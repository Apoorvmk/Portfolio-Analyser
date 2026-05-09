import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getFunds = async () => {
  const response = await api.get('/funds');
  return response.data;
};

export const getStocks = async () => {
  const response = await api.get('/stocks');
  return response.data;
};

export const analyzePortfolio = async (data) => {
  const response = await api.post('/analyze', data);
  return response.data;
};

export const getReportNarrative = async (report) => {
  const response = await api.post('/report', report);
  return response.data;
};

export const chatWithReport = async (data) => {
  const response = await api.post('/chat', data);
  return response.data;
};

export default api;
