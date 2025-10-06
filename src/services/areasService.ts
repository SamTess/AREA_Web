import axios from '../config/axios';
import { Area, Service, Action} from '../types';
import { data as mockData, services as mockServices, actions as MockActions, labelsTextReaction1, whiteboardCards} from '../mocks/areas';
import { API_CONFIG, USE_MOCK_DATA, buildApiUrl } from '../config/api';


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

export const getServiceById = async (id: number): Promise<Service | undefined> => {
  if (USE_MOCK_DATA) {
    const service = mockServices.find(service => service.id === id);
    return Promise.resolve(service);
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.getById + id);
    return response.data;
  } catch (error) {
    console.error('Get service by id error:', error);
    throw error;
  }
}

export const getActionsByServiceId = async (serviceId: number): Promise<Action[]> => {
  if (USE_MOCK_DATA) {
    const actions = MockActions.filter(action => action.serviceId === serviceId);
    return Promise.resolve(actions);
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.actions + `${serviceId}/actions`);
    return response.data;
  } catch (error) {
    console.error('Get actions by service id error:', error);
    throw error;
  }
};

export const getActionFieldsByServiceAndActionId = async (serviceId: number, actionId: number): Promise<any[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(labelsTextReaction1);

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.actionFields + `${serviceId}/actions/${actionId}/fields`);
    return response.data;
  } catch (error) {
    console.error('Get action fields error:', error);
    throw error;
  }
}

export const createAction = async (action: Partial<Action>): Promise<Action> => {
  if (USE_MOCK_DATA) {
    const newAction = { id: Date.now(), ...action } as Action;
    MockActions.push(newAction);
    return Promise.resolve(newAction);
  }

  try {
    const response = await axios.post(API_CONFIG.endpoints.actions.create, action);
    return response.data;
  } catch (error) {
    console.error('Create action error:', error);
    throw error;
  }
}

export const createArea = async (area: Partial<Area>): Promise<Area> => {
  if (USE_MOCK_DATA) {
    const newArea = { id: Date.now(), ...area } as Area;
    mockData.push(newArea);
    return Promise.resolve(newArea);
  }

  try {
    const response = await axios.post(API_CONFIG.endpoints.areas.create, area);
    return response.data;
  } catch (error) {
    console.error('Create area error:', error);
    throw error;
  }
}

export const getCardByAreaId = async (areaId: number): Promise<any[]> => {
  if (!areaId)
    return Promise.resolve([]);
  if (USE_MOCK_DATA)
    return Promise.resolve(whiteboardCards.filter(card => card.areaId === areaId));

  try {
    const response = await axios.get(API_CONFIG.endpoints.areas.cards + `${areaId}/cards`);
    return response.data;
  } catch (error) {
    console.error('Get cards by area id error:', error);
    throw error;
  }
}

export const getAreaById = async (areaId: number): Promise<Area | undefined> => {
  if (USE_MOCK_DATA) {
    const area = mockData.find(area => area.id === areaId);
    return Promise.resolve(area);
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.areas.getById + areaId);
    return response.data;
  } catch (error) {
    console.error('Get area by id error:', error);
    throw error;
  }
}

export const updateArea = async (areaId: number, area: Partial<Area>): Promise<Area> => {
  if (USE_MOCK_DATA) {
    const index = mockData.findIndex(a => a.id === areaId);
    if (index !== -1) {
      mockData[index] = { ...mockData[index], ...area };
      return Promise.resolve(mockData[index]);
    }
    throw new Error('Area not found');
  }

  try {
    const response = await axios.put(API_CONFIG.endpoints.areas.update + areaId, area);
    return response.data;
  } catch (error) {
    console.error('Update area error:', error);
    throw error;
  }
}

export const deleteAreabyId = async (areaId: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    const index = mockData.findIndex(a => a.id === areaId);
    if (index !== -1) {
      mockData.splice(index, 1);
      return Promise.resolve();
    }
    throw new Error('Area not found');
  }

  try {
    await axios.delete(API_CONFIG.endpoints.areas.delete + areaId);
  } catch (error) {
    console.error('Delete area error:', error);
    throw error;
  }
}

export const runAreaById = async (areaId: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log(`Running area with id ${areaId}`);
    return Promise.resolve();
  }

  try {
    await axios.post(API_CONFIG.endpoints.areas.run + `${areaId}/run`);
  } catch (error) {
    console.error('Run area error:', error);
    throw error;
  }
}
