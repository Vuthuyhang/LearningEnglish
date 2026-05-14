import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Colors } from '../../common/constants/Colors';
import { useVocabularyStore } from '../../features/vocabulary/vocab.store';
import { useAuthStore } from '../../features/auth/auth.store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IVocabulary } from '../../features/vocabulary/vocab.model';
import Toast from 'react-native-toast-message';
import { useSpeech } from '../../hooks/use-speech.hook';


const SavedWordScreen = ({navigation}: any) => {
  const { user } = useAuthStore();
  const { vocabList, isLoading, fetchVocab, removeWord } = useVocabularyStore();
  const { speak } = useSpeech();

  useEffect(() => {
    if (user?.uid) fetchVocab(user.uid);
  }, [user, fetchVocab]);

  const onRefresh = useCallback(() => { //Lam moi danh sach
    if (user?.uid) fetchVocab(user.uid);
  }, [user, fetchVocab]);

  const handleDelete = (word: string) => {
    Alert.alert("Xóa từ", `Bạn có chắc muốn xóa "${word}" không?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", 
        style: "destructive", 
        onPress: async () => {
          if(user?.uid) {
            await removeWord(user.uid, word);
            Toast.show({ type: 'success', text1: 'Đã xóa từ' });
            onRefresh();
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: IVocabulary }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.wordHeader}>
          <Text style={styles.wordText}>{item.word}</Text>
          <Text style={styles.phoneticText}>{item.phonetic || '/.../'}</Text>
        </View>
        <Text style={styles.definitionText} numberOfLines={3}>
          {item.definition}
        </Text>
        <TouchableOpacity onPress={() => speak(item.word)}>
          <Ionicons name="volume-medium" size={26} color={Colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDelete(item.word)}
      >
        <Ionicons name="trash-outline" size={22} color={Colors.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Saved Words</Text>
      </View> */}

      {isLoading && vocabList.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={vocabList}
          keyExtractor={(item) => item.word}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={80} color="#FFDEE9" />
              <Text style={styles.emptyText}>
                Kho từ đang trống.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 10,
  },
  listPadding: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FFB7C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardContent: { flex: 1 },
  wordHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  wordText: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  phoneticText: { fontSize: 14, color: Colors.secondary, marginLeft: 10, fontStyle: 'italic' },
  definitionText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  deleteBtn: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF0F3',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 14, color: Colors.text },
  emptyContainer: {  alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 20, fontSize: 16, color: Colors.text, textAlign: 'center', lineHeight: 24, paddingHorizontal: 40 },
});

export default SavedWordScreen;