// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IComplianceRegistry {
    function isCompliant(address user, string memory jurisdiction) external view returns (bool);
    function getKYCLevel(address user) external view returns (uint8);
}

contract TrustToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    IComplianceRegistry public complianceRegistry;
    
    mapping(address => bool) public isWhitelisted;
    mapping(address => uint256) public maxHolding;
    mapping(string => bool) public supportedJurisdictions;
    
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1B tokens
    uint8 public constant MIN_KYC_LEVEL = 2;
    
    event Whitelisted(address indexed user, uint256 maxHolding);
    event ComplianceRegistryUpdated(address indexed newRegistry);
    event JurisdictionAdded(string jurisdiction);
    event ComplianceViolation(address indexed user, string reason);

    constructor(
        string memory name,
        string memory symbol,
        address _complianceRegistry
    ) ERC20(name, symbol) {
        complianceRegistry = IComplianceRegistry(_complianceRegistry);
        supportedJurisdictions["US"] = true;
        supportedJurisdictions["EU"] = true;
        supportedJurisdictions["UK"] = true;
    }

    function whitelist(
        address user, 
        uint256 _maxHolding,
        string memory jurisdiction
    ) external onlyOwner {
        require(supportedJurisdictions[jurisdiction], "Jurisdiction not supported");
        require(complianceRegistry.isCompliant(user, jurisdiction), "User not compliant");
        require(complianceRegistry.getKYCLevel(user) >= MIN_KYC_LEVEL, "Insufficient KYC level");
        
        isWhitelisted[user] = true;
        maxHolding[user] = _maxHolding;
        
        emit Whitelisted(user, _maxHolding);
    }

    function mint(address to, uint256 amount) external onlyOwner nonReentrant {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(isWhitelisted[to], "User not whitelisted");
        require(balanceOf(to) + amount <= maxHolding[to], "Exceeds max holding");
        
        _mint(to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        if (from != address(0) && to != address(0)) {
            require(isWhitelisted[to], "Recipient not whitelisted");
            require(balanceOf(to) + amount <= maxHolding[to], "Transfer exceeds recipient max holding");
            
            // Additional compliance check for large transfers
            if (amount > 10000 * 10**18) {
                require(complianceRegistry.getKYCLevel(to) >= 3, "Large transfer requires enhanced KYC");
            }
        }
        
        super._beforeTokenTransfer(from, to, amount);
    }

    function updateComplianceRegistry(address _newRegistry) external onlyOwner {
        complianceRegistry = IComplianceRegistry(_newRegistry);
        emit ComplianceRegistryUpdated(_newRegistry);
    }

    function addJurisdiction(string memory jurisdiction) external onlyOwner {
        supportedJurisdictions[jurisdiction] = true;
        emit JurisdictionAdded(jurisdiction);
    }

    function removeFromWhitelist(address user) external onlyOwner {
        isWhitelisted[user] = false;
        maxHolding[user] = 0;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyFreeze() external onlyOwner {
        _pause();
        emit ComplianceViolation(msg.sender, "Emergency freeze activated");
    }
}
