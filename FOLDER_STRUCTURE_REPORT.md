# Community GreenToken — Folder Structure Report

**Date:** 2026-06-03 | **Status:** Audit complete — fixes applied

---

## Current Verified Folder Structure

```
Community-GreenToken/                          ← PROJECT ROOT
│
├── README.md                                  ✅ Hackathon submission README
├── .env.example                               ✅ Environment variable template
├── DEVELOPMENT_RULES.md                       ✅ Strict development rules
├── FULL_AUDIT_REPORT.md                       ✅ Audit history
├── PROJECT_REVIEW_REPORT.md                   ✅ Review history
├── SAAS_TRANSFORMATION_REPORT.md              ✅ SaaS upgrade history
├── FOLDER_STRUCTURE_REPORT.md                 ✅ This file
│
├── architecture/                              ✅ 16 technical spec files
│   ├── architecture.md
│   ├── architecture_folder_skeleton.md
│   ├── ai_analytics_integration.md
│   ├── api_endpoints.md
│   ├── backend_architecture.md
│   ├── blockchain_implementation_md.md        ✅ Updated — Soroban not Solidity
│   ├── database_design_plan.md
│   ├── deployment_plan.md
│   ├── error_logging_monitoring.md
│   ├── frontend_architecture.md
│   ├── performance_scaling.md
│   ├── qr_iot_verification_md_full.md
│   ├── security_checklist.md
│   ├── stellar_blockchain_architecture.md     ✅ NEW — Full Stellar/Soroban spec
│   ├── stellar_implementation_rules.md        ✅ NEW — Strict Stellar rules
│   └── stellar_sdk_api_spec.md               ✅ NEW — SDK + API function specs
│
├── assets/                                    ✅ ALL images organized
│   └── image/
│       ├── banner.png                         ✅ Shared banner (canonical)
│       ├── architecture/                      ✅ 4 diagram PNGs
│       ├── dashboard/                         ✅ CTA banner
│       ├── donationsidebar/                   ✅ 2 RGBA sidebar icons + 2 guide MDs
│       ├── herosection/                       ✅ hero_eco_illustration.png
│       ├── leaderboard-dashboard/             ✅ Trophy PNG + guide MD
│       │   └── sidebarleaderboard/            ✅ Achievement PNG + guide MD
│       ├── pages/                             ✅ Page-specific hero images
│       │   ├── about-us/                      ✅ 2 images
│       │   ├── auth/                          ✅ signin_hero + signup_hero
│       │   ├── billing/                       ⚠️  EMPTY — no billing hero image yet
│       │   ├── how-it-works/                  ✅ 3 images (hero, banner, flow bg)
│       │   ├── impact/                        ✅ impact_hero.png
│       │   ├── org-admin/                     ✅ org_admin_hero.png
│       │   ├── org-members/                   ✅ 2 images (hero + hero_section)
│       │   ├── org-onboarding/                ✅ 2 images (hero + hero_section)
│       │   ├── org-settings/                  ✅ 2 images
│       │   ├── pricing/                       ✅ 2 images
│       │   └── super-admin/                   ✅ dashboard mockup
│       ├── roi-business/                      ✅ 2 ROI/revenue images
│       ├── saas/                              ✅ 6 SaaS page mockups
│       └── sidebar/                           ✅ sidebar_bottom_all_pages.png + 2 guides
│
├── banner/                                    ✅ banner.png + banner_guide.md
│   ├── banner.png                             ✅ Source original (also at assets/image/banner.png)
│   └── banner_guide.md                        ✅ Banner usage documentation
│
├── branding/                                  ✅ 3 logo files (RGBA)
│   ├── community-greentoken-brand-identity-board.png
│   ├── community-greentoken-logo.png
│   └── community-greentoken-web-logo.png
│
├── foundation/                                ✅ 6 MDs + 1 CSV
│   ├── Community_GreenToken_Monetization_Roadmap.csv
│   ├── community_greentoken_plan.md
│   ├── community_greentoken_roi.md
│   ├── community_greentoken_webapp_checklist.md
│   ├── mvp_features_user_journey_architecture.md
│   ├── problem_statement.md
│   └── project_name_and_branding.md
│
├── implementation/                            ✅ 12 implementation guides
│   ├── blockchain_implementation_md.md        ✅ Updated — Soroban reference
│   ├── community_greentoken_webapp_checklist_impl_notes.md
│   ├── database_design_plan_implementation.md
│   ├── deployment_checklist.md
│   ├── development_roadmap.md
│   ├── documentation_guidelines.md
│   ├── full_project_folder_structure.md
│   ├── implementation_folder_skeleton.md
│   ├── integration_test_plan.md
│   ├── professional_implementation_and_rules.md
│   ├── qa_security_audit_check.md
│   └── sidebar_image_md.md
│
├── mockup/                                    ✅ 15 mockups — ALL renamed correctly
│   ├── about_us_page_mockup.png
│   ├── action_submission_page_mockup.png
│   ├── analytics_metrics_page_mockup.png
│   ├── billing_page_mockup.png
│   ├── dashboard_page_mockup.png
│   ├── donation_tracking_mockup.png           ⚠️  Name inconsistent (see below)
│   ├── how_it_works_page_mockup.png
│   ├── impact_page_mockup.png
│   ├── landing_page_mockup.png
│   ├── leaderboard_page_mockup.png
│   ├── org_admin_dashboard_mockup.png
│   ├── pricing_page_mockup.png
│   ├── signin_page_mockup.png
│   ├── signup_page_mockup.png
│   └── token_redemption_page_mockup.png
│
├── saas/                                      ✅ 10 SaaS architecture docs
│   ├── admin_portal.md
│   ├── billing_and_subscriptions.md
│   ├── multi_tenancy_architecture.md
│   ├── onboarding_flow.md
│   ├── saas_api_endpoints.md
│   ├── saas_database_schema.md
│   ├── saas_deployment_plan.md
│   ├── saas_folder_structure.md
│   ├── saas_overview.md
│   └── smart_contract_strategy.md
│
├── ux_ui/
│   ├── feature_specv2/                        ✅ 26 page specs + 19 starter JS files
│   │   ├── [21 page MD files — all consistent _md.md naming]
│   │   ├── [19 starter JS files]
│   │   ├── billing_page_component_starter.md  ✅ NEW — moved from billing page /
│   │   └── ux_ui_pages_features_blueprint.md
│   └── features_specs/                        ✅ 9 design/spec files
│       ├── accessibility_checklist.md
│       ├── DESIGN_SPEC.md                     ✅ NEW — 1403-line design system
│       ├── design_system.md
│       ├── documentation_index.md
│       ├── features_to_mockup_map.md
│       ├── interaction_guidelines.md
│       ├── prototyping_notes.md
│       ├── uiux_implementation_blueprint.md
│       └── ux_ui_features_specs_skeleton.md
│
│── ── SOURCE IMAGE FOLDERS (Originals — Do Not Delete) ──────────
│
├── about page /                               ⚠️  Space in name — SOURCE ORIGINAL
├── Admin Dashboard Page /                     ⚠️  Spaces + caps — SOURCE ORIGINAL
├── billing page /                             ⚠️  Space in name — SOURCE ORIGINAL
├── howitworks /                               ⚠️  Trailing space — SOURCE ORIGINAL
├── impact/                                    ✅  Clean name — SOURCE ORIGINAL
├── Org Member Managementpage/                 ⚠️  Caps + run-on — SOURCE ORIGINAL
├── org_onboarding_page/                       ✅  Clean name — SOURCE ORIGINAL
├── Org Settings Page/                         ⚠️  Spaces + caps — SOURCE ORIGINAL
├── Pricing Page /                             ⚠️  Spaces — SOURCE ORIGINAL
├── sidebar/                                   ✅  Clean name — SOURCE ORIGINAL
├── siginpage/                                 ⚠️  Typo ("sigin") — SOURCE ORIGINAL
├── signuppage/                                ✅  Clean name — SOURCE ORIGINAL
└── super_admin_dashboard/                     ✅  Clean name — SOURCE ORIGINAL
```

---

## Fixes Applied in This Audit

| # | Fix | Before | After |
|---|---|---|---|
| 1 | Mockup typo | `dashboard_page_mokup.png` | `dashboard_page_mockup.png` |
| 2 | Mockup truncated | `impact_page_mock.png` | `impact_page_mockup.png` |
| 3 | Mockup run-on | `billing_pagemockup.png` | `billing_page_mockup.png` |
| 4 | Mockup double typo | `org_admin_dashboardmocuup.png` | `org_admin_dashboard_mockup.png` |
| 5 | Mockup wrong suffix | `leaderboard_page_md.png` | `leaderboard_page_mockup.png` |
| 6 | Mockup missing suffix | `token_redemption_page.png` | `token_redemption_page_mockup.png` |
| 7 | New image added | `Org Member Managementpage/org_members_pageherosection.png` | `assets/image/pages/org-members/org_members_page_hero_section.png` |
| 8 | New image added | `org_onboarding_page/org_onboarding_pageherosection.png` | `assets/image/pages/org-onboarding/org_onboarding_page_hero_section.png` |
| 9 | Signup mockup added | `signuppage/signup_pagemockup.png` | `mockup/signup_page_mockup.png` |
| 10 | MD naming made consistent | `billing_page.md` | `billing_page_md.md` |
| 11 | MD naming made consistent | `signup_page.md` | `signup_page_md.md` |
| 12 | Misplaced MD moved | `billing page /CommunityGreenToken_BillingPage_Starter.md` | `ux_ui/feature_specv2/billing_page_component_starter.md` |

---

## Remaining Issues — Needs Your Decision

### 1. SOURCE IMAGE FOLDERS at Root Level

These folders contain the **original source images** you added. Their clean copies are already in `assets/image/pages/`. The folders have messy names with spaces/caps.

| Folder | Issue | Canonical Copy Location |
|---|---|---|
| `about page /` | Space in name | `assets/image/pages/about-us/` ✅ |
| `Admin Dashboard Page /` | Spaces + uppercase | `assets/image/pages/org-admin/` ✅ |
| `billing page /` | Space in name | No image (only MD, now moved) |
| `howitworks /` | Trailing space | `assets/image/pages/how-it-works/` ✅ |
| `Org Member Managementpage/` | Uppercase + run-on | `assets/image/pages/org-members/` ✅ |
| `Org Settings Page/` | Spaces + uppercase | `assets/image/pages/org-settings/` ✅ |
| `Pricing Page /` | Spaces + uppercase | `assets/image/pages/pricing/` ✅ |
| `siginpage/` | Typo ("sigin") | `assets/image/pages/auth/` ✅ |
| `sidebar/` | Clean name | `assets/image/sidebar/` ✅ |

**Decision needed:** Since clean copies exist in `assets/image/pages/`, do you want to:
- **Option A:** Delete the original scattered folders (they are no longer needed)
- **Option B:** Keep them as source backup (current state)

### 2. `assets/image/pages/billing/` — EMPTY

No billing hero image has been provided yet. The folder is empty.  
**Action needed:** Add a billing page hero image, or remove the empty folder.

### 3. `donation_tracking_mockup.png` — Naming Inconsistency

Most mockups follow `{page_name}_page_mockup.png` but this one is `donation_tracking_mockup.png` (missing `_page_`).  
**Suggested rename:** `donation_tracking_page_mockup.png`

### 4. Double-Extension Files Still in Source Folders

These originals still have double extensions (clean copies are in `assets/image/pages/`):
- `about page / nurtured_nature_hero.png.png`
- `signuppage/signup_hero_bg.png.png`
- `Pricing Page / price_page.png.png`

These are harmless as long as code only imports from `assets/image/pages/`.

---

## File Count Summary

| Folder | MD Files | JS Files | PNG/Images | Total |
|---|---|---|---|---|
| `architecture/` | 16 | 0 | 0 | 16 |
| `assets/image/` (all) | 6 guides | 0 | 33 | 39 |
| `banner/` | 1 | 0 | 1 | 2 |
| `branding/` | 0 | 0 | 3 | 3 |
| `foundation/` | 6 | 0 | 0 | 6 (+1 CSV) |
| `implementation/` | 12 | 0 | 0 | 12 |
| `mockup/` | 0 | 0 | 15 | 15 |
| `saas/` | 10 | 0 | 0 | 10 |
| `ux_ui/feature_specv2/` | 26 | 19 | 0 | 45 |
| `ux_ui/features_specs/` | 9 | 0 | 0 | 9 |
| Root level | 7 | 0 | 0 | 7 |
| **TOTAL (organized)** | **93** | **19** | **52** | **165** |

---

## Professional Assessment

### What is in Good Shape ✅

| Area | Status |
|---|---|
| `architecture/` folder | Professional, complete, well-named |
| `assets/image/pages/` | Clean hierarchy per page |
| `assets/image/sidebar/` | Organized with guide docs |
| `banner/` folder | Purposeful with usage guide |
| `branding/` | Clean lowercase filenames, RGBA transparency |
| `foundation/` | Logically grouped, clean names |
| `implementation/` | Complete, well-organized |
| `mockup/` | All 15 pages, now consistent naming |
| `saas/` | 10 professional architecture docs |
| `ux_ui/` | Comprehensive, all pages covered |
| `README.md` | Professional hackathon-ready |
| `.env.example` | All variables documented |

### What Still Needs Attention ⚠️

| Issue | Priority | Blocked on |
|---|---|---|
| Scattered root source folders | Medium | Your decision (keep or remove) |
| `assets/image/pages/billing/` empty | Low | Need a billing hero image |
| `donation_tracking_mockup.png` naming | Low | Rename to `..._page_mockup.png` |
