
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IComplianceRegistry {
    function isCompliant(address user, string memory jurisdiction) external view returns (bool);
    function getKYCLevel(address user) external view returns (uint8);
}

/**
 * @title MyCoraSecurityToken (MCST)
 * @dev Consolidated security token with all compliance features
 * Replaces TrustToken with enhanced functionality
 */
contract MyCoraSecurityToken is ERC20, ERC20Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    IComplianceRegistry public complianceRegistry;
    
    struct ComplianceData {
        bool kycVerified;
        uint256 jurisdiction;
        uint256 maxHolding;
        uint256 lastTransfer;
        bool frozen;
        bool whitelisted;
    }

    mapping(address => ComplianceData) public compliance;
    mapping(uint256 => bool) public allowedJurisdictions;
    mapping(string => bool) public supportedJurisdictions;
    
    uint256 public maxSupply = 1000000000 * 10**18; // 1B tokens
    uint256 public transferCooldown = 1 hours;
    uint8 public constant MIN_KYC_LEVEL = 2;
    
    event ComplianceUpdated(address indexed account, bool kycVerified, uint256 jurisdiction);
    event AccountFrozen(address indexed account, bool frozen);
    event JurisdictionUpdated(uint256 jurisdiction, bool allowed);
    event Whitelisted(address indexed user, uint256 maxHolding);
    event ComplianceRegistryUpdated(address indexed newRegistry);
    event ComplianceViolation(address indexed user, string reason);

    constructor(address _complianceRegistry) ERC20("MyCora Security Token", "MCST") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        complianceRegistry = IComplianceRegistry(_complianceRegistry);
        
        // Initialize supported jurisdictions
        allowedJurisdictions[840] = true; // USA
        allowedJurisdictions[124] = true; // Canada
        allowedJurisdictions[826] = true; // UK
        
        supportedJurisdictions["US"] = true;
        supportedJurisdictions["EU"] = true;
        supportedJurisdictions["UK"] = true;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        require(compliance[to].kycVerified, "Recipient not KYC verified");
        require(compliance[to].whitelisted, "Recipient not whitelisted");
        _mint(to, amount);
    }

    function updateCompliance(
        address account,
        bool kycVerified,
        uint256 jurisdiction,
        uint256 maxHolding,
        bool whitelisted
    ) external onlyRole(COMPLIANCE_ROLE) {
        compliance[account] = ComplianceData({
            kycVerified: kycVerified,
            jurisdiction: jurisdiction,
            maxHolding: maxHolding,
            lastTransfer: block.timestamp,
            frozen: compliance[account].frozen,
            whitelisted: whitelisted
        });
        
        emit ComplianceUpdated(account, kycVerified, jurisdiction);
        if (whitelisted) {
            emit Whitelisted(account, maxHolding);
        }
    }

    function freezeAccount(address account, bool frozen) external onlyRole(COMPLIANCE_ROLE) {
        compliance[account].frozen = frozen;
        emit AccountFrozen(account, frozen);
    }

    function setJurisdictionAllowed(uint256 jurisdiction, bool allowed) external onlyRole(COMPLIANCE_ROLE) {
        allowedJurisdictions[jurisdiction] = allowed;
        emit JurisdictionUpdated(jurisdiction, allowed);
    }

    function updateComplianceRegistry(address _newRegistry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        complianceRegistry = IComplianceRegistry(_newRegistry);
        emit ComplianceRegistryUpdated(_newRegistry);
    }

    function addJurisdiction(string memory jurisdiction) external onlyRole(COMPLIANCE_ROLE) {
        supportedJurisdictions[jurisdiction] = true;
    }

    function removeFromWhitelist(address user) external onlyRole(COMPLIANCE_ROLE) {
        compliance[user].whitelisted = false;
        compliance[user].maxHolding = 0;
    }

    function emergencyFreeze() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit ComplianceViolation(msg.sender, "Emergency freeze activated");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
        
        if (from != address(0) && to != address(0)) {
            // Enhanced compliance checks
            require(!compliance[from].frozen, "Sender account frozen");
            require(!compliance[to].frozen, "Recipient account frozen");
            require(compliance[from].kycVerified, "Sender not KYC verified");
            require(compliance[to].kycVerified, "Recipient not KYC verified");
            require(compliance[to].whitelisted, "Recipient not whitelisted");
            require(allowedJurisdictions[compliance[from].jurisdiction], "Sender jurisdiction not allowed");
            require(allowedJurisdictions[compliance[to].jurisdiction], "Recipient jurisdiction not allowed");
            require(
                block.timestamp >= compliance[from].lastTransfer + transferCooldown,
                "Transfer cooldown active"
            );
            
            // Check max holding limits
            if (compliance[to].maxHolding > 0) {
                require(
                    balanceOf(to) + amount <= compliance[to].maxHolding,
                    "Exceeds max holding limit"
                );
            }
            
            // Large transfer enhanced KYC check
            if (amount > 10000 * 10**18) {
                require(complianceRegistry.getKYCLevel(to) >= 3, "Large transfer requires enhanced KYC");
            }
        }
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._afterTokenTransfer(from, to, amount);
        
        if (from != address(0)) {
            compliance[from].lastTransfer = block.timestamp;
        }
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
