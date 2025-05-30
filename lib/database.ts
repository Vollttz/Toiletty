import { supabase } from './supabase';
import { Tables } from './supabase';

// Get all toilets within a radius (in miles) of a location
export async function getNearbyToilets(
  latitude: number,
  longitude: number,
  radiusMiles: number
) {
  const { data, error } = await supabase
    .rpc('get_nearby_toilets', {
      lat: latitude,
      lng: longitude,
      radius_miles: radiusMiles
    });

  if (error) throw error;
  return data;
}

// Get a single toilet by ID with its ratings and reviews
export async function getToiletDetails(toiletId: string) {
  const { data: toilet, error: toiletError } = await supabase
    .from('toilets')
    .select('*')
    .eq('id', toiletId)
    .single();

  if (toiletError) throw toiletError;

  const { data: ratings, error: ratingsError } = await supabase
    .from('ratings')
    .select('*')
    .eq('toilet_id', toiletId);

  if (ratingsError) throw ratingsError;

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .eq('toilet_id', toiletId)
    .order('created_at', { ascending: false });

  if (reviewsError) throw reviewsError;

  return {
    ...toilet,
    ratings: calculateAverageRatings(ratings),
    reviews
  };
}

// Add a new toilet
export async function addToilet(toilet: Omit<Tables['toilets'], 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('toilets')
    .insert([toilet])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add a new rating
export async function addRating(rating: Omit<Tables['ratings'], 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('ratings')
    .insert([rating])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add a new review
export async function addReview(review: Omit<Tables['reviews'], 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to calculate average ratings
function calculateAverageRatings(ratings: Tables['ratings'][]) {
  if (ratings.length === 0) {
    return {
      cleanliness: 0,
      accessibility: 0,
      quality: 0
    };
  }

  const sum = ratings.reduce((acc, rating) => ({
    cleanliness: acc.cleanliness + rating.cleanliness,
    accessibility: acc.accessibility + rating.accessibility,
    quality: acc.quality + rating.quality
  }), { cleanliness: 0, accessibility: 0, quality: 0 });

  return {
    cleanliness: sum.cleanliness / ratings.length,
    accessibility: sum.accessibility / ratings.length,
    quality: sum.quality / ratings.length
  };
} 