import { getUser, uploadAvatar } from '../../src/services/userService';

jest.mock('../../src/config/api', () => ({
  USE_MOCK_DATA: true
}));

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  describe('getUser', () => {
    it('should return mock user data', async () => {
      const result = await getUser('mock@example.com');

      expect(result).toEqual({
        name: 'Test Tester',
        email: 'user@example.com',
        avatarSrc: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
        profileData: {
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'Tester',
          language: 'English',
          password: 'test1234'
        }
      });
    });
  });

  describe('uploadAvatar', () => {
    it('should return mock avatar URL', async () => {
      const mockFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });

      const result = await uploadAvatar(mockFile);

      expect(result).toBe('https://mock.jpg');
    });
  });
});