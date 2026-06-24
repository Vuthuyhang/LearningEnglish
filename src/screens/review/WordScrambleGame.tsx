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
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const WORD_TIME = 45;   
const MAX_LIVES = 3;
const POINTS_PER_WORD = 10;

Sound.setCategory('Playback');

const WordScrambleGame = ({ navigation }: any) => {
  const { vocabList } = useVocabularyStore();
  const { user } = useAuthStore();
  const { updateHighScore } = useReviewStore();

  //States 
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false); //gợi ý hiển thị 1 số chữ cái đúng khi người chơi gặp khó khăn
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [wordsCleared, setWordsCleared] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WORD_TIME);

  const [currentWord, setCurrentWord] = useState<any>(null); 
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]); 
  const [userAnswer, setUserAnswer] = useState<(string | null)[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]); //Quản lý vị trí chữ cái đứng yên

  //ref
  const poolRef = useRef<any[]>([]);
  const poolIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const [pendingAction, setPendingAction] = useState<any>(null);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const bgMusic = useRef<Sound | null>(null);
  const sfxCorrect = useRef(new Sound('correct.mp3', Sound.MAIN_BUNDLE));
  const sfxWrong = useRef(new Sound('wrong.mp3', Sound.MAIN_BUNDLE));
  const sfxFail = useRef(new Sound('fail2.mp3', Sound.MAIN_BUNDLE));

  //Khởi tạo dữ liệu
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

  //Chặn thoát khi đang chơi
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

  //Hàm trộn chữ và reset trạng thái từ
  const prepareWord = (wordObj: any) => {
    if (!wordObj) return;
    setCurrentWord(wordObj);
    const wordLength = wordObj.word.length;
    setUserAnswer(new Array(wordLength).fill(null)); 
    const letters = wordObj.word.toUpperCase().split('');
    setShuffledLetters([...letters].sort(() => 0.5 - Math.random()));
    
    setUsedIndices([]); // Reset vị trí tàng hình
    setShowAnswer(false);
    setShowHint(false);
    setTimeLeft(WORD_TIME);
    
    slideAnim.setValue(50);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80 }).start();
  };

  const loadNextWord = () => {
    const nextIdx = poolIndexRef.current + 1;
    poolIndexRef.current = nextIdx >= poolRef.current.length ? 0 : nextIdx;
    prepareWord(poolRef.current[poolIndexRef.current]);
  };

  //Timer Logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isGameStarted && timeLeft > 0 && !showResultModal && !isPaused) {
      timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && isGameStarted && !isGameOver) {
      handleWrongAttempt(true); //Hết giờ cũng tính là sai và chuyển sang từ tiếp theo

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

  const handleHint = () => {
    if (showHint || showAnswer || isPaused || isGameOver) return;
    
    //sfxHint.current.play();
    const targetWord = currentWord.word.toUpperCase();
    
    const numToReveal = targetWord.length < 6 ? 1 : 2;
    //muốn là các chữ cái ngẫu nhiên chứ không phải theo thứ tự thì phải làm pool ảo để track chữ nào đã reveal rồi
    
    
    let tempAnswer = [...userAnswer];
    let tempUsedIndices = [...usedIndices];
    //tìm tất cả các index mà người dùng chưa điền
    let emptyPositions: number[] = [];
    tempAnswer.forEach((val, index) => {
      if (val === null) {
        emptyPositions.push(index);
      }
    });
    if(emptyPositions.length === 0) return;

    //xáo trộn các vị trí trống để gợi ý ngẫu nhiên
    const randomPositions = emptyPositions.sort(() => 0.5 - Math.random());
    
    //lấy ra số lượng vị trí muốn gợi ý
    const positionsToFill = randomPositions.slice(0, numToReveal);
    
    //với mỗi vị trí ngẫu nhiên được chọn, điền chữ cái đúng vào
    positionsToFill.forEach(pos => {
      const correctChar = targetWord[pos];
      // Tìm chữ cái correctChar trong pool mà chưa bị used
      const charIndexInPool = shuffledLetters.findIndex((char, idx) => 
          char === correctChar && !tempUsedIndices.includes(idx)
      );
      if (charIndexInPool !== -1) {
          tempAnswer[pos] = correctChar;
          tempUsedIndices.push(charIndexInPool);
      }
    });
   
    setUserAnswer(tempAnswer);
    setUsedIndices(tempUsedIndices);
    setShowHint(true); // Đánh dấu đã dùng hint cho từ này

    //Kiểm tra xem hint xong có thắng luôn không
    if (tempAnswer.join('') === targetWord) {
        setScore(score + POINTS_PER_WORD); 
        setWordsCleared(wordsCleared + 1); 
        setTimeout(loadNextWord, 800);
    }
  };
  const handleWrongAttempt = (shouldSkip: boolean) => {
    sfxWrong.current.stop().play();
    triggerShake();
    
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0 || shouldSkip) {
      setShowAnswer(true);
      
      setTimeout(() => {
        if (newLives <= 0) {
          endGame();
        } else {
          loadNextWord();
        }
      }, 2500); 
    } else {
      prepareWord(currentWord);
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
  // 1. Chặn bấm nếu chữ cái này đã dùng hoặc đang hiện đáp án/tạm dừng
  if (usedIndices.includes(index) || showAnswer || isPaused) return;

  // 2. Tạo bản sao của câu trả lời hiện tại
  let tempAnswer = [...userAnswer];

  // 3. TÌM VỊ TRÍ TRỐNG (null) ĐẦU TIÊN TỪ TRÁI SANG PHẢI
  const firstEmptyIndex = tempAnswer.indexOf(null);

  // 4. Nếu còn ô trống thì mới thực hiện điền
  if (firstEmptyIndex !== -1) {
    tempAnswer[firstEmptyIndex] = char; // Điền chữ vào ô trống đó
    
    const newUsedIndices = [...usedIndices, index]; // Đánh dấu index trong pool đã dùng

    setUserAnswer(tempAnswer);
    setUsedIndices(newUsedIndices);

    const target = currentWord.word.toUpperCase();

    // 5. KIỂM TRA KHI ĐÃ ĐIỀN HẾT TẤT CẢ CÁC Ô (Không còn giá trị null)
    if (!tempAnswer.includes(null)) {
      if (tempAnswer.join('') === target) {
        // --- ĐÚNG ---
        sfxCorrect.current.stop().play();
        const newScore = score + POINTS_PER_WORD;
        setScore(newScore);
        scoreRef.current = newScore;
        setWordsCleared(w => w + 1);
        
        // Đợi một chút rồi sang từ mới
        setTimeout(loadNextWord, 800);
      } else {
        // --- SAI (Điền hết nhưng không khớp) ---
        // handleWrongAttempt sẽ trừ mạng và hiện đáp án hoặc trộn lại
        setTimeout(() => handleWrongAttempt(false), 300);
      }
    }
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
     
      {!isGameStarted && (
        <GameStart title="Word Scramble" icon="shuffle" onStart={startGame} />
      )}
      
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
      
      <GameHeader 
        timeLeft={timeLeft} 
        totalTime={WORD_TIME} 
        score={score} 
        lives={lives} 
        maxLives={MAX_LIVES} 
        shakeAnim={shakeAnim}
      />
      <View style={styles.topActions}>
        <TouchableOpacity 
         style={[styles.hintBtn, showHint && { opacity: 0.5 }]}
         onPress={handleHint}
         disabled={showHint || showAnswer}
        >
          <Ionicons name="bulb" size={24} color={showHint ? "#CCC" : "#FFB74D"} />
          <Text style={[styles.hintText, showHint && { color: "#CCC" }]}>Hint</Text>
        </TouchableOpacity>
      </View>

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
                <Text style={[
                  styles.answerChar,
                  showAnswer && { color: '#FF6B6B' }
                ]}>
                  {showAnswer ? char.toUpperCase() : (userAnswer[i] || '')}
                </Text>
              </View>
            ))}
          </View>

       
          {!showAnswer && (
            <View style={styles.letterPool}>
              {shuffledLetters.map((char, index) => {
                const isUsed = usedIndices.includes(index);
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.letterBubble, isUsed && { opacity: 0 }]} 
                    onPress={() => handleLetterPress(char, index)} 
                    disabled={isUsed || isPaused || showAnswer}
                  >
                    <Text style={styles.letterText}>{char}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}


       
          {showAnswer && (
            <View style={styles.revealedBox}>
               <Text style={styles.revealedNote}>Đáp án: {currentWord.word.toUpperCase()} </Text>
            </View>
          )}

          {!showAnswer && (
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
          )}
          
        </Animated.View>
        <View style={{height: 100}}/>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  topActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginTop: 15 },
  hintBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, elevation: 2 },
  hintText: { marginLeft: 5, fontWeight: 'bold', color: '#FFB74D', fontSize: 13 },
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
  actionText: { marginLeft: 8, color: '#AAA', fontWeight: '600', fontSize: 13 },
  revealedBox: { marginTop: 20, padding: 15, backgroundColor: '#FFF0F3', borderRadius: 15 },
  revealedNote: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 18, fontStyle: 'italic' }
});

export default WordScrambleGame;
