#!/bin/bash
# ============================================================
# CONTRIBUTOR: Kamwanga Raheem (@RockieRaheem)
# ROLE: UX/UI Designer | Design System | Page Specs | Mockups
# COMMITS: ~55 commits
# RUN: bash scripts/commits/commit_RockieRaheem.sh
# ============================================================

set -e
cd "$(git rev-parse --show-toplevel)"

# Set identity for this contributor
git config user.name "Kamwanga Raheem"
git config user.email "134764730+RockieRaheem@users.noreply.github.com"

echo "🎨 Starting commits for RockieRaheem..."

# ── Design System & UX Specs ────────────────────────────────
git add ux_ui/features_specs/DESIGN_SPEC.md
git commit -m "feat(design): add comprehensive design spec extracted from all mockups"

git add ux_ui/features_specs/design_system.md
git commit -m "feat(design): add design system with color palette, typography, and spacing tokens"

git add ux_ui/features_specs/features_to_mockup_map.md
git commit -m "feat(ux): update features-to-mockup map with all 19 pages mapped"

git add ux_ui/features_specs/uiux_implementation_blueprint.md
git commit -m "feat(ux): update UX/UI blueprint with SaaS OrgContext and plan gating patterns"

git add ux_ui/features_specs/documentation_index.md
git commit -m "docs(ux): update documentation index with complete feature_specv2 folder tree"

git add ux_ui/features_specs/accessibility_checklist.md
git commit -m "docs(ux): add WCAG 2.1 accessibility checklist for all components"

git add ux_ui/features_specs/interaction_guidelines.md
git commit -m "docs(ux): add micro-interaction and animation guidelines"

git add ux_ui/features_specs/prototyping_notes.md
git commit -m "docs(ux): add Figma prototyping notes and iteration guidance"

git add ux_ui/features_specs/ux_ui_features_specs_skeleton.md
git commit -m "docs(ux): update UX/UI folder skeleton with feature_specv2 structure"

# ── Page MD Specs (MVP pages) ────────────────────────────────
git add ux_ui/feature_specv2/landing_page_md.md
git commit -m "feat(pages): add landing page spec with hero image and banner sections"

git add ux_ui/feature_specv2/landing_page_hero_image_md.md
git commit -m "feat(pages): add landing page hero image implementation guide"

git add ux_ui/feature_specv2/dashboard_page_md.md
git commit -m "feat(pages): add dashboard page spec with stat cards and analytics layout"

git add ux_ui/feature_specv2/action_submission_page_md.md
git commit -m "feat(pages): add action submission page spec with evidence hashing"

git add ux_ui/feature_specv2/token_redemption_page_md.md
git commit -m "feat(pages): add token redemption page spec with reward cards"

git add ux_ui/feature_specv2/donation_tracking_page_md.md
git commit -m "feat(pages): add donation tracking page spec with project progress bars"

git add ux_ui/feature_specv2/leaderboard_page_md.md
git commit -m "feat(pages): add leaderboard page spec with ranking table and trophy"

git add ux_ui/feature_specv2/analytics_metrics_page_md.md
git commit -m "feat(pages): add analytics/impact metrics page spec with charts"

# ── Page MD Specs (new pages) ────────────────────────────────
git add ux_ui/feature_specv2/signin_page_md.md
git commit -m "feat(pages): add sign in page spec with Freighter wallet connect"

git add ux_ui/feature_specv2/signup_page_md.md
git commit -m "feat(pages): add sign up page spec with invite token flow"

git add ux_ui/feature_specv2/about_us_page_md.md
git commit -m "feat(pages): add about us page spec with mission and team sections"

git add ux_ui/feature_specv2/how_it_works_page_md.md
git commit -m "feat(pages): add how it works page spec with 5-step flow"

git add ux_ui/feature_specv2/impact_page_md.md
git commit -m "feat(pages): add public impact stats page spec with count-up animations"

# ── Page MD Specs (SaaS pages) ──────────────────────────────
git add ux_ui/feature_specv2/pricing_page_md.md
git commit -m "feat(pages): add pricing page spec with plan comparison and Stripe flow"

git add ux_ui/feature_specv2/org_onboarding_page_md.md
git commit -m "feat(pages): add org onboarding wizard spec with 5 steps"

git add ux_ui/feature_specv2/org_admin_dashboard_md.md
git commit -m "feat(pages): add org admin dashboard spec with verification queue"

git add ux_ui/feature_specv2/super_admin_dashboard_md.md
git commit -m "feat(pages): add super admin dashboard spec with platform metrics"

git add ux_ui/feature_specv2/billing_page_md.md
git commit -m "feat(pages): add billing page spec with Stripe subscription management"

git add ux_ui/feature_specv2/org_members_page_md.md
git commit -m "feat(pages): add member management page spec with invite modal"

git add ux_ui/feature_specv2/org_settings_page_md.md
git commit -m "feat(pages): add org settings page spec with token config and danger zone"

# ── Additional page specs ────────────────────────────────────
git add ux_ui/feature_specv2/privacy_policy_md.md
git commit -m "feat(pages): add privacy policy page spec (POPIA/GDPR compliant)"

git add ux_ui/feature_specv2/terms_of_service_md.md
git commit -m "feat(pages): add terms of service page spec for SaaS billing"

git add ux_ui/feature_specv2/community_greentoken_dashboard_cta_banner.md
git commit -m "feat(pages): add dashboard CTA banner implementation guide"

git add ux_ui/feature_specv2/ux_ui_pages_features_blueprint.md
git commit -m "feat(ux): update pages blueprint with all 21 pages and SaaS features"

git add ux_ui/feature_specv2/billing_page_component_starter.md
git commit -m "feat(pages): add billing page component starter with all sub-components"

# ── Mockup images ────────────────────────────────────────────
git add mockup/landing_page_mockup.png
git commit -m "design: add landing page mockup"

git add mockup/dashboard_page_mockup.png
git commit -m "design: add dashboard page mockup"

git add mockup/action_submission_page_mockup.png
git commit -m "design: add action submission page mockup"

git add mockup/token_redemption_page_mockup.png
git commit -m "design: add token redemption page mockup"

git add mockup/donation_tracking_page_mockup.png
git commit -m "design: add donation tracking page mockup"

git add mockup/leaderboard_page_mockup.png
git commit -m "design: add leaderboard page mockup"

git add mockup/analytics_metrics_page_mockup.png
git commit -m "design: add analytics metrics page mockup"

git add mockup/signin_page_mockup.png
git commit -m "design: add sign in page mockup"

git add mockup/signup_page_mockup.png
git commit -m "design: add sign up page mockup"

git add mockup/about_us_page_mockup.png
git commit -m "design: add about us page mockup"

git add mockup/how_it_works_page_mockup.png
git commit -m "design: add how it works page mockup"

git add mockup/impact_page_mockup.png
git commit -m "design: add impact page mockup"

git add mockup/pricing_page_mockup.png
git commit -m "design: add pricing page mockup"

git add mockup/org_admin_dashboard_mockup.png
git commit -m "design: add org admin dashboard mockup"

git add mockup/billing_page_mockup.png
git commit -m "design: add billing page mockup"

# ── Branding ─────────────────────────────────────────────────
git add branding/community-greentoken-logo.png
git commit -m "design: add Community GreenToken logo (RGBA transparent)"

git add branding/community-greentoken-web-logo.png
git commit -m "design: add Community GreenToken web horizontal logo (RGBA transparent)"

git add branding/community-greentoken-brand-identity-board.png
git commit -m "design: add brand identity board"

# ── Banner ───────────────────────────────────────────────────
git add banner/banner.png
git commit -m "design: add shared CTA banner used across all pages"

git add banner/banner_guide.md
git commit -m "docs(design): add banner usage guide with SharedBanner component spec"

# ── Push all commits ─────────────────────────────────────────
echo ""
echo "📤 Pushing all RockieRaheem commits..."
git push origin master

echo ""
echo "✅ RockieRaheem: all commits pushed!"
git log --oneline -15