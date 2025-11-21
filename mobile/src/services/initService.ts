import {initOfflineDB} from './offlineService';
import {initializeApiClient} from './apiService';

/**
 * Initialize app services
 */
export const initializeApp = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing TEPS Lab App...');

    // Initialize API client
    await initializeApiClient();
    console.log('✅ API client initialized');

    // Initialize offline database
    await initOfflineDB();
    console.log('✅ Offline database initialized');

    console.log('✅ App initialization complete');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    throw error;
  }
};
