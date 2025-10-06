import axios from '../config/axios';
import { Area, Service } from '../types';
import { data as mockData, services as mockServices } from '../mocks/areas';
import { API_CONFIG, USE_MOCK_DATA } from '../config/api';

export const getAreas = async (): Promise<Area[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(mockData);

  try {
    const response = await axios.get(API_CONFIG.endpoints.areas.list);
    return response.data;
  } catch (error) {
    console.error('Get areas error:', error);
    throw error;
  }
};

export const getServices = async (): Promise<Service[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(mockServices);

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.catalog);
    return response.data;
  } catch (error) {
    console.error('Get services error:', error);
    throw error;
  }
};
