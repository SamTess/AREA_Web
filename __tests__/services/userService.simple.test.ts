// Unmock userService to test the real implementation
jest.unmock('../../src/services/userService');

import { getUser, uploadAvatar } from '../../src/services/userService';

describe('userService with mock data', () => {
  describe('getUser', () => {
    it('should get user by email', async () => {
      const result = await getUser('test@example.com');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('avatarSrc');
      expect(result).toHaveProperty('profileData');
    });

    it('should return user with profile data', async () => {
      const result = await getUser('user@test.com');

      expect(result.profileData).toBeDefined();
      expect(result.profileData).toHaveProperty('email');
      expect(result.profileData).toHaveProperty('firstName');
      expect(result.profileData).toHaveProperty('lastName');
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar file', async () => {
      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });

      const result = await uploadAvatar(mockFile);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle PNG files', async () => {
      const mockFile = new File(['content'], 'avatar.png', { type: 'image/png' });

      const result = await uploadAvatar(mockFile);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle GIF files', async () => {
      const mockFile = new File(['content'], 'avatar.gif', { type: 'image/gif' });

      const result = await uploadAvatar(mockFile);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
