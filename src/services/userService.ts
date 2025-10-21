import axios from '../config/axios';
import { UserContent } from '@/types';
import { mockUser } from '@/mocks/user';
import { API_CONFIG, USE_MOCK_DATA } from '@/config/api';

export const getUser = async (email: string): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return mockUser;

  try {
    const response = await axios.get(`${API_CONFIG.endpoints.user.getUser}/${email}`);
    return response.data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const uploadAvatar = async (file: File): Promise<string> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'https://mock.jpg';
  }

  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axios.post(API_CONFIG.endpoints.user.avatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.avatarUrl;
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
};

export const getUserInfo = async (): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return mockUser;

  try {
    const response = await axios.get(API_CONFIG.endpoints.user.getUser);
    const backendUser = response.data;
    return {
      id: backendUser.id,
      name: `${backendUser.firstname || ''} ${backendUser.lastname || ''}`.trim() || backendUser.email,
      email: backendUser.email,
      avatarSrc: backendUser.avatarUrl || '',
      password: '',
      isAdmin: backendUser.isAdmin || false,
      isVerified: backendUser.isActive || false,
      profileData: {
        email: backendUser.email,
        firstName: backendUser.firstname || '',
        lastName: backendUser.lastname || '',
        language: 'en'
      }
    };
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
}

export const getUserById = async (id: string): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return mockUser;
  try {
    const response = await axios.get(`${API_CONFIG.endpoints.user.getUserById}/${id}`);
    const backendUser = response.data;
    return {
      id: backendUser.id,
      name: `${backendUser.firstname || ''} ${backendUser.lastname || ''}`.trim() || backendUser.email,
      email: backendUser.email,
      avatarSrc: backendUser.avatarUrl || '',
      password: '',
      isAdmin: backendUser.isAdmin || false,
      isVerified: backendUser.isActive || false,
      profileData: {
        email: backendUser.email,
        firstName: backendUser.firstname || '',
        lastName: backendUser.lastname || '',
        language: 'en'
      }
    };
  } catch (error) {
    console.error('Get user by id error:', error);
    throw error;
  }
};