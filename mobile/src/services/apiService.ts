import axios, {AxiosInstance} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG} from '../config/api';
import {isOnline, queueActionForSync} from './offlineService';

let apiClient: AxiosInstance;

/**
 * Initialize API client with auth token
 */
export const initializeApiClient = async (): Promise<AxiosInstance> => {
  const token = await AsyncStorage.getItem('@auth_token');

  apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...(token && {Authorization: `Bearer ${token}`}),
    },
  });

  // Request interceptor
  apiClient.interceptors.request.use(
    async config => {
      // Check if online
      const online = await isOnline();

      if (!online) {
        // Queue request for later sync (if it's a mutation)
        if (['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
          await queueActionForSync(
            'api_request',
            config.url || '',
            config.method || 'post',
            config.data,
          );

          throw new Error('Offline: Request queued for sync');
        }
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    },
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        try {
          const refreshToken = await AsyncStorage.getItem('@refresh_token');

          if (refreshToken) {
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}/api/auth/refresh`,
              {refreshToken},
            );

            const {accessToken} = response.data.data;
            await AsyncStorage.setItem('@auth_token', accessToken);

            // Retry original request
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return axios(error.config);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          await AsyncStorage.multiRemove(['@auth_token', '@refresh_token', '@user']);
          // Navigate to login screen
        }
      }

      return Promise.reject(error);
    },
  );

  return apiClient;
};

export {apiClient};
