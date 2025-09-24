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
```
1. 📦 install        → Install dependencies (shared cache)
2. 🧹 lint           → ESLint code quality check
3. 🔍 type-check     → TypeScript validation
4. 🧪 test           → Jest unit tests
5. 🎭 test-e2e       → Cypress end-to-end tests
6. 🏗️ build          → Production build
7. 🚀 release        → Release artifacts (main branch)
8. 📚 docs           → Generate documentation
```

---

## ⚡ **Advanced Caching Strategy**

### **Multi-Level Cache System**

**Level 1: Dependency Cache**
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.yarn/cache
      node_modules
    key: ${{ runner.os }}-yarn-${{ hashFiles('yarn.lock') }}
    restore-keys: |
      ${{ runner.os }}-yarn-${{ hashFiles('package.json') }}
      ${{ runner.os }}-yarn-
```

**Level 2: Build Cache**
```yaml
- name: Cache Next.js build
  uses: actions/cache@v3
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('yarn.lock') }}-${{ hashFiles('**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx') }}
```

### **Cache Performance**

| Scenario | Cache Status | Install Time | Build Time |
|----------|-------------|--------------|------------|
| No changes | 100% hit | ~3s | ~5s |
| Package.json only | Partial hit | ~10s | ~8s |
| Yarn.lock changed | Miss | ~20s | ~15s |
| Full clean build | Miss | ~30s | ~25s |

---

## 🔄 **Job Dependencies**

### **Dependency Graph**
```
install (required by all)
├── lint
├── type-check
├── test
├── test-e2e
└── build
    └── release (main branch only)
        └── docs
```

### **Parallel Execution**
Jobs 2-6 run in parallel after `install` completes:
- ✅ **Faster feedback** (~3 minutes total vs ~8 minutes sequential)
- ✅ **Resource efficiency** (GitHub runners)
- ✅ **Early failure detection** (if any job fails, others continue)

---

## 🧪 **Testing Pipeline**

### **Unit Tests (Jest)**
```yaml
- name: Run unit tests
  run: yarn test --coverage --watchAll=false

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

**Coverage Requirements:**
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### **E2E Tests (Cypress)**
```yaml
- name: Start dev server
  run: yarn dev &

- name: Wait for server
  run: npx wait-on http://localhost:3000 --timeout 60000

- name: Run Cypress tests
  run: yarn cypress:run

- name: Upload test artifacts
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: cypress-screenshots
    path: cypress/screenshots
```

---

## 🏗️ **Build Process**

### **Production Build**
```yaml
- name: Build application
  run: yarn build
  env:
    NEXT_TELEMETRY_DISABLED: 1

- name: Export static files (if applicable)
  run: yarn export

- name: Upload build artifacts
  uses: actions/upload-artifact@v3
  with:
    name: build-files
    path: |
      .next/
      out/
    retention-days: 7
```

### **Build Optimization**
- ✅ **Tree shaking** enabled
- ✅ **Code splitting** automatic
- ✅ **Image optimization** built-in
- ✅ **Bundle analysis** in CI logs

---

## 🔍 **Code Quality Checks**

### **ESLint Configuration**
```yaml
- name: Run ESLint
  run: yarn lint --format=github

# GitHub annotations for errors
# Automatically adds comments to PR
```

### **TypeScript Validation**
```yaml
- name: Type check
  run: yarn build --dry-run || yarn tsc --noEmit
```

### **Security Scanning**
```yaml
- name: Audit dependencies
  run: yarn audit --level moderate
  continue-on-error: true  # Don't fail build on low/moderate
```

---

## 📊 **Performance Monitoring**

### **Bundle Size Tracking**
```yaml
- name: Analyze bundle size
  run: |
    yarn build
    npx next-bundle-analyzer --no-open

- name: Comment bundle size on PR
  uses: github-actions-bundle-size@v1
  with:
    base-branch: main
```

### **Performance Budgets**
```javascript
// next.config.ts
module.exports = {
  experimental: {
    bundlePagesRouterDependencies: true,
  },
  // Performance budgets
  webpack: (config) => {
    config.performance = {
      hints: 'warning',
      maxAssetSize: 512000,    // 512KB per asset
      maxEntrypointSize: 1024000,  // 1MB per entry
    }
    return config
  }
}
```

---

## 🚀 **Release Process**

### **Automatic Releases (Main Branch)**
```yaml
release:
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Create release
      uses: actions/create-release@v1
      with:
        tag_name: v${{ github.run_number }}
        release_name: Release ${{ github.run_number }}
        draft: false
        prerelease: false
```

### **Deployment Integration**
```yaml
deploy:
  needs: release
  environment: production
  steps:
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./
```

---

## 🛡️ **Security & Secrets**

### **Required Secrets**
```yaml
# Repository Settings > Secrets and variables > Actions
VERCEL_TOKEN=           # Deployment token
CODECOV_TOKEN=          # Coverage reporting
NPM_TOKEN=              # Private package access (if needed)
```

### **Security Scanning**
```yaml
- name: Run security audit
  run: |
    yarn audit --level high
    npx audit-ci --high
```

### **Dependency Updates**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    reviewers:
      - "team-leads"
```

---

## 📈 **Monitoring & Metrics**

### **CI Performance Tracking**
```yaml
- name: Report timing
  run: |
    echo "Job start: ${{ steps.start-time.outputs.time }}"
    echo "Job end: $(date)"
    echo "Duration: $(($(date +%s) - ${{ steps.start-time.outputs.time }}))" seconds
```

### **Success Rate Monitoring**
- **Target**: >95% success rate
- **Alert**: If success rate drops below 90%
- **Action**: Investigate flaky tests

### **Build Time Goals**
- **Full build**: <5 minutes
- **Cache hit**: <2 minutes
- **PR feedback**: <3 minutes

---

## 🚨 **Troubleshooting CI Issues**

### **Common Failures**

**❌ Dependency Installation Failed**
```bash
Error: Unable to authenticate, need: Basic realm="GitHub Package Registry"

Solution:
1. Check if private packages need authentication
2. Add NPM_TOKEN secret if needed
3. Update .npmrc file
```

**❌ Tests Timeout**
```bash
Error: Test timeout after 30000ms

Solutions:
1. Increase timeout in jest.config.js
2. Mock slow external API calls
3. Use jest.setTimeout() for specific tests
```

**❌ Build Memory Issues**
```bash
Error: JavaScript heap out of memory

Solutions:
1. Add NODE_OPTIONS: "--max-old-space-size=4096"
2. Use yarn build instead of npm
3. Check for memory leaks in code
```

**❌ E2E Tests Flaky**
```bash
Error: Element not found

Solutions:
1. Add proper wait conditions
2. Use data-testid attributes
3. Increase timeouts for slow operations
4. Mock external services
```

### **Debug Strategies**

**Enable Debug Logging:**
```yaml
- name: Debug info
  run: |
    echo "Node version: $(node --version)"
    echo "Yarn version: $(yarn --version)"
    echo "Build environment: $NODE_ENV"
    ls -la .next/
```

**Cache Debugging:**
```yaml
- name: Debug cache
  run: |
    echo "Cache key: ${{ steps.cache.outputs.cache-hit }}"
    echo "Yarn cache dir: $(yarn cache dir)"
    du -sh node_modules/ || echo "No node_modules"
```

**Test Debugging:**
```yaml
- name: Run tests with debug
  run: yarn test --verbose --no-coverage
  if: failure()
```

---

## 🔧 **Optimization Tips**

### **Speed Up CI**

**1. Optimize Dependencies**
```json
// package.json - Use exact versions where possible
{
  "dependencies": {
    "react": "19.0.0",     // ✅ Exact
    "next": "^15.5.3"      // ⚠️ Range (slower resolution)
  }
}
```

**2. Selective Testing**
```yaml
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v35

- name: Run tests on changed files only
  run: yarn test --findRelatedTests ${{ steps.changed-files.outputs.all_changed_files }}
  if: github.event_name == 'pull_request'
```

**3. Matrix Strategy (for multiple Node versions)**
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    os: [ubuntu-latest, windows-latest]
  fail-fast: false
```

### **Reduce Costs**

**1. Skip Redundant Jobs**
```yaml
- name: Skip if only docs changed
  if: "!contains(github.event.head_commit.message, '[docs only]')"
```

**2. Conditional E2E Tests**
```yaml
test-e2e:
  if: github.event_name == 'push' || contains(github.event.pull_request.labels.*.name, 'needs-e2e')
```

---

## 📊 **CI Metrics Dashboard**

### **Key Performance Indicators**

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Success Rate | >95% | 97.3% | ↗️ |
| Average Duration | <5min | 4.2min | ↘️ |
| Cache Hit Rate | >80% | 85.1% | ↗️ |
| Test Coverage | >80% | 83.7% | ↗️ |

### **Weekly Report Template**
```markdown
## CI Weekly Report

**Performance:**
- ✅ Success Rate: 97.3% (↗️ +2.1%)
- ⏱️ Average Duration: 4.2min (↘️ -0.8min)
- 💾 Cache Hit Rate: 85.1% (↗️ +5.2%)

**Issues Fixed:**
- Reduced flaky test timeout issues
- Optimized dependency caching

**Next Week Goals:**
- Improve E2E test stability
- Add bundle size tracking
```

---

## 🎯 **Best Practices**

### **Commit Messages**
```bash
feat: add user authentication
fix: resolve memory leak in component
test: add unit tests for auth service
ci: optimize build caching
docs: update API documentation
```

### **PR Strategy**
- ✅ Keep PRs small (<500 lines changed)
- ✅ Include tests for new features
- ✅ Update documentation as needed
- ✅ Wait for all CI checks before merging

### **Branch Protection**
```yaml
# GitHub Settings > Branches > Branch protection rules
required_status_checks:
  - lint
  - type-check
  - test
  - build

require_branches_to_be_up_to_date: true
dismiss_stale_reviews: true
require_code_owner_reviews: true
```

---

## 🔗 **Related Documentation**

- 📦 [Yarn Migration Guide](./yarn-migration.md)
- 🚀 [Getting Started](./getting-started.md)
- 🛠️ [Development Setup](./development-setup.md)
- 🧪 [Testing Strategy](./testing-strategy.md)
- 🛠️ [Troubleshooting](./troubleshooting.md)

---

**Happy building!** 🚀🔧

The CI pipeline is designed to be fast, reliable, and provide quick feedback. If you encounter issues, check the troubleshooting section or reach out to the team.