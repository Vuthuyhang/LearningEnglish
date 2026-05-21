import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Animated, TouchableOpacity, Text } from 'react-native';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { useVocabularyStore } from '../../features/vocabulary/vocab.store';
import toeicData from '../../assets/data/toeic.json';
import ieltsData from '../../assets/data/ielts.json';
import { useReviewStore } from '../../features/review/review.store';
import { useAuthStore } from '../../features/auth/auth.store';

import GameHeader from './components/gameheader';
import GameStart from './components/gamestart';
import GameExitModal from './components/gameexist';
import GameResultModal from './components/gameresult';
import GameWinFlash from './components/gamewinflash';

const ROUND_TIME = 45;
const MAX_LIVES = 3;
const PAIRS_COUNT = 5;
const POINTS_WIN = 50;

Sound.setCategory('Playback');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fisherYatesShuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildPool = (vocabList: any[]) => fisherYatesShuffle([
  ...vocabList.map(i => ({ ...i, source: 'Personal' })),
  ...(toeicData as any[]).map(i => ({ ...i, source: 'TOEIC' })),
  ...(ieltsData as any[]).map(i => ({ ...i, source: 'IELTS' })),
]);

const pickPairs = (pool: any[], usedCount: number) => {
  const start = usedCount % pool.length;
  const slice = [];
  for (let i = 0; i < PAIRS_COUNT; i++) {
    slice.push(pool[(start + i) % pool.length]);
  }
  return slice;
};

const WordMatchGame = ({ navigation }: any) => {
  const { vocabList } = useVocabularyStore();
  const { user } = useAuthStore();
  const { updateHighScore } = useReviewStore();

  // ── Game states ──
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [score, setScore] = useState(0);
  const [roundsWon, setRoundsWon] = useState(0);

  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  const isGameStartedRef = useRef(false);
  const poolRef = useRef<any[]>([]);
  const usedCountRef = useRef(0);

  const [gamePairs, setGamePairs] = useState<any[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<any[]>([]);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [selectedDef, setSelectedDef] = useState<any>(null);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);

  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  const [showRoundWin, setShowRoundWin] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Sound Refs ──
  const bgMusic = useRef<Sound | null>(null);
  const sfxCorrect = useRef<Sound | null>(null);
  const sfxWrong = useRef<Sound | null>(null);
  const sfxFail = useRef<Sound | null>(null);
  const sfxWin = useRef<Sound | null>(null);

  const loadSound = (filename: string): Sound => new Sound(filename, Sound.MAIN_BUNDLE);

  useEffect(() => {
    poolRef.current = buildPool(vocabList);
    sfxCorrect.current = loadSound('correct.mp3');
    sfxWrong.current = loadSound('wrong.mp3');
    sfxFail.current = loadSound('fail2.mp3');
    sfxWin.current = loadSound('completed.mp3');
    loadRound();
    return () => {
      bgMusic.current?.stop().release();
      sfxCorrect.current?.release(); sfxWrong.current?.release();
      sfxFail.current?.release(); sfxWin.current?.release();
    };
  }, []);

  const loadRound = useCallback(() => {
    const pairs = pickPairs(poolRef.current, usedCountRef.current);
    usedCountRef.current += PAIRS_COUNT;
    setGamePairs(pairs);
    setShuffledDefs(fisherYatesShuffle(pairs));
    setMatchedWords([]); setSelectedWord(null); setSelectedDef(null); setWrongPair([]);
    setLives(MAX_LIVES); setTimeLeft(ROUND_TIME);
    setShowRoundWin(false);
  }, []);

  const startGame = () => {
    setIsGameStarted(true);
    isGameStartedRef.current = true;
    bgMusic.current = new Sound('playing.mp3', Sound.MAIN_BUNDLE, (err) => {
      if (!err) { bgMusic.current?.setNumberOfLoops(-1).setVolume(0.3).play(); }
    });
  };

  useEffect(() => {
    if (!isGameStarted || isGameOver || showRoundWin || isPaused) return;
    if (timeLeft === 0) { endRound(false); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isGameStarted, timeLeft, isGameOver, showRoundWin, isPaused]);

  useEffect(() => {
    if (!selectedWord || !selectedDef) return;
    if (selectedWord.word === selectedDef.word) {
      sfxCorrect.current?.stop().play();
      const newMatched = [...matchedWords, selectedWord.word];
      setMatchedWords(newMatched);
      if (newMatched.length === PAIRS_COUNT) endRound(true);
      setSelectedWord(null); setSelectedDef(null);
    } else {
      sfxWrong.current?.stop().play();
      triggerShake();
      setWrongPair([selectedWord.word, selectedDef.word]);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) setTimeout(() => endRound(false), 500);
      setTimeout(() => { setWrongPair([]); setSelectedWord(null); setSelectedDef(null); }, 500);
    }
  }, [selectedWord, selectedDef]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const endRound = (isWin: boolean) => {
    if (isWin) {
      sfxWin.current?.play();
      const newScore = score + POINTS_WIN;
      setScore(newScore); scoreRef.current = newScore;
      setRoundsWon(r => r + 1);
      setShowRoundWin(true);
      Animated.sequence([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => { loadRound(); });
    } else {
      bgMusic.current?.stop();
      sfxFail.current?.play();
      setIsGameOver(true);
      isGameOverRef.current = true;
      if (user?.uid) updateHighScore(user.uid, 'match', scoreRef.current);
      setShowResultModal(true);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isGameOverRef.current || !isGameStartedRef.current) return;
      e.preventDefault();
      setIsPaused(true);
      setPendingAction(e.data.action);
      setShowExitModal(true);
    });
    return unsubscribe;
  }, [navigation]);

  const handleConfirmExit = async () => {
    if (user?.uid) await updateHighScore(user.uid, 'match', scoreRef.current);
    bgMusic.current?.stop();
    setShowExitModal(false);
    if (pendingAction) navigation.dispatch(pendingAction);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* ── COMMON COMPONENTS ── */}
      {!isGameStarted && <GameStart title="Word Match" icon="extension-puzzle" onStart={startGame} />}
      
      {showRoundWin && <GameWinFlash opacity={overlayOpacity} points={POINTS_WIN} />}
      
      <GameExitModal visible={showExitModal} score={score} onCancel={() => { setShowExitModal(false); setIsPaused(false); }} onConfirm={handleConfirmExit} />
      
      <GameResultModal visible={showResultModal} score={score} roundsWon={roundsWon} onRestart={() => navigation.replace('WordMatchGame')} onExit={() => navigation.goBack()} />
      
      <GameHeader timeLeft={timeLeft} totalTime={ROUND_TIME} score={score} lives={lives} maxLives={MAX_LIVES} roundText={`VÒNG ${roundsWon + 1}`} shakeAnim={shakeAnim} />

      {/* ── BOARD GAME (Mã riêng của Word Match) ── */}
      <ScrollView contentContainerStyle={styles.board} showsVerticalScrollIndicator={false}>
        <View style={styles.columns}>
          {/* CỘT TỪ */}
          <View style={styles.column}>
            <Text style={styles.colLabel}>ENGLISH</Text>
            {gamePairs.map((item, idx) => (
              <TouchableOpacity
                key={`w-${idx}`}
                disabled={matchedWords.includes(item.word) || isGameOver || !isGameStarted}
                onPress={() => setSelectedWord(item)}
                style={[styles.card, selectedWord?.word === item.word && styles.selectedCard, matchedWords.includes(item.word) && styles.matchedCard, wrongPair.includes(item.word) && styles.wrongCard]}
              >
                <Text style={[styles.wordText, matchedWords.includes(item.word) && styles.matchedText]}>{item.word}</Text>
                {!matchedWords.includes(item.word) && <View style={styles.tag}><Text style={styles.tagText}>{item.source}</Text></View>}
              </TouchableOpacity>
            ))}
          </View>

          {/* CỘT NGHĨA */}
          <View style={styles.column}>
            <Text style={styles.colLabel}>MEANING</Text>
            {shuffledDefs.map((item, idx) => (
              <TouchableOpacity
                key={`d-${idx}`}
                disabled={matchedWords.includes(item.word) || isGameOver || !isGameStarted}
                onPress={() => setSelectedDef(item)}
                style={[styles.card, styles.defCard, selectedDef?.word === item.word && styles.selectedCard, matchedWords.includes(item.word) && styles.matchedCard, wrongPair.includes(item.word) && styles.wrongCard]}
              >
                <Text style={[styles.defText, matchedWords.includes(item.word) && styles.matchedText]} numberOfLines={4}>{item.definition}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
        </View>
        <View style={{ height: 100 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  board: { padding: 15, paddingTop: 20 },
  columns: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: '48%' },
  colLabel: { textAlign: 'center', fontSize: 11, fontWeight: '900', color: '#BBB', marginBottom: 15, letterSpacing: 1.5 },
  card: { backgroundColor: 'white', height: 100, borderRadius: 22, padding: 10, marginBottom: 15, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#FFB7C5', shadowOpacity: 0.2, borderWidth: 2, borderColor: 'transparent' },
  defCard: { paddingHorizontal: 6 },
  selectedCard: { borderColor: '#FFB7C5', backgroundColor: '#FFF0F3' },
  matchedCard: { backgroundColor: '#E2F5E1', borderColor: '#A8D5BA', elevation: 0 },
  wrongCard: { backgroundColor: '#FFE5E5', borderColor: '#FFB3B3' },
  wordText: { fontSize: 17, fontWeight: 'bold', color: '#4A4A4A', textAlign: 'center' },
  defText: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 16 },
  matchedText: { color: '#2D5A27', fontWeight: 'bold' },
  tag: { position: 'absolute', top: 6, right: 8, backgroundColor: '#FFF5F7', paddingHorizontal: 6, borderRadius: 5, borderWidth: 0.5, borderColor: '#FFDEE9' },
  tagText: { fontSize: 8, color: '#FFB7C5', fontWeight: 'bold' },
});

export default WordMatchGame;