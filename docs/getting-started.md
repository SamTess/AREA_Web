# 🚀 Getting Started Guide

## 👋 **Welcome to AREA Web Frontend**

This guide will help new team members get up and running with our Next.js frontend project.

---

## 📋 **Prerequisites**

Before you start, make sure you have:

- **Node.js** 18.17 or later ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))
- **Yarn** package manager (we'll install this)
- **VS Code** (recommended editor)

---

## 🛠️ **Initial Setup**

### **1. Install Yarn**

**Option A: Using npm**
```bash
npm install -g yarn
```

**Option B: Using Corepack (Node 16.10+)**
```bash
corepack enable
```

**Verify installation:**
```bash
yarn --version
# Should show: 1.22.x or later
Getting started (short)

This guide helps new contributors run the AREA Web frontend locally.

Prerequisites
-------------

- Node.js 18.x or later
- Yarn (or enable Corepack)
- Git
- Recommended: VS Code

Clone and install
-----------------

```bash
git clone <repo-url>
cd AREA_Web
yarn install
cp .env.example .env.local  # if present; update values
```

Run the app
-----------

```bash
yarn dev
# Open http://localhost:3000
```

Useful scripts
--------------

- `yarn dev` — start dev server
- `yarn build` — production build
- `yarn start` — run production server
- `yarn lint` — lint code
- `yarn test` — run unit tests
- `yarn cypress:open` — open E2E runner

First PR checklist
------------------

1. Create a feature branch: `git checkout -b feature/...`
2. Run and add tests for new behavior
3. Run `yarn lint` and `yarn test`
4. Push branch and open a PR

If you need help, check `docs/` or contact the team.