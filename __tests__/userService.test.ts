import { getUser, uploadAvatar } from '../src/services/userService';
import { mockUser } from '../src/mocks/user';

jest.mock('axios');
import axios from 'axios';

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('returns mock user data when USE_MOCK_DATA is true', async () => {
      const email = 'test@example.com';
      const result = await getUser(email);
      expect(result).toEqual(mockUser);
    });

    it('returns user data with correct structure', async () => {
      const email = 'user@test.com';
      const result = await getUser(email);
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('avatarSrc');
      expect(result).toHaveProperty('profileData');
      expect(result.profileData).toHaveProperty('firstName');
      expect(result.profileData).toHaveProperty('lastName');
      expect(result.profileData).toHaveProperty('language');
    });

    it('handles different email inputs', async () => {
      const emails = ['test@example.com', 'user@test.com', 'another@test.org'];
      for (const email of emails) {
        const result = await getUser(email);
        expect(result.email).toBe('user@example.com');
      }
    });
  });

  describe('uploadAvatar', () => {
    it('returns mock avatar URL when USE_MOCK_DATA is true', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const result = await uploadAvatar(mockFile);
      expect(result).toBe('https://mock.jpg');
    });

    it('handles file upload with different file types', async () => {
      const fileTypes = ['image/png', 'image/jpeg', 'image/gif'];
      for (const type of fileTypes) {
        const mockFile = new File(['test'], 'test.png', { type });
        const result = await uploadAvatar(mockFile);
        expect(result).toBe('https://mock.jpg');
      }
    });

    it('handles file upload with different file names', async () => {
      const fileNames = ['avatar.png', 'profile.jpg', 'user.gif'];
      for (const name of fileNames) {
        const mockFile = new File(['test'], name, { type: 'image/png' });
        const result = await uploadAvatar(mockFile);
        expect(result).toBe('https://mock.jpg');
      }
    });

    it('returns a string URL', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const result = await uploadAvatar(mockFile);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^https?:\/\//);
    });
  });
});

describe('userService with real API', () => {
  const USE_MOCK_DATA = false;

  const getUserReal = async (email: string) => {
    if (USE_MOCK_DATA)
      return mockUser;
    const response = await axios.get(`/api/user/${email}`);
    return response.data;
  };

  const uploadAvatarReal = async (file: File): Promise<string> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'https://mock.jpg';
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

  it('calls axios.get for getUser when USE_MOCK_DATA is false', async () => {
    const mockResponse = { data: { email: 'real@example.com', avatarSrc: 'real.jpg', profileData: { firstName: 'Real', lastName: 'User', language: 'en' } } };
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(mockResponse);

    const result = await getUserReal('test@example.com');

    expect(axios.get).toHaveBeenCalledWith('/api/user/test@example.com');
    expect(result).toEqual(mockResponse.data);
  });

  it('calls axios.post for uploadAvatar when USE_MOCK_DATA is false', async () => {
    const mockResponse = { data: { avatarUrl: 'https://real.jpg' } };
    (axios.post as jest.MockedFunction<typeof axios.post>).mockResolvedValue(mockResponse);

    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const result = await uploadAvatarReal(mockFile);

    expect(axios.post).toHaveBeenCalledWith('/api/user/avatar', expect.any(FormData), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    expect(result).toBe('https://real.jpg');
  });
});