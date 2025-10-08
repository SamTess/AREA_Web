import axios from '../config/axios';
import { API_CONFIG, USE_MOCK_DATA } from '../config/api';
import {
  data,
  lineData,
  pieData,
  barData,
  revenueData,
  profitData,
  users,
  areas,
  services,
  areasPieData,
  servicesBarData,
  logs,
  areaRuns,
  areaStats,
  cardUserData
} from '../mocks/adminData';

export const getDashboardData = async () => {
  if (USE_MOCK_DATA)
    return data;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.dashboard);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.dashboard} error:`, error);
    throw error;
  }
};

export const getLineData = async () => {
  if (USE_MOCK_DATA)
    return lineData;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.lineData);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.lineData} error:`, error);
    throw error;
  }
};

export const getPieData = async () => {
  if (USE_MOCK_DATA)
    return pieData;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.pieData);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.pieData} error:`, error);
    throw error;
  }
};

export const getBarData = async () => {
  if (USE_MOCK_DATA)
    return barData;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.barData);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.barData} error:`, error);
    throw error;
  }
};

export const getRevenueData = async () => {
  if (USE_MOCK_DATA)
    return revenueData;


  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.revenueData);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.revenueData} error:`, error);
    throw error;
  }
};

export const getProfitData = async () => {
  if (USE_MOCK_DATA)
    return profitData;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.profitData);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.profitData} error:`, error);
    throw error;
  }
};

export const getUsers = async () => {
  if (USE_MOCK_DATA)
    return users;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.users);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.users} error:`, error);
    throw error;
  }
};

export const getAreas = async () => {
  if (USE_MOCK_DATA)
    return areas;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.areas);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.areas} error:`, error);
    throw error;
  }
};

export const getServices = async () => {
  if (USE_MOCK_DATA)
    return services;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.services);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.services} error:`, error);
    throw error;
  }
};

export const getAreasPieData = async () => {
  if (USE_MOCK_DATA)
    return areasPieData;


  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.areasPieData);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.areasPieData} error:`, error);
    throw error;
  }
};

export const getServicesBarData = async () => {
  if (USE_MOCK_DATA)
    return servicesBarData;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.servicesBarData);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.servicesBarData} error:`, error);
    throw error;
  }
};

export const getLogs = async () => {
  if (USE_MOCK_DATA)
    return logs;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.logs);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.logs} error:`, error);
    throw error;
  }
};

export const getAreaRuns = async () => {
  if (USE_MOCK_DATA)
    return areaRuns;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.areaRuns);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.areaRuns} error:`, error);
    throw error;
  }
};

export const getAreaStats = async () => {
  if (USE_MOCK_DATA)
    return areaStats;

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.areaStats);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.areaStats} error:`, error);
    throw error;
  }
};


export const getCardUserData = async () => {
  if (USE_MOCK_DATA) {
    return cardUserData;
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.admin.cardUserData);
    return response.data;
  } catch (error) {
    console.error(`Get ${API_CONFIG.endpoints.admin.cardUserData} error:`, error);
    throw error;
  }
};