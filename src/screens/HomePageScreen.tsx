import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../common/constants/Colors';
import { useAuthStore } from '../features/auth/auth.store';
import { useNewsStore } from '../features/news/news.store';
import { useVocabularyStore } from '../features/vocabulary/vocab.store';
import { MAIN_TAB_ROUTES, NEWS_ROUTES } from '../configs/enums/main-route.enum';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { articles, fetchNews } = useNewsStore();
  const { vocabList, fetchVocab } = useVocabularyStore();

  // Lấy dữ liệu mới nhất khi vào trang chủ
  useEffect(() => {
    if (user?.uid) {
      fetchNews();
      fetchVocab(user.uid);
    }
  }, []);

  // Hàm điều hướng đến bài báo
  const goToReading = (article: any) => {
    navigation.navigate(MAIN_TAB_ROUTES.NEWS_STACK, {
      screen: NEWS_ROUTES.READING,
      params: { article },
    });
  };

  const renderNewsItem = ({ item }: any) => (
    <TouchableOpacity style={styles.newsCard} onPress={() => goToReading(item)}>
      <Image source={{ uri: item.urlToImage || 'https://via.placeholder.com/150' }} style={styles.newsImage} />
      <View style={styles.newsInfo}>
        <Text style={styles.newsSource} numberOfLines={1}>{item.source.name}</Text>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.tagLabel}>
          <Text style={styles.tagText}>Báo Tiếng Anh</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={{ uri: user?.photoURL || 'https://i.pravatar.cc/100' }} 
              style={styles.avatar} 
            />
            <Text style={styles.appName}>LinguaPink</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={26} color={Colors.text} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* PROGRESS CARD */}
        <View style={styles.progressCard}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercent}>75%</Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.goalTitle}>Mục tiêu hôm nay</Text>
            <Text style={styles.goalDetail}>15/20 phút</Text>
            <Text style={styles.goalStats}>{vocabList.length} từ vựng • {articles.length > 0 ? 2 : 0} bài báo</Text>
          </View>
        </View>

        {/* TỪ VỰNG HÔM NAY (Lấy từ Vocabulary Store) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Từ Vựng Hôm Nay</Text>
          <TouchableOpacity onPress={() => navigation.navigate(MAIN_TAB_ROUTES.VOCABULARY)}>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.vocabBox}>
          {vocabList.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.vocabRow}>
              <Text style={styles.vocabWord}>{item.word}</Text>
              <Text style={styles.vocabDef} numberOfLines={1}>{item.definition}</Text>
            </View>
          ))}
          {vocabList.length === 0 && <Text style={styles.emptyText}>Chưa có từ vựng nào được lưu 🌸</Text>}
        </View>

        {/* BÁO TIẾNG ANH MỚI NHẤT (Lấy từ News Store) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Báo Tiếng Anh Mới Nhất</Text>
          <TouchableOpacity onPress={() => navigation.navigate(MAIN_TAB_ROUTES.NEWS_STACK)}>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={articles.slice(0, 5)}
          renderItem={renderNewsItem}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
        />

        {/* CHALLENGE SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Học Cùng Thách Thức</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <TouchableOpacity style={styles.challengeCard}>
           <View style={styles.challengeLeft}>
              <Text style={styles.challengeEmoji}>🔥</Text>
              <View>
                <Text style={styles.challengeName}>Ongong trò chơi</Text>
                <Text style={styles.challengeStatus}>Gamer: 3 days</Text>
              </View>
           </View>
           <View style={styles.challengeRight}>
              <Text style={styles.challengePoints}>1,250 PTS</Text>
              <Text style={styles.challengeStreak}>Streak: 8 days</Text>
           </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFDEE9',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12, borderWidth: 2, borderColor: 'white' },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#4A4A4A' },
  notifBtn: { backgroundColor: 'white', padding: 8, borderRadius: 12 },
  notifBadge: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, backgroundColor: '#FF6B6B', borderRadius: 5, borderWidth: 2, borderColor: 'white' },
  
  progressCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  progressCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 5,
    borderColor: '#FFD1DC',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: '#FF6B6B', // Giả lập progress
  },
  progressPercent: { fontWeight: 'bold', fontSize: 16, color: '#4A4A4A' },
  progressInfo: { marginLeft: 20 },
  goalTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A4A4A' },
  goalDetail: { fontSize: 15, color: '#666', marginVertical: 2 },
  goalStats: { fontSize: 12, color: '#999' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#4A4A4A' },

  vocabBox: { backgroundColor: 'white', marginHorizontal: 20, padding: 20, borderRadius: 25 },
  vocabRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  vocabWord: { width: 100, fontWeight: 'bold', color: '#4A4A4A', fontSize: 16 },
  vocabDef: { flex: 1, color: '#777' },

  newsCard: { width: 220, backgroundColor: 'white', borderRadius: 20, marginRight: 15, overflow: 'hidden', elevation: 3 },
  newsImage: { width: '100%', height: 110 },
  newsInfo: { padding: 12 },
  newsSource: { fontSize: 11, fontWeight: 'bold', color: '#AAA', marginBottom: 4 },
  newsTitle: { fontSize: 13, fontWeight: 'bold', color: '#4A4A4A', height: 35 },
  tagLabel: { backgroundColor: '#FFF0F3', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginTop: 8 },
  tagText: { fontSize: 10, color: Colors.secondary, fontWeight: 'bold' },

  challengeCard: { backgroundColor: 'white', marginHorizontal: 20, padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeLeft: { flexDirection: 'row', alignItems: 'center' },
  challengeEmoji: { fontSize: 24, marginRight: 10 },
  challengeName: { fontWeight: 'bold', color: '#4A4A4A' },
  challengeStatus: { fontSize: 12, color: '#999' },
  challengeRight: { alignItems: 'flex-end' },
  challengePoints: { fontWeight: 'bold', color: '#4A4A4A' },
  challengeStreak: { fontSize: 11, color: '#999' },
  emptyText: { textAlign: 'center', color: '#BBB', fontStyle: 'italic' }
});

export default HomeScreen;