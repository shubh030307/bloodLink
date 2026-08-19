# Contributing Guidelines (Two-Member Workflow)

Welcome to the project! This document outlines the Git/GitHub workflow for our two-member team to develop the React (Frontend) and Node.js/Prisma (Backend) application collaboratively.

## Repository Setup
The project uses `main` as the stable branch. **Never commit directly to `main`**.
Instead, both members will use personal branches:
- **Member 1 Branch**: `member-1` (Primary Focus: Frontend - `frontend/`)
- **Member 2 Branch**: `member-2` (Primary Focus: Backend - `server/`)

### Creating Your Branch (First Time Only)
Run these commands after cloning the repository:
```bash
# Pull the latest main
git checkout main
git pull origin main

# Create and switch to your personal branch
# For Member 1:
git checkout -b member-1

# For Member 2:
git checkout -b member-2

# Push your new branch to GitHub
git push -u origin <your-branch-name>
```

---

## Daily Synchronization Workflow

To avoid overwriting each other's work and to resolve conflicts early, follow this daily workflow:

### 1. Before Starting Work (Sync with Main)
Always update your branch with the latest stable code from `main` before writing new code.
```bash
# Ensure you have no uncommitted changes
git status

# Switch to main and pull latest changes from GitHub
git checkout main
git pull origin main

# Switch back to your branch
git checkout <your-branch-name>

# Merge main into your branch
git merge main
```
*If conflicts occur here, it means the other member modified the same file you did. See the "Conflict Resolution" section.*

### 2. During Development
* **Work only on your branch.**
* Keep your commits small, frequent, and meaningful.
```bash
git add .
git commit -m "feat: added new donor registration UI"
```

### 3. After Completing Work (Pushing and PR)
Once your feature or task is complete and **tested locally**, push it to GitHub and create a Pull Request (PR) into `main`.
```bash
# Push your branch
git push origin <your-branch-name>
```
* Go to GitHub and open a **Pull Request (PR)** from `<your-branch-name>` into `main`.
* The other member should briefly review the code.
* Once approved, **Squash and Merge** or **Merge** the PR into `main`.

---

## Division of Work & Preventing Conflicts

To minimize merge conflicts, the team will divide the work based on the project architecture:
* **Member 1 (Frontend)**: Responsible for the React app inside the `frontend/` directory (components, pages, routing, API integration).
* **Member 2 (Backend)**: Responsible for the Node.js API inside the `server/` directory (controllers, routes, services).

### Shared Boundaries (Caution Required!)
Both members might occasionally need to touch the same files. **Communicate before modifying these**:
1. **`server/prisma/schema.prisma`**: Changing the database schema affects both the backend logic and the frontend data types. If Member 2 changes this, Member 1 must be informed.
2. **API Routes (`server/src/routes/`) & Controllers**: Modifying how an API endpoint receives data or what it returns will break the frontend if Member 1 isn't aware.
3. **`package.json`**: When adding new NPM dependencies, do so in separate PRs to avoid dependency tree conflicts.

---

## Conflict Resolution

If a merge conflict happens (e.g., when running `git merge main` on your branch), Git will pause the merge and highlight the files with conflicts.

1. **Do NOT panic.** Your code is safe.
2. Open the conflicted file(s) in your IDE (VS Code). Look for the conflict markers:
   ```text
   <<<<<<< HEAD
   (Your changes on your branch)
   =======
   (Changes from main)
   >>>>>>> main
   ```
3. Decide what to keep: Accept Current Change (Yours), Accept Incoming Change (Main's), or manually combine both.
4. After resolving all files:
   ```bash
   git add .
   git commit -m "chore: resolve merge conflicts from main"
   ```
5. Continue your work.

## Safety Rules
* **Never commit `.env` files, passwords, or API Keys.**
* **Never commit PostgreSQL backups or raw data unless required.**
* **Never use `git push -f` (force push) on `main`.**
