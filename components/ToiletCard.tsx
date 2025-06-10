import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Toilet } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  HomeScreen: undefined;
  ToiletDetail: { toilet: Toilet };
  Map: { selectedToilet?: Toilet };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ToiletCardProps {
  toilet: Toilet;
}

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.starsContainer}>
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={size} color="#000" />
      ))
      }
      {hasHalfStar && <Ionicons name="star-half" size={size} color="#000" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#C0C0C0" />
      ))
      }
    </View>
  );
};

const ToiletCard: React.FC<ToiletCardProps> = ({ toilet }) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('ToiletDetail', { toilet });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{toilet.name}</Text>
        <Text style={styles.paidStatus}>{toilet.isPaid ? 'Paid' : 'Free'}</Text>
      </View>
      <Text style={styles.distance}>{toilet.distance.toFixed(1)} miles</Text>
      
      <View style={styles.ratingsContainer}>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Cleanliness</Text>
          <StarRating rating={toilet.ratings.cleanliness} />
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Accessibility</Text>
          <StarRating rating={toilet.ratings.accessibility} />
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Quality</Text>
          <StarRating rating={toilet.ratings.quality} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginVertical: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
    color: '#000',
    fontFamily: 'System',
  },
  paidStatus: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'System',
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'System',
  },
  ratingsContainer: {
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    marginRight: 8,
    fontFamily: 'System',
  },
  starsContainer: {
    flexDirection: 'row',
  },
});

const homeScreenStyles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});

export default ToiletCard; 