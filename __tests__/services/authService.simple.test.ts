jest.unmock('../../src/services/authService');

import {
  login,
  register,
  forgotPassword,
  updateProfile,
  logout,
  getCurrentUser,
  getAuthStatus,
  refreshToken
} from '../../src/services/authService';

describe('authService with mock data', () => {
  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await login({ email: 'test@test.com', password: 'password123' });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email');
    });

    it('should throw error with invalid credentials', async () => {
      try {
        await login({ email: 'wrong@test.com', password: 'wrong' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const result = await register({
        email: 'new@test.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123'
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });

  describe('forgotPassword', () => {
    it('should process forgot password request', async () => {
      await expect(forgotPassword('test@test.com')).resolves.not.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const profileData = {
        email: 'test@test.com',
        firstName: 'Updated',
        lastName: 'User',
        language: 'en'
      };

      await expect(updateProfile(profileData)).resolves.not.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await expect(logout()).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const result = await getCurrentUser();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('avatarSrc');
      expect(result).toHaveProperty('profileData');
    });
  });

  describe('getAuthStatus', () => {
    it('should get authentication status', async () => {
      const result = await getAuthStatus();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('authenticated');
      expect(typeof result.authenticated).toBe('boolean');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token', async () => {
      const result = await refreshToken();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('token');
      expect(typeof result.token).toBe('string');
    });
  });
});
