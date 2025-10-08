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
      providers: '/api/oauth/providers',
      oauth: '/api/auth/oauth/',
      link: '/api/oauth-link/'
    },
    user: {
      profile: '/api/auth/profile',
      avatar: '/api/user/avatar',
      getUser: '/api/auth/me',
      serviceConnection: '/api/user/service-connection',
      connectedServices: '/api/user/connected-services'
    },
    areas: {
      list: '/api/areas',
      create: '/api/areas',
      createWithActions: '/api/areas/with-links',
      update: '/api/areas/',
      delete: '/api/areas/',
      getById: '/api/areas/',
      cards: '/api/areas/',
      run: '/api/areas/',
    },
    services: {
      list: '/api/services',
      catalog: '/api/services/catalog',
      search: '/api/services/search',
      getById: '/api/services/',
      actions: '/api/action-definitions/service/',
      actionFields: '/api/services/',
    },
    actions: {
      create: '/api/actions',
      labels: '/api/services/labels',
      reactions: '/api/services/reactions',
      test: '/api/test/'
    },
    admin: {
      dashboard: '/api/admin/dashboard',
      lineData: '/api/admin/line-data',
      pieData: '/api/admin/pie-data',
      barData: '/api/admin/bar-data',
      revenueData: '/api/admin/revenue-data',
      profitData: '/api/admin/profit-data',
      users: '/api/admin/users',
      areas: '/api/admin/areas',
      services: '/api/admin/services',
      areasPieData: '/api/admin/areas-pie-data',
      servicesBarData: '/api/admin/services-bar-data',
      logs: '/api/admin/logs',
      areaRuns: '/api/admin/area-runs',
      areaStats: '/api/admin/area-stats',
      cardUserData: '/api/admin/card-user-data'
    }
  }
};

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
