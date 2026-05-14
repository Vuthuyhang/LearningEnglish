import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';

const { width } = Dimensions.get('window');
const cardSize = (width - 60) / 2;

interface Props {
  title: string;
  desc?: string; 
  icon: string;
  onPress: () => void;
}

const MenuGridCard = ({ title, desc, icon, onPress }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={Colors.btnGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={28} color={Colors.secondary} />
        </View>
        
        <View>
          <Text style={styles.title}>{title}</Text>
          {desc && <Text style={styles.desc}>{desc}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardSize,
    height: cardSize * 1.1,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#FFB7C5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    borderRadius: 30,
    padding: 18,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  iconBox: {
    width: 45,
    height: 45,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: '#4A4A4A', fontSize: 16, fontWeight: 'bold' },
  desc: { color: '#A0A0A0', fontSize: 11, marginTop: 4 }
});

export default MenuGridCard;