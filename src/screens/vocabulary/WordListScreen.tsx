import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WordListScreen = () => (
  <View style={styles.container}><Text>Kho từ vựng của bạn (Trống)</Text></View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default WordListScreen;