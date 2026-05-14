import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MAIN_TAB_ROUTES } from '../configs/enums/main-route.enum';
import { NewsStack } from './news-stack';
import { VocabStack } from './vocabulary-stack';
import { ReviewStack } from './review-stack';
import AccountScreen from '../screens/account/AccountScreen';
import HomeScreen from '../screens/HomePageScreen'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../common/constants/Colors';
import { AccountStack } from './account-navigation';


const Tab = createBottomTabNavigator();

// Component nút Trang chủ nhô lên
const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={styles.customButtonContainer}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <View style={styles.customButton}>
      {children}
    </View>
  </TouchableOpacity>
);

export const MainTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF', // Chữ trắng khi chọn giống hình
        tabBarInactiveTintColor: '#FDE2E4', // Trắng hồng nhạt khi không chọn
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';
          if (route.name === MAIN_TAB_ROUTES.NEWS_STACK) {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === MAIN_TAB_ROUTES.VOCABULARY) {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === MAIN_TAB_ROUTES.ACCOUNT) {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === MAIN_TAB_ROUTES.REVIEW) {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === MAIN_TAB_ROUTES.HOME) {
            iconName = 'home';
            size = 30; // Icon Home to hơn
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name={MAIN_TAB_ROUTES.NEWS_STACK} 
        component={NewsStack} 
        options={{ title: 'Đọc báo' }} 
      />
      <Tab.Screen 
        name={MAIN_TAB_ROUTES.VOCABULARY} 
        component={VocabStack} 
        options={{ title: 'Từ vựng' }} 
      />
      
      {/* Tab TRANG CHỦ nằm chính giữa và nhô lên */}
      <Tab.Screen 
        name={MAIN_TAB_ROUTES.HOME} 
        component={HomeScreen} 
        options={{ 
          // title: 'Trang chủ',
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }} 
      />
      <Tab.Screen 
        name={MAIN_TAB_ROUTES.REVIEW} 
        component={ReviewStack} 
        options={{ title: 'Trò chơi' }} 
      />
      <Tab.Screen 
        name={MAIN_TAB_ROUTES.ACCOUNT} 
        component={AccountStack} 
        options={{ title: 'Cá nhân' }} 
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', 
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: Colors.secondary || '#FFB7C5', 
    borderRadius: 25,
    height: 70,
    borderTopWidth: 0,
    // Đổ bóng cho thanh Tab
    shadowColor: '#FFB7C5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  customButtonContainer: {
    top: -30, // Đẩy nút lên trên cao hơn thanh tab
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFB7C5', // Cùng màu với thanh Tab hoặc màu nhấn
    borderWidth: 5,
    borderColor: '#FFF5F7', // Màu viền trắng hồng (giống màu nền app) để tạo hiệu ứng tách biệt
    justifyContent: 'center',
    alignItems: 'center',
    // Đổ bóng cho nút tròn
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});