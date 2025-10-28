import axios from '../../src/config/axios';
import * as adminService from '../../src/services/adminService';

jest.mock('../../src/config/axios');
jest.mock('../../src/config/api', () => ({
  API_CONFIG: {
    endpoints: {
      admin: {
        userConnectedPerDay: '/admin/stats/connections',
        newUserPerMonth: '/admin/stats/users',
        users: '/admin/users',
        areas: '/admin/areas',
        services: '/admin/services',
        servicesUsage: '/admin/stats/services',
        areaRuns: '/admin/area-runs',
        areaStats: '/admin/stats/areas',
        cardUserData: '/admin/stats/user-cards',
      },
      auth: {
        register: '/auth/register',
      },
      user: {
        profile: '/user/profile',
      },
    },
  },
  USE_MOCK_DATA: false,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLineData', () => {
    it('should fetch line data successfully', async () => {
      const mockData = [{ date: '2024-01-01', count: 10 }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await adminService.getLineData();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/stats/connections');
      expect(result).toEqual(mockData);
    });

    it('should handle errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(adminService.getLineData()).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getBarData', () => {
    it('should fetch bar data successfully', async () => {
      const mockData = [{ month: 'Jan', users: 50 }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await adminService.getBarData();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/stats/users');
      expect(result).toEqual(mockData);
    });
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [{ id: '1', email: 'test@example.com' }];
      mockedAxios.get.mockResolvedValue({ data: mockUsers });

      const result = await adminService.getUsers();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getAreas', () => {
    it('should fetch areas successfully', async () => {
      const mockAreas = [{ id: '1', name: 'Test Area' }];
      mockedAxios.get.mockResolvedValue({ data: mockAreas });

      const result = await adminService.getAreas();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/areas');
      expect(result).toEqual(mockAreas);
    });
  });

  describe('getServices', () => {
    it('should fetch services successfully', async () => {
      const mockServices = [{ id: '1', name: 'GitHub' }];
      mockedAxios.get.mockResolvedValue({ data: mockServices });

      const result = await adminService.getServices();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/services');
      expect(result).toEqual(mockServices);
    });
  });

  describe('getServicesBarData', () => {
    it('should fetch services bar data successfully', async () => {
      const mockData = [{ service: 'GitHub', usage: 100 }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await adminService.getServicesBarData();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/stats/services');
      expect(result).toEqual(mockData);
    });
  });

  describe('getAreaRuns', () => {
    it('should fetch area runs successfully', async () => {
      const mockRuns = [{ id: '1', status: 'success' }];
      mockedAxios.get.mockResolvedValue({ data: mockRuns });

      const result = await adminService.getAreaRuns();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/area-runs');
      expect(result).toEqual(mockRuns);
    });
  });

  describe('getAreaStats', () => {
    it('should fetch area stats successfully', async () => {
      const mockStats = { total: 100, active: 50 };
      mockedAxios.get.mockResolvedValue({ data: mockStats });

      const result = await adminService.getAreaStats();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/stats/areas');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getCardUserData', () => {
    it('should fetch card user data successfully', async () => {
      const mockData = { users: 1000, growth: 10 };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await adminService.getCardUserData();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/stats/user-cards');
      expect(result).toEqual(mockData);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        isAdmin: false,
      };
      mockedAxios.post.mockResolvedValue({ data: { id: '1', ...userData } });

      const result = await adminService.createUser(userData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual({ id: '1', ...userData });
    });
  });

  describe('addUser', () => {
    it('should add user successfully', async () => {
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        avatarSrc: '',
        profileData: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        isAdmin: false,
        isVerified: false,
      };
      mockedAxios.post.mockResolvedValue({ data: user });

      const result = await adminService.addUser(user);

      expect(mockedAxios.post).toHaveBeenCalledWith('/admin/users', user);
      expect(result).toEqual(user);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const user = {
        id: '1',
        name: 'Updated User',
        email: 'updated@example.com',
        password: 'password123',
        avatarSrc: '',
        profileData: {
          email: 'updated@example.com',
          firstName: 'Updated',
          lastName: 'User',
        },
        isAdmin: false,
        isVerified: true,
      };
      mockedAxios.put.mockResolvedValue({ data: user });

      const result = await adminService.updateUser('1', user);

      expect(mockedAxios.put).toHaveBeenCalledWith('/admin/users/1', user);
      expect(result).toEqual(user);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await adminService.deleteUser('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/user/profile/1');
    });

    it('should handle delete errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(adminService.deleteUser('1')).rejects.toThrow('Delete failed');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('deleteArea', () => {
    it('should delete area successfully', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await adminService.deleteArea('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/admin/areas/1');
    });
  });

  describe('enableDisableArea', () => {
    it('should enable area successfully', async () => {
      mockedAxios.patch.mockResolvedValue({});

      await adminService.enableDisableArea('1', true);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/admin/areas/1', { enabled: true });
    });

    it('should disable area successfully', async () => {
      mockedAxios.patch.mockResolvedValue({});

      await adminService.enableDisableArea('1', false);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/admin/areas/1', { enabled: false });
    });
  });

  describe('addService', () => {
    it('should add service successfully', async () => {
      const service = { id: '1', name: 'GitHub', logo: 'github-logo.png' };
      mockedAxios.post.mockResolvedValue({ data: service });

      const result = await adminService.addService(service);

      expect(mockedAxios.post).toHaveBeenCalledWith('/admin/services', service);
      expect(result).toEqual(service);
    });
  });

  describe('updateService', () => {
    it('should update service successfully', async () => {
      const service = { id: '1', name: 'GitHub Updated', logo: 'github-logo.png' };
      mockedAxios.put.mockResolvedValue({ data: service });

      const result = await adminService.updateService('1', service);

      expect(mockedAxios.put).toHaveBeenCalledWith('/admin/services/1', service);
      expect(result).toEqual(service);
    });
  });

  describe('deleteService', () => {
    it('should delete service successfully', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await adminService.deleteService('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/admin/services/1');
    });
  });
});
