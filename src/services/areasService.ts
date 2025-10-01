import axios from 'axios';
import { Area, Service, Action } from '../types';
import { data as mockData, services as mockServices, actions as MockActions, labelsTextReaction1, whiteboardCards} from '../mocks/areas';

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

export const getServiceById = async (id: number): Promise<Service | undefined> => {
  if (USE_MOCK_DATA) {
    const service = mockServices.find(service => service.id === id);
    return Promise.resolve(service);
  }
  const response = await axios.get(`/api/services/${id}`);
  return response.data;
}

export const getActionsByServiceId = async (serviceId: number): Promise<Action[]> => {
  if (USE_MOCK_DATA) {
    const actions = MockActions.filter(action => action.serviceId === serviceId);
    return Promise.resolve(actions);
  }
  const response = await axios.get(`/api/services/${serviceId}/actions`);
  return response.data;
};

export const getActionFieldsByServiceAndActionId = async (serviceId: number, actionId: number): Promise<any[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(labelsTextReaction1);
  const response = await axios.get(`/api/services/${serviceId}/actions/${actionId}/fields`);
  return response.data;
}

export const createAction = async (action: Partial<Action>): Promise<Action> => {
  if (USE_MOCK_DATA) {
    const newAction = { id: Date.now(), ...action } as Action;
    MockActions.push(newAction);
    return Promise.resolve(newAction);
  }
  const response = await axios.post('/api/actions', action);
  return response.data;
}

export const createArea = async (area: Partial<Area>): Promise<Area> => {
  if (USE_MOCK_DATA) {
    const newArea = { id: Date.now(), ...area } as Area;
    mockData.push(newArea);
    return Promise.resolve(newArea);
  }
  const response = await axios.post('/api/areas', area);
  return response.data;
}

export const getCardByAreaId = async (areaId: number): Promise<any[]> => {
  if (!areaId)
    return Promise.resolve([]);
  if (USE_MOCK_DATA)
    return Promise.resolve(whiteboardCards.filter(card => card.areaId === areaId));
  const response = await axios.get(`/api/areas/${areaId}/cards`);
  return response.data;
}
