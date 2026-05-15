import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Dimensions, Modal, Animated
} from 'react-native';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { useVocabularyStore } from '../../features/vocabulary/vocab.store';
import toeicData from '../../assets/data/toeic.json';
import ieltsData from '../../assets/data/ielts.json';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const WORD_TIME = 45;   // 45 giây mỗi từ
const MAX_LIVES = 3;
const POINTS_PER_WORD = 10;

Sound.setCategory('Playback');

// Lấy từ ngẫu nhiên chưa dùng từ pool vô hạn
const buildPool = (vocabList: any[]) => [
  ...vocabList,
  ...(toeicData as any[]),
  ...(ieltsData as any[]),
].sort(() => 0.5 - Math.random());

const WordScrambleGame = ({ navigation }: any) => {
  const { vocabList } = useVocabularyStore();

  // ─── Game meta ───────────────────────────────────────────────
  const [isGameStarted, setIsGameStarted]   = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [score, setScore]                   = useState(0);
  const [lives, setLives]                   = useState(MAX_LIVES);
  const [wordsCleared, setWordsCleared]     = useState(0); // số từ đã qua

  // ─── Từ hiện tại ─────────────────────────────────────────────
  const poolRef             = useRef<any[]>([]);
  const poolIndexRef        = useRef(0);          // con trỏ vào pool
  const [currentWord, setCurrentWord]       = useState<any>(null);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [userAnswer, setUserAnswer]         = useState<string[]>([]);

  // ─── Timer ───────────────────────────────────────────────────
  const [timeLeft, setTimeLeft]             = useState(WORD_TIME);
  const [showAnswer, setShowAnswer]         = useState(false); // flash đáp án khi hết giờ

  // ─── Animation ───────────────────────────────────────────────
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const flashAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim  = useRef(new Animated.Value(0)).current;

  // ─── Âm thanh ────────────────────────────────────────────────
  const bgMusic    = useRef<Sound | null>(null);
  const sfxCorrect = useRef(new Sound('correct.mp3',   Sound.MAIN_BUNDLE));
  const sfxWrong   = useRef(new Sound('wrong.mp3',     Sound.MAIN_BUNDLE));
  const sfxWin     = useRef(new Sound('completed.mp3', Sound.MAIN_BUNDLE));
  const sfxFail    = useRef(new Sound('fail2.mp3',     Sound.MAIN_BUNDLE));

  // ─── Khởi tạo pool ───────────────────────────────────────────
  useEffect(() => {
    poolRef.current = buildPool(vocabList);
    loadNextWord(0);
    return () => {
      bgMusic.current?.stop();
      bgMusic.current?.release();
      sfxCorrect.current.release();
      sfxWrong.current.release();
      sfxWin.current.release();
      sfxFail.current.release();
    };
  }, []);

  // ─── Tải từ theo index trong pool ────────────────────────────
  const loadNextWord = useCallback((idx: number) => {
    // Nếu hết pool thì xáo lại (vô hạn)
    if (idx >= poolRef.current.length) {
      poolRef.current = buildPool(vocabList);
      idx = 0;
    }
    const word = poolRef.current[idx];
    poolIndexRef.current = idx;
    const letters = word.word.toUpperCase().split('');
    setCurrentWord(word);
    setShuffledLetters([...letters].sort(() => 0.5 - Math.random()));
    setUserAnswer([]);
    setShowAnswer(false);
    setTimeLeft(WORD_TIME);

    // Slide-in animation
    slideAnim.setValue(50);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80 }).start();
  }, [vocabList]);

  // ─── Bộ đếm thời gian (mỗi từ) ───────────────────────────────
  useEffect(() => {
    if (!isGameStarted || showResultModal) return;
    if (showAnswer) return; // đang flash đáp án, không đếm

    if (timeLeft === 0) {
      // Hết giờ từ này → trừ mạng
      handleWordFail('time');
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [isGameStarted, timeLeft, showResultModal, showAnswer]);

  // ─── Bắt đầu game ────────────────────────────────────────────
  const startGame = () => {
    setIsGameStarted(true);
    bgMusic.current = new Sound('playing.mp3', Sound.MAIN_BUNDLE, (e) => {
      if (!e) {
        bgMusic.current?.setNumberOfLoops(-1);
        bgMusic.current?.setVolume(0.2);
        bgMusic.current?.play();
      }
    });
  };

  // ─── Kết thúc cả game (hết mạng) ─────────────────────────────
  const endGame = () => {
    bgMusic.current?.stop();
    sfxFail.current.play();
    setShowResultModal(true);
  };

  // ─── Xử lý khi trả lời sai hoặc hết giờ một từ ───────────────
  const handleWordFail = (reason: 'wrong' | 'time') => {
    sfxWrong.current.play();

    // Rung animation
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();

    const newLives = lives - 1;
    setLives(newLives);

    if (newLives === 0) {
      // Hết mạng: flash đáp án rồi kết thúc
      setShowAnswer(true);
      setTimeout(() => endGame(), 2000);
    } else {
      // Còn mạng: flash đáp án rồi sang từ tiếp
      setShowAnswer(true);
      setTimeout(() => {
        loadNextWord(poolIndexRef.current + 1);
      }, 2000);
    }
  };

  // ─── Người dùng bấm chữ cái ──────────────────────────────────
  const handleLetterPress = (char: string, index: number) => {
    if (showAnswer) return;

    const newAnswer = [...userAnswer, char];
    const newShuffled = [...shuffledLetters];
    newShuffled.splice(index, 1);

    setUserAnswer(newAnswer);
    setShuffledLetters(newShuffled);

    const target = currentWord.word.toUpperCase();

    if (newAnswer.join('') === target) {
      // ✅ ĐÚNG
      sfxCorrect.current.play();
      const newScore = score + POINTS_PER_WORD;
      setScore(newScore);
      setWordsCleared(w => w + 1);

      // Flash xanh nhẹ rồi next ngay
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.6, duration: 100, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1,   duration: 200, useNativeDriver: true }),
      ]).start(() => {
        loadNextWord(poolIndexRef.current + 1);
      });

    } else if (newAnswer.length === target.length) {
      // ❌ Điền đủ nhưng sai
      handleWordFail('wrong');
    }
    // Chưa đủ → chờ tiếp
  };

  // ─── Xóa chữ cuối (undo) ─────────────────────────────────────
  const handleUndo = () => {
    if (userAnswer.length === 0 || showAnswer) return;
    const lastChar = userAnswer[userAnswer.length - 1];
    setUserAnswer(prev => prev.slice(0, -1));
    setShuffledLetters(prev => [...prev, lastChar]);
  };

  // ─── Render mạng ─────────────────────────────────────────────
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

  // ─── Màu thanh timer ─────────────────────────────────────────
  const timerColor = timeLeft <= 10 ? '#FF6B6B' : timeLeft <= 20 ? '#FFA500' : '#4CAF50';
  const timerWidth = `${(timeLeft / WORD_TIME) * 100}%` as any;

  if (!currentWord) return null;

  return (
    <SafeAreaView style={styles.container}>

      {/* ── START OVERLAY ─────────────────────────────────────── */}
      {!isGameStarted && (
        <View style={styles.overlay}>
          <View style={styles.startCard}>
            <Ionicons name="shuffle" size={70} color={Colors.primary} />
            <Text style={styles.startTitle}>Word Scramble</Text>
            <Text style={styles.startSub}>
              Sắp xếp chữ cái thành từ đúng
            </Text>
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Text style={styles.startBtnText}>BẮT ĐẦU</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── RESULT MODAL ──────────────────────────────────────── */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <Ionicons name="skull-outline" size={70} color="#FF6B6B" />
            <Text style={styles.resultTitle}>Game Over!</Text>

            <View style={styles.scoreBoard}>
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatNum}>{score}</Text>
                <Text style={styles.scoreStatLabel}>ĐIỂM</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatNum}>{wordsCleared}</Text>
                <Text style={styles.scoreStatLabel}>TỪ ĐÚNG</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.resBtn}
              onPress={() => navigation.replace('WordScrambleGame')}
            >
              <LinearGradient colors={['#FFDEE9', '#FFB7C5']} style={styles.grad}>
                <Text style={styles.resBtnText}>CHƠI LẠI</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.exitText}>Thoát</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* Điểm */}
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>ĐIỂM</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>

          {/* Mạng */}
          <View style={styles.livesRow}>{renderLives()}</View>

          {/* Số từ đã qua */}
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>TỪ</Text>
            <Text style={styles.scoreValue}>{wordsCleared}</Text>
          </View>
        </View>

        {/* Timer bar */}
        <View style={styles.timerBarBg}>
          <Animated.View
            style={[styles.timerBarFill, { width: timerWidth, backgroundColor: timerColor }]}
          />
        </View>
        <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
      </View>

      {/* ── GAME AREA ─────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.gameArea,
          {
            transform: [{ translateX: shakeAnim }, { translateY: slideAnim }],
            opacity: flashAnim,
          },
        ]}
      >
        <Text style={styles.hintLabel}>DEFINITION</Text>
        <Text style={styles.definition}>{currentWord.definition}</Text>

        {/* Ô trả lời */}
        <View style={styles.answerRow}>
          {currentWord.word.split('').map((_: string, i: number) => (
            <View
              key={i}
              style={[
                styles.answerBox,
                showAnswer && { borderBottomColor: '#FF6B6B' },
                userAnswer[i] && !showAnswer && { borderBottomColor: '#FFB7C5' },
              ]}
            >
              <Text
                style={[
                  styles.answerChar,
                  showAnswer && { color: '#FF6B6B' },
                  userAnswer[i] && !showAnswer && { color: '#4A4A4A' },
                ]}
              >
                {showAnswer
                  ? currentWord.word[i].toUpperCase()
                  : userAnswer[i] || ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Bong bóng chữ cái */}
        {!showAnswer && (
          <View style={styles.letterPool}>
            {shuffledLetters.map((char, index) => (
              <TouchableOpacity
                key={`${wordsCleared}-${index}`}
                style={styles.letterBubble}
                onPress={() => handleLetterPress(char, index)}
                activeOpacity={0.7}
              >
                <Text style={styles.letterText}>{char}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showAnswer && (
          <Text style={styles.revealedNote}>
            Đáp án: {currentWord.word.toUpperCase()}
          </Text>
        )}

        {/* Nút Undo */}
        {!showAnswer && userAnswer.length > 0 && (
          <TouchableOpacity style={styles.undoBtn} onPress={handleUndo}>
            <Ionicons name="backspace-outline" size={20} color="#AAA" />
            <Text style={styles.undoText}>Xóa</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },

  // ── Overlay start ──────────────────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,245,247,0.97)',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startCard: {
    width: width * 0.85,
    backgroundColor: 'white',
    padding: 36,
    borderRadius: 40,
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  startTitle: { fontSize: 28, fontWeight: 'bold', color: '#4A4A4A', marginTop: 18 },
  startSub: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 14,
    lineHeight: 24,
    fontSize: 14,
  },
  startBtn: {
    backgroundColor: '#FFB7C5',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginTop: 28,
  },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },

  // ── Header ────────────────────────────────────────────────────
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreBox: { alignItems: 'center', minWidth: 50 },
  scoreLabel: { fontSize: 9, fontWeight: '900', color: '#CCC', letterSpacing: 1.5 },
  scoreValue: { fontSize: 22, fontWeight: 'bold', color: '#4A4A4A' },
  livesRow: { flexDirection: 'row', alignItems: 'center' },

  timerBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  timerBarFill: { height: '100%', borderRadius: 4 },
  timerText: { fontSize: 12, fontWeight: '700', textAlign: 'right' },

  // ── Game area ─────────────────────────────────────────────────
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  hintLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#CCC',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  definition: {
    fontSize: 18,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 36,
    paddingHorizontal: 10,
  },

  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  answerBox: {
    width: 32,
    height: 44,
    borderBottomWidth: 3,
    borderBottomColor: '#E0E0E0',
    marginHorizontal: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 2,
  },
  answerChar: { fontSize: 22, fontWeight: 'bold', color: '#E0E0E0' },

  letterPool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: width - 40,
  },
  letterBubble: {
    width: 52,
    height: 52,
    backgroundColor: 'white',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 7,
    elevation: 5,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  letterText: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A' },

  revealedNote: {
    marginTop: 24,
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 16,
    fontStyle: 'italic',
  },

  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
    gap: 6,
  },
  undoText: { color: '#AAA', fontWeight: '600', fontSize: 14 },

  // ── Modal kết quả ─────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    width: width * 0.82,
    backgroundColor: 'white',
    borderRadius: 36,
    padding: 32,
    alignItems: 'center',
    elevation: 20,
  },
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#4A4A4A', marginTop: 12 },

  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: '#FFF5F7',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 30,
    width: '100%',
    justifyContent: 'center',
  },
  scoreStat: { alignItems: 'center', flex: 1 },
  scoreStatNum: { fontSize: 36, fontWeight: 'bold', color: '#FFB7C5' },
  scoreStatLabel: { fontSize: 10, fontWeight: '900', color: '#CCC', letterSpacing: 1.5, marginTop: 2 },
  scoreDivider: { width: 1, height: 50, backgroundColor: '#F0D0D8', marginHorizontal: 10 },

  resBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 14 },
  grad: { padding: 17, alignItems: 'center' },
  resBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  exitText: { color: '#BBB', fontWeight: '600', fontSize: 14 },
});

export default WordScrambleGame;