// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MCCStaking is ReentrancyGuard, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    IERC20 public immutable mccToken;
    
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 accumulatedRewards;
        uint256 lockPeriod; // 0 = flexible, 30/90/365 days
    }
    
    mapping(address => StakeInfo) public stakes;
    mapping(uint256 => uint256) public lockPeriodMultipliers; // lock period => multiplier (basis points)
    
    uint256 public baseAPY = 500; // 5% base APY (basis points)
    uint256 public totalStaked;
    uint256 public rewardPool;
    
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 rewards);
    event RewardPoolFunded(uint256 amount);
    
    constructor(address _mccToken) {
        mccToken = IERC20(_mccToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Set lock period multipliers (basis points)
        lockPeriodMultipliers[0] = 10000;   // 1x for flexible
        lockPeriodMultipliers[30] = 12000;  // 1.2x for 30 days
        lockPeriodMultipliers[90] = 15000;  // 1.5x for 90 days
        lockPeriodMultipliers[365] = 20000; // 2x for 365 days
    }
    
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(lockPeriodMultipliers[lockPeriod] > 0, "Invalid lock period");
        require(stakes[msg.sender].amount == 0, "Already staking");
        
        mccToken.transferFrom(msg.sender, address(this), amount);
        
        stakes[msg.sender] = StakeInfo({
            amount: amount,
            startTime: block.timestamp,
            lastRewardTime: block.timestamp,
            accumulatedRewards: 0,
            lockPeriod: lockPeriod
        });
        
        totalStaked += amount;
        emit Staked(msg.sender, amount, lockPeriod);
    }
    
    function unstake() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        
        if (userStake.lockPeriod > 0) {
            require(
                block.timestamp >= userStake.startTime + (userStake.lockPeriod * 1 days),
                "Stake is still locked"
            );
        }
        
        uint256 rewards = calculateRewards(msg.sender);
        uint256 totalAmount = userStake.amount + rewards;
        
        totalStaked -= userStake.amount;
        rewardPool -= rewards;
        
        delete stakes[msg.sender];
        
        mccToken.transfer(msg.sender, totalAmount);
        emit Unstaked(msg.sender, userStake.amount, rewards);
    }
    
    function claimRewards() external nonReentrant {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");
        
        stakes[msg.sender].lastRewardTime = block.timestamp;
        stakes[msg.sender].accumulatedRewards += rewards;
        rewardPool -= rewards;
        
        mccToken.transfer(msg.sender, rewards);
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - userStake.lastRewardTime;
        uint256 multiplier = lockPeriodMultipliers[userStake.lockPeriod];
        
        uint256 annualReward = (userStake.amount * baseAPY * multiplier) / (10000 * 10000);
        return (annualReward * timeStaked) / 365 days;
    }
    
    function getStakeInfo(address user) external view returns (StakeInfo memory, uint256 pendingRewards) {
        return (stakes[user], calculateRewards(user));
    }
    
    function fundRewardPool(uint256 amount) external onlyRole(ADMIN_ROLE) {
        mccToken.transferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(amount);
    }
    
    function setBaseAPY(uint256 newAPY) external onlyRole(ADMIN_ROLE) {
        baseAPY = newAPY;
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
