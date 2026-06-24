import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {VOCAB_ROUTES } from '../configs/enums/main-route.enum';
import SavedWordScreen from '../screens/vocabulary/SavedWordScreen';
import VocabMenuScreen from '../screens/vocabulary/VocabMenuScreen';
import ToeicVocabScreen from '../screens/vocabulary/ToeicWordScreen';
import IeltsVocabScreen from '../screens/vocabulary/IeltsWordScreen';
import WordDetailScreen from '../screens/vocabulary/WordLookupScreen';

const Stack = createNativeStackNavigator();

export const VocabStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name={VOCAB_ROUTES.VOCAB_MENU} component={VocabMenuScreen}  options={{ title: 'Từ vựng' }}/>
      <Stack.Screen name={VOCAB_ROUTES.SAVED_LIST} component={SavedWordScreen}  options={{ title: 'Từ vựng đã lưu' }} />
      <Stack.Screen name={VOCAB_ROUTES.TOEIC_LIST} component={ToeicVocabScreen}  options={{ title: 'Từ vựng TOEIC' }}/>
      <Stack.Screen name={VOCAB_ROUTES.IELTS_LIST} component={IeltsVocabScreen} options={{ title: 'Từ vựng IELTS' }} />
      <Stack.Screen name={VOCAB_ROUTES.WORD_DETAIL} component={WordDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};