// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MyCoraUtilityToken (MCUT)
 * @dev Simplified utility token focused on platform access and governance
 * Removed loyalty features to avoid overlap with PuffPass
 */
contract MyCoraUtilityToken is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    Counters.Counter private _tokenIdCounter;
    
    enum UtilityType {
        GOVERNANCE_PASS,      // Voting rights in DAO
        PREMIUM_ACCESS,       // Premium platform features
        API_ACCESS,          // Developer API access
        ADMIN_TOOLS,         // Administrative capabilities
        EARLY_ACCESS         // Beta feature access
    }
    
    struct TokenUtility {
        UtilityType utilityType;
        uint256 accessLevel;    // 1-5 access tiers
        uint256 expiryDate;     // 0 = never expires
        bool active;
    }
    
    mapping(uint256 => TokenUtility) public tokenUtilities;
    mapping(address => mapping(UtilityType => bool)) public userAccess;
    
    uint256 public constant MAX_SUPPLY = 50000; // Reduced from 100k
    
    event UtilityGranted(address indexed user, UtilityType utilityType, uint256 tokenId);
    event UtilityRevoked(address indexed user, UtilityType utilityType, uint256 tokenId);

    constructor() ERC721("MyCora Utility Token", "MCUT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mintUtility(
        address to,
        UtilityType utilityType,
        uint256 accessLevel,
        uint256 expiryDate,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(_tokenIdCounter.current() &lt; MAX_SUPPLY, "Max supply reached");
        require(accessLevel >= 1 && accessLevel &lt;= 5, "Invalid access level");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        tokenUtilities[tokenId] = TokenUtility({
            utilityType: utilityType,
            accessLevel: accessLevel,
            expiryDate: expiryDate,
            active: true
        });
        
        userAccess[to][utilityType] = true;
        
        emit UtilityGranted(to, utilityType, tokenId);
        return tokenId;
    }

    function hasAccess(address user, UtilityType utilityType) public view returns (bool) {
        return userAccess[user][utilityType];
    }

    function getAccessLevel(address user, UtilityType utilityType) public view returns (uint256) {
        uint256 maxLevel = 0;
        uint256 balance = balanceOf(user);
        
        for (uint256 i = 0; i &lt; balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            TokenUtility memory utility = tokenUtilities[tokenId];
            
            if (utility.utilityType == utilityType && 
                utility.active && 
                (utility.expiryDate == 0 || utility.expiryDate > block.timestamp)) {
                if (utility.accessLevel > maxLevel) {
                    maxLevel = utility.accessLevel;
                }
            }
        }
        
        return maxLevel;
    }

    function deactivateUtility(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        tokenUtilities[tokenId].active = false;
        
        address owner = ownerOf(tokenId);
        UtilityType utilityType = tokenUtilities[tokenId].utilityType;
        
        // Check if user still has other active tokens of this type
        if (getAccessLevel(owner, utilityType) == 0) {
            userAccess[owner][utilityType] = false;
        }
        
        emit UtilityRevoked(owner, utilityType, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            TokenUtility memory utility = tokenUtilities[tokenId];
            
            // Remove access from sender if no other tokens of this type
            if (getAccessLevel(from, utility.utilityType) == 0) {
                userAccess[from][utility.utilityType] = false;
            }
            
            // Grant access to recipient
            userAccess[to][utility.utilityType] = true;
        }
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
