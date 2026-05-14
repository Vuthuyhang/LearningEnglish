import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { Colors } from '../constants/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface SaveButtonProps {
  onPress: () => void;
  isLoading?: boolean;   
  isSaved?: boolean;     
  title?: string;        
  style?: ViewStyle;    
}

const SaveButton = ({ 
  onPress, 
  isLoading = false, 
  isSaved = false, 
  title = "Lưu",
  style 
}: SaveButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isSaved ? styles.buttonSaved : styles.buttonNormal,
        style
      ]} 
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.text} size="small" />
      ) : (
        <>
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={18} 
            color={Colors.text} 
            style={{ marginRight: 6 }}
          />
          <Text style={styles.text}>
            {isSaved ? "Đã lưu" : title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonNormal: {
    backgroundColor: Colors.primary, 
  },
  buttonSaved: {
    backgroundColor: '#FFB7C5', 
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  text: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SaveButton;