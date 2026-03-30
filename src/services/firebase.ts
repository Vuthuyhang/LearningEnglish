import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const firebaseAuth = auth();
export const firebaseFirestore = firestore();

// Cấu hình Firestore (Tùy chọn: giúp truy vấn mượt hơn)
firebaseFirestore.settings({
  persistence: true, // Bật tính năng lưu cache offline (rất quan trọng cho app đọc báo)
});

// Gom nhóm lại để export mặc định nếu cần
const FirebaseService = {
  auth: firebaseAuth,
  firestore: firebaseFirestore,
};

export default FirebaseService;