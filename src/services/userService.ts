import axios from 'axios';
import { UserContent } from '@/types';
import { mockUser } from '@/mocks/user';

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true' || true;

export const getUser = async (email: string): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return mockUser;
  const response = await axios.get(`/api/user/${email}`);
  return response.data;
};

export const uploadAvatar = async (file: File): Promise<string> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'https://mock.jpg'; // juste mock pour l'instant ca return rien
  }
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await axios.post('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.avatarUrl;
};
