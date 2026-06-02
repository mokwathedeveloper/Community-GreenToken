# Community GreenToken — Org Settings Page MD

**Route:** `/org/admin/settings` | **Access:** `owner` role only

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero background | `assets/image/pages/org-settings/org_settings_hero.png` | 1942×809 | Top hero section |
| Page illustration | `assets/image/pages/org-settings/org_settings_page.png` | 1402×1122 | Visual reference / section illustration |
| Shared banner | `assets/image/banner.png` | 1916×821 | Optional fallback banner |
| Sidebar bottom | `assets/image/sidebar/sidebar_bottom_all_pages.png` | 1254×1254 | Sidebar bottom-left |

> See `Org Settings Page/org_settings_hero.md` for hero implementation.  
> See `assets/image/sidebar/sidebar_all_pages_guide.md` for sidebar image guide.

## 1. Components
- `OrgProfileForm` – Editable: org name, logo upload, contact email.
- `TokenConfigForm` – Editable: token name, symbol, brand primary color, action types.
- `ActionTypesEditor` – Add/remove/reorder custom action types with token reward values.
- `ContractInfoCard` – Read-only: contract address, network, explorer link.
- `DangerZone` – Delete organization (requires email confirmation).
- `SettingsNavTabs` – Tabs: Profile / Token / Actions / Contract / Danger Zone.

## 2. States
- **Default:** Forms show current saved values.
- **Editing:** Form fields become editable; save/cancel buttons appear.
- **Saving:** Inline spinner on save button; success toast on complete.
- **Error:** Inline validation errors below fields.
- **Danger Zone:** "Delete Org" button requires typing the org name to confirm.

## 3. Data
- `GET /api/orgs/:id` — current org settings
- `PUT /api/orgs/:id` — update profile
- `PUT /api/orgs/:id/config` — update token config + action types

## 4. Primary Route
- `/org/admin/settings`
- Accessible from org admin nav (owner only)

## 5. Token Configuration Section

```
Token Name:    [CapeTownGreen          ]
Token Symbol:  [CTG  ]  (3–5 uppercase letters)
Brand Color:   [#2ECC71  ████ ]  (color picker)

Action Types & Token Rewards:
┌────────────────────────────────────────┐
│ ☑ Recycling             10 tokens      │
│ ☑ Tree Planting         20 tokens      │
│ ☑ Carpooling            15 tokens      │
│ ☑ Community Clean-up    25 tokens      │
│ ☐ Water Saving          10 tokens      │
│ [+ Add Custom Action Type]             │
└────────────────────────────────────────┘
```

Note: Unlimited custom action types on Pro/Enterprise; capped at 10 on Starter.

## 6. Danger Zone Section

```
┌────────────────────────────────────────┐
│  ⚠️  Danger Zone                       │
│                                        │
│  Delete this organization              │
│  This action permanently deletes all   │
│  members, tokens, and data. It cannot  │
│  be undone.                            │
│                                        │
│  Type "capetown" to confirm:           │
│  [                    ]                │
│                                        │
│  [ Delete Organization ]  (disabled    │
│    until org name typed correctly)     │
└────────────────────────────────────────┘
```

## 7. Key Interactions
1. **Edit profile:** Click "Edit" → fields unlock → save/cancel appear.
2. **Upload logo:** Drag-and-drop or file picker → uploads to Supabase Storage → preview updates.
3. **Color picker:** Opens inline color picker → brand preview updates live in right panel.
4. **Add action type:** Click "+ Add Custom Action Type" → inline form → saved on submit.
5. **Reorder actions:** Drag handle to reorder display priority.
6. **Delete org:** Requires typing org slug + confirmation modal → triggers data export + deletion.

## 8. Folder Structure
```
frontend/
├── components/
│   ├── OrgProfileForm.jsx
│   ├── TokenConfigForm.jsx
│   ├── ActionTypesEditor.jsx
│   ├── ContractInfoCard.jsx
│   └── DangerZone.jsx
├── pages/
│   └── org/
│       └── admin/
│           └── settings.jsx
```

## 9. UX/UI Notes
- `DangerZone` section is at the bottom with red border to signal irreversibility.
- Token symbol field auto-uppercases input.
- Slug (subdomain) is **read-only** after org creation — label it "cannot be changed".
- Show a live brand preview panel (right side on desktop) that reflects color/logo changes.
- Save button only activates when form values differ from saved state (dirty check).

## 10. Accessibility
- `DangerZone` confirmation input has `aria-describedby` linking to the warning text.
- Color picker has a text input alternative for hex code entry.
- Logo upload uses `<input type="file" accept="image/*">` with keyboard access.
- All form sections have `<fieldset>` + `<legend>` grouping.
