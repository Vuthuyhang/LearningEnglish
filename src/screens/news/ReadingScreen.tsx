import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ReadingScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tiêu đề bài báo mẫu</Text>
      <Text style={styles.content}>
        Đây là nơi nội dung bài báo tiếng Anh sẽ hiển thị. 
        Sau này chúng ta sẽ viết logic tách từng từ ở đây để bạn có thể chạm vào và tra từ điển.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  content: { fontSize: 18, lineHeight: 28 }
});

export default ReadingScreen;