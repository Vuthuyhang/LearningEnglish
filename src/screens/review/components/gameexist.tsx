import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  score: number;
  onCancel: () => void;
  onConfirm: () => void;
}

const GameExitModal = ({ visible, score, onCancel, onConfirm }: Props) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.exitCard}>
        <Ionicons name="warning" size={70} color="#FFB7C5" />
        <Text style={styles.exitTitle}>Bạn muốn dừng chơi? 🌸</Text>
        <Text style={styles.exitSub}>
          Điểm số hiện tại ({score}) sẽ vẫn được lưu lại nếu đây là kỷ lục mới của bạn.
        </Text>
        <View style={styles.exitBtnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Tiếp tục</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmExitBtn} onPress={onConfirm}>
            <LinearGradient colors={['#FFDEE9', '#FFB7C5']} style={styles.gradExit}>
              <Text style={styles.confirmBtnText}>Thoát</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  exitCard: { width: width * 0.8, backgroundColor: 'white', borderRadius: 35, padding: 25, alignItems: 'center', elevation: 20 },
  exitTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A', marginTop: 15, textAlign: 'center' },
  exitSub: { fontSize: 14, color: '#9E9E9E', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  exitBtnRow: { flexDirection: 'row', marginTop: 30, width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, paddingVertical: 15, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 15, backgroundColor: '#F5F5F5' },
  cancelBtnText: { color: '#888', fontWeight: '600' },
  confirmExitBtn: { flex: 1, borderRadius: 15, overflow: 'hidden' },
  gradExit: { paddingVertical: 15, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' },
});

export default GameExitModal;