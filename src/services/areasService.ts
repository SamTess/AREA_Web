import axios from 'axios';
import { Area, Service } from '../types';
import { data as mockData, services as mockServices } from '../mocks/areas';

const USE_MOCK_DATA = true;

export const getAreas = async (): Promise<Area[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(mockData);
  const response = await axios.get('/api/areas');
  return response.data;
};

export const getServices = async (): Promise<Service[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(mockServices);
  const response = await axios.get('/api/services');
  return response.data;
};