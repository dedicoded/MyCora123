// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BadgeRegistry is ERC721, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct Badge {
        string badgeType;
        uint256 level;
        uint256 issuedAt;
        address issuer;
        string metadata;
        bool isActive;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(address => mapping(string => uint256)) public userBadges; // user => badgeType => tokenId
    mapping(address => bool) public authorizedIssuers;
    mapping(string => bool) public validBadgeTypes;
    
    event BadgeIssued(uint256 indexed tokenId, address indexed recipient, string badgeType, uint256 level);
    event BadgeRevoked(uint256 indexed tokenId);
    event BadgeTypeAdded(string badgeType);

    constructor() ERC721("MyCora Reputation Badge", "MCRB") {
        authorizedIssuers[msg.sender] = true;
        
        validBadgeTypes["KYC_VERIFIED"] = true;
        validBadgeTypes["PAYMENT_HISTORY"] = true;
        validBadgeTypes["COMPLIANCE_SCORE"] = true;
        validBadgeTypes["MERCHANT_VERIFIED"] = true;
        validBadgeTypes["INSTITUTIONAL"] = true;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized issuer");
        _;
    }

    function issueBadge(
        address recipient,
        string memory badgeType,
        uint256 level,
        string memory metadata
    ) external onlyAuthorizedIssuer whenNotPaused returns (uint256) {
        require(validBadgeTypes[badgeType], "Invalid badge type");
        require(level >= 1 && level <= 5, "Invalid level");
        
        // Check if user already has this badge type
        uint256 existingTokenId = userBadges[recipient][badgeType];
        if (existingTokenId != 0) {
            // Upgrade existing badge if new level is higher
            Badge storage existingBadge = badges[existingTokenId];
            if (level > existingBadge.level) {
                existingBadge.level = level;
                existingBadge.metadata = metadata;
                existingBadge.issuedAt = block.timestamp;
                existingBadge.issuer = msg.sender;
                
                emit BadgeIssued(existingTokenId, recipient, badgeType, level);
                return existingTokenId;
            } else {
                revert("Badge level not higher than existing");
            }
        }
        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _mint(recipient, tokenId);
        
        badges[tokenId] = Badge({
            badgeType: badgeType,
            level: level,
            issuedAt: block.timestamp,
            issuer: msg.sender,
            metadata: metadata,
            isActive: true
        });
        
        userBadges[recipient][badgeType] = tokenId;
        
        emit BadgeIssued(tokenId, recipient, badgeType, level);
        return tokenId;
    }

    function revokeBadge(uint256 tokenId) external onlyAuthorizedIssuer {
        require(_exists(tokenId), "Badge does not exist");
        
        Badge storage badge = badges[tokenId];
        require(badge.isActive, "Badge already revoked");
        
        badge.isActive = false;
        address owner = ownerOf(tokenId);
        userBadges[owner][badge.badgeType] = 0;
        
        emit BadgeRevoked(tokenId);
    }

    function getUserBadge(address user, string memory badgeType) external view returns (uint256, Badge memory) {
        uint256 tokenId = userBadges[user][badgeType];
        if (tokenId == 0) {
            return (0, Badge("", 0, 0, address(0), "", false));
        }
        return (tokenId, badges[tokenId]);
    }

    function hasMinimumBadgeLevel(address user, string memory badgeType, uint256 minLevel) external view returns (bool) {
        uint256 tokenId = userBadges[user][badgeType];
        if (tokenId == 0) return false;
        
        Badge memory badge = badges[tokenId];
        return badge.isActive && badge.level >= minLevel;
    }

    function addBadgeType(string memory badgeType) external onlyOwner {
        validBadgeTypes[badgeType] = true;
        emit BadgeTypeAdded(badgeType);
    }

    function addAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
    }

    function removeAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override whenNotPaused {
        require(from == address(0) || to == address(0), "Badges are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Badge does not exist");
        return badges[tokenId].metadata;
    }
}
