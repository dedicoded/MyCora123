// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyCoraUtilityToken is ERC721, ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct TokenMetadata {
        string category;
        uint256 level;
        uint256 mintedAt;
        mapping(string => string) attributes;
        string[] attributeKeys;
    }
    
    mapping(uint256 => TokenMetadata) public tokenMetadata;
    mapping(address => bool) public authorizedMinters;
    mapping(string => uint256) public categoryPrices;
    
    uint256 public constant MAX_SUPPLY = 100000;
    
    event TokenMinted(uint256 indexed tokenId, address indexed recipient, string category);
    event CategoryPriceUpdated(string category, uint256 price);

    constructor() ERC721("MyCora Utility Token", "MCUT") {
        authorizedMinters[msg.sender] = true;
        
        categoryPrices["ACCESS_PASS"] = 0.1 ether;
        categoryPrices["PREMIUM_FEATURES"] = 0.05 ether;
        categoryPrices["GOVERNANCE_VOTE"] = 0.01 ether;
        categoryPrices["STAKING_BOOST"] = 0.2 ether;
    }

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }

    function mint(
        address recipient,
        string memory category,
        uint256 level,
        string memory tokenURI,
        string[] memory attributeKeys,
        string[] memory attributeValues
    ) external onlyAuthorizedMinter whenNotPaused returns (uint256) {
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        require(attributeKeys.length == attributeValues.length, "Attribute arrays length mismatch");
        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        TokenMetadata storage metadata = tokenMetadata[tokenId];
        metadata.category = category;
        metadata.level = level;
        metadata.mintedAt = block.timestamp;
        metadata.attributeKeys = attributeKeys;
        
        for (uint i = 0; i < attributeKeys.length; i++) {
            metadata.attributes[attributeKeys[i]] = attributeValues[i];
        }
        
        emit TokenMinted(tokenId, recipient, category);
        return tokenId;
    }

    function publicMint(
        string memory category,
        string memory tokenURI
    ) external payable whenNotPaused returns (uint256) {
        require(categoryPrices[category] > 0, "Category not available for public mint");
        require(msg.value >= categoryPrices[category], "Insufficient payment");
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        TokenMetadata storage metadata = tokenMetadata[tokenId];
        metadata.category = category;
        metadata.level = 1;
        metadata.mintedAt = block.timestamp;
        
        // Refund excess payment
        if (msg.value > categoryPrices[category]) {
            payable(msg.sender).transfer(msg.value - categoryPrices[category]);
        }
        
        emit TokenMinted(tokenId, msg.sender, category);
        return tokenId;
    }

    function getTokenAttributes(uint256 tokenId) external view returns (string[] memory, string[] memory) {
        require(_exists(tokenId), "Token does not exist");
        
        TokenMetadata storage metadata = tokenMetadata[tokenId];
        string[] memory keys = metadata.attributeKeys;
        string[] memory values = new string[](keys.length);
        
        for (uint i = 0; i < keys.length; i++) {
            values[i] = metadata.attributes[keys[i]];
        }
        
        return (keys, values);
    }

    function getTokenMetadata(uint256 tokenId) external view returns (string memory, uint256, uint256) {
        require(_exists(tokenId), "Token does not exist");
        TokenMetadata storage metadata = tokenMetadata[tokenId];
        return (metadata.category, metadata.level, metadata.mintedAt);
    }

    function setCategoryPrice(string memory category, uint256 price) external onlyOwner {
        categoryPrices[category] = price;
        emit CategoryPriceUpdated(category, price);
    }

    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
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
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}
