import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  score: number;
  roundsWon: number;
  onRestart: () => void;
  onExit: () => void;
}

const GameResultModal = ({ visible, score, roundsWon, onRestart, onExit }: Props) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.resultCard}>
        <Ionicons name="skull-outline" size={80} color="#FF6B6B" />
        <Text style={styles.resultTitle}>Game Over!</Text>
        <View style={styles.scoreBoard}>
          <View style={styles.scoreStat}>
            <Text style={styles.scoreStatNum}>{score}</Text>
            <Text style={styles.scoreStatLabel}>ĐIỂM</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreStat}>
            <Text style={styles.scoreStatNum}>{roundsWon}</Text>
            <Text style={styles.scoreStatLabel}>VÒNG THẮNG</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.resultMainBtn} onPress={onRestart}>
          <LinearGradient colors={['#FFDEE9', '#FFB7C5']} style={styles.gradientBtn}>
            <Text style={styles.resultBtnText}>CHƠI LẠI</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onExit}><Text style={styles.exitText}>Trở về Menu</Text></TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  resultCard: { width: width * 0.85, backgroundColor: 'white', borderRadius: 40, padding: 32, alignItems: 'center', elevation: 20 },
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#4A4A4A', marginTop: 14 },
  scoreBoard: { flexDirection: 'row', alignItems: 'center', marginVertical: 22, backgroundColor: '#FFF5F7', borderRadius: 20, paddingVertical: 16, width: '100%', justifyContent: 'center' },
  scoreStat: { alignItems: 'center', flex: 1 },
  scoreStatNum: { fontSize: 36, fontWeight: 'bold', color: '#FFB7C5' },
  scoreStatLabel: { fontSize: 10, fontWeight: '900', color: '#CCC', letterSpacing: 1.5 },
  scoreDivider: { width: 1, height: 50, backgroundColor: '#F0D0D8', marginHorizontal: 10 },
  resultMainBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 14 },
  gradientBtn: { padding: 18, alignItems: 'center' },
  resultBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  exitText: { color: '#BBB', fontWeight: '600' },
});

export default GameResultModal;