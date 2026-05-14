import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { useAuthStore } from '../../features/auth/auth.store';
import { ACCOUNT_ROUTES, AUTH_ROUTES } from '../../configs/enums/main-route.enum';

const AccountScreen = ({ navigation }: any) => {
    const { isLoggedIn, user, logout } = useAuthStore();
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);

    const SettingItem = ({icon, title, value, onPress, isSwitch}: any) =>(
        <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={isSwitch}>
            <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                    <Ionicons name={icon} size={22} color={Colors.secondary} />
                </View>
                <Text style={styles.menuTitle}>{title}</Text>
            </View>
            {isSwitch ? (
                <Switch 
                    value={value}
                    onValueChange={setIsSoundEnabled}
                    trackColor={{false: '#E0E0E0', true: Colors.primary}}
                    thumbColor={value ? Colors.secondary : '#f4f3f4'}
                />
            ) : (
                <View  style={styles.menuRight}>
                    <Text style={styles.menuValue}>{value}</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.secondary} />
                </View>
            )
            }
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} >
            <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity 
                style={styles.headerCard}
                onPress={() => isLoggedIn ? navigation.navigate(ACCOUNT_ROUTES.PROFILE) : navigation.navigate(AUTH_ROUTES.LOGIN)}
                >
                    {isLoggedIn ? (
                        <View style={styles.headerContent}>
                            <Image source={{ uri: user?.photoURL || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                            <View style={styles.headerText}>
                                <Text style={styles.userName}>{user?.displayName || 'Guest'}</Text>
                                <Text style={styles.viewInfo}>Xem thông tin cá nhân</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={Colors.primary}/>
                        </View>
                    ) : (
                        <View style={styles.headerContent}>
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={40} color="#FFDEE9" />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.userName}>Guest User</Text>
                                <Text style={styles.viewInfo}>Đăng nhập để xem thông tin cá nhân</Text>
                            </View>
                            <Ionicons name="log-in-outline" size={28} color={Colors.primary} />
                        </View>
                    )}
                </TouchableOpacity>
                <View style={styles.section}>
                    {/* <Text style={styles.sectionLabel}>CỘNG ĐỒNG</Text> */}
                    <SettingItem icon="people-outline" title="Bạn bè" />
                    <SettingItem icon="library-outline" title="Tiến độ học tập" />
                    {/* <SettingItem icon="notifications-outline" title="Thông báo" value="Đang bật" />
                </View>

                <View style={styles.section}> 
                   <Text style={styles.sectionLabel}>ỨNG DỤNG</Text> 
                    <SettingItem icon="language-outline" title="Ngôn ngữ" value="Tiếng Việt" />
                    <SettingItem icon="volume-high-outline" title="Âm thanh" isSwitch value={isSoundEnabled} />  */}
                    <SettingItem icon="settings-outline" title="Cài đặt" />
                    <SettingItem icon="information-circle-outline" title="Giới thiệu" />
                    <SettingItem icon="call-outline" title="Liên hệ" />
                </View>

                {isLoggedIn && (
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                )}
                <View style={{ height: 100 }} />

            </ScrollView>

        </SafeAreaView>
    )
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  headerCard: { 
    backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 25,
    elevation: 5, shadowColor: '#FFB7C5', shadowOpacity: 0.2, shadowRadius: 10
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 65, height: 65, borderRadius: 32.5, borderWidth: 3, borderColor: '#FFF0F3' },
  avatarPlaceholder: { backgroundColor: '#FFF5F7', justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#4A4A4A' },
  viewInfo: { fontSize: 13, color: Colors.secondary || '#FFB7C5', marginTop: 4 },
  
  section: { marginTop: 10, paddingHorizontal: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#DDD', marginLeft: 15, marginBottom: 10 },
  menuItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 38, height: 38, backgroundColor: '#FFF5F7', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuTitle: { fontSize: 15, color: '#4A4A4A', fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  menuValue: { color: '#AAA', marginRight: 8, fontSize: 13 },
  logoutBtn: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 15 }
});
export default AccountScreen;
