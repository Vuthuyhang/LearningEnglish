import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../common/constants/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSpeech } from '../../hooks/use-speech.hook';
import ieltsData from '../../assets/data/ielts.json';

interface IIeltsWord{
    id: number; 
    word: string;
    phonetic: string;
    example: string;
    definition: string;
    topic: string;

}
const TOPICS = ["All", "Environment", "Education"];

const IeltsVocabScreen = () => {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const { speak } = useSpeech();

  const filteredData = useMemo(() => {
    const data = ieltsData as IIeltsWord[]; 
    if (selectedTopic === "All") return data;
    return data.filter(item => item.topic === selectedTopic);
  }, [selectedTopic]);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.word}>{item.word}</Text>
        <Text style={styles.phonetic}>{item.phonetic}</Text>
        <Text style={styles.def}>{item.definition}</Text>
      </View>
      <TouchableOpacity onPress={() => speak(item.word)}>
        <Ionicons name="volume-medium" size={26} color={Colors.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicContainer}>
          {TOPICS.map(topic => (
            <TouchableOpacity 
              key={topic} 
              style={[
                styles.topicBtn, 
                selectedTopic === topic && styles.topicBtnActive
              ]}
              onPress={() => setSelectedTopic(topic)}
            >
              <Text style={[
                styles.topicText,
                selectedTopic === topic && styles.topicTextActive
              ]}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  topicContainer: { padding: 15, backgroundColor: 'white' },
  topicBtn: { 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#FFF0F3', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFDEE9'
  },
  topicBtnActive: { backgroundColor: Colors.primary },
  topicText: { color: '#666', fontWeight: '600' },
  topicTextActive: { color: 'white' },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FFB7C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  word: { fontSize: 20, fontWeight: 'bold', color: '#4A4A4A' },
  phonetic: { color: Colors.primary, fontSize: 14, marginVertical: 4 },
  def: { color: '#666', fontSize: 15 }
});

export default IeltsVocabScreen;