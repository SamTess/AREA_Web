import axios from '../config/axios';
import { LoginData, RegisterData, ProfileData, UserContent, LoginResponse } from '../types';
import { API_CONFIG, USE_MOCK_DATA } from '../config/api';

export const extractToken = (response: LoginResponse): string | null => {
  if (response.token) { return response.token; }
  return null;
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  if (USE_MOCK_DATA) {
    if (data.email !== 'test@test.com' || data.password !== 'password123') {
      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        },
        message: 'Invalid email or password'
      };
      throw error;
    }
    return Promise.resolve({
      message: 'Login successful',
      user: {
        id: 1,
        email: data.email,
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token'
    });
  }

  try {
    const response = await axios.post(API_CONFIG.endpoints.auth.login, data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({
      message: 'Registration successful',
      user: {
        id: 1,
        email: data.email,
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token'
    });

  try {
    const response = await axios.post(API_CONFIG.endpoints.auth.register, data);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();

  try {
    await axios.post(API_CONFIG.endpoints.auth.forgotPassword, { email });
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const updateProfile = async (data: ProfileData): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();

  try {
    await axios.put(API_CONFIG.endpoints.user.profile, data);
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();

  try {
    await axios.post(API_CONFIG.endpoints.auth.logout);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({
      name: 'Mock User',
      email: 'mock@example.com',
      avatarSrc: 'https://mock.jpg',
      profileData: {
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'User',
        language: 'en'
      }
    });

  try {
    const response = await axios.get(API_CONFIG.endpoints.auth.me);
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

export const getAuthStatus = async (): Promise<{ authenticated: boolean }> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({ authenticated: true });

  try {
    const response = await axios.get(API_CONFIG.endpoints.auth.status);
    return response.data;
  } catch (error) {
    console.error('Get auth status error:', error);
    return { authenticated: false };
  }
};

export const refreshToken = async (): Promise<{ token: string }> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({ token: 'mock-refreshed-token' });

  try {
    const response = await axios.post(API_CONFIG.endpoints.auth.refresh);
    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};