import { login, register, forgotPassword, updateProfile } from '../src/services/authService'

jest.mock('axios')

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
        firstName: 'New',
        lastName: 'User',
        password: 'password123'
      }
      const result = await register(registerData)
      expect(result).toEqual({ token: 'mock-token' })
    })

    it('handles registration with complete user data', async () => {
      const registerData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
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

  describe('updateProfile', () => {
    it('resolves successfully when USE_MOCK_DATA is true', async () => {
      const profileData = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        language: 'English',
        password: 'newpassword'
      }
      await expect(updateProfile(profileData)).resolves.toBeUndefined()
    })

    it('handles profile update with complete data', async () => {
      const profileData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        language: 'French'
      }
      await expect(updateProfile(profileData)).resolves.toBeUndefined()
    })

    it('handles profile update with optional password', async () => {
      const profileData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        language: 'Spanish',
        password: 'optionalpassword'
      }
      await expect(updateProfile(profileData)).resolves.toBeUndefined()
    })

    it('handles profile update with different languages', async () => {
      const languages = ['English', 'French', 'Spanish', 'German']
      for (const language of languages) {
        const profileData = {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          language
        }
        await expect(updateProfile(profileData)).resolves.toBeUndefined()
      }
    })
  })
})