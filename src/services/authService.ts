import axios from 'axios';
import { LoginData, RegisterData, ProfileData } from '../types';

const USE_MOCK_DATA = true;

export const login = async (data: LoginData): Promise<{ token: string }> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({ token: 'mock-token' });
  const response = await axios.post('/api/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<{ token: string }> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({ token: 'mock-token' });
  const response = await axios.post('/api/auth/register', data);
  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();
  await axios.post('/api/auth/forgot-password', { email });
};

export const updateProfile = async (data: ProfileData): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();
  await axios.put('/api/auth/profile', data);
};