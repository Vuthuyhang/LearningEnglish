import React from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  opacity: Animated.Value;
  points: number;
}

const GameWinFlash = ({ opacity, points }: Props) => (
  <Animated.View style={[styles.winFlash, { opacity }]} pointerEvents="none">
    <Ionicons name="checkmark-circle" size={80} color="white" />
    <Text style={styles.winFlashTitle}>Tuyệt vời!</Text>
    <Text style={styles.winFlashSub}>+{points} điểm</Text>
  </Animated.View>
);

const styles = StyleSheet.create({
  winFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#4CAF50', zIndex: 20, justifyContent: 'center', alignItems: 'center' },
  winFlashTitle: { fontSize: 34, fontWeight: 'bold', color: 'white', marginTop: 16 },
  winFlashSub: { fontSize: 22, color: 'rgba(255,255,255,0.85)', marginTop: 8, fontWeight: '600' },
});

export default GameWinFlash;