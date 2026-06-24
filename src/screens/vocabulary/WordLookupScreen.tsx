import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, 
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../common/constants/Colors';
import { useSpeech } from '../../hooks/use-speech.hook';

const WordDetailScreen = ({ route, navigation }: any) => {
  const { wordData } = route.params;
  const { speak } = useSpeech();

  
  const handleSave = () => {
    Alert.alert(`Đã lưu "${wordData.word}"`);
    
  };

  return (
    <SafeAreaView style={styles.container}>
   
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Tra từ điển</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.wordHeaderRow}>
          <View style={styles.wordLeft}>
            <Text style={styles.wordText}>{wordData.word}</Text>
            <Text style={styles.phoneticText}>{wordData.phonetic || ''}</Text>
          </View>

          <View style={styles.actionsRight}>
            {/* Nút Loa */}
            <TouchableOpacity 
              style={styles.actionIconBtn} 
              onPress={() => speak(wordData.word)}
            >
              <Ionicons name="volume-high" size={22} color={Colors.secondary} />
            </TouchableOpacity>

            {/* Nút Lưu  */}
            <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FFDEE9', '#FFB7C5']}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={styles.saveMiniBtn}
              >
                <Ionicons name="bookmark" size={16} color="white" />
                <Text style={styles.saveMiniText}>Lưu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nội dung định nghĩa bên dưới */}
        <View style={styles.definitionsContent}>
          {wordData.meanings.map((meaning: any, index: number) => (
            <View key={index} style={styles.meaningSection}>
              <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
              
              {meaning.definitions.map((def: any, idx: number) => (
                <View key={idx} style={styles.definitionItem}>
                  <View style={styles.bullet} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.defText}>{def.definition}</Text>
                    {def.example && (
                      <Text style={styles.exampleText}>Example: {def.example}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  topNav: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 15, backgroundColor: 'white' 
  },
  navTitle: { fontSize: 16, fontWeight: '600', color: '#999' },
  
  // STYLE HÀNG NGANG MỚI
  wordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    margin: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  wordLeft: {
    // flexDirection: 'row',
    // alignItems: 'baseline', // Giúp từ và phiên âm nằm trên một đường thẳng chân chữ
    // flex: 1,
    flex: 1,
  justifyContent: 'center',
  },
  wordText: {
    fontSize: 22, // Nhỉnh hơn chữ bình thường một chút
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  phoneticText: {
    fontSize: 14,
    color: Colors.secondary || '#FFB7C5',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF5F7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saveMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  saveMiniText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 5,
  },

  // Styles nội dung
  definitionsContent: { paddingHorizontal: 20 },
  meaningSection: { marginBottom: 25 },
  partOfSpeech: { 
    fontSize: 12, fontWeight: '800', color: Colors.secondary, 
    backgroundColor: '#FFF0F3', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 15,
    textTransform: 'uppercase'
  },
  definitionItem: { flexDirection: 'row', marginBottom: 20 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD1DC', marginTop: 8, marginRight: 12 },
  defText: { fontSize: 16, color: '#4A4A4A', lineHeight: 24 },
  exampleText: { fontSize: 14, color: '#999', marginTop: 8, fontStyle: 'italic' },
});

export default WordDetailScreen;