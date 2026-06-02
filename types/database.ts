/**
 * Supabase Database type definitions.
 * Generated manually from saas/saas_database_schema.md
 * Run `npx supabase gen types typescript` once Supabase project is connected
 * to auto-generate this file from the live schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          token_name: string;
          token_symbol: string;
          logo_url: string | null;
          primary_color: string;
          plan: "free" | "starter" | "pro" | "enterprise";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: "trialing" | "active" | "past_due" | "canceled" | "unpaid";
          trial_ends_at: string | null;
          contract_address: string | null;
          contract_network: string;
          member_limit: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          joined_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["org_members"]["Row"], "id" | "joined_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["org_members"]["Row"], "role">>;
      };
      invites: {
        Row: {
          id: string;
          org_id: string;
          created_by: string;
          token: string;
          role: "admin" | "member";
          uses_left: number | null;
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["invites"]["Row"], "id" | "token" | "created_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["invites"]["Row"], "uses_left">>;
      };
      actions: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          type: string;
          description: string | null;
          evidence_url: string | null;
          status: "pending" | "verified" | "rejected";
          verified_by: string | null;
          tx_hash: string | null;
          tokens_awarded: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["actions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["actions"]["Insert"]>;
      };
      token_balances: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          balance: number;
          total_earned: number;
          total_spent: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["token_balances"]["Row"], "id" | "updated_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["token_balances"]["Row"], "balance" | "total_earned" | "total_spent">>;
      };
      redemption_logs: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          reward_id: string | null;
          tokens_spent: number;
          tx_hash: string | null;
          status: "pending" | "confirmed" | "failed";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["redemption_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["redemption_logs"]["Row"], "status" | "tx_hash">>;
      };
      rewards: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          description: string | null;
          token_cost: number;
          image_url: string | null;
          stock: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["rewards"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["rewards"]["Insert"]>;
      };
      leaderboard_rankings: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          rank: number;
          total_tokens: number;
          total_actions: number;
          period: "weekly" | "monthly" | "all_time";
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leaderboard_rankings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["leaderboard_rankings"]["Insert"]>;
      };
      analytics_metrics: {
        Row: {
          id: string;
          org_id: string;
          metric_date: string;
          total_actions: number;
          tokens_minted: number;
          active_members: number;
          co2_offset_kg: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_metrics"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["analytics_metrics"]["Insert"]>;
      };
      donation_records: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          project_name: string;
          tokens_donated: number;
          tx_hash: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["donation_records"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["donation_records"]["Insert"]>;
      };
      billing_events: {
        Row: {
          id: string;
          org_id: string | null;
          stripe_event_id: string;
          event_type: string;
          payload: Json | null;
          processed: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["billing_events"]["Row"], "id" | "created_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["billing_events"]["Row"], "processed">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_type: "free" | "starter" | "pro" | "enterprise";
      member_role: "owner" | "admin" | "member";
      action_status: "pending" | "verified" | "rejected";
    };
  };
};
