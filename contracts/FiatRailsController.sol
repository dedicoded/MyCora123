// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract FiatRailsController is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BUSINESS_ROLE = keccak256("BUSINESS_ROLE");
    
    struct FiatTransaction {
        address user;
        uint256 amount;
        string currency;
        string transactionType; // "onramp" or "offramp"
        uint256 timestamp;
        bool completed;
    }
    
    struct FiatMetrics {
        uint256 totalLocked;
        uint256 totalOnRamp;
        uint256 totalOffRamp;
        uint256 activeUsers;
    }
    
    mapping(address => bool) public verifiedBusinesses;
    mapping(address => uint256) public userFiatBalance;
    mapping(bytes32 => FiatTransaction) public transactions;
    
    FiatMetrics public metrics;
    
    event FiatOnRamp(address indexed user, uint256 amount, string currency, bytes32 transactionId);
    event FiatOffRamp(address indexed user, uint256 amount, string currency, bytes32 transactionId);
    event BusinessVerified(address indexed business);
    event FiatLocked(uint256 totalAmount);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    modifier onlyAdminOrBusiness() {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            (hasRole(BUSINESS_ROLE, msg.sender) && verifiedBusinesses[msg.sender]),
            "FiatRails: Insufficient permissions for fiat off-ramp"
        );
        _;
    }
    
    // Anyone can on-ramp fiat (deposit)
    function onRampFiat(
        address user,
        uint256 amount,
        string memory currency
    ) external whenNotPaused returns (bytes32) {
        require(amount > 0, "FiatRails: Amount must be greater than 0");
        
        bytes32 transactionId = keccak256(abi.encodePacked(user, amount, currency, block.timestamp));
        
        transactions[transactionId] = FiatTransaction({
            user: user,
            amount: amount,
            currency: currency,
            transactionType: "onramp",
            timestamp: block.timestamp,
            completed: true
        });
        
        userFiatBalance[user] += amount;
        metrics.totalLocked += amount;
        metrics.totalOnRamp += amount;
        
        emit FiatOnRamp(user, amount, currency, transactionId);
        emit FiatLocked(metrics.totalLocked);
        
        return transactionId;
    }
    
    // Only admins and verified businesses can off-ramp fiat (withdraw)
    function offRampFiat(
        address user,
        uint256 amount,
        string memory currency
    ) external onlyAdminOrBusiness whenNotPaused returns (bytes32) {
        require(amount > 0, "FiatRails: Amount must be greater than 0");
        require(userFiatBalance[user] >= amount, "FiatRails: Insufficient fiat balance");
        
        bytes32 transactionId = keccak256(abi.encodePacked(user, amount, currency, block.timestamp));
        
        transactions[transactionId] = FiatTransaction({
            user: user,
            amount: amount,
            currency: currency,
            transactionType: "offramp",
            timestamp: block.timestamp,
            completed: true
        });
        
        userFiatBalance[user] -= amount;
        metrics.totalLocked -= amount;
        metrics.totalOffRamp += amount;
        
        emit FiatOffRamp(user, amount, currency, transactionId);
        
        return transactionId;
    }
    
    // Admin function to verify business accounts
    function verifyBusiness(address business) external onlyRole(ADMIN_ROLE) {
        verifiedBusinesses[business] = true;
        _grantRole(BUSINESS_ROLE, business);
        emit BusinessVerified(business);
    }
    
    // Get fiat metrics for dashboard
    function getFiatMetrics() external view returns (FiatMetrics memory) {
        return metrics;
    }
    
    // Check if address can off-ramp
    function canOffRamp(address user) external view returns (bool) {
        return hasRole(ADMIN_ROLE, user) || 
               (hasRole(BUSINESS_ROLE, user) && verifiedBusinesses[user]);
    }
    
    // Emergency pause function
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
