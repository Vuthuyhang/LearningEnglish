import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Dimensions, Animated, ActivityIndicator
} from 'react-native';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { useVocabularyStore } from '../../features/vocabulary/vocab.store';
import { useAuthStore } from '../../features/auth/auth.store';
import { useReviewStore } from '../../features/review/review.store';
import toeicData from '../../assets/data/toeic.json';
import ieltsData from '../../assets/data/ielts.json';

// --- IMPORT COMMON COMPONENTS ---
import GameHeader from './components/gameheader';
import GameStart from './components/gamestart';
import GameExitModal from './components/gameexist';
import GameResult from './components/gameresult';

const { width } = Dimensions.get('window');
const WORD_TIME = 45;   
const MAX_LIVES = 3;
const POINTS_PER_WORD = 10;

Sound.setCategory('Playback');

const WordScrambleGame = ({ navigation }: any) => {
  const { vocabList } = useVocabularyStore();
  const { user } = useAuthStore();
  const { updateHighScore } = useReviewStore();

  // ─── States ───
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [wordsCleared, setWordsCleared] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WORD_TIME);

  const [currentWord, setCurrentWord] = useState<any>(null);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]); // Quản lý vị trí chữ cái đứng yên

  // ─── Refs & Anims ───
  const poolRef = useRef<any[]>([]);
  const poolIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const [pendingAction, setPendingAction] = useState<any>(null);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ─── Sound Refs ───
  const bgMusic = useRef<Sound | null>(null);
  const sfxCorrect = useRef(new Sound('correct.mp3', Sound.MAIN_BUNDLE));
  const sfxWrong = useRef(new Sound('wrong.mp3', Sound.MAIN_BUNDLE));
  const sfxFail = useRef(new Sound('fail2.mp3', Sound.MAIN_BUNDLE));

  // 1. Khởi tạo dữ liệu
  useEffect(() => {
    const data = [
      ...vocabList.map(i => ({...i, source: 'Personal'})),
      ...(toeicData as any[]).map(i => ({...i, source: 'TOEIC'})),
      ...(ieltsData as any[]).map(i => ({...i, source: 'IELTS'})),
    ].sort(() => 0.5 - Math.random());
    
    poolRef.current = data;
    if (data.length > 0) prepareWord(data[0]);

    return () => {
      if (bgMusic.current) {
        bgMusic.current.stop();
        bgMusic.current.release();
      }
      sfxCorrect.current.release();
      sfxWrong.current.release();
      sfxFail.current.release();
    };
  }, []);

  // 2. Chặn thoát khi đang chơi
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isGameOver || !isGameStarted) return;
      e.preventDefault();
      setIsPaused(true);
      setPendingAction(e.data.action);
      setShowExitModal(true);
    });
    return unsubscribe;
  }, [navigation, isGameOver, isGameStarted]);

  // Hàm trộn chữ và reset trạng thái từ
  const prepareWord = (wordObj: any) => {
    if (!wordObj) return;
    setCurrentWord(wordObj);
    const letters = wordObj.word.toUpperCase().split('');
    setShuffledLetters([...letters].sort(() => 0.5 - Math.random()));
    setUserAnswer([]);
    setUsedIndices([]); // Reset vị trí tàng hình
    setTimeLeft(WORD_TIME);
    
    slideAnim.setValue(50);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80 }).start();
  };

  const loadNextWord = () => {
    const nextIdx = poolIndexRef.current + 1;
    poolIndexRef.current = nextIdx >= poolRef.current.length ? 0 : nextIdx;
    prepareWord(poolRef.current[poolIndexRef.current]);
  };

  // 3. Timer Logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isGameStarted && timeLeft > 0 && !showResultModal && !isPaused) {
      timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && isGameStarted && !isGameOver) {
      handleWrongAttempt(true); // Hết giờ = mất 1 mạng + đổi từ
    }
    return () => clearInterval(timer);
  }, [isGameStarted, timeLeft, showResultModal, isPaused]);

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

  const handleWrongAttempt = (shouldSkip: boolean) => {
    sfxWrong.current.stop().play();
    triggerShake();
    
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      endGame();
    } else {
      if (shouldSkip) loadNextWord();
      else prepareWord(currentWord);
    }
  };

  const endGame = () => {
    if (bgMusic.current) bgMusic.current.stop();
    sfxFail.current.play();
    setIsGameOver(true);
    if (user?.uid) updateHighScore(user.uid, 'scramble', scoreRef.current);
    setShowResultModal(true);
  };

  const handleLetterPress = (char: string, index: number) => {
    if (usedIndices.includes(index)) return;

    const newAnswer = [...userAnswer, char];
    const newUsedIndices = [...usedIndices, index];
    
    setUserAnswer(newAnswer);
    setUsedIndices(newUsedIndices);

    const target = currentWord.word.toUpperCase();
    if (newAnswer.join('') === target) {
      sfxCorrect.current.stop().play();
      const newScore = score + POINTS_PER_WORD;
      setScore(newScore); 
      scoreRef.current = newScore;
      setWordsCleared(w => w + 1);
      setTimeout(loadNextWord, 500);
    } else if (newAnswer.length === target.length) {
      setTimeout(() => handleWrongAttempt(false), 300);
    }
  };

  const handleUndo = () => {
    if (userAnswer.length === 0) return;
    setUserAnswer(prev => prev.slice(0, -1));
    setUsedIndices(prev => prev.slice(0, -1)); // Hiện lại chữ cái vừa xóa ở pool
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirmExit = async () => {
    if (user?.uid) await updateHighScore(user.uid, 'scramble', scoreRef.current);
    if (bgMusic.current) bgMusic.current.stop();
    setShowExitModal(false);
    if (pendingAction) navigation.dispatch(pendingAction);
  };

  if (!currentWord) return <ActivityIndicator style={{flex:1}} color={Colors.primary} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. START OVERLAY */}
      {!isGameStarted && (
        <GameStart title="Word Scramble" icon="shuffle" onStart={startGame} />
      )}
      
      {/* 2. MODALS */}
      <GameExitModal 
        visible={showExitModal} 
        score={score} 
        onCancel={() => { setShowExitModal(false); setIsPaused(false); }} 
        onConfirm={handleConfirmExit} 
      />
      
      <GameResult 
        visible={showResultModal} 
        score={score} 
        roundsWon={wordsCleared} 
        onRestart={() => navigation.replace('WordScrambleGame')} 
        onExit={() => navigation.goBack()} 
      />
      
      {/* 3. HEADER (Fixed Missing roundText) */}
      <GameHeader 
        timeLeft={timeLeft} 
        totalTime={WORD_TIME} 
        score={score} 
        lives={lives} 
        maxLives={MAX_LIVES} 
        shakeAnim={shakeAnim}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.pauseArea}>
          {/* <TouchableOpacity onPress={() => setIsPaused(!isPaused)}>
              <Ionicons name={isPaused ? "play-circle" : "pause-circle"} size={30} color={Colors.secondary} />
          </TouchableOpacity> */}
        </View>

        <Animated.View style={[styles.gameArea, { transform: [{ translateX: shakeAnim }, { translateY: slideAnim }] }]}>
          <Text style={styles.hintLabel}>DEFINITION</Text>
          <Text style={styles.definition}>{currentWord.definition}</Text>

          {/* Ô TRẢ LỜI */}
          <View style={styles.answerRow}>
            {currentWord.word.split('').map((char: string, i: number) => (
              <View key={i} style={[styles.answerBox, userAnswer[i] && { borderBottomColor: '#FFB7C5' }]}>
                <Text style={styles.answerChar}>{userAnswer[i] || ''}</Text>
              </View>
            ))}
          </View>

          {/* BONG BÓNG CHỮ CÁI (Đứng yên nhờ Opacity) */}
          <View style={styles.letterPool}>
            {shuffledLetters.map((char, index) => {
              const isUsed = usedIndices.includes(index);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.letterBubble, isUsed && { opacity: 0 }]} 
                  onPress={() => handleLetterPress(char, index)} 
                  disabled={isUsed || isPaused}
                  activeOpacity={0.7}
                >
                  <Text style={styles.letterText}>{char}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CÁC NÚT HÀNH ĐỘNG */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleUndo} disabled={userAnswer.length === 0}>
              <Ionicons name="backspace-outline" size={20} color={userAnswer.length === 0 ? "#CCC" : "#AAA"} />
              <Text style={[styles.actionText, userAnswer.length === 0 && {color: '#CCC'}]}>Xóa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleWrongAttempt(true)}>
              <Ionicons name="play-forward-outline" size={20} color="#FF6B6B" />
              <Text style={[styles.actionText, {color: '#FF6B6B'}]}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>
          
        </Animated.View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  pauseArea: { paddingHorizontal: 20, alignItems: 'flex-end', marginTop: 10 },
  gameArea: { flex: 1, paddingHorizontal: 20, paddingTop: 10, alignItems: 'center' },
  hintLabel: { fontSize: 10, fontWeight: '900', color: '#CCC', letterSpacing: 2, marginBottom: 8 },
  definition: { fontSize: 17, color: '#4A4A4A', textAlign: 'center', lineHeight: 24, marginBottom: 30, height: 80 },
  answerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 },
  answerBox: { width: 30, height: 40, borderBottomWidth: 3, borderBottomColor: '#E0E0E0', marginHorizontal: 4, justifyContent: 'center', alignItems: 'center' },
  answerChar: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A' },
  letterPool: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: width - 40, minHeight: 120 },
  letterBubble: { width: 50, height: 50, backgroundColor: 'white', borderRadius: 25, justifyContent: 'center', alignItems: 'center', margin: 7, elevation: 5, shadowColor: '#FFB7C5', shadowOpacity: 0.3 },
  letterText: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A' },
  actionRow: { flexDirection: 'row', marginTop: 40, gap: 30 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderRadius: 15, elevation: 2 },
  actionText: { marginLeft: 8, color: '#AAA', fontWeight: '600', fontSize: 13 }
});

export default WordScrambleGame;