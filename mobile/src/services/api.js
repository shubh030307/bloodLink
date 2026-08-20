import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo, localhost typically maps to your machine's IP, but for Android emulator it's 10.0.2.2.
// We are dynamically setting this to your machine's local Wi-Fi IP so you can test on your phone.
const API_URL = 'http://10.160.24.244:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token');
      // In a more robust setup, we'd trigger a context update or emit an event
    }
    return Promise.reject(error);
  }
);

export default api;
