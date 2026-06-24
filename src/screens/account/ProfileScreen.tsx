import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  SafeAreaView, ScrollView, ActivityIndicator 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { DateUtil } from '../../utils/date.util';
import { Colors } from '../../common/constants/Colors';
import { useAuthStore } from '../../features/auth/auth.store';
import { ACCOUNT_ROUTES } from '../../configs/enums/main-route.enum';
import LinearGradient from 'react-native-linear-gradient'; 

const ProfileScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [extraInfo, setExtraInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const doc = await firestore().collection('users').doc(user.uid).get();
          if (doc.exists()) {
            setExtraInfo(doc.data());
          }
        } catch (error) {
          console.log("Lỗi lấy thông tin:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const InfoRow = ({ label, value }: any) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header cố định ở trên
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <View style={{ width: 28 }} />
      </View> */}

      {/* DÙNG SCROLLVIEW ĐỂ CÓ THỂ CUỘN XUỐNG THẤY NÚT */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarWrapper}>
          <Image 
            source={{ uri: user?.photoURL || 'https://i.pravatar.cc/150' }} 
            style={styles.avatar} 
          />
        </View>

        <View style={styles.card}>
          <InfoRow label="Họ và tên" value={extraInfo?.fullName || user?.displayName} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Cấp độ học" value="Intermediate" />
          <InfoRow 
            label="NGÀY THAM GIA" 
            value={DateUtil.formatDate(extraInfo?.createdAt)} 
          />
        </View>

        {/* Nút bấm nằm ở cuối danh sách cuộn */}
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => navigation.navigate(ACCOUNT_ROUTES.EDIT_PROFILE)}
        >
          <LinearGradient 
            colors={['#FFDEE9', '#FFB7C5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBtn}
          >
            <Text style={styles.editBtnText}>Chỉnh sửa thông tin</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Khoảng đệm để nút không bị Tab Bar đè lên */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A' },
  scrollContent: { paddingHorizontal: 25, alignItems: 'center' }, // Chuyển từ content sang đây
  avatarWrapper: { marginVertical: 30, elevation: 10, shadowColor: '#FFB7C5', shadowOpacity: 0.3, shadowRadius: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 5, borderColor: 'white' },
  card: { backgroundColor: 'white', width: '100%', borderRadius: 25, padding: 20, marginBottom: 30 },
  infoRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#FFF5F7' },
  infoLabel: { fontSize: 12, color: '#BBB', fontWeight: '800', marginBottom: 5, textTransform: 'uppercase' },
  infoValue: { fontSize: 16, color: '#4A4A4A', fontWeight: '500' },
  editBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', elevation: 5, shadowColor: '#FFB7C5', shadowOpacity: 0.3, shadowRadius: 5 },
  gradientBtn: { padding: 18, alignItems: 'center' },
  editBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;