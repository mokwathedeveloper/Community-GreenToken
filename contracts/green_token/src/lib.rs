//! GreenToken — SEP-41 compliant fungible token on Stellar Soroban
//!
//! Spec: architecture/stellar_blockchain_architecture.md — Contract 1
//! Rule R-SC-03: ALL privileged functions MUST call require_auth() first
//! Rule R-SC-04: MUST use i128 for ALL token amounts

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String,
};

// ── Storage Keys ─────────────────────────────────────────────────────────────
#[contracttype]
pub enum DataKey {
    Admin,
    Decimals,
    Name,
    Symbol,
    Balance(Address),
    Allowance(AllowanceKey),
}

#[contracttype]
#[derive(Clone)]
pub struct AllowanceKey {
    pub from:    Address,
    pub spender: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct AllowanceValue {
    pub amount:            i128,
    pub expiration_ledger: u32,
}

// ── Contract ─────────────────────────────────────────────────────────────────
#[contract]
pub struct GreenToken;

#[contractimpl]
impl GreenToken {
    /// One-time initialization. Sets admin, decimals (7), name, symbol.
    pub fn initialize(
        env:     Env,
        admin:   Address,
        decimal: u32,
        name:    String,
        symbol:  String,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin,    &admin);
        env.storage().instance().set(&DataKey::Decimals, &decimal);
        env.storage().instance().set(&DataKey::Name,     &name);
        env.storage().instance().set(&DataKey::Symbol,   &symbol);
    }

    // ── Read functions ─────────────────────────────────────────────────────

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap()
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().persistent()
            .get(&DataKey::Balance(id))
            .unwrap_or(0)
    }

    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let key = AllowanceKey { from, spender };
        let val: AllowanceValue = env.storage().temporary()
            .get(&DataKey::Allowance(key))
            .unwrap_or(AllowanceValue { amount: 0, expiration_ledger: 0 });

        if val.expiration_ledger < env.ledger().sequence() {
            return 0;
        }
        val.amount
    }

    // ── Write functions ────────────────────────────────────────────────────

    /// Mint tokens to `to`. Admin only.
    /// Rule R-SC-03: require_auth() is first.
    pub fn mint(env: Env, admin: Address, to: Address, amount: i128) {
        admin.require_auth();
        assert!(amount > 0, "amount must be positive");

        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "not admin");

        let bal = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &(bal + amount));

        env.events().publish(
            (symbol_short!("mint"), symbol_short!("gtok")),
            (admin, to, amount),
        );
    }

    /// Burn tokens from `from`. Token holder only.
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");

        let bal = Self::balance(env.clone(), from.clone());
        assert!(bal >= amount, "insufficient balance");

        env.storage().persistent().set(&DataKey::Balance(from.clone()), &(bal - amount));

        env.events().publish(
            (symbol_short!("burn"), symbol_short!("gtok")),
            (from, amount),
        );
    }

    /// Transfer tokens between addresses.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");

        let from_bal = Self::balance(env.clone(), from.clone());
        assert!(from_bal >= amount, "insufficient balance");

        env.storage().persistent().set(&DataKey::Balance(from.clone()), &(from_bal - amount));
        let to_bal = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &(to_bal + amount));

        env.events().publish(
            (symbol_short!("transfer"), symbol_short!("gtok")),
            (from, to, amount),
        );
    }

    /// Approve spender to spend `amount` from `from`.
    pub fn approve(
        env:               Env,
        from:              Address,
        spender:           Address,
        amount:            i128,
        expiration_ledger: u32,
    ) {
        from.require_auth();

        let key = AllowanceKey { from: from.clone(), spender: spender.clone() };

        if amount == 0 {
            // Revoking: remove the allowance entry entirely
            env.storage().temporary().remove(&DataKey::Allowance(key.clone()));
        } else {
            env.storage().temporary().set(
                &DataKey::Allowance(key.clone()),
                &AllowanceValue { amount, expiration_ledger },
            );
            // Extend Soroban storage TTL to match the logical expiration_ledger,
            // preventing the entry from expiring before the allowance period ends.
            let current = env.ledger().sequence();
            if expiration_ledger > current {
                let ttl = expiration_ledger - current;
                env.storage().temporary().extend_ttl(&DataKey::Allowance(key), ttl, ttl);
            }
        }

        env.events().publish(
            (symbol_short!("approve"), symbol_short!("gtok")),
            (from, spender, amount, expiration_ledger),
        );
    }

    /// Burn tokens from `from` using an approved allowance. Required by SEP-41.
    /// Rule R-SC-03: require_auth() is first.
    pub fn burn_from(env: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();
        assert!(amount > 0, "amount must be positive");

        let allowed = Self::allowance(env.clone(), from.clone(), spender.clone());
        assert!(allowed >= amount, "allowance exceeded");

        // Reduce allowance
        let key = AllowanceKey { from: from.clone(), spender: spender.clone() };
        let val: AllowanceValue = env.storage().temporary()
            .get(&DataKey::Allowance(key.clone()))
            .unwrap();
        env.storage().temporary().set(
            &DataKey::Allowance(key),
            &AllowanceValue { amount: val.amount - amount, expiration_ledger: val.expiration_ledger },
        );

        // Burn
        let bal = Self::balance(env.clone(), from.clone());
        assert!(bal >= amount, "insufficient balance");
        env.storage().persistent().set(&DataKey::Balance(from.clone()), &(bal - amount));

        env.events().publish(
            (symbol_short!("burn"), symbol_short!("gtok")),
            (spender, from, amount),
        );
    }

    /// Transfer on behalf of `from` using an approved allowance.
    pub fn transfer_from(
        env:     Env,
        spender: Address,
        from:    Address,
        to:      Address,
        amount:  i128,
    ) {
        spender.require_auth();

        let allowed = Self::allowance(env.clone(), from.clone(), spender.clone());
        assert!(allowed >= amount, "allowance exceeded");

        // Reduce allowance
        let key = AllowanceKey { from: from.clone(), spender: spender.clone() };
        let val: AllowanceValue = env.storage().temporary()
            .get(&DataKey::Allowance(key.clone()))
            .unwrap();
        env.storage().temporary().set(
            &DataKey::Allowance(key),
            &AllowanceValue { amount: val.amount - amount, expiration_ledger: val.expiration_ledger },
        );

        // Transfer
        Self::transfer(env, from, to, amount);
    }

    /// Transfer admin role.
    pub fn set_admin(env: Env, admin: Address, new_admin: Address) {
        admin.require_auth();
        let stored: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored, "not admin");
        env.storage().instance().set(&DataKey::Admin, &new_admin);
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, Address, Address, super::GreenTokenClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let user  = Address::generate(&env);
        let contract_id = env.register_contract(None, GreenToken);
        let client = GreenTokenClient::new(&env, &contract_id);
        client.initialize(
            &admin,
            &7u32,
            &String::from_str(&env, "GreenToken"),
            &String::from_str(&env, "GTK"),
        );
        (env, admin, user, client)
    }

    #[test]
    fn test_initialize() {
        let (env, _, _, client) = setup();
        assert_eq!(client.decimals(), 7);
        assert_eq!(client.symbol(),   String::from_str(&env, "GTK"));
        assert_eq!(client.name(),     String::from_str(&env, "GreenToken"));
    }

    #[test]
    fn test_mint_and_balance() {
        let (_, admin, user, client) = setup();
        client.mint(&admin, &user, &1_000_000_000i128); // 100 GTK
        assert_eq!(client.balance(&user), 1_000_000_000i128);
    }

    #[test]
    fn test_mint_accumulates() {
        let (_, admin, user, client) = setup();
        client.mint(&admin, &user, &500_000_000i128);
        client.mint(&admin, &user, &500_000_000i128);
        assert_eq!(client.balance(&user), 1_000_000_000i128);
    }

    #[test]
    fn test_transfer() {
        let (env, admin, user, client) = setup();
        let recipient = Address::generate(&env);
        client.mint(&admin, &user, &500_000_000i128);
        client.transfer(&user, &recipient, &200_000_000i128);
        assert_eq!(client.balance(&user),      300_000_000i128);
        assert_eq!(client.balance(&recipient), 200_000_000i128);
    }

    #[test]
    fn test_burn() {
        let (_, admin, user, client) = setup();
        client.mint(&admin, &user, &1_000_000_000i128);
        client.burn(&user, &400_000_000i128);
        assert_eq!(client.balance(&user), 600_000_000i128);
    }

    #[test]
    fn test_approve_and_allowance() {
        let (env, admin, user, client) = setup();
        let spender = Address::generate(&env);
        client.mint(&admin, &user, &1_000_000_000i128);
        client.approve(&user, &spender, &300_000_000i128, &1000u32);
        assert_eq!(client.allowance(&user, &spender), 300_000_000i128);
    }

    #[test]
    fn test_transfer_from() {
        let (env, admin, user, client) = setup();
        let spender   = Address::generate(&env);
        let recipient = Address::generate(&env);
        client.mint(&admin, &user, &1_000_000_000i128);
        client.approve(&user, &spender, &300_000_000i128, &9999u32);
        client.transfer_from(&spender, &user, &recipient, &200_000_000i128);
        assert_eq!(client.balance(&user),      800_000_000i128);
        assert_eq!(client.balance(&recipient), 200_000_000i128);
        // Remaining allowance consumed
        assert_eq!(client.allowance(&user, &spender), 100_000_000i128);
    }

    #[test]
    fn test_set_admin() {
        let (env, admin, _user, client) = setup();
        let new_admin = Address::generate(&env);
        client.set_admin(&admin, &new_admin);
        // New admin can mint; old admin cannot (auth mocking allows both in tests)
        client.mint(&new_admin, &_user, &100_000_000i128);
        assert_eq!(client.balance(&_user), 100_000_000i128);
    }

    #[test]
    #[should_panic(expected = "insufficient balance")]
    fn test_transfer_insufficient_balance() {
        let (env, admin, user, client) = setup();
        let recipient = Address::generate(&env);
        client.mint(&admin, &user, &100_000_000i128);
        // Try to transfer more than balance
        client.transfer(&user, &recipient, &200_000_000i128);
    }

    #[test]
    #[should_panic(expected = "amount must be positive")]
    fn test_mint_zero_rejected() {
        let (_, admin, user, client) = setup();
        client.mint(&admin, &user, &0i128);
    }

    #[test]
    #[should_panic(expected = "allowance exceeded")]
    fn test_transfer_from_exceeds_allowance() {
        let (env, admin, user, client) = setup();
        let spender   = Address::generate(&env);
        let recipient = Address::generate(&env);
        client.mint(&admin, &user, &1_000_000_000i128);
        client.approve(&user, &spender, &100_000_000i128, &9999u32);
        client.transfer_from(&spender, &user, &recipient, &200_000_000i128);
    }

    #[test]
    fn test_burn_from() {
        let (env, admin, user, client) = setup();
        let spender = Address::generate(&env);
        client.mint(&admin, &user, &1_000_000_000i128);
        client.approve(&user, &spender, &300_000_000i128, &9999u32);
        client.burn_from(&spender, &user, &200_000_000i128);
        assert_eq!(client.balance(&user), 800_000_000i128);
        assert_eq!(client.allowance(&user, &spender), 100_000_000i128);
    }

    #[test]
    #[should_panic(expected = "allowance exceeded")]
    fn test_burn_from_exceeds_allowance() {
        let (env, admin, user, client) = setup();
        let spender = Address::generate(&env);
        client.mint(&admin, &user, &1_000_000_000i128);
        client.approve(&user, &spender, &100_000_000i128, &9999u32);
        client.burn_from(&spender, &user, &200_000_000i128);
    }

    #[test]
    fn test_approve_zero_revokes() {
        let (env, admin, user, client) = setup();
        let spender = Address::generate(&env);
        client.mint(&admin, &user, &1_000_000_000i128);
        client.approve(&user, &spender, &300_000_000i128, &9999u32);
        client.approve(&user, &spender, &0i128, &9999u32); // revoke
        assert_eq!(client.allowance(&user, &spender), 0i128);
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_initialize_rejected() {
        let (env, admin, _, client) = setup();
        // Try to re-initialize
        client.initialize(&admin, &7u32, &String::from_str(&env, "Hack"), &String::from_str(&env, "HCK"));
    }
}
