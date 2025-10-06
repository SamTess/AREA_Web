import axios from '../config/axios';
import { OAuthProvider } from '../types';
import { API_CONFIG, USE_MOCK_DATA } from '../config/api';

const mockProviders: OAuthProvider[] = [
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png", label: 'Google' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", label: 'Microsoft' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg", label: 'Github' },
];

export const getOAuthProviders = async (): Promise<OAuthProvider[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(mockProviders);

  try {
    const response = await axios.get(`${API_CONFIG.baseURL}/api/oauth/providers`);
    return response.data.map((provider: {
      providerKey: string;
      providerLabel: string;
      providerLogoUrl: string;
      userAuthUrl: string;
      clientId: string;
    }) => ({
      providerKey: provider.providerKey,
      providerLabel: provider.providerLabel,
      providerLogoUrl: provider.providerLogoUrl,
      userAuthUrl: provider.userAuthUrl,
      clientId: provider.clientId,
      iconPath: provider.providerLogoUrl,
      label: provider.providerLabel
    }));
  } catch (error) {
    console.error('Get OAuth providers error:', error);
    return mockProviders;
  }
};

export const initiateOAuth = (provider: string, userAuthUrl?: string): void => {
  if (USE_MOCK_DATA) {
    console.log(`Mock OAuth initiation for ${provider}`);
    return;
  }

  if (userAuthUrl) {
    window.location.href = userAuthUrl;
    return;
  }
  const oauthUrl = `${API_CONFIG.baseURL}/api/oauth/${provider.toLowerCase()}/authorize`;
  window.location.href = oauthUrl;
};

export const connectGitHubForTesting = async (githubToken: string, githubUsername: string) => {
  try {
    const response = await axios.post(`${API_CONFIG.baseURL}/api/test/github/simulate-github-connection`, {
      github_token: githubToken,
      github_username: githubUsername
    });
    return response.data;
  } catch (error) {
    console.error('GitHub connection error:', error);
    throw error;
  }
};