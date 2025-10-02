import { getAreas, getServices } from '../../src/services/areasService';

jest.mock('../../src/config/api', () => ({
  USE_MOCK_DATA: true
}));

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('areasService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  describe('getAreas', () => {
    it('should return mock areas data', async () => {
      const result = await getAreas();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('status');
    });
  });

  describe('getServices', () => {
    it('should return mock services data', async () => {
      const result = await getServices();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('logo');
    });
  });
});