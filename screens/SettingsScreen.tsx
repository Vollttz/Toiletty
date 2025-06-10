import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../lib/AuthContext';

const DISTANCE_OPTIONS = [1, 2, 3, 5, 10, 20, 50];
const SORT_OPTIONS = [
  { id: 'distance', label: 'Distance' },
  { id: 'rating', label: 'Rating' },
];

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [sortBy, setSortBy] = useState('distance');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedDistance = await AsyncStorage.getItem('searchDistance');
      const savedSortBy = await AsyncStorage.getItem('sortBy');
      if (savedDistance) setSelectedDistance(Number(savedDistance));
      if (savedSortBy) setSortBy(savedSortBy);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleDistanceSelect = async (distance: number) => {
    setSelectedDistance(distance);
    try {
      await AsyncStorage.setItem('searchDistance', distance.toString());
      await AsyncStorage.setItem('sortBy', sortBy);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSortSelect = async (sortOption: string) => {
    setSortBy(sortOption);
    try {
      await AsyncStorage.setItem('searchDistance', selectedDistance.toString());
      await AsyncStorage.setItem('sortBy', sortOption);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Distance</Text>
          <Text style={styles.sectionSubtitle}>Select how far to search for toilets</Text>
          <View style={styles.distanceOptions}>
            {DISTANCE_OPTIONS.map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.distanceOption,
                  selectedDistance === distance && styles.selectedDistance,
                ]}
                onPress={() => handleDistanceSelect(distance)}
              >
                <Text
                  style={[
                    styles.distanceText,
                    selectedDistance === distance && styles.selectedDistanceText,
                  ]}
                >
                  {distance} mi
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <Text style={styles.sectionSubtitle}>Choose how to sort nearby toilets</Text>
          <View style={styles.sortOptions}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  sortBy === option.id && styles.selectedSort,
                ]}
                onPress={() => handleSortSelect(option.id)}
              >
                <Text
                  style={[
                    styles.sortText,
                    sortBy === option.id && styles.selectedSortText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  distanceOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  selectedDistance: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  distanceText: {
    fontSize: 14,
    color: '#000',
  },
  selectedDistanceText: {
    color: '#fff',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  sortOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  selectedSort: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  sortText: {
    fontSize: 14,
    color: '#000',
  },
  selectedSortText: {
    color: '#fff',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 