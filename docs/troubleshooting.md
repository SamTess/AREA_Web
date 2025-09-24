# 🛠️ Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

This guide covers the most frequent issues encountered during development and their solutions.

---

## 📦 **Package Manager Issues**

### **npm vs Yarn Conflicts**

**❌ Problem:** Mixed package managers causing conflicts
```bash
Error: Cannot resolve dependency tree
Error: Package-lock.json and yarn.lock exist simultaneously
```

**✅ Solution:**
```bash
# Clean everything
rm -rf node_modules package-lock.json

# Use Yarn exclusively
yarn install

# Verify no package-lock.json is created
ls -la | grep -E "(package-lock|yarn.lock)"
```

### **Dependency Resolution Errors**

**❌ Problem:** Version conflicts during installation
```bash
error: Package "react@19.0.0" has unmet peer dependency
```

**✅ Solution:**
```bash
# Option 1: Update dependencies
yarn upgrade react react-dom

# Option 2: Force resolution in package.json
{
  "resolutions": {
    "react": "19.0.0",
    "react-dom": "19.0.0"
  }
}

# Option 3: Legacy peer deps (last resort)
yarn install --legacy-peer-deps
```

### **Cache Issues**

**❌ Problem:** Outdated cache causing weird errors
```bash
Module not found: Can't resolve 'package-name'
```

**✅ Solution:**
```bash
# Clear Yarn cache
yarn cache clean

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
yarn install
```

---

## 🏗️ **Build & Development Issues**

### **Next.js Build Failures**

**❌ Problem:** TypeScript errors during build
```bash
Type error: Property 'children' does not exist on type 'Props'
```

**✅ Solution:**
```typescript
// Add proper types
interface Props {
  children: React.ReactNode  // Add this
  title: string
}

// Or use built-in types
interface Props extends React.PropsWithChildren {
  title: string
}
```

**❌ Problem:** Memory issues during build
```bash
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**✅ Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" yarn build

# Or add to package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### **Development Server Issues**

**❌ Problem:** Port already in use
```bash
Error: listen EADDRINUSE :::3000
```

**✅ Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
yarn dev --port 3001

# Or set in package.json
{
  "scripts": {
    "dev": "next dev --port 3001"
  }
}
```

**❌ Problem:** Hot reload not working
```bash
Changes not reflected in browser
```

**✅ Solution:**
```bash
# Check file watching limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart development server
yarn dev

# Check if files are being watched
ls -la src/  # Verify file permissions
```

---

## 🧪 **Testing Issues**

### **Jest Test Failures**

**❌ Problem:** `toBeInTheDocument` not found
```bash
TypeError: expect(...).toBeInTheDocument is not a function
```

**✅ Solution:**
```javascript
// Make sure jest.setup.js exists and is imported
// jest.setup.js
import '@testing-library/jest-dom'

// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
```

**❌ Problem:** Mock errors in tests
```bash
Cannot find module 'next/router' from 'Component.test.tsx'
```

**✅ Solution:**
```javascript
// Add to jest.setup.js
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
    }
  },
}))
```

### **Cypress Test Issues**

**❌ Problem:** Element not found
```bash
Timed out retrying after 4000ms: Expected to find element: [data-testid="button"]
```

**✅ Solution:**
```typescript
// Wait for element to exist
cy.get('[data-testid="button"]').should('exist')

// Wait for element to be visible
cy.get('[data-testid="button"]').should('be.visible')

// Increase timeout for slow operations
cy.get('[data-testid="button"]', { timeout: 10000 }).click()

// Wait for API call to complete
cy.intercept('GET', '/api/data').as('getData')
cy.wait('@getData')
cy.get('[data-testid="result"]').should('be.visible')
```

**❌ Problem:** Cypress won't start
```bash
Error: spawn EACCES cypress
```

**✅ Solution:**
```bash
# Fix permissions (Linux/Mac)
chmod +x node_modules/.bin/cypress

# Clear Cypress cache
npx cypress cache clear
npx cypress install

# Verify installation
npx cypress verify
```

---

## 🎨 **Styling Issues**

### **Tailwind CSS Not Working**

**❌ Problem:** Tailwind classes not applying
```bash
Classes like 'bg-blue-500' have no effect
```

**✅ Solution:**
```javascript
// Check tailwind.config.js content paths
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',  // Make sure this matches your structure
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
}

// Restart development server after config changes
yarn dev
```

**❌ Problem:** CSS modules not working
```bash
className is undefined in component
```

**✅ Solution:**
```typescript
// Correct CSS module import
import styles from './Component.module.css'

// Use className correctly
<div className={styles.container}>Content</div>

// Check file naming: Component.module.css (not Component.css)
```

### **Mantine UI Issues**

**❌ Problem:** MantineProvider not wrapping components
```bash
Error: useStyles was called outside of MantineProvider
```

**✅ Solution:**
```typescript
// Wrap your app in layout.tsx
import { MantineProvider } from '@mantine/core'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}

// For tests, use custom render
const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>)
}
```

---

## 🔒 **TypeScript Issues**

### **Type Errors**

**❌ Problem:** Strict mode TypeScript errors
```bash
Argument of type 'string | undefined' is not assignable to parameter of type 'string'
```

**✅ Solution:**
```typescript
// Option 1: Type guard
if (value) {
  doSomething(value)  // TypeScript knows value is string
}

// Option 2: Non-null assertion (use carefully)
doSomething(value!)

// Option 3: Provide fallback
doSomething(value || 'default')

// Option 4: Optional chaining
value?.someMethod()
```

**❌ Problem:** Module declaration issues
```bash
Cannot find module './styles.module.css' or its corresponding type declarations
```

**✅ Solution:**
```typescript
// Create types/global.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

// Add to tsconfig.json
{
  "include": ["types/**/*", "src/**/*"]
}
```

### **Import/Export Issues**

**❌ Problem:** Default import errors
```bash
Module has no default export
```

**✅ Solution:**
```typescript
// Check the actual export
// If library exports named exports:
import { Button } from '@mantine/core'

// If library has default export:
import Button from '@mantine/core/Button'

// For mixed exports:
import React, { useState, useEffect } from 'react'
```

---

## 🌐 **Environment Issues**

### **Environment Variables**

**❌ Problem:** Environment variables not loading
```bash
process.env.NEXT_PUBLIC_API_URL is undefined
```

**✅ Solution:**
```bash
# Check file naming
.env.local          # ✅ Correct for local development
.env                # ⚠️  Committed to git (be careful)
.env.development    # ✅ Development specific

# Check variable naming
NEXT_PUBLIC_API_URL=http://localhost:8000  # ✅ Available in browser
API_SECRET=secret123                       # ✅ Server-side only

# Restart server after adding env variables
yarn dev
```

### **CORS Issues**

**❌ Problem:** CORS errors in development
```bash
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**✅ Solution:**
```javascript
// next.config.ts - Add rewrites for development
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
}

// Or configure your backend to allow localhost:3000
```

---

## 🚀 **CI/CD Issues**

### **GitHub Actions Failures**

**❌ Problem:** Yarn not found in CI
```bash
/usr/bin/bash: yarn: command not found
```

**✅ Solution:**
```yaml
# Add Yarn installation to workflow
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'

- name: Install Yarn
  run: npm install -g yarn

- name: Install dependencies
  run: yarn install --frozen-lockfile
```

**❌ Problem:** Tests timeout in CI
```bash
Jest: Timeout - Async callback was not invoked within the 30000ms timeout
```

**✅ Solution:**
```yaml
# Increase timeout in CI
- name: Run tests
  run: yarn test --testTimeout=60000 --watchAll=false

# Or update jest.config.js
module.exports = {
  testTimeout: process.env.CI ? 60000 : 30000,
}
```

### **Build Failures in Production**

**❌ Problem:** Different behavior in production build
```bash
ReferenceError: window is not defined
```

**✅ Solution:**
```typescript
// Check if running in browser
if (typeof window !== 'undefined') {
  // Browser-only code
  window.localStorage.setItem('key', 'value')
}

// Or use useEffect for browser-only side effects
useEffect(() => {
  // This only runs in the browser
  const stored = localStorage.getItem('key')
}, [])

// Or use dynamic imports
const { default: BrowserOnlyComponent } = await import('./BrowserOnlyComponent')
```

---

## 🔧 **Performance Issues**

### **Slow Development Build**

**❌ Problem:** Very slow compilation times
```bash
webpack compiled with warnings (took 45.2 seconds)
```

**✅ Solution:**
```javascript
// next.config.ts - Enable SWC minifier
module.exports = {
  swcMinify: true,

  // Reduce bundle size
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },

  // Exclude heavy libraries from SSR
  webpack: (config) => {
    if (!config.isServer) {
      config.resolve.fallback.fs = false
    }
    return config
  },
}
```

### **Memory Leaks**

**❌ Problem:** Browser tab consuming too much memory
```bash
Page becomes unresponsive after extended use
```

**✅ Solution:**
```typescript
// Clean up event listeners
useEffect(() => {
  const handleScroll = () => { /* ... */ }

  window.addEventListener('scroll', handleScroll)

  // Cleanup
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}, [])

// Clean up intervals/timeouts
useEffect(() => {
  const interval = setInterval(() => { /* ... */ }, 1000)

  return () => clearInterval(interval)
}, [])

// Avoid memory leaks in async operations
useEffect(() => {
  let cancelled = false

  const fetchData = async () => {
    const data = await api.getData()
    if (!cancelled) {
      setData(data)
    }
  }

  fetchData()

  return () => {
    cancelled = true
  }
}, [])
```

---

## 🔍 **Debugging Tools**

### **Browser DevTools**

**React DevTools:**
- Install browser extension
- Component inspector and profiler
- Hook debugging

**Network Tab:**
- API request/response debugging
- Performance analysis

**Console Methods:**
```javascript
console.log('Simple debug')
console.table(arrayOrObject)      // Better formatting
console.group('API Calls')        // Group related logs
console.time('operation')         // Performance timing
console.timeEnd('operation')

// Conditional logging
console.assert(condition, 'Error message')
```

### **VS Code Debugging**

**Launch Configuration (.vscode/launch.json):**
```json
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
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    }
  ]
}
```

---

## 📞 **Getting Help**

### **Internal Resources**
1. 📖 Check other documentation files
2. 🔍 Search existing GitHub issues
3. 💬 Ask in team chat
4. 📅 Schedule pair programming session

### **External Resources**
1. **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
2. **React**: [react.dev](https://react.dev)
3. **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org/)
4. **Jest**: [jestjs.io](https://jestjs.io/)
5. **Cypress**: [docs.cypress.io](https://docs.cypress.io/)

### **Create a Bug Report**

When creating an issue, include:

```markdown
## Bug Report

**Environment:**
- OS: [e.g., macOS 14.0]
- Node.js: [e.g., 18.17.0]
- Yarn: [e.g., 1.22.22]
- Browser: [e.g., Chrome 120]

**Steps to Reproduce:**
1. Run `yarn dev`
2. Navigate to `/page`
3. Click button
4. Error occurs

**Expected Behavior:**
Button should submit form

**Actual Behavior:**
Error: [paste error message]

**Additional Context:**
- Error logs
- Screenshots
- Any recent changes
```

---

## ✅ **Quick Diagnostic Checklist**

When something breaks, check:

### **Development Issues**
- [ ] `yarn install` completed successfully
- [ ] No `package-lock.json` file exists
- [ ] Development server is running (`yarn dev`)
- [ ] No TypeScript errors (`yarn build`)
- [ ] Browser console shows no errors
- [ ] File permissions are correct

### **Test Issues**
- [ ] All dependencies installed
- [ ] Jest setup file configured
- [ ] Test files in correct location
- [ ] No conflicting global mocks
- [ ] Environment variables set for tests

### **Build Issues**
- [ ] All environment variables set
- [ ] No TypeScript errors
- [ ] All imports resolve correctly
- [ ] No circular dependencies
- [ ] Sufficient memory allocated

---

## 🎯 **Prevention Tips**

### **Best Practices**
1. **Commit early, commit often** - Easier to identify when issues started
2. **Use TypeScript strictly** - Catch errors at compile time
3. **Write tests first** - Prevent regressions
4. **Keep dependencies updated** - Security and compatibility
5. **Use consistent code style** - Reduce merge conflicts

### **Regular Maintenance**
```bash
# Weekly maintenance routine
yarn audit                    # Security check
yarn outdated                # Check for updates
yarn test                     # Ensure tests pass
yarn build                    # Ensure build works
```

---

**Remember:** Most issues have been encountered before. Check the documentation, search existing issues, and don't hesitate to ask for help! 🤝

---

## 🔗 **Related Documentation**

- 📦 [Yarn Migration Guide](./yarn-migration.md)
- 🚀 [Getting Started](./getting-started.md)
- 🛠️ [Development Setup](./development-setup.md)
- 🚀 [CI Pipeline Guide](./ci-pipeline.md)
- 🧪 [Testing Strategy](./testing-strategy.md)