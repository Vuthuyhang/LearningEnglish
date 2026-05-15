import React, {useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { REVIEW_ROUTES } from '../../configs/enums/main-route.enum';
import { useReviewStore } from '../../features/review/review.store';
import { useAuthStore } from '../../features/auth/auth.store';

const ReviewMenuScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
const { highScores, fetchHighScores } = useReviewStore();

  useEffect(() => {
    if (user?.uid) {
      fetchHighScores(user.uid);
    }
  }, [user?.uid, fetchHighScores]);

  const games = [
    {
      id: 'match',
      title: 'Word Match',
      score: '1,500',
      icon: 'extension-puzzle',
      color: '#FFD1DC',
      route: REVIEW_ROUTES.GAME_MATCH,
    },
    {
      id: 'scramble',
      title: 'Word Scramble',
      score: '1,200',
      icon: 'shuffle',
      color: '#C2E9FB',
      route: REVIEW_ROUTES.GAME_SCRAMBLE,
    },
    {
      id: 'quiz',
      title: 'Vocabulary Quiz',
      score: '591',
      icon: 'list',
      color: '#D4F0F0',
      route: null,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}> </Text>
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {games.map((game) => (
          <View key={game.id} style={styles.gameCard}>
            {/* Khối Icon bên trái */}
            <View style={[styles.iconContainer, { backgroundColor: game.color }]}>
              <Ionicons name={game.icon} size={35} color="white" />
            </View>

            {/* Thông tin ở giữa */}
            <View style={styles.infoContainer}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.highScore}>
                High-score: {(highScores[game.id] || 0).toLocaleString()}
              </Text>
              <View style={styles.badgeRow}>
                 <View style={styles.coinBadge}><Text style={styles.badgeText}>H</Text></View>
                 <Text style={styles.pointsText}>25</Text>
              </View>
            </View>

            {/* Nút chơi ngay bên phải */}
            <TouchableOpacity 
              style={styles.playBtn}
              onPress={() => game.route && navigation.navigate(game.route)}
            >
              <Text style={styles.playBtnText}>Chơi ngay</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#4A4A4A', padding: 25 },
  scrollPadding: { paddingHorizontal: 20 },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconContainer: { width: 80, height: 80, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1, marginLeft: 15 },
  gameTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A4A4A' },
  highScore: { fontSize: 13, color: '#999', marginVertical: 3 },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  coinBadge: { backgroundColor: '#FFB74D', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  pointsText: { fontSize: 12, color: '#FFB74D', marginLeft: 5, fontWeight: '600' },
  playBtn: { backgroundColor: Colors.secondary || '#FFB7C5', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12 },
  playBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
});

export default ReviewMenuScreen;