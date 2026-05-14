export enum APP_ROUTES {
  AUTH_STACK = 'AuthStack',
  MAIN_TAB = 'MainTab',
}

export enum AUTH_ROUTES {
  LOGIN = 'Login',
  REGISTER = 'Register',
  FORGOTPASSWORD ='ForgotPassword',
}

export enum NEWS_ROUTES {
  NEWS_FEED = 'News',
  READING = 'Reading',
}

export enum MAIN_TAB_ROUTES {
  HOME = 'Home',
  NEWS_STACK = 'NewsTab',
  VOCABULARY = 'Vocabulary',
  ACCOUNT = 'Account',
  REVIEW = 'Review',
}

export enum ACCOUNT_ROUTES {
  ACCOUNT_MENU = 'AccountMenu',
  PROFILE = 'Profile',
  EDIT_PROFILE = 'EditProfile',
  NOTIFICATIONS = 'Notifications',
  LANGUAGE = 'Language',
}

export enum VOCAB_ROUTES {
  VOCAB_MENU = 'VocabMenu',
  SAVED_LIST = 'SavedList',
  TOEIC_LIST = 'ToeicList',
  IELTS_LIST = 'IeltsList',
}

export enum REVIEW_ROUTES {
  REVIEW_MENU = 'ReviewMenu',
  // REVIEW_SAVED = 'ReviewSaved',
  // REVIEW_TOEIC = 'ReviewToeic',
  // REVIEW_IELTS = 'ReviewIelts',
  // REVIEW_FLASHCARD = 'ReviewFlashcard',
  // REVIEW_QUIZ = 'ReviewQuiz',
  GAME_MATCH = 'WordMatchGame',
  GAME_SCRAMBLE = 'WordScrambleGame',
  GAME_QUIZ = 'QuizRushGame',
}