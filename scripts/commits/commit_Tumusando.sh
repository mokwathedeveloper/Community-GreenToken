#!/bin/bash
# ============================================================
# CONTRIBUTOR: Tumusando (@Tumusando)
# ROLE: Frontend Developer | Page Starter Code | Assets | UX
# COMMITS: ~50 commits
# RUN: bash scripts/commits/commit_Tumusando.sh
# ============================================================

set -e
cd "$(git rev-parse --show-toplevel)"

# Set identity for this contributor
git config user.name "Tumusando"
git config user.email "229076553+Tumusando@users.noreply.github.com"

echo "💻 Starting commits for Tumusando..."

# ── Page Starter Code (Frontend pages) ───────────────────────
git add ux_ui/feature_specv2/landing_page_starter_code.js
git commit -m "feat(starter): add landing page with hero section and banner component"

git add ux_ui/feature_specv2/dashboard_page_starter_code.js
git commit -m "feat(starter): add dashboard with real-time stat cards and leaderboard"

git add ux_ui/feature_specv2/token_redemption_page_starter_code.js
git commit -m "feat(starter): add token redemption page with reward cards and modal"

git add ux_ui/feature_specv2/donation_tracking_page_starter_code.js
git commit -m "feat(starter): add donation tracking page with project progress bars"

git add ux_ui/feature_specv2/leaderboard_page_starter_code.js
git commit -m "feat(starter): add leaderboard page with ranking table and trophy"

git add ux_ui/feature_specv2/analytics_metrics_page_starter_code.js
git commit -m "feat(starter): add analytics page with charts and community metrics"

git add ux_ui/feature_specv2/about_us_page_starter_code.js
git commit -m "feat(starter): add about us page with values grid and team cards"

git add ux_ui/feature_specv2/how_it_works_page_starter_code.js
git commit -m "feat(starter): add how it works page with step cards and FAQ accordion"

git add ux_ui/feature_specv2/impact_page_starter_code.js
git commit -m "feat(starter): add public impact page with count-up stats and project bars"

# ── Assets: Page hero images ─────────────────────────────────
git add assets/image/herosection/hero_eco_illustration.png
git commit -m "assets: add landing page hero eco illustration"

git add assets/image/pages/about-us/about_us_hero.png
git commit -m "assets: add about us page hero image"

git add assets/image/pages/about-us/about_us_cta_banner.png
git commit -m "assets: add about us CTA banner"

git add assets/image/pages/about-us/hero_starter.md
git commit -m "docs(assets): add about us hero image implementation guide"

git add assets/image/pages/about-us/cta_banner_guide.md
git commit -m "docs(assets): add about us CTA banner guide"

git add assets/image/pages/auth/signin_hero.png
git commit -m "assets: add sign in page hero background"

git add assets/image/pages/auth/signup_hero.png
git commit -m "assets: add sign up page hero background"

git add assets/image/pages/auth/signin_hero_guide.md
git commit -m "docs(assets): add sign in hero implementation guide"

git add assets/image/pages/auth/signup_hero_guide.md
git commit -m "docs(assets): add sign up hero implementation guide"

git add assets/image/pages/how-it-works/how_it_works_hero.png
git commit -m "assets: add how it works page hero image"

git add assets/image/pages/how-it-works/how_it_works_banner.png
git commit -m "assets: add how it works mid-page banner"

git add assets/image/pages/how-it-works/flow_diagram_background.png
git commit -m "assets: add flow diagram section background"

git add assets/image/pages/how-it-works/hero_guide.md
git commit -m "docs(assets): add how it works hero image implementation guide"

git add assets/image/pages/impact/impact_hero.png
git commit -m "assets: add impact page hero banner"

git add assets/image/pages/impact/hero_starter.md
git commit -m "docs(assets): add impact page hero starter code guide"

git add assets/image/pages/pricing/pricing_hero.png
git commit -m "assets: add pricing page hero image"

git add assets/image/pages/pricing/price_page.png
git commit -m "assets: add pricing page CTA background"

git add assets/image/pages/pricing/hero_guide.md
git commit -m "docs(assets): add pricing hero implementation guide"

git add assets/image/pages/pricing/hero_image_guide.md
git commit -m "docs(assets): add pricing hero CTA placement guide"

git add assets/image/pages/org-admin/org_admin_hero.png
git commit -m "assets: add org admin dashboard hero banner"

git add assets/image/pages/org-admin/hero_guide.md
git commit -m "docs(assets): add org admin hero guide"

git add assets/image/pages/org-onboarding/org_onboarding_hero.png
git commit -m "assets: add org onboarding wizard hero"

git add assets/image/pages/org-onboarding/org_onboarding_page_hero_section.png
git commit -m "assets: add org onboarding page header section image"

git add assets/image/pages/org-onboarding/hero_guide.md
git commit -m "docs(assets): add org onboarding hero implementation guide"

git add assets/image/pages/org-settings/org_settings_hero.png
git commit -m "assets: add org settings page hero"

git add assets/image/pages/org-settings/org_settings_page.png
git commit -m "assets: add org settings page illustration"

git add assets/image/pages/org-settings/hero_guide.md
git commit -m "docs(assets): add org settings hero guide"

git add assets/image/pages/org-members/org_members_hero.png
git commit -m "assets: add org members page hero"

git add assets/image/pages/org-members/org_members_page_hero_section.png
git commit -m "assets: add org members page header section"

git add assets/image/pages/super-admin/super_admin_dashboard_mockup.png
git commit -m "assets: add super admin dashboard mockup reference"

# ── Assets: Donation sidebar images ─────────────────────────
git add assets/image/donationsidebar/green_earth_and_sprout.png
git commit -m "assets: add donation sidebar green earth illustration (RGBA transparent)"

git add assets/image/donationsidebar/donation_tracker_sidebar.png
git commit -m "assets: add donation tracker sidebar icon placeholder"

git add assets/image/donationsidebar/sidebar_bottom_green_earth.md
git commit -m "docs(assets): add green earth sidebar component guide"

git add assets/image/donationsidebar/sidebar_bottom_donation_tracker_md.md
git commit -m "docs(assets): add donation tracker sidebar component guide"

# ── Banner shared asset ──────────────────────────────────────
git add assets/image/banner.png
git commit -m "assets: add shared banner canonical copy in assets/image/"

# ── Push all commits ─────────────────────────────────────────
echo ""
echo "📤 Pushing all Tumusando commits..."
git push origin master

echo ""
echo "✅ Tumusando: all commits pushed!"
git log --oneline -15