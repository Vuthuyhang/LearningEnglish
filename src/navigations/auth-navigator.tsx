import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AUTH_ROUTES } from '../configs/enums/main-route.enum';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name={AUTH_ROUTES.LOGIN} component={LoginScreen} options = {{ title: 'Đăng nhập' }}/>
      <Stack.Screen name={AUTH_ROUTES.REGISTER} component={RegisterScreen} options = {{ title: 'Đăng ký' }}/>
      <Stack.Screen name={AUTH_ROUTES.FORGOTPASSWORD} component={ForgotPasswordScreen} options = {{ title: 'Quên mật khẩu' }}/>

    </Stack.Navigator>
  );
};