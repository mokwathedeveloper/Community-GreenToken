#!/bin/bash
# ============================================================
# CONTRIBUTOR: Collins Nyamwaya (@TekguruCybersec)
# ROLE: Backend | Security | Blockchain | Smart Contracts
# COMMITS: ~50 commits
# RUN: bash scripts/commits/commit_TekguruCybersec.sh
# ============================================================

set -e
cd "$(git rev-parse --show-toplevel)"

# Set identity for this contributor
git config user.name "Collins Nyamwaya"
git config user.email "nyamwayacollins23@gmail.com"

echo "🔐 Starting commits for TekguruCybersec..."

# ── Implementation: Blockchain & Security ────────────────────
git add implementation/blockchain_implementation_md.md
git commit -m "fix(blockchain): update implementation guide to Stellar Soroban/Rust"

git add implementation/qa_security_audit_check.md
git commit -m "feat(security): add SaaS security audit with tenant isolation checks"

git add implementation/integration_test_plan.md
git commit -m "feat(testing): add tenant isolation, billing webhook and plan gate tests"

git add implementation/deployment_checklist.md
git commit -m "feat(deploy): add Stripe, wildcard DNS and 14-step Supabase migration checklist"

git add implementation/database_design_plan_implementation.md
git commit -m "feat(db): add SaaS schema migrations with org_id and RLS policy patterns"

git add implementation/professional_implementation_and_rules.md
git commit -m "docs(impl): add professional coding standards and API interaction rules"

git add implementation/development_roadmap.md
git commit -m "docs(impl): add 72-hour hackathon development roadmap"

git add implementation/documentation_guidelines.md
git commit -m "docs(impl): add documentation standards and markdown guidelines"

git add implementation/implementation_folder_skeleton.md
git commit -m "docs(impl): update implementation skeleton with SaaS additions"

git add implementation/full_project_folder_structure.md
git commit -m "docs(impl): add full SaaS project directory structure"

git add implementation/sidebar_image_md.md
git commit -m "docs(impl): update sidebar image guide with canonical path reference"

git add implementation/community_greentoken_webapp_checklist_impl_notes.md
git commit -m "docs(impl): add implementation notes for webapp checklist"

# ── Page Starter Code (Backend-heavy pages) ──────────────────
git add ux_ui/feature_specv2/action_submission_page_starter_code.js
git commit -m "feat(starter): add action submission page with evidence hashing"

git add ux_ui/feature_specv2/signin_page_starter_code.js
git commit -m "feat(starter): add sign in page with Supabase Auth and Freighter wallet"

git add ux_ui/feature_specv2/signup_page_starter_code.js
git commit -m "feat(starter): add sign up page with invite token and password strength"

git add ux_ui/feature_specv2/org_admin_dashboard_starter_code.js
git commit -m "feat(starter): add org admin dashboard with real-time verification queue"

git add ux_ui/feature_specv2/super_admin_dashboard_starter_code.js
git commit -m "feat(starter): add super admin dashboard with org table and MRR metrics"

git add ux_ui/feature_specv2/billing_page_starter_code.js
git commit -m "feat(starter): add billing page with Stripe checkout and portal integration"

git add ux_ui/feature_specv2/org_onboarding_page_starter_code.js
git commit -m "feat(starter): add org onboarding wizard with slug check and contract deploy"

git add ux_ui/feature_specv2/org_members_page_starter_code.js
git commit -m "feat(starter): add member management with invite modal and bulk actions"

git add ux_ui/feature_specv2/org_settings_page_starter_code.js
git commit -m "feat(starter): add org settings with token config and danger zone"

git add ux_ui/feature_specv2/pricing_page_starter_code.js
git commit -m "feat(starter): add pricing page with annual/monthly toggle and Stripe flow"

# ── Assets: Architecture images ──────────────────────────────
git add assets/image/architecture/blockchain_ecosystem_diagram.png
git commit -m "assets: add blockchain ecosystem architecture diagram"

git add assets/image/architecture/community_greentoken_flow_diagram.png
git commit -m "assets: add Community GreenToken token flow diagram"

git add assets/image/architecture/community_greentoken_system_flow_diagram.png
git commit -m "assets: add system flow diagram"

git add assets/image/architecture/greentoken_dashboard_infographic.png
git commit -m "assets: add GreenToken dashboard infographic"

# ── Assets: Sidebar images ───────────────────────────────────
git add assets/image/sidebar/sidebar_bottom_all_pages.png
git commit -m "assets: add shared sidebar bottom illustration (all pages)"

git add assets/image/sidebar/sidebar_all_pages_guide.md
git commit -m "docs(assets): add sidebar image usage guide for all app pages"

git add assets/image/sidebar/MISSING_ASSET_README.md
git commit -m "docs(assets): document missing sidebar asset with re-sourcing instructions"

# ── Assets: Leaderboard images ───────────────────────────────
git add assets/image/leaderboard-dashboard/leaderboard_trophy.png
git commit -m "assets: add leaderboard trophy image (RGBA transparent)"

git add assets/image/leaderboard-dashboard/leaderboard_trophy_image.md
git commit -m "docs(assets): add leaderboard trophy implementation guide"

git add assets/image/leaderboard-dashboard/sidebarleaderboard/eco_achievement_trophy_plants.png
git commit -m "assets: add eco achievement trophy sidebar icon (RGBA transparent)"

git add assets/image/leaderboard-dashboard/sidebarleaderboard/sidebar_bottom_achievement_md.md
git commit -m "docs(assets): add sidebar achievement component guide"

# ── Assets: Dashboard images ─────────────────────────────────
git add assets/image/dashboard/dashboard_cta_banner_nature.png
git commit -m "assets: add dashboard CTA bottom banner image"

# ── Assets: ROI/Business images ──────────────────────────────
git add assets/image/roi-business/community_greentoken_info_roi.png
git commit -m "assets: add ROI information diagram"

git add assets/image/roi-business/community_greentoken_revenue_chart.png
git commit -m "assets: add revenue chart visualization"

# ── Assets: SaaS mockups ─────────────────────────────────────
git add assets/image/saas/org_admin_dashboard.png
git commit -m "design: add org admin dashboard SaaS mockup"

git add assets/image/saas/super_admin_dashboard.png
git commit -m "design: add super admin dashboard SaaS mockup"

git add assets/image/saas/billing_page_mockup.png
git commit -m "design: add billing page SaaS mockup"

git add assets/image/saas/member_management_page.png
git commit -m "design: add member management SaaS mockup"

git add assets/image/saas/org_onboarding_wizard.png
git commit -m "design: add org onboarding wizard SaaS mockup"

git add assets/image/saas/org_settings_page.png
git commit -m "design: add org settings SaaS mockup"

git add assets/image/saas/SAAS_ASSETS_README.md
git commit -m "docs(assets): add SaaS assets guide with required mockup dimensions"

# ── Push all commits ─────────────────────────────────────────
echo ""
echo "📤 Pushing all TekguruCybersec commits..."
git push origin master

echo ""
echo "✅ TekguruCybersec: all commits pushed!"
git log --oneline -15