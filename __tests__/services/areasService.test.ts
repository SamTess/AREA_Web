import axios from '../../src/config/axios';
import * as areasService from '../../src/services/areasService';

jest.mock('../../src/config/axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Set USE_MOCK_DATA to true to test mock path
jest.mock('../../src/config/api', () => ({
  API_CONFIG: {
    baseURL: 'http://localhost:8080',
    endpoints: {
      areas: { list: '/areas', backend: '/backend/areas', getById: '/areas/', delete: '/areas/' },
      services: { catalog: '/services' },
    },
  },
  USE_MOCK_DATA: true,
}));

describe('areasService (Mock Mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAreas', () => {
    it('should return mock areas data', async () => {
      const result = await areasService.getAreas();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('getServices', () => {
    it('should return mock services data', async () => {
      const result = await areasService.getServices();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
