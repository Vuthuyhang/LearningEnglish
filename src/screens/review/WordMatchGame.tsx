import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Dimensions, Modal, Animated
} from 'react-native';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { useVocabularyStore } from '../../features/vocabulary/vocab.store';
import toeicData from '../../assets/data/toeic.json';
import ieltsData from '../../assets/data/ielts.json';
import { LinearGradient } from 'react-native-linear-gradient';
import { useReviewStore } from '../../features/review/review.store';
import { useAuthStore } from '../../features/auth/auth.store';

const { width } = Dimensions.get('window');
const ROUND_TIME  = 45;
const MAX_LIVES   = 3;
const PAIRS_COUNT = 5;
const POINTS_WIN  = 50;

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

// ─── Component ────────────────────────────────────────────────────────────────
const WordMatchGame = ({ navigation }: any) => {
  const { vocabList } = useVocabularyStore();
  const { user } = useAuthStore();
  const { updateHighScore } = useReviewStore();

  // ── Game meta ────────────────────────────────────────────────
  const [isGameStarted, setIsGameStarted]     = useState(false);
  const [isGameOver, setIsGameOver]           = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [score, setScore]                     = useState(0);
  const [roundsWon, setRoundsWon]             = useState(0);

  const scoreRef = useRef(0);

  // FIX vấn đề 2: Dùng ref song song với isGameOver và isGameStarted
  // để listener beforeRemove đọc giá trị đúng mà không cần re-register
  const isGameOverRef    = useRef(false);
  const isGameStartedRef = useRef(false);

  // ── Round state ──────────────────────────────────────────────
  const poolRef       = useRef<any[]>([]);
  const usedCountRef  = useRef(0);
  const [gamePairs,    setGamePairs]    = useState<any[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<any[]>([]);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [selectedDef,  setSelectedDef]  = useState<any>(null);
  const [wrongPair,    setWrongPair]    = useState<string[]>([]);
  const [lives,        setLives]        = useState(MAX_LIVES);
  const [timeLeft,     setTimeLeft]     = useState(ROUND_TIME);
  const [isRoundOver,  setIsRoundOver]  = useState(false);

  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [isPaused,      setIsPaused]      = useState(false);

  const isRoundOverRef = useRef(false);
  const livesRef       = useRef(MAX_LIVES);

  // ── Transition overlay ───────────────────────────────────────
  const [showRoundWin, setShowRoundWin] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim      = useRef(new Animated.Value(0)).current;

  // ── Sound ────────────────────────────────────────────────────
  const bgMusic    = useRef<Sound | null>(null);
  const sfxCorrect = useRef<Sound | null>(null);
  const sfxWrong   = useRef<Sound | null>(null);
  const sfxFail    = useRef<Sound | null>(null);
  const sfxWin     = useRef<Sound | null>(null);

  const loadSound = (filename: string): Sound => {
    return new Sound(filename, Sound.MAIN_BUNDLE, (err) => {
      if (err) console.warn(`Failed to load sound: ${filename}`, err);
    });
  };

  const playSfx = (sfx: React.MutableRefObject<Sound | null>) => {
    sfx.current?.stop();
    sfx.current?.play();
  };

  // ── Khởi tạo ─────────────────────────────────────────────────
  useEffect(() => {
    poolRef.current = buildPool(vocabList);
    sfxCorrect.current = loadSound('correct.mp3');
    sfxWrong.current   = loadSound('wrong.mp3');
    sfxFail.current    = loadSound('fail2.mp3');
    sfxWin.current     = loadSound('completed.mp3');
    loadRound();

    return () => {
      bgMusic.current?.stop();
      bgMusic.current?.release();
      sfxCorrect.current?.release();
      sfxWrong.current?.release();
      sfxFail.current?.release();
      sfxWin.current?.release();
    };
  }, []);

  // ── Load vòng mới ─────────────────────────────────────────────
  const loadRound = useCallback(() => {
    const pairs = pickPairs(poolRef.current, usedCountRef.current);
    usedCountRef.current += PAIRS_COUNT;
    isRoundOverRef.current = false;
    setGamePairs(pairs);
    setShuffledDefs(fisherYatesShuffle(pairs));
    setMatchedWords([]);
    setSelectedWord(null);
    setSelectedDef(null);
    setWrongPair([]);
    livesRef.current = MAX_LIVES;
    setLives(MAX_LIVES);
    setTimeLeft(ROUND_TIME);
    setIsRoundOver(false);
    setShowRoundWin(false);
  }, []);

  // ── Bắt đầu game ─────────────────────────────────────────────
  const startGame = () => {
    setIsGameStarted(true);
    isGameStartedRef.current = true; // FIX vấn đề 2: cập nhật ref
    bgMusic.current = new Sound('playing.mp3', Sound.MAIN_BUNDLE, (err) => {
      if (!err) {
        bgMusic.current?.setNumberOfLoops(-1);
        bgMusic.current?.setVolume(0.3);
        bgMusic.current?.play();
      } else {
        console.warn('Failed to load background music', err);
      }
    });
  };

  // ── Timer mỗi vòng ───────────────────────────────────────────
  useEffect(() => {
    if (!isGameStarted || isRoundOverRef.current || showRoundWin || isPaused) return;
    if (timeLeft === 0) {
      triggerShake();
      endRound(false, 'time');
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isGameStarted, timeLeft, showRoundWin, isPaused]);

  // ── Kiểm tra nối từ ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedWord || !selectedDef) return;

    if (selectedWord.word === selectedDef.word) {
      playSfx(sfxCorrect);
      setMatchedWords(prev => {
        const newMatched = [...prev, selectedWord.word];
        if (newMatched.length === PAIRS_COUNT) {
          endRound(true);
        }
        return newMatched;
      });
      setSelectedWord(null);
      setSelectedDef(null);

    } else {
      playSfx(sfxWrong);
      triggerShake();
      setWrongPair([selectedWord.word, selectedDef.word]);

      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);

      if (newLives === 0) {
        setTimeout(() => endRound(false, 'lives'), 500);
      }

      setTimeout(() => {
        setWrongPair([]);
        setSelectedWord(null);
        setSelectedDef(null);
      }, 500);
    }
  }, [selectedWord, selectedDef]);

  // ── Shake animation ───────────────────────────────────────────
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Kết thúc 1 vòng ──────────────────────────────────────────
  const endRound = useCallback((isWin: boolean, reason?: string) => {
    if (isRoundOverRef.current) return;
    isRoundOverRef.current = true;
    setIsRoundOver(true);

    if (isWin) {
      playSfx(sfxWin);
      const newScore = scoreRef.current + POINTS_WIN;
      scoreRef.current = newScore;
      setScore(newScore);
      setRoundsWon(r => r + 1);

      setShowRoundWin(true);
      Animated.sequence([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setShowRoundWin(false);
        loadRound();
      });

    } else {
      bgMusic.current?.stop();
      playSfx(sfxFail);
      // FIX vấn đề 2: đánh dấu game over qua ref để listener không chặn nữa
      setIsGameOver(true);
      isGameOverRef.current = true;
      if (user?.uid) {
        updateHighScore(user.uid, 'match', scoreRef.current);
      }
      setShowResultModal(true);
    }
  }, [loadRound, user, updateHighScore]);

  // ── Xử lý thoát giữa chừng ───────────────────────────────────
  // FIX vấn đề 2: chỉ phụ thuộc vào navigation, đọc trạng thái qua ref
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isGameOverRef.current || !isGameStartedRef.current) return;

      e.preventDefault();
      isRoundOverRef.current = true;
      setIsPaused(true);       // trigger re-run timer effect → dừng đồng hồ
      setPendingAction(e.data.action);
      setShowExitModal(true);
    });

    return unsubscribe;
  }, [navigation]);

  const handleConfirmExit = async () => {
    if (user?.uid) {
      await updateHighScore(user.uid, 'match', scoreRef.current);
    }
    bgMusic.current?.stop();
    setShowExitModal(false);
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    }
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    setPendingAction(null);
    isRoundOverRef.current = false;
    setIsPaused(false); // trigger re-run timer effect → đồng hồ chạy lại
  };

  // ── Render mạng ──────────────────────────────────────────────
  const renderLives = () =>
    [...Array(MAX_LIVES)].map((_, i) => (
      <Ionicons
        key={i}
        name={i < lives ? 'heart' : 'heart-outline'}
        size={22}
        color={i < lives ? '#FF6B6B' : '#DDD'}
        style={{ marginHorizontal: 2 }}
      />
    ));

  // ── Màu timer ────────────────────────────────────────────────
  const timerColor    = timeLeft <= 10 ? '#FF6B6B' : timeLeft <= 20 ? '#FFA500' : '#4A4A4A';
  const progressPct   = `${(timeLeft / ROUND_TIME) * 100}%` as any;
  const progressColor = timeLeft <= 10 ? '#FF6B6B' : timeLeft <= 20 ? '#FFA500' : '#FFD1DC';

  return (
    <SafeAreaView style={styles.container}>

      {/* ── START OVERLAY ─────────────────────────────────────── */}
      {!isGameStarted && (
        <View style={styles.overlay}>
          <View style={styles.startCard}>
            <Ionicons name="extension-puzzle" size={80} color={Colors.primary} />
            <Text style={styles.startTitle}>Word Match</Text>
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Text style={styles.startBtnText}>BẮT ĐẦU CHƠI</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── WIN ROUND FLASH OVERLAY ───────────────────────────── */}
      {showRoundWin && (
        <Animated.View style={[styles.winFlash, { opacity: overlayOpacity }]}>
          <Ionicons name="checkmark-circle" size={80} color="white" />
          <Text style={styles.winFlashTitle}>Tuyệt vời!</Text>
          <Text style={styles.winFlashSub}>+{POINTS_WIN} điểm</Text>
        </Animated.View>
      )}

      {/* ── MODAL XÁC NHẬN THOÁT ─────────────────────────────── */}
      <Modal visible={showExitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.exitCard}>
            <Ionicons name="warning" size={70} color="#FFB7C5" />
            <Text style={styles.exitTitle}>Bạn muốn dừng chơi? 🌸</Text>
            <Text style={styles.exitSub}>
              Điểm số hiện tại ({score}) sẽ vẫn được lưu lại nếu đây là kỷ lục mới của bạn.
            </Text>

            <View style={styles.exitBtnRow}>
              {/* FIX vấn đề 1: gọi handleCancelExit thay vì setShowExitModal(false) */}
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelExit}>
                <Text style={styles.cancelBtnText}>Tiếp tục</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmExitBtn} onPress={handleConfirmExit}>
                <LinearGradient colors={['#FFDEE9', '#FFB7C5']} style={styles.gradExit}>
                  <Text style={styles.confirmBtnText}>Thoát</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── GAME OVER MODAL ───────────────────────────────────── */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <Ionicons name="skull-outline" size={80} color="#FF6B6B" />
            <Text style={styles.resultTitle}>Game Over!</Text>

            <View style={styles.scoreBoard}>
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatNum}>{scoreRef.current}</Text>
                <Text style={styles.scoreStatLabel}>ĐIỂM</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatNum}>{roundsWon}</Text>
                <Text style={styles.scoreStatLabel}>VÒNG THẮNG</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.resultMainBtn}
              onPress={() => navigation.replace('WordMatchGame')}
            >
              <LinearGradient colors={['#FFDEE9', '#FFB7C5']} style={styles.gradientBtn}>
                <Text style={styles.resultBtnText}>CHƠI LẠI</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* isGameOver = true nên navigation.goBack() sẽ không bị chặn */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.exitText}>Trở về Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <Animated.View style={[styles.headerCard, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.statsRow}>
          <View style={styles.timerBox}>
            <Ionicons name="alarm-outline" size={20} color={timerColor} />
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>ĐIỂM</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.livesRow}>{renderLives()}</View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: progressPct, backgroundColor: progressColor }]} />
        </View>

        <Text style={styles.roundLabel}>VÒNG {roundsWon + 1}</Text>
      </Animated.View>

      {/* ── BOARD ─────────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.board} showsVerticalScrollIndicator={false}>
        <View style={styles.columns}>

          {/* CỘT TỪ */}
          <View style={styles.column}>
            <Text style={styles.colLabel}>ENGLISH</Text>
            {gamePairs.map((item, idx) => {
              const isMatched  = matchedWords.includes(item.word);
              const isSelected = selectedWord?.word === item.word;
              const isWrong    = wrongPair.includes(item.word) && selectedWord?.word === item.word;
              return (
                <TouchableOpacity
                  key={`w-${idx}`}
                  disabled={isMatched || isRoundOver || !isGameStarted}
                  onPress={() => setSelectedWord(item)}
                  style={[
                    styles.card,
                    isSelected && styles.selectedCard,
                    isMatched  && styles.matchedCard,
                    isWrong    && styles.wrongCard,
                  ]}
                >
                  <Text style={[styles.wordText, isMatched && styles.matchedText]}>
                    {item.word}
                  </Text>
                  {!isMatched && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.source}</Text>
                    </View>
                  )}
                  {isMatched && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#2D5A27"
                      style={{ position: 'absolute', top: 6, right: 8 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CỘT NGHĨA */}
          <View style={styles.column}>
            <Text style={styles.colLabel}>MEANING</Text>
            {shuffledDefs.map((item, idx) => {
              const isMatched  = matchedWords.includes(item.word);
              const isSelected = selectedDef?.word === item.word;
              const isWrong    = wrongPair.includes(item.word) && selectedDef?.word === item.word;
              return (
                <TouchableOpacity
                  key={`d-${idx}`}
                  disabled={isMatched || isRoundOver || !isGameStarted}
                  onPress={() => setSelectedDef(item)}
                  style={[
                    styles.card,
                    styles.defCard,
                    isSelected && styles.selectedCard,
                    isMatched  && styles.matchedCard,
                    isWrong    && styles.wrongCard,
                  ]}
                >
                  <Text
                    style={[styles.defText, isMatched && styles.matchedText]}
                    numberOfLines={4}
                  >
                    {item.definition}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,245,247,0.96)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startCard: {
    width: width * 0.85,
    backgroundColor: 'white',
    padding: 36,
    borderRadius: 34,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
  startTitle:   { fontSize: 26, fontWeight: 'bold', color: '#4A4A4A', marginTop: 18 },
  startBtn:     { backgroundColor: '#FFB7C5', paddingVertical: 15, paddingHorizontal: 44, borderRadius: 22, marginTop: 28 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  winFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4CAF50',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winFlashTitle: { fontSize: 34, fontWeight: 'bold', color: 'white', marginTop: 16 },
  winFlashSub:   { fontSize: 22, color: 'rgba(255,255,255,0.85)', marginTop: 8, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  resultCard:   { width: width * 0.85, backgroundColor: 'white', borderRadius: 40, padding: 32, alignItems: 'center', elevation: 20 },
  resultTitle:  { fontSize: 28, fontWeight: 'bold', color: '#4A4A4A', marginTop: 14 },

  scoreBoard: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 22,
    backgroundColor: '#FFF5F7', borderRadius: 20,
    paddingVertical: 16, paddingHorizontal: 28,
    width: '100%', justifyContent: 'center',
  },
  scoreStat:      { alignItems: 'center', flex: 1 },
  scoreStatNum:   { fontSize: 36, fontWeight: 'bold', color: '#FFB7C5' },
  scoreStatLabel: { fontSize: 10, fontWeight: '900', color: '#CCC', letterSpacing: 1.5, marginTop: 2 },
  scoreDivider:   { width: 1, height: 50, backgroundColor: '#F0D0D8', marginHorizontal: 10 },

  resultMainBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 14 },
  gradientBtn:   { padding: 18, alignItems: 'center' },
  resultBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  exitText:      { color: '#BBB', fontWeight: '600' },

  headerCard: {
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10,
    backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    elevation: 6, shadowColor: '#FFB7C5', shadowOpacity: 0.2, shadowRadius: 10,
  },
  statsRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timerBox:   { flexDirection: 'row', alignItems: 'center' },
  timerText:  { fontSize: 18, fontWeight: 'bold', marginLeft: 5 },
  scoreBox:   { alignItems: 'center' },
  scoreLabel: { fontSize: 9, fontWeight: '900', color: '#CCC', letterSpacing: 1.5 },
  scoreValue: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A' },
  livesRow:   { flexDirection: 'row' },

  progressContainer: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressFill:      { height: '100%', borderRadius: 4 },
  roundLabel: { textAlign: 'center', fontSize: 10, fontWeight: '900', color: '#CCC', letterSpacing: 2, marginTop: 6 },

  board:   { padding: 15, paddingTop: 20 },
  columns: { flexDirection: 'row', justifyContent: 'space-between' },
  column:  { width: '48%' },
  colLabel:{ textAlign: 'center', fontSize: 11, fontWeight: '900', color: '#BBB', marginBottom: 15, letterSpacing: 1.5 },

  card: {
    backgroundColor: 'white', height: 100, borderRadius: 22,
    padding: 10, marginBottom: 15, justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#FFB7C5', shadowOpacity: 0.2,
    borderWidth: 2, borderColor: 'transparent',
  },
  defCard:      { paddingHorizontal: 6 },
  selectedCard: { borderColor: '#FFB7C5', backgroundColor: '#FFF0F3' },
  matchedCard:  { backgroundColor: '#E2F5E1', borderColor: '#A8D5BA', elevation: 0 },
  wrongCard:    { backgroundColor: '#FFE5E5', borderColor: '#FFB3B3' },

  wordText:    { fontSize: 17, fontWeight: 'bold', color: '#4A4A4A', textAlign: 'center' },
  defText:     { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 16 },
  matchedText: { color: '#2D5A27', fontWeight: 'bold' },

  tag:     { position: 'absolute', top: 6, right: 8, backgroundColor: '#FFF5F7', paddingHorizontal: 6, borderRadius: 5, borderWidth: 0.5, borderColor: '#FFDEE9' },
  tagText: { fontSize: 8, color: '#FFB7C5', fontWeight: 'bold' },

  exitCard: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 35,
    padding: 25,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  exitTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A', marginTop: 15, textAlign: 'center' },
  exitSub:   { fontSize: 14, color: '#9E9E9E', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  exitBtnRow: { flexDirection: 'row', marginTop: 30, width: '100%', justifyContent: 'space-between' },
  cancelBtn:     { flex: 1, paddingVertical: 15, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 15, backgroundColor: '#F5F5F5' },
  cancelBtnText: { color: '#888', fontWeight: '600' },
  confirmExitBtn: { flex: 1, borderRadius: 15, overflow: 'hidden' },
  gradExit:       { paddingVertical: 15, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' },
});

export default WordMatchGame;