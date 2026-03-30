import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MAIN_TAB_ROUTES } from '../configs/routes/main.route';
import { NewsStack } from './news-stack';
import VocabularyScreen from '../screens/vocabulary/WordListScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export const MainTab = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name={MAIN_TAB_ROUTES.NEWS_STACK} component={NewsStack} options={{ title: 'Tin tức' }} />
      <Tab.Screen name={MAIN_TAB_ROUTES.VOCABULARY} component={VocabularyScreen} options={{ title: 'Từ vựng' }} />
      <Tab.Screen name={MAIN_TAB_ROUTES.SETTINGS} component={SettingsScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
};