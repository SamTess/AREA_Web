jest.unmock('../../src/services/areasService');

import { getAreas, getServices } from '../../src/services/areasService';

describe('areasService with mock data', () => {
  describe('getAreas', () => {
    it('should return areas', async () => {
      const result = await getAreas();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('description');
        expect(result[0]).toHaveProperty('status');
        expect(result[0]).toHaveProperty('services');
        expect(result[0]).toHaveProperty('lastRun');
      }
    });
  });

  describe('getServices', () => {
    it('should return services', async () => {
      const result = await getServices();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('logo');
      }
    });
  });
});
