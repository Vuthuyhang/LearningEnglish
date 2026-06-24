import React, { useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../common/constants/Colors';
import { useNewsStore } from '../../features/news/news.store';
import { GuardianArticle } from '../../features/news/news.model';
import { NEWS_ROUTES } from '../../configs/enums/main-route.enum';

const NewsFeedScreen = ({ navigation }: any) => {
  const { articles, isLoading, fetchNews, error } = useNewsStore();

  useEffect(() => {
    fetchNews();
  }, []);

  // const renderItem = ({ item }: any) => (
  //   <TouchableOpacity 
  //     style={styles.card}
  //     onPress={() => navigation.navigate(NEWS_ROUTES.READING, { article: item })}
  //   >
  //     <Image source={{ uri: item.urlToImage || 'https://via.placeholder.com/150' }} style={styles.image} />
  //     <View style={styles.cardBody}>
  //       <Text style={styles.category}>#EnglishLearning</Text>
  //       <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
  //       <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
  //       <Text style={styles.date}>{new Date(item.publishedAt).toLocaleDateString()}</Text>
  //     </View>
  //   </TouchableOpacity>
  // );
  // Trong renderItem của NewsFeedScreen.tsx
const renderItem = ({ item }: { item: GuardianArticle }) => (
  <TouchableOpacity 
    style={styles.card}
    onPress={() => navigation.navigate(NEWS_ROUTES.READING, { article: item })}
  >
    <Image 
      source={{ uri: item.fields?.thumbnail || 'https://via.placeholder.com/150' }} 
      style={styles.image} 
    />
    <View style={styles.cardBody}>
      <Text style={styles.category}>#{item.sectionName}</Text>
      <Text style={styles.title} numberOfLines={2}>{item.webTitle}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.fields?.trailText?.replace(/<[^>]*>?/gm, '')} {/* Xóa thẻ HTML nếu có */}
      </Text>
    </View>
  </TouchableOpacity>
);

  if (isLoading) {
    return (
      <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.headerTitle}>Daily News</Text> */}
      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={fetchNews}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.text, paddingHorizontal: 20, paddingTop: 20 },
  card: { 
    backgroundColor: Colors.white, borderRadius: 20, marginBottom: 20, 
    overflow: 'hidden', elevation: 5, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 5
  },
  image: { width: '100%', height: 200, backgroundColor: Colors.primary },
  cardBody: { padding: 15 },
  category: { color: Colors.secondary, fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  description: { fontSize: 14, color: '#666', marginBottom: 10 },
  date: { fontSize: 12, color: '#AAA', textAlign: 'right' }
});

export default NewsFeedScreen;