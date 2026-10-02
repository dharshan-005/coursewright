# Learning Management System

A Full-Stack Online Learning Management System — a 4-member college Major
Project. Each part of the stack lives in its own top-level folder so it's
clear who owns what.

```
learning-management-system/
├── frontend/     React UI — built and maintained here (see frontend/README.md)
├── backend/      Node.js/Express API, database, auth — to be added by teammates
└── README.md     This file
```

## Who owns what

- **`frontend/`** — Frontend UI/UX & Responsive Design. A complete React app
  (Vite + React Router) with all 15 pages, mock data, and a mock API layer in
  `frontend/src/api/` ready for the backend to plug into. Full details, setup
  steps, and design notes are in `frontend/README.md`.
- **`backend/`** — Not included here. Whoever owns the backend should add a
  `backend/` folder at this same level with the Node.js/Express server,
  database models, and JWT auth. The mock functions in `frontend/src/api/`
  each have a comment showing exactly what shape of response they expect.

## Getting the frontend running

```powershell
cd frontend
npm install
npm run dev
```

See `frontend/README.md` for the full breakdown of pages, components, and how
to wire up real backend endpoints once they exist.

## Git & GitHub workflow (Windows PowerShell)

Run these commands from this folder (`learning-management-system`), one level
above `frontend/`, so the whole project — frontend and backend together —
lives in a single repository.

### 1. Initialize Git in the project

```powershell
git init
git add .
git commit -m "Initial commit: frontend UI structure"
```

### 2. Create a GitHub repository

1. Go to [github.com/new](https://github.com/new).
2. Name it (e.g. `learning-management-system`), choose Public or Private, and
   **do not** initialize with a README, .gitignore, or license (you already
   have them).
3. Click **Create repository**.

### 3. Connect your local project to GitHub

Copy the URL GitHub shows you, then run:

```powershell
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
```

### 4. Push the project

```powershell
git push -u origin main
```

### 5. Create a frontend branch

If your team wants each part of the stack developed on its own branch before
merging into `main`:

```powershell
git checkout -b frontend
git push -u origin frontend
```

Your teammate building the backend would do the same with `git checkout -b
backend` in their own clone, and add their code under a `backend/` folder.

### 6. How teammates clone the repository

```powershell
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>/frontend
npm install
```

### 7. How teammates create their own branches

```powershell
git checkout -b backend-api
# or
git checkout -b feature/login-endpoint
```

### 8. How to pull the latest changes

Before starting work each day:

```powershell
git checkout main
git pull origin main
```

### 9. How to create and merge pull requests

1. Push your branch: `git push -u origin <branch-name>`
2. On GitHub, open the repository and click **Compare & pull request**.
3. Set the base branch (usually `main`) and the compare branch (your feature
   branch), add a short description, and click **Create pull request**.
4. Ask a teammate to review; once approved, click **Merge pull request**.
5. Back in PowerShell, update your local `main`:
   ```powershell
   git checkout main
   git pull origin main
   ```
