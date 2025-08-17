// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PuffPassRewards is ERC1155URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Reward tiers
    uint256 public constant GREEN_PASS = 1;
    uint256 public constant GOLD_PASS = 2;
    uint256 public constant BLACK_PASS = 3;
    
    // Soulbound Points Token
    mapping(address => uint256) public puffPoints;
    mapping(address => uint256) public currentTier;
    mapping(address => bool) public soulbound;
    
    // Tier requirements
    mapping(uint256 => uint256) public tierRequirements;
    mapping(uint256 => string) public tierNames;
    mapping(uint256 => string) public tierPerks;
    
    event PointsEarned(address indexed user, uint256 points, uint256 totalPoints);
    event TierUpgraded(address indexed user, uint256 newTier, string tierName);
    event PurchaseRecorded(address indexed user, uint256 purchaseCount);
    
    constructor() ERC1155("https://api.mycora.com/puffpass/") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        tierRequirements[GREEN_PASS] = 3;
        tierRequirements[GOLD_PASS] = 10;
        tierRequirements[BLACK_PASS] = 25;
        
        tierNames[GREEN_PASS] = "Green PuffPass";
        tierNames[GOLD_PASS] = "Gold PuffPass";
        tierNames[BLACK_PASS] = "Black PuffPass";
        
        tierPerks[GREEN_PASS] = "10% discount, Member pricing";
        tierPerks[GOLD_PASS] = "15% discount, Priority support, Free delivery";
        tierPerks[BLACK_PASS] = "25% discount, VIP access, Free delivery, Exclusive products";
    }
    
    function recordPurchase(address customer) external onlyRole(MINTER_ROLE) {
        puffPoints[customer] += 1;
        emit PurchaseRecorded(customer, puffPoints[customer]);
        
        // Check for tier upgrades
        _checkTierUpgrade(customer);
    }
    
    function _checkTierUpgrade(address customer) internal {
        uint256 points = puffPoints[customer];
        uint256 newTier = 0;
        string memory uri = "";
        
        if (points >= tierRequirements[BLACK_PASS]) {
            newTier = BLACK_PASS;
            uri = "ipfs://QmBlackTierMetadata";
        } else if (points >= tierRequirements[GOLD_PASS]) {
            newTier = GOLD_PASS;
            uri = "ipfs://QmGoldTierMetadata";
        } else if (points >= tierRequirements[GREEN_PASS]) {
            newTier = GREEN_PASS;
            uri = "ipfs://QmGreenTierMetadata";
        }
        
        if (newTier > currentTier[customer]) {
            // Burn old tier NFT if exists
            if (currentTier[customer] > 0) {
                _burn(customer, currentTier[customer], 1);
            }
            
            // Mint new tier NFT with metadata URI
            _mint(customer, newTier, 1, "");
            _setURI(newTier, uri);
            currentTier[customer] = newTier;
            soulbound[customer] = true; // Make soulbound
            
            emit TierUpgraded(customer, newTier, tierNames[newTier]);
        }
    }
    
    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure override {
        revert("Soulbound: non-transferable");
    }
    
    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure override {
        revert("Soulbound: non-transferable");
    }
    
    function getUserStatus(address user) external view returns (
        uint256 points,
        uint256 tier,
        string memory tierName,
        string memory perks,
        uint256 nextTierRequirement,
        uint256 progressPercent
    ) {
        points = puffPoints[user];
        tier = currentTier[user];
        tierName = tier > 0 ? tierNames[tier] : "No Pass";
        perks = tier > 0 ? tierPerks[tier] : "None";
        
        // Calculate next tier requirement and progress
        if (tier == 0 && points < tierRequirements[GREEN_PASS]) {
            nextTierRequirement = tierRequirements[GREEN_PASS] - points;
            progressPercent = (points * 100) / tierRequirements[GREEN_PASS];
        } else if (tier == GREEN_PASS && points < tierRequirements[GOLD_PASS]) {
            nextTierRequirement = tierRequirements[GOLD_PASS] - points;
            progressPercent = ((points - tierRequirements[GREEN_PASS]) * 100) / (tierRequirements[GOLD_PASS] - tierRequirements[GREEN_PASS]);
        } else if (tier == GOLD_PASS && points < tierRequirements[BLACK_PASS]) {
            nextTierRequirement = tierRequirements[BLACK_PASS] - points;
            progressPercent = ((points - tierRequirements[GOLD_PASS]) * 100) / (tierRequirements[BLACK_PASS] - tierRequirements[GOLD_PASS]);
        } else {
            nextTierRequirement = 0; // Max tier reached
            progressPercent = 100;
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
