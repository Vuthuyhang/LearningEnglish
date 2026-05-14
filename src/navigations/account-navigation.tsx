import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ACCOUNT_ROUTES} from '../configs/enums/main-route.enum';
import AccountScreen from '../screens/account/AccountScreen';
import ProfileScreen from '../screens/account/ProfileScreen';
import EditProfileScreen from '../screens/account/EditProfileScreen';
const Stack = createNativeStackNavigator();

export const AccountStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name={ACCOUNT_ROUTES.ACCOUNT_MENU} component={AccountScreen}/>
      <Stack.Screen name={ACCOUNT_ROUTES.PROFILE} component={ProfileScreen}  />
      <Stack.Screen name={ACCOUNT_ROUTES.EDIT_PROFILE} component={EditProfileScreen} />

      {/* <Stack.Screen name={ACCOUNT_ROUTES.Account_SAVED} component={AccountSavedScreen}  />
      <Stack.Screen name={ACCOUNT_ROUTES.Account_TOEIC} component={AccountToeicScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.Account_IELTS} component={AccountIeltsScreen} /> */}
      {/* <Stack.Screen name={ACCOUNT_ROUTES.GAME_MATCH} component={WordMatchGame} /> */}

    </Stack.Navigator>
  );
};