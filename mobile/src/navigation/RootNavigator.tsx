import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuthStore} from '../store/authStore';

// Placeholder screens - implement actual screens
const HomeScreen = () => null;
const LoginScreen = () => null;
const CoursesScreen = () => null;

const Stack = createStackNavigator();

const RootNavigator = () => {
  const {isAuthenticated, isLoading} = useAuthStore();

  if (isLoading) {
    return null; // Or loading screen
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Courses" component={CoursesScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
