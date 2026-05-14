import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../common/constants/Colors';
import { VOCAB_ROUTES } from '../../configs/enums/main-route.enum';
import MenuGridCard from '../../common/components/MenuGridCard';

const { width } = Dimensions.get('window');
const cardSize = (width - 60) / 2;

const VocabMenuScreen = ({ navigation }: any) => {
  
  const menuItems = [
    {title: 'My saved words', icon: 'heart', route: VOCAB_ROUTES.SAVED_LIST},
    {title: 'TOEIC', icon: 'school', route: VOCAB_ROUTES.TOEIC_LIST},
    {title: 'IELTS', icon: 'book', route: VOCAB_ROUTES.IELTS_LIST},
  ];

    return (
        <SafeAreaView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}></Text>
            </View>
            {/* Menu Grid */}
            <View style={styles.grid}>
              {menuItems.map((item, index) => (
                <MenuGridCard
                  key={index}
                  title={item.title}
                  icon={item.icon}
                  onPress={() => navigation.navigate(item.route)}
                />
              ))}
            </View>

          </ScrollView>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { 
        paddingHorizontal: 25,
        paddingTop: 30,
        marginBottom: 25,
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
});
export default VocabMenuScreen;