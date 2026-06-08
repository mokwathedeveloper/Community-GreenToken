//! ActionRegistry — Records and verifies eco-actions on Stellar Soroban
//!
//! Spec: architecture/stellar_blockchain_architecture.md — Contract 2
//! Rule R-SC-03: ALL privileged functions MUST call require_auth() first
//! Rule R-SC-09: Minting MUST only happen through ActionRegistry (cross-contract call)
//! Rule: SHA-256 evidence hash stored on-chain prevents tampering

#![no_std]

use soroban_sdk::{
    contract, contractevent, contractimpl, contracttype, symbol_short,
    Address, BytesN, Env, String, Vec,
};

// ── Events ────────────────────────────────────────────────────────────────────
#[contractevent]
pub struct ActionSubmitted {
    pub action_id: u64,
    pub user:      Address,
    pub timestamp: u64,
}

#[contractevent]
pub struct ActionVerified {
    pub action_id: u64,
    pub tokens:    i128,
}

#[contractevent]
pub struct ActionRejected {
    pub action_id: u64,
}

// ── Types ─────────────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, PartialEq)]
pub enum ActionType {
    Recycling,
    TreePlanting,
    Carpooling,
    EnergySaving,
    WaterSaving,
    CommunityCleanup,
    CompostingOrganics,
    PublicTransport,
    SolarEnergyUse,
    BeachCleanup,
}

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum ActionStatus {
    Pending,
    Verified,
    Rejected,
}

#[contracttype]
#[derive(Clone)]
pub struct Action {
    pub action_id:      u64,
    pub user:           Address,
    pub action_type:    ActionType,
    pub description:    String,
    pub evidence_hash:  BytesN<32>,  // SHA-256 of photo evidence
    pub timestamp:      u64,
    pub status:         ActionStatus,
    pub tokens_awarded: i128,
    pub org_id:         BytesN<32>,
}

// ── Storage Keys ──────────────────────────────────────────────────────────────
#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    ActionCount,
    Action(u64),
    UserActions(Address),
    EvidenceUsed(BytesN<32>),     // Rule: prevent duplicate evidence
    TokenReward(ActionType),
}

// ── Default token rewards (in stroops: 1 GTK = 10_000_000 stroops) ────────────
fn default_reward(action_type: &ActionType) -> i128 {
    match action_type {
        ActionType::Recycling          =>  100_000_000, // 10 GTK
        ActionType::TreePlanting       =>  200_000_000, // 20 GTK
        ActionType::Carpooling         =>  150_000_000, // 15 GTK
        ActionType::EnergySaving       =>  120_000_000, // 12 GTK
        ActionType::WaterSaving        =>  100_000_000, // 10 GTK
        ActionType::CommunityCleanup   =>  250_000_000, // 25 GTK
        ActionType::CompostingOrganics =>  100_000_000, // 10 GTK
        ActionType::PublicTransport    =>   80_000_000, //  8 GTK
        ActionType::SolarEnergyUse     =>  200_000_000, // 20 GTK
        ActionType::BeachCleanup       =>  300_000_000, // 30 GTK
    }
}

// ── Contract ─────────────────────────────────────────────────────────────────
#[contract]
pub struct ActionRegistry;

#[contractimpl]
impl ActionRegistry {
    /// One-time initialization.
    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin,         &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::ActionCount,   &0u64);
    }

    // ── Read functions ──────────────────────────────────────────────────────

    pub fn action_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ActionCount).unwrap_or(0)
    }

    pub fn get_action(env: Env, action_id: u64) -> Action {
        env.storage().persistent()
            .get(&DataKey::Action(action_id))
            .expect("action not found")
    }

    pub fn get_user_actions(env: Env, user: Address) -> Vec<u64> {
        env.storage().persistent()
            .get(&DataKey::UserActions(user))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_token_reward(env: Env, action_type: ActionType) -> i128 {
        env.storage().instance()
            .get(&DataKey::TokenReward(action_type.clone()))
            .unwrap_or_else(|| default_reward(&action_type))
    }

    // ── Write functions ─────────────────────────────────────────────────────

    /// Submit a new eco-action. Any authenticated user.
    /// Rule: Duplicate evidence_hash rejected on-chain.
    pub fn submit_action(
        env:           Env,
        user:          Address,
        action_type:   ActionType,
        description:   String,
        evidence_hash: BytesN<32>,
        org_id:        BytesN<32>,
    ) -> u64 {
        user.require_auth();

        // Reject duplicate evidence
        assert!(
            !env.storage().persistent().has(&DataKey::EvidenceUsed(evidence_hash.clone())),
            "evidence already used"
        );

        let action_id: u64 = env.storage().instance()
            .get(&DataKey::ActionCount)
            .unwrap_or(0) + 1;

        let action = Action {
            action_id,
            user:          user.clone(),
            action_type,
            description,
            evidence_hash: evidence_hash.clone(),
            timestamp:     env.ledger().timestamp(),
            status:        ActionStatus::Pending,
            tokens_awarded: 0,
            org_id,
        };

        // Persist action and mark evidence as used
        env.storage().persistent().set(&DataKey::Action(action_id), &action);
        env.storage().persistent().set(&DataKey::EvidenceUsed(evidence_hash), &true);
        env.storage().instance().set(&DataKey::ActionCount, &action_id);

        // Append to user's action list
        let mut user_actions: Vec<u64> = env.storage().persistent()
            .get(&DataKey::UserActions(user.clone()))
            .unwrap_or(Vec::new(&env));
        user_actions.push_back(action_id);
        env.storage().persistent().set(&DataKey::UserActions(user.clone()), &user_actions);

        ActionSubmitted { action_id, user: user.clone(), timestamp: env.ledger().timestamp() }.publish(&env);

        action_id
    }

    /// Admin verifies an action — triggers cross-contract GreenToken.mint().
    /// Rule R-SC-09: Minting MUST happen here, not directly from API.
    pub fn verify_action(env: Env, admin: Address, action_id: u64, tokens: i128) {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "not admin");

        let mut action: Action = env.storage().persistent()
            .get(&DataKey::Action(action_id))
            .expect("action not found");

        assert!(action.status == ActionStatus::Pending, "action not pending");
        assert!(tokens > 0, "tokens must be positive");

        action.status        = ActionStatus::Verified;
        action.tokens_awarded = tokens;
        env.storage().persistent().set(&DataKey::Action(action_id), &action);

        // Cross-contract call: mint tokens to the action's user
        // Uses the GreenToken contract stored at initialization
        let token_contract: Address = env.storage().instance()
            .get(&DataKey::TokenContract)
            .unwrap();

        let _: () = env.invoke_contract(
            &token_contract,
            &symbol_short!("mint"),
            soroban_sdk::vec![
                &env,
                admin.to_val(),
                action.user.to_val(),
                soroban_sdk::IntoVal::into_val(&tokens, &env),
            ],
        );

        ActionVerified { action_id, tokens }.publish(&env);
    }

    /// Admin rejects an action.
    pub fn reject_action(env: Env, admin: Address, action_id: u64) {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "not admin");

        let mut action: Action = env.storage().persistent()
            .get(&DataKey::Action(action_id))
            .expect("action not found");

        assert!(action.status == ActionStatus::Pending, "action not pending");
        action.status = ActionStatus::Rejected;
        env.storage().persistent().set(&DataKey::Action(action_id), &action);

        ActionRejected { action_id }.publish(&env);
    }

    /// Admin sets custom token reward for an action type.
    pub fn set_token_reward(env: Env, admin: Address, action_type: ActionType, tokens: i128) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "not admin");
        env.storage().instance().set(&DataKey::TokenReward(action_type), &tokens);
    }

    /// Upgrade the contract WASM in-place. Admin only.
    /// All storage (actions, evidence hashes, reward config) is preserved.
    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: BytesN<32>) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "not admin");
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, BytesN};

    fn setup() -> (Env, Address, Address, Address, ActionRegistryClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin      = Address::generate(&env);
        let user       = Address::generate(&env);
        let token_addr = Address::generate(&env);
        let contract_id = env.register_contract(None, ActionRegistry);
        let client = ActionRegistryClient::new(&env, &contract_id);
        client.initialize(&admin, &token_addr);
        (env, admin, user, token_addr, client)
    }

    #[test]
    fn test_submit_action_increments_count() {
        let (env, _, user, _, client) = setup();
        let hash   = BytesN::from_array(&env, &[1u8; 32]);
        let org_id = BytesN::from_array(&env, &[2u8; 32]);
        assert_eq!(client.action_count(), 0);
        let id = client.submit_action(&user, &ActionType::Recycling,
            &String::from_str(&env, "Recycled 5 bags"), &hash, &org_id);
        assert_eq!(id, 1);
        assert_eq!(client.action_count(), 1);
    }

    #[test]
    fn test_submit_action_stored_correctly() {
        let (env, _, user, _, client) = setup();
        let hash   = BytesN::from_array(&env, &[1u8; 32]);
        let org_id = BytesN::from_array(&env, &[2u8; 32]);
        let id = client.submit_action(&user, &ActionType::TreePlanting,
            &String::from_str(&env, "Planted 3 trees"), &hash, &org_id);
        let action = client.get_action(&id);
        assert_eq!(action.status, ActionStatus::Pending);
        assert_eq!(action.tokens_awarded, 0);
        assert_eq!(action.user, user);
    }

    #[test]
    fn test_user_actions_list() {
        let (env, _, user, _, client) = setup();
        let org_id = BytesN::from_array(&env, &[1u8; 32]);
        client.submit_action(&user, &ActionType::Recycling,
            &String::from_str(&env, "a"), &BytesN::from_array(&env, &[1u8; 32]), &org_id);
        client.submit_action(&user, &ActionType::Carpooling,
            &String::from_str(&env, "b"), &BytesN::from_array(&env, &[2u8; 32]), &org_id);
        let user_actions = client.get_user_actions(&user);
        assert_eq!(user_actions.len(), 2);
    }

    #[test]
    fn test_reject_action() {
        let (env, admin, user, _, client) = setup();
        let hash   = BytesN::from_array(&env, &[5u8; 32]);
        let org_id = BytesN::from_array(&env, &[1u8; 32]);
        let id = client.submit_action(&user, &ActionType::BeachCleanup,
            &String::from_str(&env, "Cleaned beach"), &hash, &org_id);
        client.reject_action(&admin, &id);
        let action = client.get_action(&id);
        assert_eq!(action.status, ActionStatus::Rejected);
    }

    #[test]
    fn test_set_custom_token_reward() {
        let (env, admin, _, _, client) = setup();
        client.set_token_reward(&admin, &ActionType::Recycling, &500_000_000i128);
        assert_eq!(client.get_token_reward(&ActionType::Recycling), 500_000_000i128);
    }

    #[test]
    fn test_default_token_rewards() {
        let (_, _, _, _, client) = setup();
        assert_eq!(client.get_token_reward(&ActionType::TreePlanting), 200_000_000i128);
        assert_eq!(client.get_token_reward(&ActionType::BeachCleanup), 300_000_000i128);
    }

    #[test]
    #[should_panic(expected = "evidence already used")]
    fn test_duplicate_evidence_rejected() {
        let (env, _, user, _, client) = setup();
        let hash   = BytesN::from_array(&env, &[42u8; 32]);
        let org_id = BytesN::from_array(&env, &[1u8; 32]);
        client.submit_action(&user, &ActionType::Recycling,
            &String::from_str(&env, "test"), &hash, &org_id);
        client.submit_action(&user, &ActionType::Recycling,
            &String::from_str(&env, "test2"), &hash, &org_id);
    }

    #[test]
    #[should_panic(expected = "action not pending")]
    fn test_cannot_reject_already_rejected() {
        let (env, admin, user, _, client) = setup();
        let hash   = BytesN::from_array(&env, &[9u8; 32]);
        let org_id = BytesN::from_array(&env, &[1u8; 32]);
        let id = client.submit_action(&user, &ActionType::Recycling,
            &String::from_str(&env, "x"), &hash, &org_id);
        client.reject_action(&admin, &id);
        client.reject_action(&admin, &id); // second reject should panic
    }
}
