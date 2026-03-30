import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Dimensions, ScrollView, KeyboardAvoidingView, Platform, 
  Alert, ActivityIndicator 
} from 'react-native';
import { Colors } from '../../common/constants/Colors';
import { useAuthStore } from '../../features/auth/auth.store';
import { AuthService } from '../../features/auth/auth.service';
import { AUTH_ROUTES } from '../../configs/routes/main.route';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Lấy các hàm từ Zustand store
  const { setUser, isLoading, setLoading } = useAuthStore();

  const handleRegister = async () => {
    //kiểm tra mk nhập vào
    if (!fullName || !email || !password || !confirmPassword) {
      return Alert.alert("Vui lòng điền đầy đủ thông tin");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Mật khẩu không khớp.");
    }
    if (password.length < 6) {
      return Alert.alert("Mật khẩu yếu");
    }
//api đăng ký
    setLoading(true);
    try {
      await AuthService.register(fullName, email, password);
      setLoading(false);
      Alert.alert("Đăng ký thành công", "", [{text: "Đăng nhập", onPress: () => navigation.navigate(AUTH_ROUTES.LOGIN)}]);
    
    } catch (errorCode: any) {
      setLoading(false);
      let msg = "Đã có lỗi xảy ra, vui lòng thử lại";
      if (errorCode === 'auth/email-already-in-use') msg = "Email đã tồn tại";
      if (errorCode === 'auth/invalid-email') msg = "Định dạng email không đúng.";
      Alert.alert("Đăng ký thất bại", msg);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Join Us</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            placeholderTextColor="#A0A0A0"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            placeholderTextColor="#A0A0A0"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, isLoading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <Text style={styles.buttonText}>Đăng Ký Tài Khoản</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate(AUTH_ROUTES.LOGIN)}
            style={styles.link}
          >
            <Text style={styles.linkText}>Đã có tài khoản? <Text style={{fontWeight: 'bold'}}>Đăng nhập</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { 
    width: width * 0.85, padding: 30, backgroundColor: Colors.white, 
    borderRadius: 25, elevation: 10, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 10 
  },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: 30 },
  input: { 
    backgroundColor: '#FFF0F3', padding: 15, borderRadius: 15, 
    marginBottom: 15, color: Colors.text, fontSize: 16
  },
  button: { 
    backgroundColor: Colors.primary, padding: 18, borderRadius: 15, 
    alignItems: 'center', marginTop: 10, shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5
  },
  buttonText: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 25, alignItems: 'center' },
  linkText: { color: Colors.secondary, fontSize: 14 }
});

export default RegisterScreen;