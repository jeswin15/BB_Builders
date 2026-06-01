import axios from 'axios';

const fallbackUrl = import.meta.env.PROD ? 'https://api.bassbuilders.in/api' : 'http://127.0.0.1:8000/api';
export const baseURL = import.meta.env.VITE_API_URL || fallbackUrl;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
