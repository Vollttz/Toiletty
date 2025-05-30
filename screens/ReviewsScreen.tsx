import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Toilet } from '../types';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  HomeScreen: undefined;
  ToiletDetail: { toilet: Toilet };
  Reviews: { toilet: Toilet };
  Map: { selectedToilet?: Toilet };
};

type ReviewsScreenRouteProp = RouteProp<RootStackParamList, 'Reviews'>;
type ReviewsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reviews'>;

type Props = {
  route: ReviewsScreenRouteProp;
  navigation: ReviewsScreenNavigationProp;
};

const RatingStars = ({ rating, size = 20 }: { rating: number; size?: number }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color="#FFD700"
        />
      ))}
    </View>
  );
};

const ReviewsScreen: React.FC<Props> = ({ route }) => {
  const { toilet } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{toilet.name}</Text>
          <Text style={styles.reviewCount}>
            {toilet.reviews.length} {toilet.reviews.length === 1 ? 'Review' : 'Reviews'}
          </Text>
        </View>

        <View style={styles.reviewsList}>
          {toilet.reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.userName}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <View style={styles.reviewRatings}>
                <View style={styles.reviewRatingItem}>
                  <Text style={styles.reviewRatingLabel}>Cleanliness:</Text>
                  <RatingStars rating={review.cleanliness} size={16} />
                </View>
                <View style={styles.reviewRatingItem}>
                  <Text style={styles.reviewRatingLabel}>Accessibility:</Text>
                  <RatingStars rating={review.accessibility} size={16} />
                </View>
                <View style={styles.reviewRatingItem}>
                  <Text style={styles.reviewRatingLabel}>Quality:</Text>
                  <RatingStars rating={review.quality} size={16} />
                </View>
              </View>
              {review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 16,
    color: '#666',
  },
  reviewsList: {
    padding: 16,
  },
  reviewItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 14,
    color: '#666',
  },
  reviewRatings: {
    marginVertical: 8,
  },
  reviewRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewRatingLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
});

export default ReviewsScreen; 