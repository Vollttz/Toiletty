import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kkblfrnlvhhcllrdxaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYmxmcm5sdmhoY2xscmR4YXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzQ1OTUsImV4cCI6MjA2MzUxMDU5NX0.mQn05N5LS3p-gU4SDf2Hoq2mU5NPJWgGYsDDT4PUaew'
);

async function seedDatabase() {
  try {
    // Add a new toilet
    const { data: newToilet, error: toiletError } = await supabase
      .from('toilets')
      .insert({
        name: 'Starbucks Coffee Restroom',
        address: '123 S Murphy Ave, Sunnyvale, CA 94086',
        latitude: 37.3725,
        longitude: -122.0389,
        is_paid: false
      })
      .select()
      .single();

    if (toiletError) {
      console.error('Error inserting new toilet:', toiletError);
      return;
    }

    // Add ratings for the new toilet
    const { error: ratingError } = await supabase
      .from('ratings')
      .insert({
        toilet_id: newToilet.id,
        cleanliness: 4.7,
        accessibility: 4.5,
        quality: 4.6
      });

    if (ratingError) {
      console.error('Error inserting rating:', ratingError);
    }

    // Add a review for the new toilet
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        toilet_id: newToilet.id,
        user_id: 'user5',
        user_name: 'Emily Brown',
        rating: 4.6,
        comment: 'Clean and well-maintained restroom. Good accessibility features.',
        created_at: new Date().toISOString()
      });

    if (reviewError) {
      console.error('Error inserting review:', reviewError);
    }

    console.log('New toilet added successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase(); 