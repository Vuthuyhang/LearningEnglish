import React, { useState } from 'react';
import { 
  View, Text, Switch, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../common/constants/Colors';

interface SettingScreenProps {
  navigation: any;
}

interface SettingRowProps {
  label: string;
  icon: string; // Thêm icon cho đẹp
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  hasArrow?: boolean;
}

// Đưa SettingRow ra ngoài để code sạch hơn
const SettingRow = ({ label, icon, value, onValueChange, onPress, hasArrow }: SettingRowProps) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={onPress ? 0.7 : 1} 
    style={styles.rowContainer}
  >
    <View style={styles.rowLeft}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={Colors.secondary || '#FFB7C5'} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
    
    {value !== undefined && (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: Colors.primary || '#FFD1DC' }}
        thumbColor={value ? (Colors.secondary || '#FFB7C5') : '#f4f3f4'}
      />
    )}
    {hasArrow && <Ionicons name="chevron-forward" size={20} color="#CCC" />}
  </TouchableOpacity>
);

export const SettingScreen = ({ navigation }: SettingScreenProps) => {
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 40 }} />
      </View> */}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
       
        <View style={styles.card}>
          <SettingRow 
            icon="volume-high-outline" 
            label="Âm thanh" 
            value={isSoundOn} 
            onValueChange={setIsSoundOn} 
          />
          <SettingRow 
            icon="moon-outline" 
            label="Chế độ tối" 
            value={isDarkMode} 
            onValueChange={setIsDarkMode} 
          />
          <SettingRow 
            icon="notifications-outline" 
            label="Thông báo" 
            value={isNotificationsEnabled} 
            onValueChange={setIsNotificationsEnabled} 
          />
          <SettingRow 
            icon="language-outline" 
            label="Ngôn ngữ" 
            hasArrow 
            onPress={() => navigation.navigate('LanguageSettings')} 
          />
        </View>
          


        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF5F7' // Nền hồng pastel nhạt
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 15, 
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A4A4A' },
  scrollPadding: { padding: 20 },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#CCC', 
    marginLeft: 15, 
    marginBottom: 10, 
    marginTop: 10,
    letterSpacing: 1 
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  rowContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF5F7'
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { 
    width: 36, 
    height: 36, 
    backgroundColor: '#FFF5F7', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  label: { fontSize: 16, color: '#4A4A4A', fontWeight: '500' },
});

export default SettingScreen;