import axios from 'axios';
import { OAuthProvider } from '../types';

const USE_MOCK_DATA = true;

{/** ou je sais pas si on met les Services ici */}
const mockProviders: OAuthProvider[] = [
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png", label: 'Google' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", label: 'Microsoft' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg", label: 'Github' },
];

export const getOAuthProviders = async (): Promise<OAuthProvider[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(mockProviders);
  const response = await axios.get('/api/auth/providers');
  return response.data;
};