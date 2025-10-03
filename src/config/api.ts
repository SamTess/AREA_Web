export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me',
      status: '/api/auth/status',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      verifyEmail: '/api/auth/verify-email',
      providers: '/api/auth/providers',
      oauth: '/api/auth/oauth/'
    },
    user: {
      profile: '/api/auth/profile',
      avatar: '/api/user/avatar',
      getUser: '/api/user'
    },
    areas: {
      list: '/api/areas',
      create: '/api/areas',
      update: '/api/areas/',
      delete: '/api/areas/',
      getById: '/api/areas/',
      cards: '/api/areas/',
      run: '/api/areas/',
    },
    services: {
      list: '/api/services',
      search: '/api/services/search',
      getById: '/api/services/',
      actions: '/api/services/',
      actionFields: '/api/services/',
    },
    actions: {
      create: '/api/actions',
    }
  }
};

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
