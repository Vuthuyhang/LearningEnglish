import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Dimensions, Animated, ActivityIndicator, ScrollView
} from 'react-native';
import Sound from 'react-native-sound';
import { Colors } from '../../common/constants/Colors';
import { useVocabularyStore } from '../../features/vocabulary/vocab.store';
import { useAuthStore } from '../../features/auth/auth.store';
import { useReviewStore } from '../../features/review/review.store';
import toeicData from '../../assets/data/toeic.json';
import ieltsData from '../../assets/data/ielts.json';
import LinearGradient from 'react-native-linear-gradient';

// --- IMPORT COMMON COMPONENTS ---
import GameHeader from './components/gameheader';
import GameStart from './components/gamestart';
import GameExitModal from './components/gameexist';
import GameResult from './components/gameresult';

const { width } = Dimensions.get('window');
const QUESTION_TIME = 15; // 15 giây mỗi câu
const MAX_LIVES = 3;

const VocabularyQuizGame = ({ navigation }: any) => {
  const { vocabList } = useVocabularyStore();
  const { user } = useAuthStore();
  const { updateHighScore } = useReviewStore();

  // ─── States ───
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctOption, setCorrectOption] = useState<string | null>(null);

  // ─── Refs & Anims ───
  const poolRef = useRef<any[]>([]);
  const scoreRef = useRef(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [pendingAction, setPendingAction] = useState<any>(null);

  // ─── Sound Refs ───
  const bgMusic = useRef<Sound | null>(null);
  const sfxCorrect = useRef(new Sound('correct.mp3', Sound.MAIN_BUNDLE));
  const sfxWrong = useRef(new Sound('wrong.mp3', Sound.MAIN_BUNDLE));
  const sfxFail = useRef(new Sound('fail2.mp3', Sound.MAIN_BUNDLE));

  // 1. Khởi tạo dữ liệu
  useEffect(() => {
    const data = [
      ...vocabList.map(i => ({ ...i, source: 'Personal' })),
      ...(toeicData as any[]).map(i => ({ ...i, source: 'TOEIC' })),
      ...(ieltsData as any[]).map(i => ({ ...i, source: 'IELTS' })),
    ].sort(() => 0.5 - Math.random());

    poolRef.current = data;
    generateQuestion(0);

    return () => {
      if (bgMusic.current) { bgMusic.current.stop().release(); }
      sfxCorrect.current.release();
      sfxWrong.current.release();
      sfxFail.current.release();
    };
  }, []);

  // 2. Logic tạo câu hỏi trắc nghiệm
  const generateQuestion = (index: number) => {
    if (index >= poolRef.current.length) {
      // Nếu hết từ thì xáo lại từ đầu
      poolRef.current = [...poolRef.current].sort(() => 0.5 - Math.random());
      index = 0;
    }

    const correctWord = poolRef.current[index];
    
    // Tạo 3 đáp án sai ngẫu nhiên
    const distractors = poolRef.current
      .filter(item => item.word !== correctWord.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // Trộn đáp án đúng vào 3 đáp án sai
    const allOptions = [...distractors, correctWord].sort(() => 0.5 - Math.random());

    setCurrentQuestion(correctWord);
    setOptions(allOptions);
    setSelectedOption(null);
    setCorrectOption(null);
    setTimeLeft(QUESTION_TIME);
  };
  //logic chặn thoát
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Nếu game đã kết thúc hoặc chưa bắt đầu, cho phép thoát thẳng
      if (isGameOver || !isGameStarted) return;

      // Chặn hành động thoát
      e.preventDefault();
      setIsPaused(true); // Dừng đồng hồ
      setPendingAction(e.data.action);
      setShowExitModal(true); // Hiện Modal xác nhận
    });

    return unsubscribe;
  }, [navigation, isGameOver, isGameStarted]);

  // 3. Timer Logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isGameStarted && timeLeft > 0 && !showResultModal && !isPaused && !correctOption) {
      timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && isGameStarted && !correctOption) {
      handleAnswer(null); // Hết giờ tính là sai
    }
    return () => clearInterval(timer);
  }, [isGameStarted, timeLeft, showResultModal, isPaused, correctOption]);

  const startGame = () => {
    setIsGameStarted(true);
    bgMusic.current = new Sound('playing.mp3', Sound.MAIN_BUNDLE, (e) => {
      if (!e) {
        bgMusic.current?.setNumberOfLoops(-1).setVolume(0.3).play();
      }
    });
  };

  const handleAnswer = (optionWord: string | null) => {
    if (selectedOption || isGameOver) return;

    setSelectedOption(optionWord || "TIMEOUT");
    setCorrectOption(currentQuestion.word);

    if (optionWord === currentQuestion.word) {
      // ĐÚNG
      sfxCorrect.current.stop().play();
      const newScore = score + 10;
      setScore(newScore);
      scoreRef.current = newScore;
      
      setTimeout(() => {
        setQuestionCount(prev => prev + 1);
        generateQuestion(questionCount + 1);
      }, 1000);
    } else {
      // SAI
      sfxWrong.current.stop().play();
      triggerShake();
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setTimeout(endGame, 1000);
      } else {
        setTimeout(() => {
          setQuestionCount(prev => prev + 1);
          generateQuestion(questionCount + 1);
        }, 1500);
      }
    }
  };

  const endGame = () => {
    if (bgMusic.current) bgMusic.current.stop();
    sfxFail.current.play();
    setIsGameOver(true);
    if (user?.uid) updateHighScore(user.uid, 'quiz', scoreRef.current);
    setShowResultModal(true);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirmExit = async () => {
    if (user?.uid) await updateHighScore(user.uid, 'quiz', scoreRef.current);
    if (bgMusic.current) bgMusic.current.stop();
    setShowExitModal(false);
    if (pendingAction) {
        navigation.dispatch(pendingAction); // Thực hiện lệnh thoát đã chặn lúc nãy
    }
  };

  if (!currentQuestion) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />;

  return (
    <SafeAreaView style={styles.container}>
      {!isGameStarted && (
        <GameStart title="Vocabulary Quiz" icon="list" onStart={startGame} />
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
        roundsWon={questionCount} 
        onRestart={() => navigation.replace('VocabularyQuizGame')} 
        onExit={() => navigation.goBack()} 
      />


      <GameHeader 
        timeLeft={timeLeft} 
        totalTime={QUESTION_TIME} 
        score={score} 
        lives={lives} 
        maxLives={MAX_LIVES} 
        shakeAnim={shakeAnim}
        
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.quizArea}>
            
            <Text style={styles.wordTitle}>{currentQuestion.word}</Text>
            <Text style={styles.phonetic}>{currentQuestion.phonetic}</Text>

            <View style={styles.optionsGrid}>
            {options.map((opt, index) => {
                const isSelected = selectedOption === opt.word;
                const isCorrect = correctOption === opt.word;
                const isWrong = isSelected && !isCorrect;

                return (
                <TouchableOpacity
                    key={index}
                    style={[
                    styles.optionBtn,
                    isCorrect && styles.correctBtn,
                    isWrong && styles.wrongBtn
                    ]}
                    onPress={() => handleAnswer(opt.word)}
                    disabled={!!selectedOption || isPaused}
                >
                    <Text style={[
                        styles.optionText,
                        (isCorrect || isWrong) && { color: 'white' }
                        ]}
                        numberOfLines={4}
                    >
                    {opt.definition}
                    </Text>
                </TouchableOpacity>
                );
            })}
            </View>
            <View style={{ height: 120 }} /> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  quizArea: { flex: 1, padding: 25, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  questionLabel: { fontSize: 10, fontWeight: '900', color: '#CCC', letterSpacing: 2, marginBottom: 15 },
  wordTitle: { fontSize: 32, fontWeight: 'bold', color: '#4A4A4A', textTransform: 'capitalize' },
  phonetic: { fontSize: 16, color: '#FFB7C5', marginTop: 5, marginBottom: 40 },
  optionsGrid: { 
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,

},
  optionBtn: {
    backgroundColor: 'white',
    width: '48%',            // Mỗi nút chiếm gần một nửa chiều rộng màn hình
    height: 120,             // Cố định chiều cao để 4 ô vuông vức bằng nhau
    borderRadius: 20,
    marginBottom: 15,        // Khoảng cách giữa hàng trên và hàng dưới
    padding: 10,
    justifyContent: 'center', // Căn giữa chữ theo chiều dọc
    alignItems: 'center',     // Căn giữa chữ theo chiều ngang
    elevation: 3,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.2,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  optionText: { fontSize: 13, color: '#666', textAlign: 'center', fontWeight: '500' },
  correctBtn: { backgroundColor: '#E2F5E1', borderColor: '#A8D5BA' },
  wrongBtn: { backgroundColor: '#FFE5E5', borderColor: '#FFB3B3' }
});

export default VocabularyQuizGame;
//ở game quiz muốn chia các đáp án thành 2 hàng, 2 cột