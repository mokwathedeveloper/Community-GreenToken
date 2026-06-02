# Community GreenToken — Org Member Management Page MD

**Route:** `/org/admin/members` | **Access:** `owner` or `admin` role

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero / page header | `assets/image/pages/org-members/org_members_hero.png` | 1536×1024 | Top page header banner |
| Shared banner | `assets/image/banner.png` | 1916×821 | Optional fallback banner |
| Sidebar bottom | `assets/image/sidebar/sidebar_bottom_all_pages.png` | 1254×1254 | Sidebar bottom-left |

> See `assets/image/sidebar/sidebar_all_pages_guide.md` for sidebar image guide.

## 1. Components
- `MemberTable` – Paginated, searchable table of all org members.
- `MemberRoleBadge` – Color-coded badge: Owner / Admin / Member.
- `InviteModal` – Generate invite link or send email invites.
- `BulkActionBar` – Appears when rows are selected: bulk role change, bulk remove.
- `MemberLimitBar` – Usage bar: X / Y members used (links to billing).
- `RoleChangeDropdown` – Inline dropdown to change a member's role.
- `RemoveMemberModal` – Confirmation before removing a member.

## 2. States
- **Default:** Full member table, paginated.
- **Search active:** Table filters to matching names/emails.
- **Row selected:** `BulkActionBar` slides in at the bottom.
- **Limit reached:** "Invite" button disabled; tooltip explains upgrade required.
- **Empty:** "No members yet" with large invite CTA.

## 3. Table Columns
| Column | Description |
|---|---|
| Avatar + Name | Display name or email |
| Role | Owner / Admin / Member badge |
| Token Balance | Current org token balance |
| Actions Submitted | Total lifetime actions |
| Joined | Date joined the org |
| Last Active | Last login or action date |
| Actions | Role dropdown + Remove button |

## 4. Primary Route
- `/org/admin/members`
- Accessible from org admin nav tabs

## 5. Key Interactions
1. **Search:** Type in search bar → live-filter table by name/email.
2. **Change role:** Click role badge → dropdown → confirm → `PUT /api/orgs/:id/members/:userId/role`.
3. **Remove member:** Click "Remove" → `RemoveMemberModal` → `DELETE /api/orgs/:id/members/:userId`.
4. **Invite new members:** Click "Invite Members" → `InviteModal` with link + email options.
5. **Bulk actions:** Select checkboxes → `BulkActionBar` with "Set as Admin" / "Remove Selected".
6. **Export:** "Export CSV" button → downloads member list with token balances.

## 6. Invite Modal Detail
```
┌─────────────────────────────────────────┐
│  Invite Members                         │
│                                         │
│  Share invite link:                     │
│  ┌─────────────────────────────────┐    │
│  │ capetown.greentoken.app/join/   │    │
│  │ abc123def456                    │    │
│  └─────────────────────────────────┘    │
│  [ 📋 Copy ]   Expires in 7 days        │
│                                         │
│  Or send by email:                      │
│  [email1@example.com        ] [+ Add]   │
│  [email2@example.com        ]           │
│                                         │
│  Role: ○ Admin  ● Member               │
│                                         │
│  [ Cancel ]     [ Send Invites ]        │
└─────────────────────────────────────────┘
```

## 7. Folder Structure
```
frontend/
├── components/
│   ├── MemberTable.jsx
│   ├── MemberRoleBadge.jsx
│   ├── InviteModal.jsx
│   ├── BulkActionBar.jsx
│   ├── MemberLimitBar.jsx
│   └── RemoveMemberModal.jsx
├── pages/
│   └── org/
│       └── admin/
│           └── members.jsx
└── data/
    └── mockMemberData.js
```

## 8. UX/UI Notes
- Owner badge is gold, Admin is blue, Member is grey.
- Removing the last owner is blocked with a clear error message.
- "You cannot remove yourself" if the admin tries to remove their own account.
- `MemberLimitBar` at the top of the page is always visible — constant reminder of plan limits.
- Mobile: table collapses to card list (name + role + token balance per card).

## 9. Accessibility
- Table uses `<th scope="col">` for all headers.
- Role change dropdown uses `role="combobox"` with keyboard navigation.
- Modals trap focus and support Escape to close.
- Bulk action checkbox has `aria-label="Select all members"`.
