import { API_CONFIG, buildApiUrl } from '../../src/config/api';

describe('api configuration', () => {
  describe('API_CONFIG', () => {
    it('should contain all required auth endpoints', () => {
      expect(API_CONFIG.endpoints.auth).toEqual({
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        me: '/api/auth/me',
        status: '/api/auth/status',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password',
        verifyEmail: '/api/auth/verify-email',
        providers: '/api/auth/providers'
      });
    });

    it('should contain all required user endpoints', () => {
      expect(API_CONFIG.endpoints.user).toEqual({
        profile: '/api/auth/profile',
        avatar: '/api/user/avatar',
        getUser: '/api/user'
      });
    });

    it('should contain all required areas endpoints', () => {
      expect(API_CONFIG.endpoints.areas).toEqual({
        list: '/api/areas',
        create: '/api/areas',
        update: '/api/areas',
        delete: '/api/areas'
      });
    });

    it('should have a baseURL', () => {
      expect(API_CONFIG.baseURL).toBeDefined();
      expect(typeof API_CONFIG.baseURL).toBe('string');
    });
  });

  describe('buildApiUrl', () => {
    it('should build correct URL with endpoint', () => {
      const url = buildApiUrl('/api/test');
      expect(url).toContain('/api/test');
      expect(url).toMatch(/^https?:\/\/.+\/api\/test$/);
    });

    it('should handle endpoints without leading slash', () => {
      const url = buildApiUrl('api/test');
      expect(url).toContain('api/test');
    });

    it('should handle empty endpoint', () => {
      const url = buildApiUrl('');
      expect(url).toBe(API_CONFIG.baseURL);
    });

    it('should concatenate baseURL and endpoint correctly', () => {
      const endpoint = '/test/endpoint';
      const url = buildApiUrl(endpoint);
      expect(url).toBe(`${API_CONFIG.baseURL}${endpoint}`);
    });
  });
});