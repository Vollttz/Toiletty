import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Toilet, Review } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../lib/api';

type RootStackParamList = {
  HomeScreen: undefined;
  ToiletDetail: { toilet: Toilet };
  Map: { selectedToilet?: Toilet };
  Reviews: { toilet: Toilet };
};

type ToiletDetailScreenRouteProp = RouteProp<RootStackParamList, 'ToiletDetail'>;
type ToiletDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToiletDetail'>;

type Props = {
  route: ToiletDetailScreenRouteProp;
  navigation: ToiletDetailScreenNavigationProp;
};

interface NewReview {
  cleanliness: number;
  accessibility: number;
  quality: number;
  comment: string;
}

const RatingStars = ({ rating, size = 20, onPress }: { rating: number; size?: number; onPress?: (rating: number) => void }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress?.(star)}
          disabled={!onPress}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#000' : '#C0C0C0'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ToiletDetail: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { toilet } = route.params;
  const [newReview, setNewReview] = useState<NewReview>({
    cleanliness: 0,
    accessibility: 0,
    quality: 0,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (
      newReview.cleanliness > 0 &&
      newReview.accessibility > 0 &&
      newReview.quality > 0
    ) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        // TODO: Replace with actual user ID and name from authentication
        const userId = 'temp-user-id';
        const userName = 'Anonymous User';
        
        await api.submitReview(toilet.id, {
          ...newReview,
          userId,
          userName,
        });

        // Reset form
      setNewReview({
        cleanliness: 0,
        accessibility: 0,
        quality: 0,
        comment: '',
      });

        // Refresh the toilet data
        const updatedRatings = await api.getRatings(toilet.id);
        const updatedReviews = await api.getReviews(toilet.id);
        
        // Update the toilet object with new data
        const updatedToilet = {
          ...toilet,
          ratings: {
            cleanliness: updatedRatings?.[0]?.cleanliness || 0,
            accessibility: updatedRatings?.[0]?.accessibility || 0,
            quality: updatedRatings?.[0]?.quality || 0
          },
          reviews: updatedReviews?.map((review: any) => ({
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

        // Update the route params
        navigation.setParams({ toilet: updatedToilet });
      } catch (err) {
        console.error('Error submitting review:', err);
        setError(err instanceof Error ? err.message : 'Failed to submit review');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const updateRating = (type: keyof Omit<NewReview, 'comment'>, value: number) => {
    setNewReview(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const isFormValid = newReview.cleanliness > 0 && 
                     newReview.accessibility > 0 && 
                     newReview.quality > 0;

  const handleShowOnMap = () => {
    navigation.navigate('Map', { selectedToilet: toilet });
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error opening Google Maps:', err);
      Alert.alert('Error', 'Could not open Google Maps');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.name}>{toilet.name}</Text>
          <Text style={styles.address}>{toilet.address}</Text>
          <View style={styles.paymentIndicator}>
            <Ionicons
              name={toilet.isPaid ? "cash" : "cash-outline"} 
              size={20} 
              color="#000" 
            />
            <Text style={styles.paymentText}>
              {toilet.isPaid ? "Paid" : "Free"}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
          <TouchableOpacity 
              style={[styles.actionButton, styles.showOnMapButton]}
            onPress={handleShowOnMap}
          >
            <Ionicons name="map" size={20} color="white" />
              <Text style={[styles.actionButtonText, { fontFamily: 'System' }]}>Show on Map</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.directionsButton]}
              onPress={handleGetDirections}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={[styles.actionButtonText, { fontFamily: 'System' }]}>Get Directions</Text>
          </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ratingsContainer}>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Cleanliness</Text>
            <RatingStars rating={toilet.ratings.cleanliness} size={16} />
          </View>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Accessibility</Text>
            <RatingStars rating={toilet.ratings.accessibility} size={16} />
          </View>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Quality</Text>
            <RatingStars rating={toilet.ratings.quality} size={16} />
          </View>
          <TouchableOpacity 
            style={styles.reviewCountContainer}
            onPress={() => navigation.navigate('Reviews', { toilet })}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.reviewCountText}>
              {toilet.reviews?.length || 0} {toilet.reviews?.length === 1 ? 'Review' : 'Reviews'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#666" style={styles.chevron} />
          </TouchableOpacity>
        </View>

        <View style={styles.addReviewSection}>
          <Text style={styles.sectionTitle}>Add a Review</Text>
          
          <View style={styles.ratingInput}>
            <Text style={styles.ratingLabel}>Cleanliness:</Text>
            <RatingStars 
              rating={newReview.cleanliness} 
              size={24}
              onPress={(rating) => updateRating('cleanliness', rating)}
            />
          </View>

          <View style={styles.ratingInput}>
            <Text style={styles.ratingLabel}>Accessibility:</Text>
            <RatingStars 
              rating={newReview.accessibility} 
              size={24}
              onPress={(rating) => updateRating('accessibility', rating)}
            />
          </View>

          <View style={styles.ratingInput}>
            <Text style={styles.ratingLabel}>Quality:</Text>
            <RatingStars 
              rating={newReview.quality} 
              size={24}
              onPress={(rating) => updateRating('quality', rating)}
            />
          </View>

          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment (optional)..."
            placeholderTextColor="#999"
            multiline
            value={newReview.comment}
            onChangeText={(text) => setNewReview(prev => ({ ...prev, comment: text }))}
          />
          {Platform.OS === 'android' && (
            <View style={{ height: 0 }} />
          )}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitReview}
            disabled={!isFormValid || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
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
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
    fontFamily: 'System',
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'System',
  },
  paymentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'System',
  },
  ratingsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  ratingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'System',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    fontFamily: 'System',
  },
  reviewItem: {
    marginBottom: 16,
    padding: 12,
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
    color: '#000',
    fontFamily: 'System',
  },
  reviewDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
  },
  reviewComment: {
    fontSize: 14,
    color: '#000',
    marginTop: 8,
    fontFamily: 'System',
  },
  addReviewSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 100,
  },
  ratingInput: {
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: '#000',
    fontFamily: 'System',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  showOnMapButton: {
    // backgroundColor handled by actionButton
  },
  directionsButton: {
    // backgroundColor handled by actionButton
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'System',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'System',
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
    color: '#000',
    width: 100,
    fontFamily: 'System',
  },
  reviewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  reviewCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 4,
    fontFamily: 'System',
  },
  chevron: {
    marginLeft: 4,
  },
});

export default ToiletDetail; 