let inMemoryToken: string | null = null;
let tokenExpiryTime: number | null = null;

const getEncryptionKey = (): string => {
  if (typeof window === 'undefined') return '';

  let key = sessionStorage.getItem('_sk');
  if (!key) {
    key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    sessionStorage.setItem('_sk', key);
  }
  return key;
};

const simpleEncrypt = (text: string, key: string): string => {
  if (!text || !key) return text;

  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result);
  } catch {
    return text;
  }
};

const simpleDecrypt = (encrypted: string, key: string): string => {
  if (!encrypted || !key) return encrypted;

  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  } catch {
    return encrypted;
  }
};

export const setSecureToken = (token: string, expiresInMs?: number): void => {
  if (!token) {
    console.warn('Attempted to store empty token');
    return;
  }
  inMemoryToken = token;
  if (expiresInMs) {
    tokenExpiryTime = Date.now() + expiresInMs;
  }
  if (typeof window !== 'undefined') {
    try {
      const encryptionKey = getEncryptionKey();
      const encrypted = simpleEncrypt(token, encryptionKey);
      localStorage.setItem('_at', encrypted);

      if (expiresInMs) {
        localStorage.setItem('_ate', tokenExpiryTime!.toString());
      }
    } catch (error) {
      console.error('Failed to store encrypted token:', error);
    }
  }
};

export const getSecureToken = (): string | null => {
  if (tokenExpiryTime && Date.now() > tokenExpiryTime) {
    clearSecureToken();
    return null;
  }
  if (inMemoryToken) {
    return inMemoryToken;
  }
  if (typeof window !== 'undefined') {
    try {
      const encrypted = localStorage.getItem('_at');
      if (encrypted) {
        const encryptionKey = getEncryptionKey();
        const decrypted = simpleDecrypt(encrypted, encryptionKey);
        inMemoryToken = decrypted;
        const expiryStr = localStorage.getItem('_ate');
        if (expiryStr) {
          const expiry = parseInt(expiryStr, 10);
          if (Date.now() > expiry) {
            clearSecureToken();
            return null;
          }
          tokenExpiryTime = expiry;
        }

        return decrypted;
      }
    } catch (error) {
      console.error('Failed to retrieve encrypted token:', error);
    }
  }
  return null;
};

export const hasSecureToken = (): boolean => {
  return getSecureToken() !== null;
};

export const clearSecureToken = (): void => {
  inMemoryToken = null;
  tokenExpiryTime = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('_at');
    localStorage.removeItem('_ate');
    sessionStorage.removeItem('_sk');
    localStorage.removeItem('authToken');
  }
};

export const migrateFromLocalStorage = (): void => {
  if (typeof window !== 'undefined') {
    const oldToken = localStorage.getItem('authToken');
    if (oldToken) {
      console.log('Migrating token to secure storage...');
      setSecureToken(oldToken);
      localStorage.removeItem('authToken');
    }
  }
};
