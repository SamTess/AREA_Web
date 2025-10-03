let inMemoryToken: string | null = null;
let tokenExpiryTime: number | null = null;
let cryptoKey: CryptoKey | null = null;

const getOrCreateCryptoKey = async (): Promise<CryptoKey> => {
  if (cryptoKey) return cryptoKey;

  if (typeof window === 'undefined') {
    throw new Error('Web Crypto API not available in server-side environment');
  }

  if (!isWebCryptoSupported()) {
    throw new Error('Web Crypto API not supported in this browser');
  }

  const storedKeyData = sessionStorage.getItem('_sk');
  if (storedKeyData) {
    try {
      const keyData = new Uint8Array(JSON.parse(storedKeyData));
      cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
      return cryptoKey;
    } catch (error) {
      console.warn('Failed to restore crypto key, generating new one:', error);
      sessionStorage.removeItem('_sk');
    }
  }
  cryptoKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  try {
    const exportedKey = await crypto.subtle.exportKey('raw', cryptoKey);
    const keyArray = Array.from(new Uint8Array(exportedKey));
    sessionStorage.setItem('_sk', JSON.stringify(keyArray));
  } catch (error) {
    console.warn('Failed to store crypto key:', error);
  }

  return cryptoKey;
};

const encryptWithAESGCM = async (text: string): Promise<string> => {
  if (!text) return text;

  try {
    const key = await getOrCreateCryptoKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

const decryptWithAESGCM = async (encryptedData: string): Promise<string> => {
  if (!encryptedData) return encryptedData;

  try {
    const key = await getOrCreateCryptoKey();

    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

export const setSecureToken = async (token: string, expiresInMs?: number): Promise<void> => {
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
      if (isWebCryptoSupported()) {
        const encrypted = await encryptWithAESGCM(token);
        localStorage.setItem('_at', encrypted);
      } else {
        console.warn('Web Crypto API not supported. Token stored in memory only for security.');
        localStorage.setItem('_at', 'WEB_CRYPTO_NOT_SUPPORTED');
      }

      if (expiresInMs) {
        localStorage.setItem('_ate', tokenExpiryTime!.toString());
      }
    } catch (error) {
      console.error('Failed to store encrypted token:', error);
    }
  }
};

export const getSecureToken = async (): Promise<string | null> => {
  if (tokenExpiryTime && Date.now() > tokenExpiryTime) {
    await clearSecureToken();
    return null;
  }
  if (inMemoryToken) {
    return inMemoryToken;
  }
  if (typeof window !== 'undefined') {
    try {
      const encrypted = localStorage.getItem('_at');
      if (encrypted && encrypted !== 'WEB_CRYPTO_NOT_SUPPORTED') {
        if (isWebCryptoSupported()) {
          const decrypted = await decryptWithAESGCM(encrypted);
          inMemoryToken = decrypted;
          const expiryStr = localStorage.getItem('_ate');
          if (expiryStr) {
            const expiry = parseInt(expiryStr, 10);
            if (Date.now() > expiry) {
              await clearSecureToken();
              return null;
            }
            tokenExpiryTime = expiry;
          }

          return decrypted;
        } else {
          console.warn('Web Crypto API not supported. Cannot decrypt stored data.');
          await clearSecureToken();
        }
      } else if (encrypted === 'WEB_CRYPTO_NOT_SUPPORTED') {
        console.warn('Token was stored without encryption. Clearing for security.');
        await clearSecureToken();
      }
    } catch (error) {
      console.error('Failed to retrieve encrypted token:', error);
      await clearSecureToken();
    }
  }
  return null;
};

export const hasSecureToken = async (): Promise<boolean> => {
  const token = await getSecureToken();
  return token !== null;
};

export const clearSecureToken = async (): Promise<void> => {
  inMemoryToken = null;
  tokenExpiryTime = null;
  cryptoKey = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('_at');
    localStorage.removeItem('_ate');
    sessionStorage.removeItem('_sk');
    localStorage.removeItem('authToken');
  }
};

export const migrateFromLocalStorage = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    const oldToken = localStorage.getItem('authToken');
    if (oldToken) {
      console.log('Migrating token to secure storage...');
      await setSecureToken(oldToken);
      localStorage.removeItem('authToken');
    }
  }
};

export const getSecureTokenSync = (): string | null => {
  if (tokenExpiryTime && Date.now() > tokenExpiryTime) {
    return null;
  }
  return inMemoryToken;
};

export const isWebCryptoSupported = (): boolean => {
  return typeof window !== 'undefined' &&
         typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined';
};

export const __resetInMemoryState = (): void => {
  inMemoryToken = null;
  tokenExpiryTime = null;
  cryptoKey = null;
};
