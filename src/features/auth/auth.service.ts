
import { firebaseAuth, firebaseFirestore } from '../../services/firebase';

export const AuthService = {
  register: async (fullName: string, email: string, pass: string) => {
    try {
      const result = await firebaseAuth.createUserWithEmailAndPassword(email, pass);
      const uid = result.user.uid;

      await result.user.updateProfile({ displayName: fullName });

      await firebaseFirestore.collection('users').doc(uid).set({
        fullName: fullName,
        email: email,
        level: 'Beginner', 
        totalWordsLearned: 0,
        createdAt: new Date().getTime(),
      });

      return result.user;
    } catch (error: any) {
      throw error.code;
    }
  },

  login: async (email: string, pass: string) => {
    try {
      const result = await firebaseAuth.signInWithEmailAndPassword(email, pass);
      return result.user;
    } catch (error: any) {
      throw error.code;
    }
  },

  forgotpassword: async (email: string) => {
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
    } catch (error: any){
      throw error.code
    }
  },

  logout: async () => {
    await firebaseAuth.signOut();
  },

   updateProfile: async (uid: string, fullName: string, photoURL?: string) => {
    try {
      // 1. Cập nhật trên Firebase Authentication (Thông tin đăng nhập)
      const updateData: { displayName: string; photoURL?: string } = { displayName: fullName };
      if (photoURL) updateData.photoURL = photoURL;
      await firebaseAuth.currentUser?.updateProfile(updateData);

      // 2. Cập nhật trên Cloud Firestore (Hồ sơ lưu trữ)
      await firebaseFirestore.collection('users').doc(uid).update({
        fullName: fullName,
        ...(photoURL && { photoURL: photoURL })
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  }
};