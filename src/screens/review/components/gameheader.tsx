import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../common/constants/Colors';

interface Props {
  timeLeft: number;
  totalTime: number;
  score: number;
  lives: number;
  maxLives: number;
  roundText?: string;
  shakeAnim?: any; 
}

const GameHeader = ({ timeLeft, totalTime, score, lives, maxLives, roundText, shakeAnim }: Props) => {
  const timerColor = timeLeft <= 10 ? '#FF6B6B' : timeLeft <= 20 ? '#FFA500' : '#4A4A4A';
  const progressPct = `${(timeLeft / totalTime) * 100}%` as any;
  const progressColor = timeLeft <= 10 ? '#FF6B6B' : '#FFD1DC';

  return (
    <Animated.View style={[styles.headerCard, shakeAnim && { transform: [{ translateX: shakeAnim }] }]}>
      <View style={styles.statsRow}>
        <View style={styles.timerBox}>
          <Ionicons name="alarm-outline" size={20} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>ĐIỂM</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.livesRow}>
          {[...Array(maxLives)].map((_, i) => (
            <Ionicons key={i} name={i < lives ? 'heart' : 'heart-outline'} size={22} color="#FF6B6B" style={{ marginHorizontal: 2 }} />
          ))}
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: progressPct, backgroundColor: progressColor }]} />
      </View>
      <Text style={styles.roundLabel}>{roundText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerCard: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 6, shadowColor: '#FFB7C5', shadowOpacity: 0.2, shadowRadius: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timerBox: { flexDirection: 'row', alignItems: 'center' },
  timerText: { fontSize: 18, fontWeight: 'bold', marginLeft: 5 },
  scoreBox: { alignItems: 'center' },
  scoreLabel: { fontSize: 9, fontWeight: '900', color: '#CCC', letterSpacing: 1.5 },
  scoreValue: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A' },
  livesRow: { flexDirection: 'row' },
  progressContainer: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  roundLabel: { textAlign: 'center', fontSize: 10, fontWeight: '900', color: '#CCC', letterSpacing: 2, marginTop: 6 },
});

export default GameHeader;