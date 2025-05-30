import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import ToiletCard from '../components/ToiletCard';
import { api } from '../lib/api';
import { Toilet } from '../types';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchToilets = async () => {
    try {
      setLoading(true);
      
      // Get user's location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      // Fetch nearby toilets
      const data = await api.getNearbyToilets(
        location.coords.latitude,
        location.coords.longitude,
        3 // 3 mile radius
      );

      // Transform the data to match our Toilet type
      const transformedToilets: Toilet[] = await Promise.all(
        data.map(async (toilet: {
          id: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          distance: number;
          is_paid: boolean;
        }) => {
          // Get ratings for this toilet
          const ratings = await api.getRatings(toilet.id);

          // Get reviews for this toilet
          const reviews = await api.getReviews(toilet.id);

          return {
            id: toilet.id,
            name: toilet.name,
            address: toilet.address,
            latitude: toilet.latitude,
            longitude: toilet.longitude,
            distance: toilet.distance,
            isPaid: toilet.is_paid,
            ratings: {
              cleanliness: ratings?.[0]?.cleanliness || 0,
              accessibility: ratings?.[0]?.accessibility || 0,
              quality: ratings?.[0]?.quality || 0
            },
            reviews: reviews?.map((review: {
              id: string;
              user_id: string;
              user_name: string;
              cleanliness: number;
              accessibility: number;
              quality: number;
              comment: string;
              created_at: string;
            }) => ({
              id: review.id,
              userId: review.user_id,
              userName: review.user_name,
              cleanliness: review.cleanliness,
              accessibility: review.accessibility,
              quality: review.quality,
              comment: review.comment,
              date: review.created_at
            })) || []
          };
        })
      );

      setToilets(transformedToilets);
    } catch (err) {
      console.error('Error in fetchToilets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchToilets();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchToilets();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={toilets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ToiletCard toilet={item} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 16 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2A9D8F']}
            tintColor="#2A9D8F"
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No toilets found nearby</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 + insets.bottom }} />}
        style={styles.list}
      />
    </View>
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
    paddingTop: 16,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

export default HomeScreen; 