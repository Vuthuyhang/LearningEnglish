import React, {useMemo, useCallback} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Colors } from "../constants/Colors";

interface IWordModalProps{
    bottomSheetRef: any;
    wordData: any;
    isLoading: boolean;
    onSave: (word: string) => void;
}
const WordModal =({bottomSheetRef, wordData, isLoading, onSave}: IWordModalProps) =>{
    const snapPoints = useMemo(()=>['50%'], []);
    return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} 
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: Colors.backgroundModal}}
      handleIndicatorStyle={{ backgroundColor: Colors.primary }}
    >
      <BottomSheetView style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.inner}>
            <View style={styles.header}>
              <View>
                <Text style={styles.word}>{wordData?.word}</Text>
                <Text style={styles.phonetic}>{wordData?.phonetic || "/.../"}</Text>
              </View>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => onSave(wordData?.word)}
              >
                <Text style={styles.saveText}>Lưu</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <Text style={styles.label}>Nghĩa:</Text>
              <Text style={styles.definition}>
                {wordData?.meanings[0]?.definitions[0]?.definition || "Không tìm thấy định nghĩa."}
              </Text>
    
            </View>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );     
}
const styles = StyleSheet.create({
  contentContainer: { flex: 1, padding: 20 },
  inner: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  word: { fontSize: 28, fontWeight: 'bold', color: Colors.text, textTransform: 'capitalize' },
  phonetic: { fontSize: 16, color: Colors.secondary, marginTop: 2 },
  saveButton: { backgroundColor: Colors.button, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15 },
  saveText: { color: Colors.text, fontWeight: 'bold' },
  body: { marginTop: 10 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#999', marginBottom: 5 },
  definition: { fontSize: 17, color: Colors.text, lineHeight: 24 },

});

export default WordModal;