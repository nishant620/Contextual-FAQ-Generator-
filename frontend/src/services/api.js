import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('API Base URL:', API_BASE_URL); 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url); // Debug log
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    }); 
    
    let message = 'An error occurred';
    
    if (error.response) {
      message = error.response.data?.error || 
                error.response.data?.message || 
                `Server error: ${error.response.status}`;
    } else if (error.request) {
      
      message = 'No response from server. Please check if the backend is running.';
    } else {
      
      message = error.message || 'Request failed';
    }
    
    return Promise.reject(new Error(message));
  }
);

// API methods
export const crawlWebsite = async (url) => {
  const response = await api.post('/crawl', { url });
  return response.data;
};

export const generateFAQs = async (url, count = 7) => {
  const response = await api.post('/faqs/generate-faqs', { url, count });
  return response.data;
};

export const getFAQs = async (status = null) => {
  const url = status ? `/faqs?status=${status}` : '/faqs';
  const response = await api.get(url);
  return response.data;
};

export const updateFAQ = async (id, data) => {
  const response = await api.put(`/faqs/${id}`, data);
  return response.data;
};

export const publishFAQ = async (id) => {
  const response = await api.post(`/faqs/${id}/publish`);
  return response.data;
};

export const exportFAQs = async (format = 'json') => {
  const response = await api.get(`/faqs/export?format=${format}`, {
    responseType: format === 'csv' ? 'blob' : 'json',
  });
  return response.data;
};

export default api;


