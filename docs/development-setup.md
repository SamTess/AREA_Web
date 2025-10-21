# 🛠️ Development Setup Guide

## 🎯 **Development Environment Configuration**

Development setup (short)

This document describes the recommended development environment, core configuration files and workflow used by the AREA Web frontend.

System requirements
-------------------

- Node.js 18.x or later
- Yarn 1.22.x (or Corepack-enabled Yarn)
- Git
- Recommended: 8GB RAM for comfortable local builds

Project overview
----------------

- Framework: Next.js (App Router) with TypeScript
- UI: Mantine + CSS Modules (Tailwind may be used in parts)
- Tests: Jest (unit) and Cypress (E2E)

Key scripts (package.json)
--------------------------

Common scripts you will use:

- `yarn dev` — run the development server
- `yarn build` — run a production build
- `yarn start` — start the production server
- `yarn lint` / `yarn lint:fix` — lint and auto-fix
- `yarn test` / `yarn test:watch` — run unit tests
- `yarn cypress:open` / `yarn cypress:run` — E2E tests

Configuration highlights
-----------------------

- `tsconfig.json` — TypeScript options and path aliases
- `jest.config.js` — Jest + Next configuration
- `cypress.config.ts` — E2E settings and baseUrl
- `eslint.config.mjs` — ESLint configuration and rules

Recommended editor & extensions
--------------------------------

- VS Code with: ESLint, Prettier, TypeScript, Tailwind CSS IntelliSense, Jest extensions
- Workspace settings: format on save, ESLint code actions on save

Workflow & tips
---------------

Daily workflow:

1. Start dev server: `yarn dev`
2. Use `yarn test:watch` to run tests while developing
3. Run `yarn lint` and `yarn build` before creating a PR

Feature branch checklist:

- Create a feature branch from `main` (or your project's target branch)
- Add tests for new features
- Run lint and tests locally
- Push and open a PR with a clear description

Troubleshooting quick fixes
--------------------------

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules yarn.lock && yarn install`
- Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 yarn build`

If you want, I can produce a short, copyable `.vscode/settings.json` and `launch.json` tuned for this repo.