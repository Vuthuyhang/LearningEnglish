import React from 'react';
import { useEffect } from 'react';
import { firebaseAuth } from '../services/firebase';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../features/auth/auth.store'; 
import { APP_ROUTES } from '../configs/enums/main-route.enum';
import { AuthNavigator } from './auth-navigator';
import { MainTab } from './main-tab';

const RootStack = createNativeStackNavigator();
const AppNavigator = () => {
  const { isLoggedIn, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const subscriber = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user); 
    });
    return subscriber; 
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <RootStack.Screen name={APP_ROUTES.MAIN_TAB} component={MainTab} />
        ) : (
          <RootStack.Screen name={APP_ROUTES.AUTH_STACK} component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;