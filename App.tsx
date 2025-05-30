import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationContainer, useNavigation, RouteProp } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Alert, Image, Modal, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import HomeScreen from './screens/HomeScreen';
import ToiletDetail from './screens/ToiletDetail';
import { Toilet } from './types';
import { mockToilets } from './mockData';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from './lib/api';
import { useFocusEffect } from '@react-navigation/native';
import CreateToilet from './screens/CreateToilet';
import ReviewsScreen from './screens/ReviewsScreen';

// Create the navigators
const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Define the types for our navigation
type RootStackParamList = {
  Home: undefined;
  HomeScreen: undefined;
  ToiletDetail: { toilet: Toilet };
  Map: { selectedToilet?: Toilet };
  CreateToilet: { latitude: number; longitude: number };
  Reviews: { toiletId: string };
};

// Custom Marker Component
const ToiletMarker = ({ toilet, onPress }: { toilet: Toilet; onPress: () => void }) => {
  return (
    <Marker
      coordinate={{
        latitude: toilet.latitude,
        longitude: toilet.longitude,
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1.0 }}
      zIndex={1000}
    >
      <View style={styles.markerContainer}>
        <Ionicons name="water" size={24} color="#2A9D8F" />
      </View>
    </Marker>
  );
};

// Map Screen Component
const MapScreen = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Map'>) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);

  const fetchToilets = async () => {
    try {
      setLoading(true);
      
      // Get user's location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      setLocation(location);

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
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchToilets();
    }, [])
  );

  useEffect(() => {
    if (route.params?.selectedToilet && mapReady) {
      const toilet = route.params.selectedToilet;
      setSelectedToilet(toilet);
      setModalVisible(true);
    }
  }, [route.params?.selectedToilet, mapReady]);

  const handleMarkerPress = (toilet: Toilet) => {
    setSelectedToilet(toilet);
    setModalVisible(true);
  };

  const onMapReady = () => {
    setMapReady(true);
    if (route.params?.selectedToilet) {
      const toilet = route.params.selectedToilet;
      setSelectedToilet(toilet);
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedToilet(null);
  };

  const handleSeeMore = () => {
    if (selectedToilet) {
      setModalVisible(false);
      navigation.navigate('ToiletDetail', { toilet: selectedToilet });
    }
  };

  const handleLongPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setCreateModalVisible(true);
  };

  const handleCreateToilet = () => {
    if (selectedLocation) {
      setCreateModalVisible(false);
      navigation.navigate('CreateToilet', {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>{errorMsg}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: route.params?.selectedToilet?.latitude || location.coords.latitude,
              longitude: route.params?.selectedToilet?.longitude || location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onLongPress={handleLongPress}
            onMapReady={onMapReady}
          >
            {toilets.map((toilet) => (
              <ToiletMarker
                key={toilet.id}
                toilet={toilet}
                onPress={() => handleMarkerPress(toilet)}
              />
            ))}
          </MapView>
          
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {selectedToilet && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{selectedToilet.name}</Text>
                      <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.modalDistance}>
                      {selectedToilet.distance.toFixed(1)} miles away
                    </Text>
                    <View style={styles.modalRatings}>
                      <View style={styles.modalRatingItem}>
                        <Text style={styles.modalRatingLabel}>Cleanliness</Text>
                        <Text style={styles.modalRatingValue}>
                          {selectedToilet.ratings.cleanliness.toFixed(1)}
                        </Text>
                      </View>
                      <View style={styles.modalRatingItem}>
                        <Text style={styles.modalRatingLabel}>Accessibility</Text>
                        <Text style={styles.modalRatingValue}>
                          {selectedToilet.ratings.accessibility.toFixed(1)}
                        </Text>
                      </View>
                      <View style={styles.modalRatingItem}>
                        <Text style={styles.modalRatingLabel}>Quality</Text>
                        <Text style={styles.modalRatingValue}>
                          {selectedToilet.ratings.quality.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.seeMoreButton}
                      onPress={handleSeeMore}
                    >
                      <Text style={styles.seeMoreButtonText}>See More Details</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={createModalVisible}
            onRequestClose={() => setCreateModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Toilet Here?</Text>
                  <TouchableOpacity 
                    onPress={() => setCreateModalVisible(false)} 
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalText}>
                  Would you like to add a new toilet at this location?
                </Text>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCreateToilet}
                >
                  <Text style={styles.confirmButtonText}>Yes, Add Toilet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setCreateModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.screen}>
          <Text style={styles.text}>Loading location...</Text>
        </View>
      )}
    </View>
  );
};

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2A9D8F',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ 
          title: 'Toiletty',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="ToiletDetail" 
        component={ToiletDetail}
        options={({ route }) => ({ 
          title: route.params.toilet.name,
          tabBarVisible: false
        })}
      />
      <Stack.Screen 
        name="Reviews" 
        component={ReviewsScreen}
        options={({ route }) => ({ 
          title: 'Reviews',
          tabBarVisible: false
        })}
      />
      <Stack.Screen 
        name="CreateToilet" 
        component={CreateToilet}
        options={{ 
          title: 'Add New Toilet'
        }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
              tabBarActiveTintColor: '#2A9D8F',
              tabBarInactiveTintColor: 'gray',
              headerShown: false,
              tabBarStyle: {
                paddingBottom: 0,
                paddingTop: 0,
                height: 90,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                elevation: 0,
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
              },
              tabBarItemStyle: {
                marginTop: -20,
              },
              tabBarLabelStyle: {
                marginTop: -35,
                fontSize: 11,
                position: 'relative',
                top: -40,
              },
              tabBarIconStyle: {
                marginBottom: 0,
                marginTop: -15,
              },
              tabBarHideOnKeyboard: true,
            })}
          >
            <Tab.Screen 
              name="Home" 
              component={HomeStack}
              options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} style={{ marginTop: -30 }} />
                ),
              }}
            />
            <Tab.Screen 
              name="Map" 
              component={MapScreen}
              options={{
                tabBarLabel: 'Map',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="map" size={size} color={color} style={{ marginTop: -30 }} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    color: '#2A9D8F',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2A9D8F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A9D8F',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  modalDistance: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  modalRatings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalRatingItem: {
    alignItems: 'center',
    flex: 1,
  },
  modalRatingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalRatingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A9D8F',
  },
  seeMoreButton: {
    backgroundColor: '#2A9D8F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  seeMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#2A9D8F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
}); 