import React from 'react';
import { useEffect } from 'react';
import { firebaseAuth } from '../services/firebase';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../features/auth/auth.store'; // Import Store
import { APP_ROUTES } from '../configs/routes/main.route';
import { AuthNavigator } from './auth-navigator';
import { MainTab } from './main-tab';

const RootStack = createNativeStackNavigator();
const AppNavigator = () => {
  const { isLoggedIn, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Lắng nghe sự thay đổi của Firebase Auth (Cực kỳ quan trọng)
    const subscriber = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user); // Nếu có user, isLoggedIn sẽ thành true
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Nếu đã đăng nhập -> Hiển thị thẳng bộ MainTab (NewsFeed nằm trong này)
          <RootStack.Screen name={APP_ROUTES.MAIN_TAB} component={MainTab} />
        ) : (
          // Nếu chưa -> Chỉ cho thấy bộ Login/Register
          <RootStack.Screen name={APP_ROUTES.AUTH_STACK} component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;