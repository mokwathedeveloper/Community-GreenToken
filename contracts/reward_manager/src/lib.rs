//! RewardManager — Handles token redemptions and burns on Stellar Soroban
//!
//! Spec: architecture/stellar_blockchain_architecture.md — Contract 3
//! Rule R-SC-03: ALL privileged functions MUST call require_auth() first
//! Rule: User MUST sign redemption transactions (Freighter wallet — not platform key)
//! Rule: Token burn on redemption creates deflationary mechanics

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, BytesN, Env, String, Vec,
};

// ── Types ─────────────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone)]
pub struct Reward {
    pub reward_id:    u32,
    pub name:         String,
    pub description:  String,
    pub token_cost:   i128,
    pub total_supply: i64,   // -1 = unlimited
    pub redeemed:     u32,
    pub is_active:    bool,
    pub org_id:       BytesN<32>,
}

#[contracttype]
#[derive(Clone)]
pub struct Redemption {
    pub redemption_id: u64,
    pub user:          Address,
    pub reward_id:     u32,
    pub tokens_burned: i128,
    pub timestamp:     u64,
}

// ── Storage Keys ──────────────────────────────────────────────────────────────
#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    RewardCount,
    Reward(u32),
    RedemptionCount,
    Redemption(u64),
    UserRedemptions(Address),
    TotalBurned,
}

// ── Contract ─────────────────────────────────────────────────────────────────
#[contract]
pub struct RewardManager;

#[contractimpl]
impl RewardManager {
    /// One-time initialization.
    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin,            &admin);
        env.storage().instance().set(&DataKey::TokenContract,    &token_contract);
        env.storage().instance().set(&DataKey::RewardCount,      &0u32);
        env.storage().instance().set(&DataKey::RedemptionCount,  &0u64);
        env.storage().instance().set(&DataKey::TotalBurned,      &0i128);
    }

    // ── Read functions ──────────────────────────────────────────────────────

    pub fn get_reward(env: Env, reward_id: u32) -> Reward {
        env.storage().persistent()
            .get(&DataKey::Reward(reward_id))
            .expect("reward not found")
    }

    pub fn get_all_rewards(env: Env) -> Vec<u32> {
        let count: u32 = env.storage().instance().get(&DataKey::RewardCount).unwrap_or(0);
        let mut ids = Vec::new(&env);
        for i in 1..=count {
            if env.storage().persistent().has(&DataKey::Reward(i)) {
                let r: Reward = env.storage().persistent().get(&DataKey::Reward(i)).unwrap();
                if r.is_active {
                    ids.push_back(i);
                }
            }
        }
        ids
    }

    pub fn get_redemption(env: Env, redemption_id: u64) -> Redemption {
        env.storage().persistent()
            .get(&DataKey::Redemption(redemption_id))
            .expect("redemption not found")
    }

    pub fn get_user_redemptions(env: Env, user: Address) -> Vec<u64> {
        env.storage().persistent()
            .get(&DataKey::UserRedemptions(user))
            .unwrap_or(Vec::new(&env))
    }

    pub fn total_burned(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalBurned).unwrap_or(0)
    }

    pub fn redemption_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::RedemptionCount).unwrap_or(0)
    }

    // ── Write functions ─────────────────────────────────────────────────────

    /// Admin adds a new reward to the catalog.
    pub fn add_reward(
        env:          Env,
        admin:        Address,
        reward_id:    u32,
        name:         String,
        description:  String,
        token_cost:   i128,
        total_supply: i64,
        org_id:       BytesN<32>,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "not admin");
        assert!(token_cost > 0, "token cost must be positive");
        assert!(!env.storage().persistent().has(&DataKey::Reward(reward_id)), "reward id taken");

        let reward = Reward { reward_id, name, description, token_cost, total_supply, redeemed: 0, is_active: true, org_id };
        env.storage().persistent().set(&DataKey::Reward(reward_id), &reward);
        let count: u32 = env.storage().instance().get(&DataKey::RewardCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::RewardCount, &count.max(reward_id));

        env.events().publish(
            (symbol_short!("added"), symbol_short!("reward")),
            (reward_id, token_cost),
        );
    }

    /// User redeems tokens for a reward.
    /// MUST be called by the user themselves (Freighter wallet signs this tx).
    /// Burns tokens from user's GreenToken balance — deflationary.
    pub fn redeem_reward(env: Env, user: Address, reward_id: u32) -> u64 {
        user.require_auth();  // User signs with their own Freighter wallet

        let mut reward: Reward = env.storage().persistent()
            .get(&DataKey::Reward(reward_id))
            .expect("reward not found");

        assert!(reward.is_active, "reward not active");
        assert!(reward.total_supply == -1 || (reward.redeemed as i64) < reward.total_supply, "reward sold out");

        // Cross-contract call: burn tokens from user's balance
        let token_contract: Address = env.storage().instance()
            .get(&DataKey::TokenContract)
            .unwrap();

        let _: () = env.invoke_contract(
            &token_contract,
            &symbol_short!("burn"),
            soroban_sdk::vec![
                &env,
                user.to_val(),
                soroban_sdk::IntoVal::into_val(&reward.token_cost, &env),
            ],
        );

        // Record redemption
        let redemption_id: u64 = env.storage().instance()
            .get(&DataKey::RedemptionCount)
            .unwrap_or(0) + 1;

        let redemption = Redemption {
            redemption_id,
            user: user.clone(),
            reward_id,
            tokens_burned: reward.token_cost,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Redemption(redemption_id), &redemption);
        env.storage().instance().set(&DataKey::RedemptionCount, &redemption_id);

        // Update reward redeemed count
        reward.redeemed += 1;
        env.storage().persistent().set(&DataKey::Reward(reward_id), &reward);

        // Update total burned stat
        let burned: i128 = env.storage().instance().get(&DataKey::TotalBurned).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalBurned, &(burned + reward.token_cost));

        // Append to user's redemption list
        let mut user_reds: Vec<u64> = env.storage().persistent()
            .get(&DataKey::UserRedemptions(user.clone()))
            .unwrap_or(Vec::new(&env));
        user_reds.push_back(redemption_id);
        env.storage().persistent().set(&DataKey::UserRedemptions(user.clone()), &user_reds);

        env.events().publish(
            (symbol_short!("redeemed"), symbol_short!("reward")),
            (redemption_id, user, reward_id, reward.token_cost),
        );

        redemption_id
    }

    /// Admin updates reward (toggle active, change cost).
    pub fn update_reward(env: Env, admin: Address, reward_id: u32, token_cost: i128, is_active: bool) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "not admin");

        let mut reward: Reward = env.storage().persistent()
            .get(&DataKey::Reward(reward_id))
            .expect("reward not found");

        reward.token_cost = token_cost;
        reward.is_active  = is_active;
        env.storage().persistent().set(&DataKey::Reward(reward_id), &reward);
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, BytesN};

    fn setup() -> (Env, Address, Address, RewardManagerClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin      = Address::generate(&env);
        let token_addr = Address::generate(&env);
        let contract_id = env.register_contract(None, RewardManager);
        let client = RewardManagerClient::new(&env, &contract_id);
        client.initialize(&admin, &token_addr);
        (env, admin, token_addr, client)
    }

    fn add_test_reward(env: &Env, client: &RewardManagerClient, admin: &Address) {
        let org_id = BytesN::from_array(env, &[1u8; 32]);
        client.add_reward(
            admin, &1u32,
            &String::from_str(env, "Tree Planting"),
            &String::from_str(env, "Plant a tree"),
            &500_000_000i128,
            &(-1i64),
            &org_id,
        );
    }

    #[test]
    fn test_add_reward() {
        let (env, admin, _, client) = setup();
        add_test_reward(&env, &client, &admin);
        let reward = client.get_reward(&1u32);
        assert_eq!(reward.token_cost, 500_000_000i128);
        assert!(reward.is_active);
        assert_eq!(reward.redeemed, 0);
        assert_eq!(reward.total_supply, -1i64);
    }

    #[test]
    fn test_total_burned_starts_at_zero() {
        let (_, _, _, client) = setup();
        assert_eq!(client.total_burned(), 0i128);
        assert_eq!(client.redemption_count(), 0u64);
    }

    #[test]
    fn test_get_all_rewards_returns_active() {
        let (env, admin, _, client) = setup();
        let org_id = BytesN::from_array(&env, &[1u8; 32]);
        client.add_reward(&admin, &1u32, &String::from_str(&env, "R1"),
            &String::from_str(&env, "desc"), &100_000_000i128, &(-1i64), &org_id);
        client.add_reward(&admin, &2u32, &String::from_str(&env, "R2"),
            &String::from_str(&env, "desc"), &200_000_000i128, &(-1i64), &org_id);
        let all = client.get_all_rewards();
        assert_eq!(all.len(), 2);
    }

    #[test]
    fn test_update_reward_deactivate() {
        let (env, admin, _, client) = setup();
        add_test_reward(&env, &client, &admin);
        client.update_reward(&admin, &1u32, &500_000_000i128, &false);
        let reward = client.get_reward(&1u32);
        assert!(!reward.is_active);
    }

    #[test]
    fn test_update_reward_change_cost() {
        let (env, admin, _, client) = setup();
        add_test_reward(&env, &client, &admin);
        client.update_reward(&admin, &1u32, &999_000_000i128, &true);
        let reward = client.get_reward(&1u32);
        assert_eq!(reward.token_cost, 999_000_000i128);
    }

    #[test]
    #[should_panic(expected = "reward id taken")]
    fn test_duplicate_reward_id_rejected() {
        let (env, admin, _, client) = setup();
        let org_id = BytesN::from_array(&env, &[1u8; 32]);
        client.add_reward(&admin, &1u32, &String::from_str(&env, "R"),
            &String::from_str(&env, "d"), &100_000_000i128, &(-1i64), &org_id);
        client.add_reward(&admin, &1u32, &String::from_str(&env, "R2"),
            &String::from_str(&env, "d"), &200_000_000i128, &(-1i64), &org_id);
    }

    #[test]
    #[should_panic(expected = "token cost must be positive")]
    fn test_zero_cost_reward_rejected() {
        let (env, admin, _, client) = setup();
        let org_id = BytesN::from_array(&env, &[1u8; 32]);
        client.add_reward(&admin, &1u32, &String::from_str(&env, "R"),
            &String::from_str(&env, "d"), &0i128, &(-1i64), &org_id);
    }
}
