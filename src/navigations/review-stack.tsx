import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { REVIEW_ROUTES } from '../configs/enums/main-route.enum';
import ReviewMenuScreen from '../screens/review/ReviewMenuScreen';
import WordMatchGame from '../screens/review/WordMatchGame';
import WordScrambleGame from '../screens/review/WordScrambleGame';
import VocabularyQuizGame from '../screens/review/QuizScreen';

const Stack = createNativeStackNavigator();

export const ReviewStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name={REVIEW_ROUTES.REVIEW_MENU} component={ReviewMenuScreen} options={{ title: 'Ôn tập' }} />
      {/* <Stack.Screen name={REVIEW_ROUTES.REVIEW_SAVED} component={ReviewSavedScreen}  />
      <Stack.Screen name={REVIEW_ROUTES.REVIEW_TOEIC} component={ReviewToeicScreen} />
      <Stack.Screen name={REVIEW_ROUTES.REVIEW_IELTS} component={ReviewIeltsScreen} /> */}
      <Stack.Screen name={REVIEW_ROUTES.GAME_MATCH} component={WordMatchGame} options={{ title: 'Trò chơi ghép từ' }} />
      <Stack.Screen name={REVIEW_ROUTES.GAME_SCRAMBLE} component={WordScrambleGame} options={{ title: 'Trò chơi xáo trộn từ' }} />
      <Stack.Screen name={REVIEW_ROUTES.GAME_QUIZ} component={VocabularyQuizGame} options={{ title: 'Trò chơi quiz' }} />

    </Stack.Navigator>
  );
};