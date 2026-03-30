
import { firebaseAuth, firebaseFirestore } from '../../services/firebase';

export const AuthService = {
  // Đăng ký tài khoản mới
  register: async (fullName: string, email: string, pass: string) => {
    try {
      // BƯỚC 1: Tạo tài khoản trong hệ thống Authentication
      const result = await firebaseAuth.createUserWithEmailAndPassword(email, pass);
      const uid = result.user.uid;

      // BƯỚC 2: Cập nhật Profile cơ bản (displayName)
      await result.user.updateProfile({ displayName: fullName });

      // BƯỚC 3: Lưu thông tin chi tiết vào Firestore
      // Chúng ta dùng UID làm ID của Document luôn để sau này dễ tìm
      await firebaseFirestore.collection('users').doc(uid).set({
        fullName: fullName,
        email: email,
        level: 'Beginner', // Mặc định khi mới đăng ký
        totalWordsLearned: 0,
        createdAt: new Date().getTime(),
      });

      return result.user;
    } catch (error: any) {
      throw error.code;
    }
  },

  // Đăng nhập
  login: async (email: string, pass: string) => {
    try {
      const result = await firebaseAuth.signInWithEmailAndPassword(email, pass);
      return result.user;
    } catch (error: any) {
      throw error.code;
    }
  },
  //Quên mật khẩu
  forgotpassword: async (email: string) => {
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
    } catch (error: any){
      throw error.code
    }
  },

  // Đăng xuất
  logout: async () => {
    await firebaseAuth.signOut();
  }
};