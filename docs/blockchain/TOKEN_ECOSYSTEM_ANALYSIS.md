# MyCora Token Ecosystem Analysis

## Token Hierarchy & Utility Assessment

### 🟢 ESSENTIAL TOKENS (Keep & Enhance)

#### 1. **MyCoraCoin (MCC)** - ERC-20 Stablecoin
- **Purpose**: Core ecosystem currency, USD-pegged
- **Utility**: Fiat on/off-ramps, payments, staking rewards
- **Status**: ✅ Essential - Primary value transfer mechanism
- **Contract**: `/contracts/MyCoraCoin.sol`

#### 2. **PuffPassRewards** - ERC-1155 Loyalty System
- **Purpose**: Invisible NFT rewards for dispensaries/retail
- **Utility**: Tier-based loyalty, purchase tracking, soulbound benefits
- **Status**: ✅ Essential - Unique value proposition for B2B customers
- **Contract**: `/contracts/PuffPassRewards.sol`

### 🟡 CONSOLIDATION CANDIDATES (Merge or Simplify)

#### 3. **MyCoraSecurityToken** - ERC-20 Compliance Token ✅ CONSOLIDATED
- **Purpose**: All compliance, KYC, and regulatory features
- **Status**: ✅ Enhanced with former TrustToken functionality
- **Action**: ✅ COMPLETE - Single compliance token with full feature set

#### 4. **MyCoraUtilityToken** - ERC-721 NFT
- **Purpose**: Access passes, premium features
- **Issue**: Overlaps with PuffPass functionality
- **Recommendation**: Repurpose for platform governance/access only
- **Action**: Simplify to focus on platform utilities, not loyalty

### 🔴 REDUNDANT/DEPRECATED (Remove or Archive)

#### 5. **Duplicate PuffPass Implementations**
- **Issue**: Multiple PuffPass contracts found in user context
- **Action**: Keep only the enhanced soulbound version

## Recommended Token Architecture

\`\`\`
MyCora Ecosystem
├── MyCoraCoin (MCC) - ERC-20 Stablecoin
│   ├── Fiat backing via Cybrid
│   ├── Staking rewards (MCCStaking contract)
│   └── Primary payment currency
│
├── MyCoraSecurityToken (MCST) - ERC-20 Compliance Token  
│   ├── Enhanced with TrustToken features
│   ├── KYC/AML integration
│   ├── Jurisdiction controls
│   └── Regulatory compliance
│
├── PuffPassRewards - ERC-1155 Loyalty System
│   ├── Soulbound NFTs (non-transferable)
│   ├── Tier progression (Green/Gold/Black)
│   └── B2B loyalty solution
│
└── MyCoraUtilityToken (MCUT) - ERC-721 Platform Access
    ├── Governance participation
    ├── Premium feature access
    └── Platform utilities only
\`\`\`

## Implementation Priority

1. **Consolidate Security Tokens**: Merge TrustToken features into MyCoraSecurityToken
2. **Simplify Utility Token**: Remove loyalty features, focus on platform access
3. **Enhance Stablecoin**: Add more DeFi features to MCC
4. **Optimize PuffPass**: Ensure single, robust implementation

## Smart Contract Status

- ✅ MyCoraCoin: Complete with Cybrid integration
- ✅ PuffPassRewards: Complete soulbound implementation  
- ✅ MyCoraSecurityToken: Complete with consolidated compliance features
- 🔄 MyCoraUtilityToken: Simplified for platform access only
- ✅ TrustToken: Removed - features merged into MyCoraSecurityToken
\`\`\`

```solidity file="contracts/MyCoraSecurityToken.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MyCoraSecurityToken (MCST)
 * @dev Enhanced security token with compliance features merged from TrustToken
 * Consolidates all compliance functionality into single contract
 */
contract MyCoraSecurityToken is ERC20, ERC20Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // <CHANGE> Enhanced compliance features from TrustToken integration
    struct ComplianceData {
        bool kycVerified;
        uint256 jurisdiction; // ISO country code
        uint256 maxHolding;
        uint256 lastTransfer;
        bool frozen;
    }

    mapping(address => ComplianceData) public compliance;
    mapping(uint256 => bool) public allowedJurisdictions;
    
    uint256 public maxSupply = 1000000000 * 10**18; // 1B tokens
    uint256 public transferCooldown = 1 hours;
    
    event ComplianceUpdated(address indexed account, bool kycVerified, uint256 jurisdiction);
    event AccountFrozen(address indexed account, bool frozen);
    event JurisdictionUpdated(uint256 jurisdiction, bool allowed);

    constructor() ERC20("MyCora Security Token", "MCST") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        // <CHANGE> Initialize common jurisdictions
        allowedJurisdictions[840] = true; // USA
        allowedJurisdictions[124] = true; // Canada
        allowedJurisdictions[826] = true; // UK
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount &lt;= maxSupply, "Exceeds max supply");
        require(compliance[to].kycVerified, "Recipient not KYC verified");
        _mint(to, amount);
    }

    function updateCompliance(
        address account,
        bool kycVerified,
        uint256 jurisdiction,
        uint256 maxHolding
    ) external onlyRole(COMPLIANCE_ROLE) {
        compliance[account] = ComplianceData({
            kycVerified: kycVerified,
            jurisdiction: jurisdiction,
            maxHolding: maxHolding,
            lastTransfer: block.timestamp,
            frozen: compliance[account].frozen
        });
        
        emit ComplianceUpdated(account, kycVerified, jurisdiction);
    }

    function freezeAccount(address account, bool frozen) external onlyRole(COMPLIANCE_ROLE) {
        compliance[account].frozen = frozen;
        emit AccountFrozen(account, frozen);
    }

    function setJurisdictionAllowed(uint256 jurisdiction, bool allowed) external onlyRole(COMPLIANCE_ROLE) {
        allowedJurisdictions[jurisdiction] = allowed;
        emit JurisdictionUpdated(jurisdiction, allowed);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
        
        if (from != address(0) && to != address(0)) {
            // <CHANGE> Enhanced compliance checks
            require(!compliance[from].frozen, "Sender account frozen");
            require(!compliance[to].frozen, "Recipient account frozen");
            require(compliance[from].kycVerified, "Sender not KYC verified");
            require(compliance[to].kycVerified, "Recipient not KYC verified");
            require(allowedJurisdictions[compliance[from].jurisdiction], "Sender jurisdiction not allowed");
            require(allowedJurisdictions[compliance[to].jurisdiction], "Recipient jurisdiction not allowed");
            require(
                block.timestamp >= compliance[from].lastTransfer + transferCooldown,
                "Transfer cooldown active"
            );
            
            // Check max holding limits
            if (compliance[to].maxHolding > 0) {
                require(
                    balanceOf(to) + amount &lt;= compliance[to].maxHolding,
                    "Exceeds max holding limit"
                );
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
