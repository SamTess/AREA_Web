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
```

### **2. Clone the Repository**

```bash
# Clone the repository
git clone <your-repository-url>
cd AREA_Web

# Verify you're in the right directory
ls -la
# Should see: package.json, yarn.lock, src/, etc.
```

### **3. Install Dependencies**

```bash
# Install all project dependencies
yarn install

# This should create node_modules/ and may update yarn.lock
```

### **4. Environment Setup**

```bash
# Copy environment template (if exists)
cp .env.example .env.local  # If this file exists

# Or create a new .env.local file with required variables
touch .env.local
```

---

## 🏃‍♂️ **Running the Project**

### **Development Server**

```bash
# Start the development server
yarn dev

# Server will start at: http://localhost:3000
# Hot reload is enabled - changes appear automatically
```

### **Available Scripts**

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `yarn dev` | Development server | Daily development |
| `yarn build` | Production build | Before deployment |
| `yarn start` | Production server | Testing production build |
| `yarn lint` | ESLint checking | Code quality check |
| `yarn lint:fix` | Auto-fix lint issues | Cleanup before commit |
| `yarn test` | Run unit tests | Testing components |
| `yarn test:watch` | Watch mode tests | TDD development |
| `yarn cypress:open` | E2E test UI | Interactive testing |
| `yarn cypress:run` | E2E test headless | CI-like testing |

---

## 📁 **Project Structure**

```
AREA_Web/
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   └── favicon.ico
│   ├── 📁 components/          # Reusable components
│   ├── 📁 lib/                 # Utilities and helpers
│   └── 📁 types/               # TypeScript types
├── 📁 __tests__/               # Jest unit tests
├── 📁 cypress/                 # E2E tests
│   ├── 📁 e2e/                 # Test files
│   └── 📁 support/             # Test utilities
├── 📁 public/                  # Static assets
├── 📁 docs/                    # Documentation
├── package.json                # Dependencies & scripts
├── yarn.lock                   # Locked dependencies
├── tsconfig.json               # TypeScript config
├── jest.config.js              # Jest test config
├── cypress.config.ts           # Cypress config
├── eslint.config.mjs           # ESLint config
└── next.config.ts              # Next.js config
```

---

## 🧪 **Testing Your Setup**

### **1. Development Server**
```bash
yarn dev
# ✅ Should start successfully on http://localhost:3000
# ✅ Page should load without errors
# ✅ Hot reload should work (edit src/app/page.tsx)
```

### **2. Linting**
```bash
yarn lint
# ✅ Should show "No ESLint warnings or errors"
```

### **3. Unit Tests**
```bash
yarn test
# ✅ Should show tests passing:
# PASS __tests__/home.test.tsx
# ✅ Component renders correctly
# ✅ Logo is visible
# ✅ Button is present
```

### **4. Build Process**
```bash
yarn build
# ✅ Should create .next/ folder
# ✅ No TypeScript errors
# ✅ Build completes successfully
```

### **5. E2E Tests (Optional)**
```bash
# Start dev server in background
yarn dev &

# Run E2E tests
yarn cypress:run
# ✅ Should pass all tests
```

---

## 🎯 **Your First Contribution**

### **1. Create a Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

### **2. Make Your Changes**
- Edit files in `src/`
- Add tests in `__tests__/`
- Update documentation if needed

### **3. Test Your Changes**
```bash
yarn lint          # Check code style
yarn test          # Run unit tests
yarn build         # Ensure build works
```

### **4. Commit and Push**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### **5. Create Pull Request**
- Go to GitHub/GitLab
- Create PR from your branch
- CI will run automatically
- Request code review

---

## 💡 **Development Tips**

### **Hot Reload**
- Changes to `src/` files trigger automatic reload
- Component errors show in browser overlay
- Check browser console for runtime errors

### **TypeScript**
- Use strict typing for better code quality
- Run `yarn build` to check for type errors
- VS Code shows inline type errors

### **Debugging**
```bash
# Debug mode
yarn dev --debug

# Inspect bundle
yarn analyze    # If available
```

### **Testing**
- Write tests for new components
- Use `yarn test:watch` during development
- Test both happy path and edge cases

---

## 🔧 **VS Code Setup (Recommended)**

### **Extensions**
Install these VS Code extensions:
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **ESLint**
- **Prettier**
- **Tailwind CSS IntelliSense** (if using Tailwind)
- **Jest**

### **Workspace Settings**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## 🚨 **Common Issues**

### **"yarn: command not found"**
```bash
# Install Yarn globally
npm install -g yarn
```

### **"Module not found" errors**
```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### **TypeScript errors**
```bash
# Check TypeScript config
yarn build
```

### **Tests failing**
```bash
# Update snapshots if needed
yarn test -- --updateSnapshot
```

### **Port already in use**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
yarn dev --port 3001
```

---

## 📞 **Getting Help**

### **Resources**
1. 📚 [Team Documentation](./README.md)
2. 🔧 [Development Setup](./development-setup.md)
3. 🚀 [CI Pipeline Guide](./ci-pipeline.md)
4. 🧪 [Testing Strategy](./testing-strategy.md)
5. 🛠️ [Troubleshooting](./troubleshooting.md)

### **Support Channels**
- **Team Chat**: Ask questions in development channel
- **GitHub Issues**: Create issue for bugs or feature requests
- **Code Reviews**: Learn from PR feedback
- **Pair Programming**: Schedule sessions with team members

---

## ✅ **Setup Complete!**

If you can run `yarn dev` and see the application at http://localhost:3000, you're all set! 🎉

**Next Steps:**
1. 📖 Read the [development setup guide](./development-setup.md)
2. 🧪 Learn about our [testing strategy](./testing-strategy.md)
3. 🚀 Understand our [CI pipeline](./ci-pipeline.md)
4. 🤝 Make your first contribution!

Welcome to the team! 👥