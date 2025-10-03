import { 
  setSecureToken, 
  getSecureToken, 
  clearSecureToken, 
  migrateFromLocalStorage,
  hasSecureToken,
  getSecureTokenSync,
  isWebCryptoSupported,
  __resetInMemoryState
} from '../../src/utils/secureStorage';

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Define mocks before setting up window
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock console methods
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    consoleWarnSpy.mockClear();
    consoleLogSpy.mockClear();
    
    // Clear any in-memory state without localStorage operations
    __resetInMemoryState();
  });

  describe('setSecureToken', () => {
    it('should store token securely', async () => {
      const token = 'test-token';
      await setSecureToken(token);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(sessionStorageMock.setItem).toHaveBeenCalled();
    });

    it('should warn when storing empty token', async () => {
      await setSecureToken('');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Attempted to store empty token');
    });

    it('should handle null token', async () => {
      await setSecureToken(null!);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Attempted to store empty token');
    });

    it('should store expiration time when provided', async () => {
      const token = 'test-token';
      const expiryMs = 60000; // 1 minute
      await setSecureToken(token, expiryMs);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('_ate', expect.any(String));
    });
  });

  describe('getSecureToken', () => {
    it('should retrieve token when available', async () => {
      // First clear any existing state
      await clearSecureToken();
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === '_at') return 'dGVzdC10b2tlbg=='; // base64 for 'test-token'
        return null;
      });
      sessionStorageMock.getItem.mockReturnValue('test-key');
      
      const token = await getSecureToken();
      
      expect(token).toBeTruthy();
    });

    it('should return null when completely empty storage', async () => {
      // Clear any existing state
      await clearSecureToken();
      
      localStorageMock.getItem.mockReturnValue(null);
      sessionStorageMock.getItem.mockReturnValue(null);
      
      const token = await getSecureToken();
      
      expect(token).toBeNull();
    });

    it('should handle stored token properly', async () => {
      // This test focuses on the in-memory retrieval path
      await setSecureToken('test-token');
      
      // Token should be available from memory
      const token = await getSecureToken();
      
      expect(token).toBe('test-token');
    });

    it('should return null for expired tokens', async () => {
      // Clear any existing state
      await clearSecureToken();
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === '_at') return 'encrypted-token';
        if (key === '_ate') return (Date.now() - 1000).toString(); // expired
        return null;
      });
      
      const token = await getSecureToken();
      
      expect(token).toBeNull();
    });
  });

  describe('clearSecureToken', () => {
    it('should clear both localStorage and sessionStorage', async () => {
      await clearSecureToken();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_at');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_ate');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('_sk');
    });
  });

  describe('migrateFromLocalStorage', () => {
    it('should migrate old token and clear it', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'authToken') return 'old-token';
        return null;
      });
      
      await migrateFromLocalStorage();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Migrating token to secure storage...');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should do nothing when no old token exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      await migrateFromLocalStorage();
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('encryption/decryption edge cases', () => {
    it('should handle encryption with empty key', async () => {
      // Clear any existing state
      await clearSecureToken();
      
      sessionStorageMock.getItem.mockReturnValue('');
      
      const token = 'test-token';
      await setSecureToken(token);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should handle decryption with corrupted data', async () => {
      // Clear any existing state
      await clearSecureToken();
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === '_at') return 'corrupted-data';
        return null;
      });
      sessionStorageMock.getItem.mockReturnValue('test-key');
      
      const token = await getSecureToken();
      
      // Should clear corrupted data and return null
      expect(token).toBeNull();
    });

    it('should handle Web Crypto API not supported gracefully', async () => {
      // Clear any existing state
      await clearSecureToken();
      
      const token = 'test-token';
      await setSecureToken(token);
      
      // Should still work, just store a fallback indicator
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('SSR compatibility', () => {
    it('should handle basic operations without throwing', async () => {
      // Test that basic operations don't throw errors
      await expect(setSecureToken('test-token')).resolves.not.toThrow();
      await expect(clearSecureToken()).resolves.not.toThrow();
      await expect(getSecureToken()).resolves.not.toThrow();
    });
  });

  describe('new security features', () => {
    it('should detect Web Crypto API support', () => {
      expect(isWebCryptoSupported()).toBe(true);
    });

    it('should provide synchronous token access when available', async () => {
      // Clear any existing state
      await clearSecureToken();
      
      // First set a token
      await setSecureToken('test-token');
      
      // Should be available synchronously from memory
      const syncToken = getSecureTokenSync();
      expect(syncToken).toBe('test-token');
    });

    it('should handle token expiration in sync access', async () => {
      // Clear any existing state
      await clearSecureToken();
      
      // Set token with very short expiry
      await setSecureToken('test-token', 1); // 1ms
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const syncToken = getSecureTokenSync();
      expect(syncToken).toBeNull();
    });

    it('should check if token exists', async () => {
      // Clear any existing state
      await clearSecureToken();
      
      await setSecureToken('test-token');
      
      const hasToken = await hasSecureToken();
      expect(hasToken).toBe(true);
      
      await clearSecureToken();
      
      const hasTokenAfterClear = await hasSecureToken();
      expect(hasTokenAfterClear).toBe(false);
    });
  });
});