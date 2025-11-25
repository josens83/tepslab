import messaging from '@react-native-firebase/messaging';
import {Platform, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiClient} from './apiService';

const DEVICE_TOKEN_KEY = '@device_token';

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get FCM device token
 */
export const getDeviceToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    if (token) {
      console.log('✅ FCM Token:', token);
      await AsyncStorage.setItem(DEVICE_TOKEN_KEY, token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Register device token with backend
 */
export const registerDeviceToken = async (
  userId: string,
  token: string,
): Promise<void> => {
  try {
    await apiClient.post('/api/notifications/register', {
      userId,
      token,
      platform: Platform.OS,
      deviceInfo: {
        os: Platform.OS,
        osVersion: Platform.Version,
      },
    });
    console.log('✅ Device token registered with backend');
  } catch (error) {
    console.error('Error registering device token:', error);
  }
};

/**
 * Handle foreground notifications
 */
export const setupForegroundHandler = () => {
  messaging().onMessage(async remoteMessage => {
    console.log('📱 Foreground notification received:', remoteMessage);

    if (remoteMessage.notification) {
      Alert.alert(
        remoteMessage.notification.title || 'TEPS Lab',
        remoteMessage.notification.body || '',
        [
          {
            text: '확인',
            style: 'default',
          },
        ],
      );
    }
  });
};

/**
 * Handle background/quit state notifications
 */
export const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📱 Background notification received:', remoteMessage);
    // Handle background notification
    // You can update local database, show local notification, etc.
  });
};

/**
 * Handle notification tap (when app is in background or quit)
 */
export const setupNotificationOpenHandler = (
  onNotificationOpen: (notification: any) => void,
) => {
  // Handle notification that opened the app from quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('📱 Notification opened app from quit state:', remoteMessage);
        onNotificationOpen(remoteMessage);
      }
    });

  // Handle notification that opened the app from background state
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('📱 Notification opened app from background:', remoteMessage);
    onNotificationOpen(remoteMessage);
  });
};

/**
 * Setup all notification handlers
 */
export const setupNotifications = async () => {
  try {
    // Request permission
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.warn('⚠️  Notification permission not granted');
      return;
    }

    // Get and save device token
    const token = await getDeviceToken();

    if (!token) {
      console.warn('⚠️  Failed to get FCM token');
      return;
    }

    // Setup handlers
    setupForegroundHandler();
    setupBackgroundHandler();

    // Listen for token refresh
    messaging().onTokenRefresh(async newToken => {
      console.log('🔄 FCM Token refreshed:', newToken);
      await AsyncStorage.setItem(DEVICE_TOKEN_KEY, newToken);
      // Register new token with backend
      // This should be called after user logs in
    });

    console.log('✅ Notifications setup complete');
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
};

/**
 * Send local notification (for offline mode)
 */
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any,
) => {
  // This would use a local notification library like @notifee/react-native
  console.log('📢 Local notification:', {title, body, data});
};

/**
 * Schedule local notification
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  date: Date,
  data?: any,
) => {
  console.log('⏰ Scheduled notification:', {title, body, date, data});
  // Implementation would use notification scheduling library
};

/**
 * Cancel scheduled notification
 */
export const cancelScheduledNotification = async (notificationId: string) => {
  console.log('❌ Cancelled notification:', notificationId);
  // Implementation would cancel scheduled notification
};

/**
 * Get stored device token
 */
export const getStoredDeviceToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored device token:', error);
    return null;
  }
};
