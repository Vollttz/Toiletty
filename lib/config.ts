// Import environment variables
import { SUPABASE_URL as ENV_URL, SUPABASE_ANON_KEY as ENV_KEY } from '@env';

// Use environment variables with fallback to hardcoded values
export const SUPABASE_URL = ENV_URL || 'https://kkblfrnlvhhcllrdxaws.supabase.co';
export const SUPABASE_ANON_KEY = ENV_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYmxmcm5sdmhoY2xscmR4YXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzQ1OTUsImV4cCI6MjA2MzUxMDU5NX0.mQn05N5LS3p-gU4SDf2Hoq2mU5NPJWgGYsDDT4PUaew';

// Log which values are being used
console.log('Using Supabase URL from:', ENV_URL ? 'environment' : 'fallback');
console.log('Using Supabase Key from:', ENV_KEY ? 'environment' : 'fallback'); 