// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height }: {
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
  }) =>
    React.createElement('img', { src, alt, width, height }),
}))

jest.mock('@mantine/carousel', () => ({
  Carousel: Object.assign(
    ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'carousel' }, children),
    {
      Slide: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'carousel-slide' }, children),
    }
  ),
}))

jest.mock('embla-carousel-autoplay', () => jest.fn(() => ({})))

// Mock Mantine hooks
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(() => false),
  useIsomorphicEffect: jest.fn(() => {}),
  useLocalStorage: jest.fn(() => ['', jest.fn()]),
  useColorScheme: jest.fn(() => 'light'),
  useHotkeys: jest.fn(() => {}),
  useDebouncedValue: jest.fn((value) => [value]),
  useDebounce: jest.fn((fn) => fn),
  useClickOutside: jest.fn(() => jest.fn()),
  useFocusTrap: jest.fn(() => ({ ref: { current: null }, activate: jest.fn(), deactivate: jest.fn() })),
  useFocusReturn: jest.fn(() => jest.fn()),
  useMergedRef: jest.fn(() => ({ current: null })),
  useResizeObserver: jest.fn(() => ({ ref: { current: null }, width: 0, height: 0 })),
  useViewportSize: jest.fn(() => ({ width: 1024, height: 768 })),
  useIntersection: jest.fn(() => ({ ref: { current: null }, entry: null })),
  useHash: jest.fn(() => ['', jest.fn()]),
  useNetwork: jest.fn(() => ({ online: true })),
  useOs: jest.fn(() => 'macos'),
  usePageLeave: jest.fn(() => jest.fn()),
  useReducedMotion: jest.fn(() => false),
  useScrollLock: jest.fn(() => [false, jest.fn()]),
  useToggle: jest.fn(() => [false, jest.fn()]),
  useUncontrolled: jest.fn((options) => {
    // Handle arrays properly for useCombobox
    if (options?.defaultValue !== undefined && Array.isArray(options.defaultValue)) {
      return [options.defaultValue, jest.fn()];
    }
    if (options?.value !== undefined && Array.isArray(options.value)) {
      return [options.value, jest.fn()];
    }
    return [options?.defaultValue ?? options?.value ?? false, jest.fn()];
  }),
  useCombobox: jest.fn(() => ({
    resetSelectedOption: jest.fn(),
    openDropdown: jest.fn(),
    closeDropdown: jest.fn(),
    toggleDropdown: jest.fn(),
    selectFirstOption: jest.fn(),
    selectActiveOption: jest.fn(),
    selectNextOption: jest.fn(),
    selectPreviousOption: jest.fn(),
    updateSelectedOptionIndex: jest.fn(),
    listId: 'mantine-test-list-id',
    dropdownOpened: false,
    selectedOptionIndex: -1,
  })),
  useId: jest.fn(() => 'mantine-id'),
  useDidUpdate: jest.fn((fn) => fn()),
  useForceUpdate: jest.fn(() => jest.fn()),
  useLogger: jest.fn(() => ({ log: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
  useTimeout: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), clear: jest.fn() })),
  useInterval: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), active: false })),
  useHover: jest.fn(() => ({ hovered: false, ref: { current: null } })),
  useMouse: jest.fn(() => ({ x: 0, y: 0, ref: { current: null } })),
  useMove: jest.fn(() => ({ x: 0, y: 0, active: false })),
  useFullscreen: jest.fn(() => ({ fullscreen: false, toggle: jest.fn(), ref: { current: null } })),
  useIdle: jest.fn(() => false),
  useEyeDropper: jest.fn(() => ({ supported: false, open: jest.fn() })),
  useFavicon: jest.fn(() => jest.fn()),
  useHeadroom: jest.fn(() => ({ fixed: false, floating: false })),
  useInputState: jest.fn((initialValue) => [initialValue, jest.fn()]),
  useListState: jest.fn((initialValue = []) => [initialValue, {
    setState: jest.fn(),
    append: jest.fn(),
    prepend: jest.fn(),
    insert: jest.fn(),
    remove: jest.fn(),
    pop: jest.fn(),
    shift: jest.fn(),
    apply: jest.fn(),
    applyWhere: jest.fn(),
    filter: jest.fn(),
    setItem: jest.fn(),
    setItemProp: jest.fn(),
    sort: jest.fn(),
    reorder: jest.fn(),
  }]),
  useCounter: jest.fn((initialValue = 0) => [initialValue, {
    increment: jest.fn(),
    decrement: jest.fn(),
    set: jest.fn(),
    reset: jest.fn(),
  }]),
  useSetState: jest.fn((initialState = {}) => [initialState, {
    setState: jest.fn(),
    reset: jest.fn(),
  }]),
  useDisclosure: jest.fn((initialState = false) => [initialState, {
    open: jest.fn(),
    close: jest.fn(),
    toggle: jest.fn(),
  }]),
  useSessionStorage: jest.fn((key, defaultValue) => [defaultValue, jest.fn()]),
  useWindowEvent: jest.fn(() => {}),
  useWindowScroll: jest.fn(() => ({ x: 0, y: 0 })),
  useElementSize: jest.fn(() => ({ ref: { current: null }, width: 0, height: 0 })),
  useShallowEffect: jest.fn((fn) => fn()),
  useValidatedState: jest.fn((initialValue) => [initialValue, jest.fn(), { valid: true, message: '' }]),
  useForm: jest.fn(() => ({
    values: {},
    errors: {},
    setValues: jest.fn(),
    setErrors: jest.fn(),
    setFieldValue: jest.fn(),
    setFieldError: jest.fn(),
    validate: jest.fn(),
    validateField: jest.fn(),
    reset: jest.fn(),
    resetDirty: jest.fn(),
    resetTouched: jest.fn(),
    isDirty: jest.fn(() => false),
    isTouched: jest.fn(() => false),
    isValid: jest.fn(() => true),
    getInputProps: jest.fn(() => ({})),
    getValues: jest.fn(() => ({})),
    onSubmit: jest.fn(),
    onReset: jest.fn(),
  })),
  mergeRefs: jest.fn(() => jest.fn()),
}))

process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true'

jest.mock('./services/userService', () => ({
  getUser: jest.fn().mockResolvedValue({
    name: 'Test Tester',
    email: 'user@example.com',
    avatarSrc: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
    profileData: {
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'Tester',
      language: 'English',
      password: 'test1234',
    },
  }),
  uploadAvatar: jest.fn().mockResolvedValue('https://mock.jpg'),
}))

jest.mock('./services/authService', () => ({
  login: jest.fn().mockResolvedValue({
    token: 'mock-token',
    message: 'Login successful',
    user: {
      id: 1,
      email: 'test@example.com',
      isActive: true,
      isAdmin: false,
      createdAt: new Date().toISOString()
    },
    refreshToken: 'mock-refresh-token'
  }),
  register: jest.fn().mockResolvedValue({
    token: 'mock-token',
    message: 'Registration successful',
    user: {
      id: 1,
      email: 'test@example.com',
      isActive: true,
      isAdmin: false,
      createdAt: new Date().toISOString()
    },
    refreshToken: 'mock-refresh-token'
  }),
  forgotPassword: jest.fn().mockResolvedValue(undefined),
  updateProfile: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  extractToken: jest.fn().mockReturnValue('mock-token'),
  getCurrentUser: jest.fn().mockResolvedValue({
    name: 'Mock User',
    email: 'mock@example.com',
    avatarSrc: 'https://mock.jpg',
    profileData: {
      email: 'mock@example.com',
      firstName: 'Mock',
      lastName: 'User',
      language: 'en'
    }
  }),
  getAuthStatus: jest.fn().mockResolvedValue({ authenticated: true }),
  refreshToken: jest.fn().mockResolvedValue({ token: 'mock-refreshed-token' }),
}))

// Mock areas service - importing actual mock data
const mockAreas = [
  { id: 1, name: 'GitHub PR Monitor', description: 'Monitors pull requests and sends notifications', lastRun: '2024-09-25', services: [1], status: 'success' },
  { id: 2, name: 'Slack Channel Alert', description: 'Alerts users via Slack channels on events', lastRun: '2024-09-24', services: [6], status: 'failed' },
  { id: 3, name: 'GitLab CI Pipeline', description: 'Triggers on GitLab CI pipeline failures', lastRun: '2024-09-23', services: [2], status: 'in progress' },
  { id: 4, name: 'Bitbucket Repo Sync', description: 'Syncs repositories across Bitbucket instances', lastRun: '2024-09-22', services: [3], status: 'success' },
  { id: 5, name: 'Azure DevOps Build', description: 'Monitors build statuses in Azure DevOps', lastRun: '2024-09-21', services: [4], status: 'success' },
  { id: 6, name: 'Jira Issue Tracker', description: 'Tracks and updates Jira issues automatically', lastRun: '2024-09-20', services: [5], status: 'in progress' },
  { id: 7, name: 'Multi-Service Notification', description: 'Combines GitHub and Slack for notifications', lastRun: '2024-09-19', services: [1,2,3,4,5, 6], status: 'success' },
  { id: 8, name: 'GitLab Merge Request', description: 'Handles merge requests in GitLab', lastRun: '2024-09-18', services: [2], status: 'failed' },
  { id: 9, name: 'Bitbucket Webhook', description: 'Processes webhooks from Bitbucket', lastRun: '2024-09-17', services: [3], status: 'in progress' },
  { id: 10, name: 'Azure Slack Integration', description: 'Integrates Azure DevOps with Slack alerts', lastRun: '2024-09-16', services: [4, 6], status: 'success' },
  { id: 11, name: 'Jira GitHub Sync', description: 'Syncs Jira issues with GitHub repositories', lastRun: '2024-09-15', services: [1, 5], status: 'success' },
  { id: 12, name: 'GitLab Slack Bot', description: 'Bot that posts GitLab updates to Slack', lastRun: 'Not started yet', services: [2, 6], status: 'not started' },
  { id: 13, name: 'Bitbucket Jira Link', description: 'Links Bitbucket commits to Jira issues', lastRun: '2024-09-13', services: [3, 5], status: 'success' },
  { id: 14, name: 'Azure DevOps Dashboard', description: 'Updates dashboards based on Azure DevOps data', lastRun: '2024-09-12', services: [4], status: 'success' },
  { id: 15, name: 'GitHub Issue Closer', description: 'Automatically closes resolved GitHub issues', lastRun: '2024-09-11', services: [1], status: 'in progress' },
  { id: 16, name: 'Slack File Upload', description: 'Uploads files to Slack channels', lastRun: '2024-09-10', services: [6], status: 'success' },
  { id: 17, name: 'GitLab Runner Monitor', description: 'Monitors GitLab CI runners', lastRun: 'Not started yet', services: [2], status: 'not started' },
  { id: 18, name: 'Bitbucket PR Review', description: 'Manages pull request reviews in Bitbucket', lastRun: '2024-09-08', services: [3], status: 'in progress' },
  { id: 19, name: 'Azure Jira Integration', description: 'Integrates Azure DevOps work items with Jira', lastRun: '2024-09-07', services: [4, 5], status: 'success' },
  { id: 20, name: 'Multi-Platform Alert', description: 'Sends alerts across GitHub, Slack, and Jira', lastRun: '2024-09-06', services: [1, 5, 6], status: 'success' },
];

const mockServices = [
  { id: 1, name: 'GitHub', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
  { id: 2, name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
  { id: 3, name: 'Bitbucket', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Bitbucket-blue-logomark-only.svg' },
  { id: 4, name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
  { id: 5, name: 'Jira', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Jira_%28Software%29_logo.svg' },
  { id: 6, name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png' },
];

jest.mock('./services/areasService', () => ({
  getAreas: jest.fn().mockResolvedValue(mockAreas),
  getServices: jest.fn().mockResolvedValue(mockServices),
  createArea: jest.fn().mockResolvedValue({ id: Date.now(), name: 'Mock Area', description: 'Mock Description', lastRun: new Date().toISOString(), services: [], status: 'not started' }),
  updateArea: jest.fn().mockResolvedValue({}),
  deleteArea: jest.fn().mockResolvedValue({}),
  getOAuthProviders: jest.fn().mockResolvedValue([
    { id: 'google', name: 'Google', color: '#4285f4' },
    { id: 'github', name: 'GitHub', color: '#333' },
  ]),
}))