import axios from '../config/axios';
import { OAuthProvider } from '../types';
import { API_CONFIG, USE_MOCK_DATA, buildApiUrl } from '../config/api';

const mockProviders: OAuthProvider[] = [
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png", label: 'Google' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", label: 'Microsoft' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg", label: 'Github' },
];

export const getOAuthProviders = async (): Promise<OAuthProvider[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(mockProviders);

  try {
    const response = await axios.get(API_CONFIG.endpoints.auth.providers);
    return response.data;
  } catch (error) {
    console.error('Get OAuth providers error:', error);
    throw error;
  }
};

export const initiateOAuth = (provider: string): void => {
  if (USE_MOCK_DATA) {
    console.log(`Mock OAuth initiation for ${provider}`);
    return;
  }

  const oauthUrl = API_CONFIG.endpoints.auth.oauth + provider.toLowerCase();
  window.location.href = oauthUrl;
};