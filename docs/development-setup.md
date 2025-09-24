# 🛠️ Development Setup Guide

## 🎯 **Development Environment Configuration**

This guide covers the detailed setup for development environment, tools, and workflow optimization.

---

## 📋 **System Requirements**

### **Minimum Requirements**
- **Node.js**: 18.17.0 or later
- **Yarn**: 1.22.0 or later
- **Git**: 2.x or later
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space for dependencies

### **Recommended Setup**
- **OS**: Linux/macOS (Windows with WSL2)
- **Editor**: VS Code with extensions
- **Terminal**: zsh/bash with Git support
- **Browser**: Chrome/Firefox with dev tools

---

## 🏗️ **Project Architecture**

### **Tech Stack**
```
Frontend Framework    → Next.js 15.5.3 (App Router)
React Version         → React 19 (latest)
Language             → TypeScript 5.x
Styling              → Tailwind CSS + CSS Modules
UI Components        → Mantine 7.x
Package Manager      → Yarn 1.22.x
Build Tool           → Turbopack (dev) / Webpack (prod)
```

### **Development Tools**
```
Code Quality         → ESLint + TypeScript
Testing Unit         → Jest + Testing Library
Testing E2E          → Cypress
CI/CD               → GitHub Actions
Version Control      → Git with conventional commits
```

---

## ⚙️ **Configuration Files**

### **package.json - Scripts Explained**

```json
{
  "scripts": {
    "dev": "next dev --turbopack",          // Development with Turbopack
    "build": "next build",                   // Production build
    "start": "next start",                   // Production server
    "lint": "next lint",                     // ESLint check
    "lint:fix": "next lint --fix",           // Auto-fix ESLint issues
    "test": "jest",                          // Unit tests
    "test:watch": "jest --watch",            // Watch mode testing
    "test:coverage": "jest --coverage",      // Coverage report
    "cypress:open": "cypress open",          // Cypress UI
    "cypress:run": "cypress run",            // Headless E2E tests
    "cypress:ci": "start-server-and-test dev http://localhost:3000 cypress:run"
  }
}
```

### **tsconfig.json - TypeScript Configuration**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],           // Path aliases
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "__tests__",          // Exclude tests from build
    "cypress"            // Exclude E2E tests from build
  ]
}
```

### **jest.config.js - Testing Configuration**

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',  // Path to Next.js app
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### **cypress.config.ts - E2E Configuration**

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,              // Disable video recording
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
})
```

---

## 🎨 **Code Style & Standards**

### **ESLint Configuration**

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
    }
  }
];

export default eslintConfig;
```

### **Coding Standards**

**File Naming:**
```
Components    → PascalCase (Button.tsx, UserProfile.tsx)
Pages         → kebab-case (user-profile.tsx, about-us.tsx)
Utilities     → camelCase (formatDate.ts, apiClient.ts)
Constants     → SCREAMING_SNAKE_CASE (API_ENDPOINTS.ts)
```

**Import Order:**
```typescript
// 1. React and Next.js
import React from 'react'
import Link from 'next/link'

// 2. Third-party libraries
import { Button } from '@mantine/core'
import axios from 'axios'

// 3. Internal imports (absolute paths)
import { apiClient } from '@/lib/api'
import { UserProfile } from '@/components/UserProfile'

// 4. Relative imports
import './styles.module.css'
```

**Component Structure:**
```typescript
// 1. Imports

// 2. Types/Interfaces
interface Props {
  title: string
  onClick?: () => void
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title, onClick }) => {
  // 4. Hooks
  const [state, setState] = useState('')

  // 5. Event handlers
  const handleClick = () => {
    onClick?.()
  }

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  )
}
```

---

## 🧪 **Testing Setup**

### **Unit Testing with Jest**

**Test File Structure:**
```
src/components/Button.tsx
__tests__/Button.test.tsx     ← Unit tests here
```

**Test Template:**
```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { Button } from '@/components/Button'

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MantineProvider>{component}</MantineProvider>
  )
}

describe('Button Component', () => {
  test('renders correctly', () => {
    renderWithProvider(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  test('handles click events', () => {
    const mockClick = jest.fn()
    renderWithProvider(<Button onClick={mockClick}>Click me</Button>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockClick).toHaveBeenCalledTimes(1)
  })
})
```

### **E2E Testing with Cypress**

**Test File Structure:**
```
cypress/e2e/user-flow.cy.ts    ← E2E tests here
cypress/support/commands.ts    ← Custom commands
```

**E2E Test Template:**
```typescript
// cypress/e2e/user-flow.cy.ts
describe('User Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should login successfully', () => {
    cy.get('[data-testid="email-input"]').type('user@example.com')
    cy.get('[data-testid="password-input"]').type('password')
    cy.get('[data-testid="login-button"]').click()

    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="welcome-message"]').should('be.visible')
  })
})
```

---

## 🚀 **Development Workflow**

### **Daily Development**

```bash
# 1. Start development server
yarn dev

# 2. Run tests in watch mode (separate terminal)
yarn test:watch

# 3. Make changes to code
# Files in src/ will auto-reload

# 4. Before committing
yarn lint           # Check code quality
yarn test           # Run all tests
yarn build          # Verify build works
```

### **Feature Development**

```bash
# 1. Create feature branch
git checkout -b feature/user-authentication

# 2. Make changes with tests
# - Write failing test first (TDD)
# - Implement feature
# - Make test pass
# - Refactor if needed

# 3. Test everything
yarn lint
yarn test
yarn cypress:run    # If you changed user flows

# 4. Commit with conventional commits
git commit -m "feat(auth): add user login functionality"

# 5. Push and create PR
git push origin feature/user-authentication
```

### **Debugging Techniques**

**Console Debugging:**
```typescript
console.log('Debug value:', variable)
console.table(array)          // For arrays/objects
console.time('operation')     // Performance timing
console.timeEnd('operation')
```

**React DevTools:**
- Install browser extension
- Inspect component props/state
- Profile component performance

**Next.js Debugging:**
```bash
# Debug mode
yarn dev --debug

# Bundle analyzer (if configured)
yarn analyze
```

---

## 🔧 **VS Code Setup**

### **Required Extensions**

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",      // Tailwind CSS IntelliSense
    "esbenp.prettier-vscode",          // Prettier formatter
    "dbaeumer.vscode-eslint",          // ESLint
    "ms-vscode.vscode-typescript-next", // TypeScript
    "bradlc.vscode-tailwindcss",       // Tailwind CSS
    "formulahendry.auto-rename-tag",   // Auto rename HTML tags
    "christian-kohler.path-intellisense", // Path completion
    "ms-vscode.vscode-json"            // JSON support
  ]
}
```

### **Workspace Settings**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### **Launch Configuration**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": null,
      "runtimeArgs": ["--inspect"],
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    }
  ]
}
```

---

## 🐛 **Troubleshooting**

### **Common Development Issues**

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install

# Check TypeScript errors
yarn build
```

**Test Failures:**
```bash
# Update test snapshots
yarn test -- --updateSnapshot

# Clear Jest cache
yarn test -- --clearCache

# Run specific test file
yarn test Button.test.tsx
```

**Linting Issues:**
```bash
# Auto-fix ESLint issues
yarn lint:fix

# Check specific file
yarn lint src/components/Button.tsx
```

### **Performance Issues**

**Slow Development Server:**
```bash
# Use Turbopack (experimental)
yarn dev --turbo

# Clear cache and restart
rm -rf .next node_modules/.cache
yarn dev
```

**Memory Issues:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" yarn dev
```

---

## 📊 **Performance Monitoring**

### **Build Analysis**

```bash
# Bundle size analysis
yarn build
# Check .next/static/* for bundle sizes

# Lighthouse CI (if configured)
yarn lighthouse
```

### **Development Metrics**

```typescript
// pages/_app.tsx - Web Vitals
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric)
}
```

---

## 🔄 **Environment Management**

### **Environment Variables**

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here

# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.production.com
DATABASE_URL=postgresql://prod-db...
```

### **Environment-Specific Configs**

```typescript
// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}
```

---

## ✅ **Development Checklist**

### **Before Starting Development**
- [ ] Yarn is installed globally
- [ ] Dependencies are installed (`yarn install`)
- [ ] Development server starts (`yarn dev`)
- [ ] Tests pass (`yarn test`)
- [ ] ESLint passes (`yarn lint`)

### **Before Committing**
- [ ] All tests pass (`yarn test`)
- [ ] No linting errors (`yarn lint`)
- [ ] Build succeeds (`yarn build`)
- [ ] Types check (`yarn build`)
- [ ] No console errors/warnings

### **Before Creating PR**
- [ ] Feature branch is up to date
- [ ] All tests pass (including E2E if relevant)
- [ ] Code is properly documented
- [ ] Performance impact considered
- [ ] Accessibility tested

---

**Ready to develop!** 🚀

For specific workflows and CI processes, check the [CI Pipeline Guide](./ci-pipeline.md).