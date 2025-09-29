import { getAreas, getServices } from '../src/services/areasService'
import { services as mockServices, data as mockAreas } from '../src/mocks/areas'

jest.mock('axios')
import axios from 'axios'

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('areasService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAreas', () => {
    it('returns mock data when USE_MOCK_DATA is true', async () => {
      const result = await getAreas()
      expect(result).toEqual(mockAreas)
    })

    it('returns correct area structure', async () => {
      const result = await getAreas()
      expect(result).toBeInstanceOf(Array)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id')
        expect(result[0]).toHaveProperty('name')
        expect(result[0]).toHaveProperty('description')
        expect(result[0]).toHaveProperty('lastRun')
        expect(result[0]).toHaveProperty('services')
        expect(result[0]).toHaveProperty('status')
      }
    })
  })

  describe('getServices', () => {
    it('returns mock services when USE_MOCK_DATA is true', async () => {
      const result = await getServices()
      expect(result).toEqual(mockServices)
    })

    it('returns correct service structure', async () => {
      const result = await getServices()
      expect(result).toBeInstanceOf(Array)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id')
        expect(result[0]).toHaveProperty('name')
        expect(result[0]).toHaveProperty('logo')
      }
    })
  })
})