import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../common/constants/Colors';
import { useAuthStore } from '../../features/auth/auth.store';
import { AUTH_ROUTES } from '../../configs/enums/main-route.enum';
import { Alert } from 'react-native';
import { ActivityIndicator } from 'react-native';
const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin");
    
    try {
      await login(email, password);
    
    } catch (errorCode) {
      let msg = "Đã có lỗi xảy ra";
      if (errorCode === 'auth/user-not-found') msg = "Tài khoản không tồn tại";
      if (errorCode === 'auth/wrong-password') msg = "Sai mật khẩu";
      Alert.alert("Thất bại", msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <TextInput
          style={styles.input}
          placeholder="Email của bạn"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin} 
            disabled={isLoading}> 
            {isLoading ? <ActivityIndicator color="#4A4A4A" /> : <Text style={styles.buttonText}>Đăng Nhập</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate(AUTH_ROUTES.REGISTER)}>
          <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate(AUTH_ROUTES.FORGOTPASSWORD)}>
          <Text style={styles.linkText}>Quên mật khẩu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  card: { width: width * 0.85, padding: 25, backgroundColor: Colors.white, borderRadius: 20, elevation: 5, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: Colors.background, padding: 15, borderRadius: 12, marginBottom: 15, color: Colors.text },
  button: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: Colors.text, fontWeight: '600', fontSize: 16 },
  linkText: { marginTop: 20, textAlign: 'center', color: Colors.secondary, fontWeight: '500' }
});

export default LoginScreen;