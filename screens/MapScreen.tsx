import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { api } from '../lib/api';
import { Toilet } from '../types';
import { useFocusEffect } from '@react-navigation/native';

const MapScreen: React.FC = () => {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchToilets = async () => {
    try {
      setLoading(true);
      
      // Get saved distance from AsyncStorage
      const savedDistance = await AsyncStorage.getItem('searchDistance');
      const distance = savedDistance ? Number(savedDistance) : 5;

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

      // Get saved sort preference
      const savedSortBy = await AsyncStorage.getItem('sortBy');
      const sortBy = savedSortBy || 'distance';

      // Fetch nearby toilets
      const data = await api.getNearbyToilets(
        location.coords.latitude,
        location.coords.longitude,
        distance,
        sortBy as 'distance' | 'rating'
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

  // Fetch toilets when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchToilets();
    }, [])
  );

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default MapScreen; 