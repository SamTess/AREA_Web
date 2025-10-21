
# Contributing

Thank you for contributing to AREA Web. This page explains the expected workflow, coding standards and how to submit a pull request.

Prerequisites
-------------

- Node.js 18+ and Yarn (or npm)
- Git access to the repository

Quick start
-----------

1. Fork the repository and clone your fork:

```bash
git clone https://github.com/your-username/AREA_Web.git
cd AREA_Web
```

2. Add upstream remote and create a feature branch:

```bash
git remote add upstream https://github.com/SamTess/AREA_Web.git
git fetch upstream
git checkout -b feature/your-feature
```

Development checklist
---------------------

- Install dependencies: `yarn install`
- Copy env template if provided: `cp .env.example .env.local` and update values
- Run the dev server: `yarn dev`
- Run unit tests: `yarn test`
- Lint: `yarn lint`

Coding standards
----------------

- Use TypeScript for new code.
- Follow ESLint and Prettier rules. Run `yarn lint` before committing.
- Prefer small, focused pull requests with clear titles and descriptions.
- Add unit tests for new logic and components. Keep coverage healthy.

Testing
-------

- Unit tests: `yarn test`
- E2E tests: `yarn cypress:run` (or `yarn cypress:open` for interactive runs)

Submitting a pull request
------------------------

1. Commit with a clear message (conventional commits recommended):

```bash
git add .
git commit -m "feat(area): add area creation flow"
git push origin feature/your-feature
```

2. Open a pull request against `main` (or the project branch you were asked to target). Include:

- What the change does
- Any migration or environment variable changes
- How to test locally

Review process
--------------

- At least one maintainer review is required.
- Address review comments and push fixes to the same branch.
- Squash commits if requested by maintainers.

More resources
--------------

- Project docs: `docs/`
- Development setup: `docs/development-setup.md`
- Testing strategy: `docs/testing-strategy.md`

Thanks for helping improve AREA Web!