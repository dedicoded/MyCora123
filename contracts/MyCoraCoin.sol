// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MyCoraCoin (MCC)
 * @dev USD-pegged stablecoin for the MyCora ecosystem
 * Integrates with Cybrid for compliant fiat on/off-ramps
 */
contract MyCoraCoin is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Cybrid integration tracking
    mapping(address => string) public cybridAccountIds;
    mapping(string => address) public accountIdToWallet;
    
    // Fiat backing tracking
    uint256 public totalFiatBacking; // In cents (USD)
    mapping(address => uint256) public fiatDeposits;
    
    event FiatDeposit(address indexed user, uint256 amount, string cybridTxId);
    event FiatWithdrawal(address indexed user, uint256 amount, string cybridTxId);
    event CybridAccountLinked(address indexed wallet, string accountId);

    constructor() ERC20("MyCora Coin", "MCC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @dev Mint MCC tokens backed by fiat deposit via Cybrid
     */
    function mintFromFiat(
        address to,
        uint256 amount,
        string memory cybridTxId
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Update fiat backing (amount is in wei, convert to cents)
        uint256 fiatCents = amount / 10**16; // 1 MCC = $1, so 10^18 wei = 100 cents
        totalFiatBacking += fiatCents;
        fiatDeposits[to] += fiatCents;
        
        _mint(to, amount);
        emit FiatDeposit(to, amount, cybridTxId);
    }

    /**
     * @dev Burn MCC tokens for fiat withdrawal via Cybrid
     */
    function burnForFiat(
        address from,
        uint256 amount,
        string memory cybridTxId
    ) external onlyRole(BURNER_ROLE) whenNotPaused {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        // Update fiat backing
        uint256 fiatCents = amount / 10**16;
        require(totalFiatBacking >= fiatCents, "Insufficient fiat backing");
        
        totalFiatBacking -= fiatCents;
        if (fiatDeposits[from] >= fiatCents) {
            fiatDeposits[from] -= fiatCents;
        }
        
        _burn(from, amount);
        emit FiatWithdrawal(from, amount, cybridTxId);
    }

    /**
     * @dev Link wallet to Cybrid account ID
     */
    function linkCybridAccount(
        address wallet,
        string memory accountId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        cybridAccountIds[wallet] = accountId;
        accountIdToWallet[accountId] = wallet;
        emit CybridAccountLinked(wallet, accountId);
    }

    /**
     * @dev Get fiat backing ratio (in basis points, 10000 = 100%)
     */
    function getFiatBackingRatio() external view returns (uint256) {
        if (totalSupply() == 0) return 10000;
        
        uint256 totalSupplyInCents = totalSupply() / 10**16;
        if (totalSupplyInCents == 0) return 10000;
        
        return (totalFiatBacking * 10000) / totalSupplyInCents;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
