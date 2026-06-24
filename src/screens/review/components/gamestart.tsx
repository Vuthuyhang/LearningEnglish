import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../common/constants/Colors';

const { width } = Dimensions.get('window');

interface Props {
  title: string;
  icon: string;
  onStart: () => void;
}

const GameStartOverlay = ({ title, icon, onStart }: Props) => (
  <View style={styles.overlay}>
    <View style={styles.startCard}>
      <Ionicons name={icon} size={80} color={Colors.primary || '#FFD1DC'} />
      <Text style={styles.startTitle}>{title}</Text>
      <Text style={styles.startSub}>Sẵn sàng</Text>
      <TouchableOpacity style={styles.startBtn} onPress={onStart}>
        <Text style={styles.startBtnText}>BẮT ĐẦU CHƠI</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 245, 247, 0.96)', zIndex: 10, justifyContent: 'center', alignItems: 'center' },
  startCard: { width: width * 0.85, backgroundColor: 'white', padding: 36, borderRadius: 34, alignItems: 'center', elevation: 12, shadowColor: '#FFB7C5', shadowOpacity: 0.35, shadowRadius: 18 },
  startTitle: { fontSize: 26, fontWeight: 'bold', color: '#4A4A4A', marginTop: 18 },
  startSub: { textAlign: 'center', color: '#9E9E9E', marginTop: 14, lineHeight: 24, fontSize: 14 },
  startBtn: { backgroundColor: '#FFB7C5', paddingVertical: 15, paddingHorizontal: 44, borderRadius: 22, marginTop: 28 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});

export default GameStartOverlay;