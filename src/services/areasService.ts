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
    const response = await axios.get(API_CONFIG.endpoints.services.list);
    return response.data;
  } catch (error) {
    console.error('Get services error:', error);
    throw error;
  }
};

export const createArea = async (areaData: Partial<Area>): Promise<Area> => {
  if (USE_MOCK_DATA) {
    const mockArea: Area = {
      id: Date.now(),
      name: areaData.name || 'Mock Area',
      description: areaData.description || 'Mock Description',
      lastRun: new Date().toISOString(),
      services: areaData.services || [],
      status: 'not started'
    };
    return Promise.resolve(mockArea);
  }

  try {
    const response = await axios.post(API_CONFIG.endpoints.areas.create, areaData);
    return response.data;
  } catch (error) {
    console.error('Create area error:', error);
    throw error;
  }
};

export const updateArea = async (id: number, areaData: Partial<Area>): Promise<Area> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve({ ...areaData, id } as Area);
  }

  try {
    const response = await axios.put(`${API_CONFIG.endpoints.areas.update}/${id}`, areaData);
    return response.data;
  } catch (error) {
    console.error('Update area error:', error);
    throw error;
  }
};

export const deleteArea = async (id: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve();
  }

  try {
    await axios.delete(`${API_CONFIG.endpoints.areas.delete}/${id}`);
  } catch (error) {
    console.error('Delete area error:', error);
    throw error;
  }
};

export const searchServices = async (query: string): Promise<Service[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockServices.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase())
    ));
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.search, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Search services error:', error);
    throw error;
  }
};