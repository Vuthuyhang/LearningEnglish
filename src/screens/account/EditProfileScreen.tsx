import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Image, SafeAreaView, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../common/constants/Colors';
import { useAuthStore } from '../../features/auth/auth.store';
import { AuthService } from '../../features/auth/auth.service';
import Toast from 'react-native-toast-message';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [loading, setLoading] = useState(false);

  // Hàm mở thư viện ảnh
  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
      if (response.didCancel) return;
      if (response.assets && response.assets[0].uri) {
        setAvatar(response.assets[0].uri);
      }
    });
  };

  const handleSave = async () => {
    if (!fullName.trim()) return Alert.alert("Lỗi 🌸", "Họ tên không được để trống.");

    setLoading(true);
    try {
      await AuthService.updateProfile(user!.uid, fullName, avatar || undefined);
      
      // Cập nhật lại Store để màn hình Profile tự đổi theo
      setUser({ ...user, displayName: fullName, photoURL: avatar });

      Toast.show({
        type: 'success',
        text1: 'Thành công ✨',
        text2: 'Thông tin của bạn đã được cập nhật'
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu thông tin lúc này.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: avatar || 'https://i.pravatar.cc/150' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.cameraIcon} onPress={handleSelectImage}>
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeText}>Chạm để đổi ảnh 🌸</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>HỌ VÀ TÊN</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.secondary} />
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập tên mới của bạn"
              placeholderTextColor="#AAA"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <LinearGradient
            colors={['#FFDEE9', '#FFB7C5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBtn}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveBtnText}>LƯU THAY ĐỔI</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A4A4A' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 25, alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  imageWrapper: { position: 'relative' },
  avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 5, borderColor: 'white' },
  cameraIcon: { 
    position: 'absolute', bottom: 5, right: 5, 
    backgroundColor: '#FFB7C5', padding: 10, 
    borderRadius: 20, borderWidth: 3, borderColor: 'white' 
  },
  changeText: { marginTop: 12, color: '#FFB7C5', fontWeight: '600', fontSize: 13 },
  inputCard: { backgroundColor: 'white', width: '100%', borderRadius: 25, padding: 20, elevation: 4, shadowColor: '#FFB7C5', shadowOpacity: 0.1, shadowRadius: 10 },
  label: { fontSize: 11, fontWeight: '800', color: '#CCC', marginBottom: 10, letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#FFF5F7', paddingBottom: 5 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#4A4A4A', paddingVertical: 10 },
  saveBtn: { width: '100%', marginTop: 40, borderRadius: 20, overflow: 'hidden', elevation: 5, shadowColor: '#FFB7C5', shadowOpacity: 0.3 },
  gradientBtn: { padding: 18, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 }
});

export default EditProfileScreen;