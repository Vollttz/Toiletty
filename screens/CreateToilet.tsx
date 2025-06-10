import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../lib/api';
import { Toilet } from '../types';

type RootStackParamList = {
  HomeScreen: undefined;
  ToiletDetail: { toilet: Toilet };
  Map: { selectedToilet?: Toilet };
  CreateToilet: { latitude: number; longitude: number };
};

type CreateToiletScreenRouteProp = RouteProp<RootStackParamList, 'CreateToilet'>;
type CreateToiletScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateToilet'>;

type Props = {
  route: CreateToiletScreenRouteProp;
  navigation: CreateToiletScreenNavigationProp;
};

const CreateToilet: React.FC<Props> = ({ route, navigation }) => {
  const { latitude, longitude } = route.params;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    accessibility: 0,
    quality: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRating = (type: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSubmit = async () => {
    console.log('Submit button pressed'); // Basic logging to verify button press
    
    if (!name.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Starting toilet creation with data:', {
        name: name.trim(),
        address: address.trim(),
        latitude,
        longitude,
        is_paid: isPaid,
        ratings
      });
      
      // Create the toilet
      const newToilet = await api.createToilet({
        name: name.trim(),
        address: address.trim(),
        latitude,
        longitude,
        is_paid: isPaid,
      });

      console.log('Toilet created successfully:', newToilet);

      // Submit initial ratings
      const reviewResult = await api.submitReview(newToilet.id, {
        cleanliness: ratings.cleanliness,
        accessibility: ratings.accessibility,
        quality: ratings.quality,
        comment: 'Initial rating',
        userId: 'temp-user-id',
        userName: 'Anonymous User',
      });

      console.log('Review submitted successfully:', reviewResult);

      Alert.alert(
        'Success',
        'Toilet added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Map' as never)
          }
        ]
      );
    } catch (error) {
      console.error('Detailed error in handleSubmit:', error);
      Alert.alert(
        'Error',
        `Failed to create toilet: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily: 'System' }]}>Add New Toilet</Text>
          <Text style={[styles.subtitle, { fontFamily: 'System' }]}>Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: 'System' }]}>Name *</Text>
            <TextInput
              style={[styles.input, { fontFamily: 'System' }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter toilet name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: 'System' }]}>Address *</Text>
            <TextInput
              style={[styles.input, { fontFamily: 'System' }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.paymentToggle}>
            <Text style={[styles.label, { fontFamily: 'System' }]}>Payment Status</Text>
            <TouchableOpacity
              style={[styles.toggleButton, isPaid && styles.toggleButtonActive]}
              onPress={() => setIsPaid(!isPaid)}
            >
              <Text style={[styles.toggleButtonText, isPaid && styles.toggleButtonTextActive, { fontFamily: 'System' }]}>
                {isPaid ? 'Paid' : 'Free'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingsSection}>
            <Text style={[styles.sectionTitle, { fontFamily: 'System' }]}>Initial Ratings</Text>
            
            <View style={styles.ratingInput}>
              <Text style={[styles.ratingLabel, { fontFamily: 'System' }]}>Cleanliness</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateRating('cleanliness', star)}
                  >
                    <Ionicons
                      name={star <= ratings.cleanliness ? 'star' : 'star-outline'}
                      size={24}
                      color={star <= ratings.cleanliness ? '#000' : '#C0C0C0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingInput}>
              <Text style={[styles.ratingLabel, { fontFamily: 'System' }]}>Accessibility</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateRating('accessibility', star)}
                  >
                    <Ionicons
                      name={star <= ratings.accessibility ? 'star' : 'star-outline'}
                      size={24}
                      color={star <= ratings.accessibility ? '#000' : '#C0C0C0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingInput}>
              <Text style={[styles.ratingLabel, { fontFamily: 'System' }]}>Quality</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateRating('quality', star)}
                  >
                    <Ionicons
                      name={star <= ratings.quality ? 'star' : 'star-outline'}
                      size={24}
                      color={star <= ratings.quality ? '#000' : '#C0C0C0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={() => {
              console.log('Button pressed');
              handleSubmit();
            }}
            disabled={isSubmitting}
          >
            <Text style={[styles.submitButtonText, { fontFamily: 'System' }]}>
              {isSubmitting ? 'Adding...' : 'Add Toilet'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Add extra padding at the bottom
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'System',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  paymentToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  toggleButtonActive: {
    backgroundColor: '#000',
  },
  toggleButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  ratingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'System',
  },
  ratingInput: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'System',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default CreateToilet; 