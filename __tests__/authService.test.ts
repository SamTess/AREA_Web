import { login, register, forgotPassword } from '../src/services/authService'

jest.mock('axios')
import axios from 'axios'

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('returns mock token when USE_MOCK_DATA is true', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' }
      const result = await login(loginData)
      expect(result).toEqual({ token: 'mock-token' })
    })

    it('handles login with valid credentials structure', async () => {
      const loginData = { email: 'user@test.com', password: 'securepass' }
      const result = await login(loginData)
      expect(result).toHaveProperty('token')
      expect(typeof result.token).toBe('string')
    })
  })

  describe('register', () => {
    it('returns mock token when USE_MOCK_DATA is true', async () => {
      const registerData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123'
      }
      const result = await register(registerData)
      expect(result).toEqual({ token: 'mock-token' })
    })

    it('handles registration with complete user data', async () => {
      const registerData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'securepassword'
      }
      const result = await register(registerData)
      expect(result).toHaveProperty('token')
      expect(typeof result.token).toBe('string')
    })
  })

  describe('forgotPassword', () => {
    it('resolves successfully when USE_MOCK_DATA is true', async () => {
      const email = 'user@example.com'
      await expect(forgotPassword(email)).resolves.toBeUndefined()
    })

    it('handles forgot password with valid email', async () => {
      const email = 'valid.email@test.com'
      await expect(forgotPassword(email)).resolves.toBeUndefined()
    })
  })
})