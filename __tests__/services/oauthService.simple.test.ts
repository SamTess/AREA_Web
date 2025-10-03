// Unmock oauthService to test the real implementation
jest.unmock('../../src/services/oauthService');

import { getOAuthProviders, initiateOAuth } from '../../src/services/oauthService';

describe('oauthService with mock data', () => {
  describe('getOAuthProviders', () => {
    it('should return list of OAuth providers', async () => {
      const result = await getOAuthProviders();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return providers with label and iconPath properties', async () => {
      const result = await getOAuthProviders();

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('label');
        expect(result[0]).toHaveProperty('iconPath');
      }
    });

    it('should return at least 3 OAuth providers', async () => {
      const result = await getOAuthProviders();

      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('initiateOAuth', () => {
    it('should initiate OAuth for a provider', () => {
      const provider = 'google';

      expect(() => initiateOAuth(provider)).not.toThrow();
    });

    it('should handle OAuth initiation for different providers', () => {
      const providers = ['google', 'microsoft', 'github'];

      for (const provider of providers) {
        expect(() => initiateOAuth(provider)).not.toThrow();
      }
    });
  });
});
