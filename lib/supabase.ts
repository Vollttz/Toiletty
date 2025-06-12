import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Initialize the Supabase client
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    storage: {
      maxRetryCount: 3,
      retryInterval: 1000,
    },
  }
);

// Types for our database tables
export type Tables = {
  toilets: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    is_paid: boolean;
    created_at: string;
    images: string[];
  };
  ratings: {
    id: string;
    toilet_id: string;
    cleanliness: number;
    accessibility: number;
    quality: number;
    created_at: string;
  };
  reviews: {
    id: string;
    toilet_id: string;
    user_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
  };
}; 