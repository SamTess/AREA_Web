# 🚀 CI Pipeline Guide

## 🎯 **Overview**

Our GitHub Actions CI pipeline provides automated testing, building, and deployment for the frontend. This guide explains how it works and how to optimize it.

---

## 📋 **Pipeline Architecture**

### **Workflow File Location**
```
.github/workflows/CI_Front_Web.yaml
```

### **Trigger Events**
```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:  # Manual trigger
```

### **Pipeline Jobs Overview**
# CI pipeline guide

This document summarizes the front-end CI pipeline (GitHub Actions) and best practices for keeping CI fast, reliable and actionable.

Workflow location
-----------------

- Primary workflow: `.github/workflows/CI_Front_Web.yaml` (if present).
- Triggers: push to main/develop, pull requests, and manual dispatch.

Jobs overview
-------------

Typical jobs in the pipeline:

1. install — install dependencies and restore caches
2. lint — ESLint checks
3. type-check — TypeScript validation
4. test — Jest unit/component tests and coverage
5. test-e2e — Cypress end-to-end tests (optional/conditional)
6. build — production build
7. release — create release artifacts (main branch)
8. docs — documentation generation

Caching recommendations
-----------------------

- Cache dependencies (Yarn cache, node_modules) keyed by lockfile hash.
- Cache Next.js build output (`.next/cache`) to speed subsequent builds.

Testing and artifacts
---------------------

- Unit tests: run `yarn test --coverage --watchAll=false`. Upload coverage (e.g., to Codecov) if enabled.
- E2E tests: start a dev server, wait for readiness (e.g. `wait-on`), then run `yarn cypress:run`.
- On failures, collect test artifacts (screenshots, videos, logs) for debugging.

Build and release
-----------------

- Build: `yarn build` (disable telemetry via `NEXT_TELEMETRY_DISABLED=1` in CI if desired).
- Optionally export static files (`yarn export`) and upload `.next/` or `out/` as build artifacts.
- Release: create releases and trigger deployment steps only from `main` (or your release branch).

Code quality and checks
-----------------------

- Run ESLint and annotate PRs with errors.
- Run TypeScript checks (`yarn tsc --noEmit` or `yarn build --dry-run`).
- Run dependency audits (`yarn audit`) and treat high severity issues as blockers.

CI troubleshooting tips
-----------------------

- Dependency install failures: ensure private registry auth (NPM_TOKEN) and .npmrc settings in CI.
- Test timeouts: increase jest/cypress timeouts, mock slow external services, or split long tests.
- Memory issues: set `NODE_OPTIONS=--max-old-space-size=4096` for build steps.

Optimizations and best practices
--------------------------------

- Run lint/type-check/test in parallel after install to get fast feedback.
- Use selective testing (run related tests only on PRs) to reduce CI time.
- Skip E2E on small doc-only PRs or run conditionally.

Related docs
------------

- Yarn migration: `docs/yarn-migration.md`
- Getting started: `docs/getting-started.md`
- Development setup: `docs/development-setup.md`
- Testing strategy: `docs/testing-strategy.md`
- Troubleshooting: `docs/troubleshooting.md`

If you want, I can produce a small example GitHub Actions workflow snippet tailored to this repo.