import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  SafeAreaView, ScrollView, Dimensions, ActivityIndicator, Modal
} from 'react-native';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { useVocabularyStore } from '../../features/vocabulary/vocab.store';
import toeicData from '../../assets/data/toeic.json';
import ieltsData from '../../assets/data/ielts.json';

const { width, height } = Dimensions.get('window');
const GAME_TIME = 30; 

Sound.setCategory('Playback');

const WordMatchGame = ({ navigation }: any) => {
  const { vocabList } = useVocabularyStore();
  
  // States quản lý trạng thái Game
  const [isGameStarted, setIsGameStarted] = useState(false); // Trạng thái bắt đầu
  const [gamePairs, setGamePairs] = useState<any[]>([]); 
  const [shuffledDefs, setShuffledDefs] = useState<any[]>([]); 
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [selectedDef, setSelectedDef] = useState<any>(null);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isGameOver, setIsGameOver] = useState(false);

  // Refs âm thanh
  const bgMusic = useRef<Sound | null>(null);
  const sfxCorrect = useRef(new Sound('correct.mp3', Sound.MAIN_BUNDLE));
  const sfxWrong = useRef(new Sound('wrong.mp3', Sound.MAIN_BUNDLE));
  const sfxFail = useRef(new Sound('fail2.mp3', Sound.MAIN_BUNDLE));
  const sfxWin = useRef(new Sound('completed.mp3', Sound.MAIN_BUNDLE));

  // 1. Chuẩn bị dữ liệu khi vào màn hình
  useEffect(() => {
    const allAvailable = [
      ...vocabList.map(i => ({ ...i, source: 'Personal' })),
      ...(toeicData as any[]).map(i => ({ ...i, source: 'TOEIC' })),
      ...(ieltsData as any[]).map(i => ({ ...i, source: 'IELTS' })),
    ];

    if (allAvailable.length < 5) {
      Alert.alert("Opps! 🌸", "Cần ít nhất 5 từ vựng để chơi. Hãy lưu thêm từ nhé!");
      navigation.goBack();
      return;
    }

    const selected = allAvailable.sort(() => 0.5 - Math.random()).slice(0, 6);
    setGamePairs(selected);
    setShuffledDefs([...selected].sort(() => 0.5 - Math.random()));

    // Cleanup khi thoát
    return () => {
      if (bgMusic.current) {
        bgMusic.current.stop();    // Dừng trước
        bgMusic.current.release(); // Giải phóng sau, không viết dính vào nhau
     }
      sfxCorrect.current.release();
      sfxWrong.current.release();
      sfxFail.current.release();
      sfxWin.current.release();
    };
  }, []);

  // 2. Logic bắt đầu Game (Khi bấm nút Start)
  const startGame = () => {
    setIsGameStarted(true);
    // Chỉ phát nhạc sau khi nhấn Start
    bgMusic.current = new Sound('playing.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (!error) {
        bgMusic.current?.setNumberOfLoops(-1);
        bgMusic.current?.setVolume(0.3);
        bgMusic.current?.play();
      }
    });
  };

  // 3. Bộ đếm thời gian (Chỉ chạy khi đã Start)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isGameStarted && timeLeft > 0 && !isGameOver && matchedWords.length < gamePairs.length) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isGameStarted && timeLeft === 0 && !isGameOver) {
      bgMusic.current?.stop();
      sfxFail.current.play();
      handleEndGame(false);
    }
    return () => clearInterval(timer);
  }, [isGameStarted, timeLeft, isGameOver, matchedWords.length]);

  // 4. Kiểm tra nối từ
  useEffect(() => {
    if (selectedWord && selectedDef) {
      if (selectedWord.word === selectedDef.word) {
        sfxCorrect.current.play();
        setMatchedWords(prev => [...prev, selectedWord.word]);
        setSelectedWord(null);
        setSelectedDef(null);
        if (matchedWords.length + 1 === gamePairs.length) {
          bgMusic.current?.stop();
          sfxWin.current.play();
          handleEndGame(true);
        }
      } else {
        sfxWrong.current.play();
        setWrongPair([selectedWord.word, selectedDef.word]);
        setTimeout(() => {
          setWrongPair([]);
          setSelectedWord(null);
          setSelectedDef(null);
        }, 500);
      }
    }
  }, [selectedWord, selectedDef]);

  const handleEndGame = (isWin: boolean) => {
    setIsGameOver(true);
    Alert.alert(
      isWin ? "Thắng cuộc! 🎉" : "Hết giờ! ⏰",
      isWin ? `Tuyệt vời! Bạn còn dư ${timeLeft}s.` : "Thử lại ván khác nhé!",
      [{ text: "Chơi lại", onPress: () => navigation.replace('WordMatchGame') },
       { text: "Thoát", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MÀN HÌNH CHỜ (START SCREEN) */}
      {!isGameStarted && (
        <View style={styles.overlay}>
          <View style={styles.startCard}>
            <Ionicons name="extension-puzzle" size={80} color={Colors.primary} />
            <Text style={styles.startTitle}>Sẵn sàng chưa? ✨</Text>
            <Text style={styles.startSub}>Nối 6 cặp từ trong 60 giây để chiến thắng.</Text>
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Text style={styles.startBtnText}>BẮT ĐẦU CHƠI</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* HEADER & TIMER */}
      <View style={styles.headerCard}>
        <View style={styles.timerRow}>
          <Ionicons name="alarm-outline" size={24} color={timeLeft < 10 ? '#FF6B6B' : Colors.secondary} />
          <Text style={[styles.timerText, timeLeft < 10 && { color: '#FF6B6B' }]}>{timeLeft}s</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${(timeLeft / GAME_TIME) * 100}%`, backgroundColor: timeLeft < 10 ? '#FF6B6B' : '#FFD1DC' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.board} showsVerticalScrollIndicator={false}>
        <View style={styles.columns}>
          {/* CỘT TỪ */}
          <View style={styles.column}>
            <Text style={styles.colLabel}>ENGLISH</Text>
            {gamePairs.map((item, idx) => {
              const isMatched = matchedWords.includes(item.word);
              const isSelected = selectedWord?.word === item.word;
              const isWrong = wrongPair.includes(item.word) && selectedWord?.word === item.word;
              return (
                <TouchableOpacity
                  key={`w-${idx}`}
                  disabled={isMatched || isGameOver || !isGameStarted}
                  onPress={() => setSelectedWord(item)}
                  style={[styles.card, isSelected && styles.selectedCard, isMatched && styles.matchedCard, isWrong && styles.wrongCard]}
                >
                  <Text style={[styles.wordText, isMatched && styles.matchedText]}>{item.word}</Text>
                  {!isMatched && <View style={styles.tag}><Text style={styles.tagText}>{item.source}</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CỘT NGHĨA */}
          <View style={styles.column}>
            <Text style={styles.colLabel}>MEANING</Text>
            {shuffledDefs.map((item, idx) => {
              const isMatched = matchedWords.includes(item.word);
              const isSelected = selectedDef?.word === item.word;
              const isWrong = wrongPair.includes(item.word) && selectedDef?.word === item.word;
              return (
                <TouchableOpacity
                  key={`d-${idx}`}
                  disabled={isMatched || isGameOver || !isGameStarted}
                  onPress={() => setSelectedDef(item)}
                  style={[styles.card, styles.defCard, isSelected && styles.selectedCard, isMatched && styles.matchedCard, isWrong && styles.wrongCard]}
                >
                  <Text style={[styles.defText, isMatched && styles.matchedText]} numberOfLines={4}>
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
  // Start Screen styles
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 245, 247, 0.95)', zIndex: 10, justifyContent: 'center', alignItems: 'center' },
  startCard: { width: width * 0.85, backgroundColor: 'white', padding: 40, borderRadius: 30, alignItems: 'center', elevation: 10, shadowColor: '#FFB7C5', shadowOpacity: 0.3, shadowRadius: 15 },
  startTitle: { fontSize: 26, fontWeight: 'bold', color: '#4A4A4A', marginTop: 20 },
  startSub: { textAlign: 'center', color: '#9E9E9E', marginTop: 10, lineHeight: 20 },
  startBtn: { backgroundColor: '#FFB7C5', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 20, marginTop: 30 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  headerCard: { padding: 20, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#FFB7C5', shadowOpacity: 0.1 },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  timerText: { fontSize: 24, fontWeight: 'bold', marginLeft: 8, color: '#4A4A4A' },
  progressContainer: { height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%' },
  board: { padding: 15, paddingTop: 20 },
  columns: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: '48%' },
  colLabel: { textAlign: 'center', fontSize: 11, fontWeight: '900', color: '#BBB', marginBottom: 15, letterSpacing: 1.5 },
  card: { backgroundColor: 'white', height: 100, borderRadius: 22, padding: 10, marginBottom: 15, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#FFB7C5', shadowOpacity: 0.2, borderWidth: 2, borderColor: 'transparent' },
  defCard: { paddingHorizontal: 6 },
  
  // TRẠNG THÁI MÀU SẮC MỚI
  selectedCard: { borderColor: '#FFB7C5', backgroundColor: '#FFF0F3' },
  matchedCard: { backgroundColor: '#E2F5E1', borderColor: '#A8D5BA', elevation: 0 }, // Xanh lá Pastel
  wrongCard: { backgroundColor: '#FFE5E5', borderColor: '#FFB3B3' },
  
  wordText: { fontSize: 17, fontWeight: 'bold', color: '#4A4A4A', textAlign: 'center' },
  defText: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 16 },
  matchedText: { color: '#2D5A27', fontWeight: 'bold' }, // Chữ xanh đậm, không gạch
  
  tag: { position: 'absolute', top: 6, right: 8, backgroundColor: '#FFF5F7', paddingHorizontal: 6, borderRadius: 5, borderWidth: 0.5, borderColor: '#FFDEE9' },
  tagText: { fontSize: 8, color: '#FFB7C5', fontWeight: 'bold' },
});

export default WordMatchGame;