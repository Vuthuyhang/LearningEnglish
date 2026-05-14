import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../common/constants/Colors';
import { useAuthStore } from '../../features/auth/auth.store';
import { AUTH_ROUTES } from '../../configs/enums/main-route.enum';
import { Alert } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { AuthService } from '../../features/auth/auth.service';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({navigation} : any) => {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const {setUser, isLoading, setLoading} = useAuthStore();
   
    const handleForgotPassword = async() =>{
        if(!email) return Alert.alert("Email không tồn tại");

        setLoading(true);
        try{
            await AuthService.forgotpassword(email);
            setIsSent(true);
            Alert.alert("Gửi thành công", "Đã gửi mã xác thực qua email")
        } catch(errorCode){
            let msg="Có lỗi xảy ra!"
            if(errorCode === 'auth/user-not-found'){
                msg = 'Email chưa đăng ký';
            }
            if(errorCode ==='auth/invalid-email'){
                msg='Email không hợp lệ';
            }
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };
   if(isSent){
    return(
        <View style={styles.container}>
                <Text style={styles.title}>Kiểm tra Email</Text>
                <Text style={styles.subTitle}>
                    Link đặt lại mật khẩu đã được gửi đến: {"\n"} 
                    <Text style={{ fontWeight: 'bold' }}>{email}</Text>
                </Text>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Quay lại Đăng nhập</Text>
                </TouchableOpacity>
            </View>
    );
   }
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Quên mật khẩu</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Nhập email của bạn"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TouchableOpacity 
                    style={[styles.button, isLoading && { opacity: 0.7 }]} 
                    onPress={handleForgotPassword} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Gửi</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={styles.linkText}>Quay lại Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    card: { 
        width: width * 0.85, 
        padding: 25, 
        backgroundColor: Colors.white, 
        borderRadius: 20, 
        elevation: 5, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 5 
    },
    title: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: Colors.text, 
        textAlign: 'center', 
        marginBottom: 10 
    },
    description: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 25,
        lineHeight: 20
    },
    subTitle: { 
        textAlign: 'center', 
        marginBottom: 30, 
        color: '#444', 
        fontSize: 16,
        lineHeight: 24
    },
    input: { 
        backgroundColor: '#F5F5F5', 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 20, 
        color: Colors.text,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    button: { 
        backgroundColor: Colors.primary, 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center' 
    },
    buttonText: { 
        color: Colors.white, 
        fontWeight: '600', 
        fontSize: 16 
    },
    linkText: { 
        textAlign: 'center', 
        color: Colors.secondary, 
        fontWeight: '500' 
    }
});

export default ForgotPasswordScreen;
