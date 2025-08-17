// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ComplianceRegistry is Ownable, Pausable {
    struct UserCompliance {
        uint8 kycLevel; // 0: None, 1: Basic, 2: Enhanced, 3: Institutional
        bool isCompliant;
        uint256 lastUpdated;
        mapping(string => bool) jurisdictionCompliance;
        string[] approvedJurisdictions;
    }
    
    mapping(address => UserCompliance) public userCompliance;
    mapping(address => bool) public authorizedUpdaters;
    
    event KYCUpdated(address indexed user, uint8 kycLevel);
    event ComplianceStatusChanged(address indexed user, bool isCompliant);
    event JurisdictionApproved(address indexed user, string jurisdiction);
    event AuthorizedUpdaterAdded(address indexed updater);

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() {
        authorizedUpdaters[msg.sender] = true;
    }

    function setKYCLevel(
        address user,
        uint8 kycLevel,
        string[] memory jurisdictions
    ) external onlyAuthorized whenNotPaused {
        require(kycLevel <= 3, "Invalid KYC level");
        
        UserCompliance storage compliance = userCompliance[user];
        compliance.kycLevel = kycLevel;
        compliance.isCompliant = kycLevel >= 1;
        compliance.lastUpdated = block.timestamp;
        
        // Clear existing jurisdictions
        for (uint i = 0; i < compliance.approvedJurisdictions.length; i++) {
            compliance.jurisdictionCompliance[compliance.approvedJurisdictions[i]] = false;
        }
        delete compliance.approvedJurisdictions;
        
        // Add new jurisdictions
        for (uint i = 0; i < jurisdictions.length; i++) {
            compliance.jurisdictionCompliance[jurisdictions[i]] = true;
            compliance.approvedJurisdictions.push(jurisdictions[i]);
            emit JurisdictionApproved(user, jurisdictions[i]);
        }
        
        emit KYCUpdated(user, kycLevel);
        emit ComplianceStatusChanged(user, compliance.isCompliant);
    }

    function isCompliant(address user, string memory jurisdiction) external view returns (bool) {
        UserCompliance storage compliance = userCompliance[user];
        return compliance.isCompliant && compliance.jurisdictionCompliance[jurisdiction];
    }

    function getKYCLevel(address user) external view returns (uint8) {
        return userCompliance[user].kycLevel;
    }

    function getApprovedJurisdictions(address user) external view returns (string[] memory) {
        return userCompliance[user].approvedJurisdictions;
    }

    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit AuthorizedUpdaterAdded(updater);
    }

    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
    }

    function revokeCompliance(address user) external onlyAuthorized {
        userCompliance[user].isCompliant = false;
        emit ComplianceStatusChanged(user, false);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
