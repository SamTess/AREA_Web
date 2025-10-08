# How to Contribute Code

Welcome! We appreciate your interest in contributing to the AREA Web project. This guide will help you get started with contributing code to our Next.js-based web application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)
- [Additional Resources](#additional-resources)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn
- Git
- Docker (optional, for containerized development)

## Getting Started

1. **Fork the repository**: Click the "Fork" button on the GitHub repository page to create your own copy.

2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/AREA_Web.git
   cd AREA_Web
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/SamTess/AREA_Web.git
   ```

4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables**: Copy `.env.example` to `.env.local` and fill in the required values.

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Run tests**:
   ```bash
   npm test
   # or
   yarn test
   ```

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code style (ESLint and Prettier are configured)
- Write meaningful commit messages
- Use descriptive variable and function names
- Add JSDoc comments for public APIs

### Code Style

Run the linter before committing:
```bash
npm run lint
```

Format code with Prettier:
```bash
npm run format
```

## Testing

We use Jest for unit tests and Cypress for end-to-end tests.

### Running Tests

- **Unit tests**: `npm test`
- **E2E tests**: `npm run cypress:run`
- **Coverage**: `npm run test:coverage`

### Writing Tests

- Write unit tests for all new functions and components
- Ensure test coverage is maintained above 80%
- Use descriptive test names and arrange-act-assert pattern

## Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template with details

## Code Review Process

- All PRs require review from at least one maintainer
- Address review comments promptly
- Keep PRs focused on a single feature or fix
- Squash commits if requested

## Additional Resources

- [Project README](../README.md)
- [Development Setup Guide](development-setup.md)
- [Testing Strategy](testing-strategy.md)
- [API Configuration](API_CONFIGURATION.md)

Thank you for contributing to AREA Web! Your efforts help improve the project for everyone.