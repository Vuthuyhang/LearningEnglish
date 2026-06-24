import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NEWS_ROUTES } from '../configs/enums/main-route.enum';
import NewsFeedScreen from '../screens/news/NewsFeedScreen';
import ReadingScreen from '../screens/news/ReadingScreen';

const Stack = createNativeStackNavigator();

export const NewsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name={NEWS_ROUTES.NEWS_FEED} component={NewsFeedScreen} options={{ title: 'Tin tức' }} />
      <Stack.Screen name={NEWS_ROUTES.READING} component={ReadingScreen} options={{ title: 'Đọc báo' }} />
    </Stack.Navigator>
  );
};