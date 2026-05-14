import React, { useRef, useState, useMemo, useCallback } from 'react';
import { 
  View, Text, ScrollView, Image, StyleSheet, 
  TouchableOpacity, Dimensions, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { Colors } from '../../common/constants/Colors';
import { useAuthStore } from '../../features/auth/auth.store';
import firestore from '@react-native-firebase/firestore';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSpeech } from '../../hooks/use-speech.hook';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useVocabularyStore } from '../../features/vocabulary/vocab.store';
import { DictaionaryService } from '../../features/dictionary/dictionary.service';
import SaveButton from '../../common/components/SaveButton';

const { width } = Dimensions.get('window');

const ReadingScreen = ({ route }: any) => {
  const { article } = route.params;

  const { user } = useAuthStore();
  const { fetchVocab } = useVocabularyStore();
  const { speak, isPlaying } = useSpeech();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [isDictLoading, setIsDictLoading] = useState(false);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const handleWordPress = async (word: string) => {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
    if (cleanWord.length === 0) return;

    bottomSheetRef.current?.expand();
    setIsDictLoading(true);

    try {
      const res = await DictaionaryService.getDefinition(cleanWord);
      setSelectedWord(res);
    } catch (error) {
      setSelectedWord({
        word: cleanWord,
        meanings: [{ definitions: [{ definition: 'Không tìm thấy nghĩa của từ này' }] }],
      });
    } finally {
      setIsDictLoading(false);
    }
  };

  const handleSaveWord = async () => {
    if (!selectedWord || !user) return;
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('vocabularies')
        .doc(selectedWord.word.toLowerCase())
        .set({
          word: selectedWord.word,
          phonetic: selectedWord.phonetic || '',
          definition: selectedWord.meanings[0].definitions[0].definition,
          savedAt: firestore.FieldValue.serverTimestamp(),
        });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã thêm vào kho từ vựng',
      });
      
      if (user.uid) fetchVocab(user.uid);
      bottomSheetRef.current?.close();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Thất bại',
        text2: 'Đã xảy ra lỗi khi lưu từ',
      });
    }
  };
  const renderInteractiveContent = (text: string) => {
    if (!text) return null;
    const words = text.split(/\s+/);
    return (
      <View style={styles.wordWrapper}>
        {words.map((word, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => handleWordPress(word)} 
            activeOpacity={0.5}
          >
            <Text style={styles.wordText}>{word} </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image
            source={{ uri: article.urlToImage || 'https://via.placeholder.com/400x250' }}
            style={styles.image}
          />

          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{article.title}</Text>
              <TouchableOpacity 
                style={styles.audioButton} 
                onPress={() => speak((article.description || "") + " " + (article.content || ""))}
              >
                <Ionicons 
                  name={isPlaying ? "pause-circle" : "play-circle-outline"} 
                  size={45} 
                  color={Colors.primary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{article.source.name}</Text>
              <Text style={styles.metaText}> • </Text>
              <Text style={styles.metaText}>
                {new Date(article.publishedAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.body}>
              {renderInteractiveContent(article.description || '')}
              <View style={{ height: 15 }} />
              {renderInteractiveContent(article.content?.split('[+')[0] || '')}
            </View>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={styles.modalBg}
          handleIndicatorStyle={{ backgroundColor: Colors.primary }}
        >
          <BottomSheetView style={styles.modalContent}>
            {isDictLoading ? (
              <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 30 }} />
            ) : selectedWord ? (
              <View>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.wordAudioRow}>
                       <Text style={styles.modalWord}>{selectedWord.word}</Text>
                       <TouchableOpacity 
                         style={styles.smallAudioBtn} 
                         onPress={() => speak(selectedWord.word)}
                       >
                         <Ionicons name="volume-medium" size={25} color={Colors.secondary} />
                       </TouchableOpacity>
                    </View>
                    <Text style={styles.modalPhonetic}>{selectedWord.phonetic || '/.../'}</Text>
                  </View>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWord}>
                    <Text style={styles.saveBtnText}>Lưu</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.meaningLabel}>Định nghĩa:</Text>
                  <Text style={styles.meaningText}>
                    {selectedWord.meanings?.[0]?.definitions?.[0]?.definition || "Không tìm thấy nghĩa."}
                  </Text>
                </ScrollView>
              </View>
            ) : null}
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  image: { width: width, height: 250, backgroundColor: Colors.background },
  contentContainer: { padding: 20 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, fontSize: 22, fontWeight: 'bold', color: Colors.text, lineHeight: 30 },
  audioButton: { marginLeft: 10 },
  metaRow: { flexDirection: 'row', marginBottom: 20, marginTop: 10, opacity: 0.6 },
  metaText: { fontSize: 13, color: Colors.text },
  body: { marginTop: 5 },
  wordWrapper: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  wordText: { fontSize: 19, lineHeight: 32, color: Colors.text },
  modalBg: { backgroundColor: Colors.white, borderRadius: 30, elevation: 20 },
  modalContent: { padding: 25, flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordAudioRow: { flexDirection: 'row', alignItems: 'center' },
  modalWord: { fontSize: 26, fontWeight: 'bold', color: Colors.text, textTransform: 'capitalize' },
  smallAudioBtn: { marginLeft: 10 },
  modalPhonetic: { fontSize: 16, color: Colors.secondary, marginTop: 2 },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 },
  saveBtnText: { color: Colors.text, fontWeight: 'bold', fontSize: 14 },
  modalBody: { marginTop: 20 },
  meaningLabel: { fontSize: 12, fontWeight: 'bold', color: '#BBB', marginBottom: 5, textTransform: 'uppercase' },
  meaningText: { fontSize: 17, color: Colors.text, lineHeight: 26 },
});

export default ReadingScreen;