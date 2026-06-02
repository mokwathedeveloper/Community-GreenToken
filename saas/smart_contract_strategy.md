# Community GreenToken — Smart Contract Strategy for SaaS

## ⚠️ Platform: Stellar Soroban (Rust) — NOT Ethereum/Solidity
> Full Soroban specs: `architecture/stellar_blockchain_architecture.md`  
> Implementation rules: `architecture/stellar_implementation_rules.md`

---

## Two Approaches

### Option A: Shared Contract with org_id Parameter (Recommended for MVP/Starter)
One contract on-chain, all orgs share it. The `orgId` is passed as a parameter to partition token balances and actions.

**Pros:** Simple, fast onboarding, cheap (no deploy gas per org), one contract to maintain.  
**Cons:** Less isolation — one bug could affect all orgs. Token symbol is shared.

### Option B: Factory Contract — Per-Org Deployment (Recommended for Pro/Enterprise)
A `GreenTokenFactory` contract deploys a fresh `GreenToken` contract for each new organization.

**Pros:** Full isolation, org gets their own token symbol/name on-chain, enterprise-grade.  
**Cons:** Deploy gas cost per org, more contract management.

**Recommended approach:** Use **Option A for Free/Starter**, **Option B for Pro/Enterprise**. The platform handles the switch transparently.

---

## Option A: Shared Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract GreenTokenShared is AccessControl {
    bytes32 public constant ORG_ADMIN_ROLE = keccak256("ORG_ADMIN_ROLE");

    // orgId → userAddress → balance
    mapping(bytes32 => mapping(address => uint256)) public balances;

    // orgId → total supply
    mapping(bytes32 => uint256) public totalSupply;

    event TokensMinted(bytes32 indexed orgId, address indexed to, uint256 amount);
    event TokensBurned(bytes32 indexed orgId, address indexed from, uint256 amount);
    event TokensTransferred(bytes32 indexed orgId, address indexed from, address indexed to, uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(bytes32 orgId, address to, uint256 amount)
        external onlyRole(ORG_ADMIN_ROLE) {
        balances[orgId][to] += amount;
        totalSupply[orgId] += amount;
        emit TokensMinted(orgId, to, amount);
    }

    function burn(bytes32 orgId, address from, uint256 amount)
        external onlyRole(ORG_ADMIN_ROLE) {
        require(balances[orgId][from] >= amount, "Insufficient balance");
        balances[orgId][from] -= amount;
        totalSupply[orgId] -= amount;
        emit TokensBurned(orgId, from, amount);
    }

    function transfer(bytes32 orgId, address from, address to, uint256 amount)
        external onlyRole(ORG_ADMIN_ROLE) {
        require(balances[orgId][from] >= amount, "Insufficient balance");
        balances[orgId][from] -= amount;
        balances[orgId][to]   += amount;
        emit TokensTransferred(orgId, from, to, amount);
    }

    function balanceOf(bytes32 orgId, address user) external view returns (uint256) {
        return balances[orgId][user];
    }
}
```

---

## Option B: Factory + Per-Org ERC-20

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Per-org token — full ERC-20 compliance
contract OrgGreenToken is ERC20, Ownable {
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        address orgOwner
    ) ERC20(tokenName, tokenSymbol) Ownable(orgOwner) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

// Factory — deploys a new OrgGreenToken per org
contract GreenTokenFactory is Ownable {
    // orgId (bytes32) → deployed contract address
    mapping(bytes32 => address) public orgContracts;

    event OrgContractDeployed(bytes32 indexed orgId, address contractAddress, string tokenName, string symbol);

    constructor() Ownable(msg.sender) {}

    function deployForOrg(
        bytes32 orgId,
        string calldata tokenName,
        string calldata tokenSymbol,
        address orgAdmin
    ) external onlyOwner returns (address) {
        require(orgContracts[orgId] == address(0), "Org already has a contract");

        OrgGreenToken newToken = new OrgGreenToken(tokenName, tokenSymbol, orgAdmin);
        orgContracts[orgId] = address(newToken);

        emit OrgContractDeployed(orgId, address(newToken), tokenName, tokenSymbol);
        return address(newToken);
    }

    function getContract(bytes32 orgId) external view returns (address) {
        return orgContracts[orgId];
    }
}
```

---

## Backend: Contract Deployment API

```typescript
// POST /api/contracts/deploy
export async function POST(req: Request) {
  const { orgId, tokenName, tokenSymbol, useShared } = await req.json();
  const orgIdBytes32 = ethers.utils.formatBytes32String(orgId);

  if (useShared) {
    // Just register the org in the shared contract
    const sharedContract = new ethers.Contract(
      process.env.SHARED_CONTRACT_ADDRESS!,
      SharedContractABI,
      signer
    );
    await sharedContract.grantOrgAdmin(orgIdBytes32, process.env.PLATFORM_WALLET!);
    await supabase.from('organizations').update({
      contract_address: process.env.SHARED_CONTRACT_ADDRESS,
      contract_network: 'shared',
    }).eq('id', orgId);
  } else {
    // Deploy via factory
    const factory = new ethers.Contract(
      process.env.FACTORY_CONTRACT_ADDRESS!,
      FactoryABI,
      signer
    );
    const tx = await factory.deployForOrg(
      orgIdBytes32, tokenName, tokenSymbol, process.env.PLATFORM_WALLET!
    );
    const receipt = await tx.wait();
    const contractAddress = receipt.events[0].args.contractAddress;

    await supabase.from('organizations').update({
      contract_address: contractAddress,
      contract_network: process.env.CONTRACT_NETWORK || 'testnet',
    }).eq('id', orgId);

    return Response.json({ contractAddress, txHash: tx.hash });
  }
}
```

---

## Plan → Contract Strategy Mapping

| Plan | Contract Strategy | Deploy Gas | Isolation |
|---|---|---|---|
| Free | Shared contract | None | Logical (org_id param) |
| Starter | Shared contract | None | Logical (org_id param) |
| Pro | Factory-deployed | ~$5–20 (testnet: free) | Full ERC-20 per org |
| Enterprise | Factory-deployed + custom | Platform-covered | Full + custom logic |

---

## ActionRegistry Contract (Shared for All Plans)

```solidity
contract ActionRegistry {
    struct Action {
        bytes32 orgId;
        address user;
        string  actionType;
        uint256 timestamp;
        bool    verified;
    }

    mapping(uint256 => Action) public actions;
    uint256 public actionCount;

    event ActionLogged(uint256 indexed actionId, bytes32 indexed orgId, address user, string actionType);
    event ActionVerified(uint256 indexed actionId, uint256 tokensAwarded);

    function logAction(bytes32 orgId, address user, string calldata actionType)
        external returns (uint256 actionId) {
        actionId = actionCount++;
        actions[actionId] = Action(orgId, user, actionType, block.timestamp, false);
        emit ActionLogged(actionId, orgId, user, actionType);
    }

    function verifyAction(uint256 actionId, uint256 tokensAwarded) external {
        actions[actionId].verified = true;
        emit ActionVerified(actionId, tokensAwarded);
    }
}
```
