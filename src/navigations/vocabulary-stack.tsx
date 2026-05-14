import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {VOCAB_ROUTES } from '../configs/enums/main-route.enum';
import SavedWordScreen from '../screens/vocabulary/SavedWordScreen';
import VocabMenuScreen from '../screens/vocabulary/VocabMenuScreen';
import ToeicVocabScreen from '../screens/vocabulary/ToeicWordScreen';
import IeltsVocabScreen from '../screens/vocabulary/IeltsWordScreen';


const Stack = createNativeStackNavigator();

export const VocabStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name={VOCAB_ROUTES.VOCAB_MENU} component={VocabMenuScreen}/>
      <Stack.Screen name={VOCAB_ROUTES.SAVED_LIST} component={SavedWordScreen}  />
      <Stack.Screen name={VOCAB_ROUTES.TOEIC_LIST} component={ToeicVocabScreen} />
      <Stack.Screen name={VOCAB_ROUTES.IELTS_LIST} component={IeltsVocabScreen} />
    </Stack.Navigator>
  );
};