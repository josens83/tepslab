import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import RootNavigator from './navigation/RootNavigator';
import {theme} from './config/theme';
import {initializeApp} from './services/initService';
import {setupNotifications} from './services/notificationService';
import {useAuthStore} from './store/authStore';

const App = () => {
  const {checkAuth} = useAuthStore();

  useEffect(() => {
    // Initialize app
    const init = async () => {
      await initializeApp();
      await checkAuth();
      await setupNotifications();
    };

    init();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar
              barStyle="light-content"
              backgroundColor={theme.colors.primary}
            />
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
