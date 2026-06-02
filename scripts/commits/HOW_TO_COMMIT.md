# Community GreenToken — Team Commit Guide

**Goal:** Get ~200 commits on GitHub so judges see every contributor's work clearly.

---

## Team Members & Their Scripts

| GitHub Username | Real Name | Role | Script | Commits |
|---|---|---|---|---|
| `mokwathedeveloper` | Mokwa Moffat Ohuru | Project Lead / Architecture / Stellar | `commit_mokwathedeveloper.sh` | ~40 |
| `RockieRaheem` | Kamwanga Raheem | UX/UI Design / Mockups / Page Specs | `commit_RockieRaheem.sh` | ~55 |
| `TekguruCybersec` | Collins Nyamwaya | Backend / Security / Blockchain | `commit_TekguruCybersec.sh` | ~50 |
| `Tumusando` | Tumusando | Frontend / Assets / Starter Code | `commit_Tumusando.sh` | ~50 |

**Total: ~195 commits**

---

## IMPORTANT: Run Scripts IN THIS ORDER

```
1. mokwathedeveloper runs their script first
2. RockieRaheem runs their script second
3. TekguruCybersec runs their script third
4. Tumusando runs their script last
```

Each person must `git pull` before running if they're on a different machine.

---

## How Each Person Runs Their Script

### Step 1 — Clone the repo (if not already cloned)
```bash
git clone https://github.com/mokwathedeveloper/Community-GreenToken.git
cd Community-GreenToken
```

### Step 2 — Pull latest (ALWAYS do this before your commits)
```bash
git pull origin master
```

### Step 3 — Run your commit script
```bash
# Replace with YOUR script name
bash scripts/commits/commit_RockieRaheem.sh
```

The script:
- Sets your name and email automatically ✅
- Commits each file with a meaningful message ✅
- Pushes everything to GitHub ✅

---

## If You Want to Do It Manually (One File at a Time)

### 1. Set your identity first (only once per machine)
```bash
# Replace with YOUR name and email from the table below
git config user.name "Kamwanga Raheem"
git config user.email "134764730+RockieRaheem@users.noreply.github.com"
```

### 2. Stage one file
```bash
git add ux_ui/feature_specv2/landing_page_md.md
```

### 3. Commit with a meaningful message
```bash
git commit -m "feat(pages): add landing page specification with hero and banner"
```

### 4. Push
```bash
git push origin master
```

### 5. Repeat for each file

---

## GitHub Email Reference (use these exactly)

| Username | Email to use in git config |
|---|---|
| `mokwathedeveloper` | `135048252+mokwathedeveloper@users.noreply.github.com` |
| `RockieRaheem` | `134764730+RockieRaheem@users.noreply.github.com` |
| `TekguruCybersec` | `nyamwayacollins23@gmail.com` |
| `Tumusando` | `229076553+Tumusando@users.noreply.github.com` |

> These are GitHub no-reply emails. Using them ensures your commits show up on your GitHub profile contribution graph.

---

## Commit Message Format

Every commit follows this pattern:
```
type(scope): short description
```

| Type | When to use |
|---|---|
| `feat` | Adding a new file or feature |
| `docs` | Documentation changes |
| `fix` | Fixing a bug or incorrect content |
| `design` | Adding or updating image/design files |
| `assets` | Adding image files |
| `config` | Configuration files |
| `refactor` | Reorganizing without changing content |

### Examples
```bash
git commit -m "feat(stellar): add Soroban smart contract architecture spec"
git commit -m "design: add dashboard page mockup"
git commit -m "docs(ux): add design system with color tokens"
git commit -m "assets: add landing page hero image"
```

---

## After All Scripts Are Run

Check the commit graph:
```bash
git log --oneline | wc -l   # should show ~200
git shortlog -sn             # shows commits per author
```

View on GitHub:
- `https://github.com/mokwathedeveloper/Community-GreenToken/graphs/contributors`
- This is what judges will look at!

---

## Troubleshooting

**"rejected — non-fast-forward"**
```bash
git pull origin master --rebase
git push origin master
```

**"nothing to commit"** — that file was already committed. Skip it.

**Script fails halfway** — Run `git status`, identify where it stopped, then continue manually from the next uncommitted file.
