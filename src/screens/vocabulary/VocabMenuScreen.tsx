import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  ScrollView, TextInput, ActivityIndicator, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { VOCAB_ROUTES } from '../../configs/enums/main-route.enum';
import { useDebounce } from '../../hooks/use-debounce.hook';
import { DictaionaryService } from '../../features/dictionary/dictionary.service';
import WordModal from '../../common/components/WordModal';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

const VocabMenuScreen = ({ navigation }: any) => {

  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedSearchTerm = useDebounce(keyword, 300);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const menuItems = [
    { title: 'Từ vựng đã lưu', icon: 'heart', route: VOCAB_ROUTES.SAVED_LIST, desc: 'Kho từ cá nhân' },
    { title: 'Từ vựng TOEIC', icon: 'school', route: VOCAB_ROUTES.TOEIC_LIST, desc: '600 từ căn bản' },
    { title: 'Từ vựng IELTS', icon: 'book', route: VOCAB_ROUTES.IELTS_LIST, desc: 'Academic vocabulary' },
  ];

  // Logic Gợi ý từ
  useEffect(() => {
    if (debouncedSearchTerm.length > 1) {
      DictaionaryService.getSuggestions(debouncedSearchTerm).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  // Logic Tra từ
  const handleTranslate = async (wordToSearch?: string) => {
    const targetWord = wordToSearch || keyword;
    if (!targetWord.trim()) return;

    setIsSearching(true);
  try {
    const res = await DictaionaryService.getDefinition(targetWord.trim());
    
    navigation.navigate(VOCAB_ROUTES.WORD_DETAIL, { wordData: res });
    
    setKeyword(''); 
    setSuggestions([]);
  } catch (error) {
    Alert.alert("Không tìm thấy từ này");
  } finally {
    setIsSearching(false);
  }
  };

  const VocabMenuItem = ({ icon, title, desc, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={24} color={Colors.secondary} />
        </View>
        <View>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuDesc}>{desc}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* --- HEADER & SEARCH AREA --- */}
          <View style={styles.header}>
            
            
            <View style={styles.searchWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="search-outline" size={20} color="#BBB" style={{ marginLeft: 15 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nhập từ cần tra"
                  placeholderTextColor="#BBB"
                  value={keyword}
                  onChangeText={setKeyword}
                  onSubmitEditing={() => handleTranslate()}
                />
              </View>
              <TouchableOpacity onPress={() => handleTranslate()}>
                <LinearGradient 
                  colors={['#FFDEE9', '#FFB7C5']} 
                  style={styles.searchBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.searchBtnText}>Dịch</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Dropdown Gợi ý */}
            {suggestions.length > 0 && (
              <View style={styles.suggestionBox}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionItem}
                    onPress={() => {
                      setKeyword(item.word);
                      handleTranslate(item.word);
                    }}
                  >
                    <Ionicons name="return-down-forward-outline" size={16} color={Colors.primary} />
                    <Text style={styles.suggestionText}>{item.word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>BỘ TỪ VỰNG</Text>
            {menuItems.map((item, index) => (
              <VocabMenuItem
                key={index}
                title={item.title}
                desc={item.desc}
                icon={item.icon}
                onPress={() => navigation.navigate(item.route)}
              />
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* <WordModal
          bottomSheetRef={bottomSheetRef}
          wordData={searchResult}
          isLoading={isSearching}
          onSave={() => Alert.alert("Đã lưu từ vựng!")}
        /> */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  header: { 
    padding: 25, 
    backgroundColor: 'white', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 5, shadowColor: '#FFB7C5', shadowOpacity: 0.1,
    zIndex: 10
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#4A4A4A', marginBottom: 20 },
  
  searchWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F8F8F8', borderRadius: 20, borderWidth: 1, borderColor: '#FEE'
  },
  searchInput: { flex: 1, height: 50, paddingHorizontal: 10, color: '#4A4A4A' },
  searchBtn: { paddingHorizontal: 20, height: 50, borderRadius: 20, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: 'bold' },

  suggestionBox: {
    backgroundColor: 'white', borderRadius: 20, marginTop: 5, padding: 5,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.1,
    position: 'absolute', top: 130, left: 25, right: 25,
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#F5F5F5' },
  suggestionText: { marginLeft: 10, color: '#666' },

  // Styles giống AccountScreen
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#DDD', marginLeft: 15, marginBottom: 15, letterSpacing: 1 },
  menuItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: 'white', padding: 18, borderRadius: 25, marginBottom: 15,
    elevation: 4, shadowColor: '#FFB7C5', shadowOpacity: 0.15, shadowRadius: 8
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { 
    width: 45, height: 45, backgroundColor: '#FFF5F7', borderRadius: 15, 
    justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  menuTitle: { fontSize: 16, color: '#4A4A4A', fontWeight: 'bold' },
  menuDesc: { fontSize: 12, color: '#AAA', marginTop: 2 },
});

export default VocabMenuScreen;