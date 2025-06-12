import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';

// Add safety checks for environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_URL = SUPABASE_URL;
const API_KEY = SUPABASE_ANON_KEY;

const headers = {
  'apikey': API_KEY,
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
};

export const api = {
  async getNearbyToilets(latitude: number, longitude: number, radiusMiles: number) {
    if (!API_URL || !API_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    // First, let's try a simple query to test the connection
    const testUrl = `${API_URL}/rest/v1/toilets?select=id&limit=1`;

    try {
      const testResponse = await fetchWithTimeout(
        testUrl,
        {
          headers
        }
      );

      if (!testResponse.ok) {
        throw new Error(`Test query failed: ${testResponse.status}`);
      }

      // If the test query works, proceed with the actual query
      const url = `${API_URL}/rest/v1/rpc/get_nearby_toilets`;
      const body = {
        lat: latitude,
        lng: longitude,
        radius_miles: radiusMiles
      };

      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch nearby toilets: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getNearbyToilets:', error);
      throw error;
    }
  },

  async getRatings(toiletId: string) {
    if (!API_URL || !API_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const url = `${API_URL}/rest/v1/ratings?toilet_id=eq.${toiletId}`;

    try {
      const response = await fetchWithTimeout(
        url,
        {
          headers
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ratings: ${response.status}`);
      }
      
      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Empty response received from server');
      }

      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Error in getRatings:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error details:', { url, headers });
        throw new Error('Network request failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  },

  async getReviews(toiletId: string) {
    if (!API_URL || !API_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const url = `${API_URL}/rest/v1/reviews?toilet_id=eq.${toiletId}`;

    try {
      const response = await fetchWithTimeout(
        url,
        {
          headers
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }
      
      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Empty response received from server');
      }

      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Error in getReviews:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error details:', { url, headers });
        throw new Error('Network request failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  },

  async submitReview(toiletId: string, review: {
    cleanliness: number;
    accessibility: number;
    quality: number;
    comment: string;
    userId: string;
    userName: string;
  }) {
    if (!API_URL || !API_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    try {
      console.log('Submitting review for toilet:', toiletId);
      console.log('Review data:', review);

      // First, get all existing ratings to calculate averages
      const existingRatings = await this.getRatings(toiletId);
      console.log('Existing ratings:', existingRatings);
      
      // Calculate new averages including the new review
      const allCleanliness = [...(existingRatings?.map((r: { cleanliness: number }) => r.cleanliness) || []), review.cleanliness];
      const allAccessibility = [...(existingRatings?.map((r: { accessibility: number }) => r.accessibility) || []), review.accessibility];
      const allQuality = [...(existingRatings?.map((r: { quality: number }) => r.quality) || []), review.quality];

      const avgCleanliness = allCleanliness.reduce((a, b) => a + b, 0) / allCleanliness.length;
      const avgAccessibility = allAccessibility.reduce((a, b) => a + b, 0) / allAccessibility.length;
      const avgQuality = allQuality.reduce((a, b) => a + b, 0) / allQuality.length;

      console.log('Calculated averages:', {
        cleanliness: avgCleanliness,
        accessibility: avgAccessibility,
        quality: avgQuality
      });

      // Insert the review
      const reviewUrl = `${API_URL}/rest/v1/reviews`;
      const reviewBody = {
        toilet_id: toiletId,
        user_id: review.userId,
        user_name: review.userName,
        cleanliness: review.cleanliness,
        accessibility: review.accessibility,
        quality: review.quality,
        comment: review.comment,
        created_at: new Date().toISOString()
      };

      console.log('Submitting review with body:', reviewBody);

      const reviewResponse = await fetchWithTimeout(
        reviewUrl,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(reviewBody)
        }
      );

      console.log('Review submission response status:', reviewResponse.status);

      if (!reviewResponse.ok) {
        const errorText = await reviewResponse.text();
        console.error('Error response from server:', errorText);
        throw new Error(`Failed to submit review: ${reviewResponse.status} - ${errorText}`);
      }

      // Update the ratings with the new averages
      const ratingsUrl = `${API_URL}/rest/v1/ratings`;
      const ratingsBody = {
        toilet_id: toiletId,
        cleanliness: avgCleanliness,
        accessibility: avgAccessibility,
        quality: avgQuality,
        created_at: new Date().toISOString()
      };

      console.log('Updating ratings with body:', ratingsBody);

      // If there's an existing rating, update it instead of creating a new one
      if (existingRatings && existingRatings.length > 0) {
        const existingRatingId = existingRatings[0].id;
        const updateResponse = await fetchWithTimeout(
          `${ratingsUrl}?id=eq.${existingRatingId}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify(ratingsBody)
          }
        );

        console.log('Rating update response status:', updateResponse.status);

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Error response from server:', errorText);
          throw new Error(`Failed to update ratings: ${updateResponse.status} - ${errorText}`);
        }
      } else {
        // If no existing rating, create a new one
        const createResponse = await fetchWithTimeout(
          ratingsUrl,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(ratingsBody)
          }
        );

        console.log('Rating creation response status:', createResponse.status);

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('Error response from server:', errorText);
          throw new Error(`Failed to create ratings: ${createResponse.status} - ${errorText}`);
        }
      }

      return {
        success: true,
        message: 'Review submitted successfully',
        averages: {
          cleanliness: avgCleanliness,
          accessibility: avgAccessibility,
          quality: avgQuality
        }
      };
    } catch (error) {
      console.error('Detailed error in submitReview:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Network request failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  },

  createToilet: async (toiletData: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    is_paid: boolean;
  }) => {
    if (!API_URL || !API_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    try {
      console.log('Creating toilet with data:', toiletData);
      console.log('Using API URL:', API_URL);
      
      const response = await fetchWithTimeout(
        `${API_URL}/rest/v1/toilets`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...toiletData,
            created_at: new Date().toISOString()
          })
        }
      );

      console.log('Create toilet response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        throw new Error(`Failed to create toilet: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Create toilet response data:', data);
      return data[0]; // Return the first item since Supabase returns an array
    } catch (error) {
      console.error('Detailed error in createToilet:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Network request failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  },

  getNearbyToilets: async (
    latitude: number,
    longitude: number,
    distance: number = 5,
    sortBy: 'distance' | 'rating' = 'distance'
  ) => {
    try {
      // Convert distance from miles to degrees (approximately 69 miles per degree)
      const distanceInDegrees = distance / 69.0;
      
      const response = await fetch(
        `${API_URL}/rest/v1/toilets?select=*,ratings(cleanliness,accessibility,quality)&latitude=gte.${latitude - distanceInDegrees}&latitude=lte.${latitude + distanceInDegrees}&longitude=gte.${longitude - distanceInDegrees}&longitude=lte.${longitude + distanceInDegrees}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch toilets');
      }

      const toilets = await response.json();

      // Calculate distance and average rating for each toilet
      const toiletsWithRatings = toilets.map((toilet: any) => {
        // Calculate distance in miles using the Haversine formula
        const R = 3958.8; // Earth's radius in miles
        const lat1 = latitude * Math.PI / 180;
        const lat2 = toilet.latitude * Math.PI / 180;
        const dLat = (toilet.latitude - latitude) * Math.PI / 180;
        const dLon = (toilet.longitude - longitude) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceInMiles = R * c;

        const ratings = toilet.ratings || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((acc: number, curr: any) => 
              acc + (curr.cleanliness + curr.accessibility + curr.quality) / 3, 0) / ratings.length
          : 0;

        return {
          ...toilet,
          distance: distanceInMiles,
          averageRating: avgRating,
        };
      }).filter(toilet => toilet.distance <= distance); // Filter out toilets beyond the selected distance

      // Sort based on user preference
      if (sortBy === 'rating') {
        toiletsWithRatings.sort((a: any, b: any) => b.averageRating - a.averageRating);
      } else {
        // Sort by distance by default
        toiletsWithRatings.sort((a: any, b: any) => a.distance - b.distance);
      }

      return toiletsWithRatings;
    } catch (error) {
      console.error('Error fetching nearby toilets:', error);
      throw error;
    }
  },

  uploadToiletImage: async (toiletId: string, imageUri: string) => {
    try {
      // Create a unique filename
      const filename = `${toiletId}/${Date.now()}.jpg`;

      // Create form data with the file
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: 'image/jpeg',
        name: filename
      } as any);

      console.log('Uploading file from URI:', imageUri);

      // Upload using Supabase storage client
      const { data, error } = await supabase.storage
        .from('toiletimages')
        .upload(filename, formData, {
          contentType: 'multipart/form-data',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('toiletimages')
        .getPublicUrl(filename);

      // Update the toilet record
      const { data: toilet } = await supabase
        .from('toilets')
        .select('images')
        .eq('id', toiletId)
        .single();

      await supabase
        .from('toilets')
        .update({ 
          images: [...(toilet?.images || []), publicUrl]
        })
        .eq('id', toiletId);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadToiletImage:', error);
      throw error;
    }
  },

  getToiletImages: async (toiletId: string) => {
    try {
      const { data, error } = await supabase
        .from('toilets')
        .select('images')
        .eq('id', toiletId)
        .single();

      if (error) throw error;
      return data.images || [];
    } catch (error) {
      console.error('Error getting toilet images:', error);
      throw error;
    }
  },
}; 