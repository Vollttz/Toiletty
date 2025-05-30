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

const ToiletCard: React.FC<ToiletCardProps> = ({ toilet }) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('ToiletDetail', { toilet });
  };

  const handleShowOnMap = () => {
    navigation.navigate('Map', { selectedToilet: toilet });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.name}>{toilet.name}</Text>
        <View style={[styles.badge, toilet.isPaid ? styles.paidBadge : styles.freeBadge]}>
          <Text style={styles.badgeText}>{toilet.isPaid ? 'Paid' : 'Free'}</Text>
        </View>
      </View>
      
      <Text style={styles.distance}>{toilet.distance.toFixed(1)} miles away</Text>
      
      <View style={styles.ratingsContainer}>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Cleanliness</Text>
          <Text style={styles.ratingValue}>{toilet.ratings.cleanliness.toFixed(1)}</Text>
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Accessibility</Text>
          <Text style={styles.ratingValue}>{toilet.ratings.accessibility.toFixed(1)}</Text>
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Quality</Text>
          <Text style={styles.ratingValue}>{toilet.ratings.quality.toFixed(1)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.showOnMapButton}
        onPress={handleShowOnMap}
      >
        <Ionicons name="map" size={20} color="white" />
        <Text style={styles.showOnMapButtonText}>Show on Map</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#FFD700',
  },
  freeBadge: {
    backgroundColor: '#90EE90',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ratingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  showOnMapButton: {
    backgroundColor: '#2A9D8F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    width: '100%',
  },
  showOnMapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ToiletCard; 