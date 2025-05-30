import { createClient } from '@supabase/supabase-js';
import { Tables } from '../lib/supabase';

const supabase = createClient(
  'https://kkblfrnlvhhcllrdxaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYmxmcm5sdmhoY2xscmR4YXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzQ1OTUsImV4cCI6MjA2MzUxMDU5NX0.mQn05N5LS3p-gU4SDf2Hoq2mU5NPJWgGYsDDT4PUaew'
);

async function cleanupDatabase() {
  try {
    // Get all toilets
    const { data: toilets, error: toiletsError } = await supabase
      .from('toilets')
      .select('*');

    if (toiletsError) {
      console.error('Error fetching toilets:', toiletsError);
      return;
    }

    // Group toilets by name and address
    const groupedToilets = toilets.reduce((acc, toilet) => {
      const key = `${toilet.name}-${toilet.address}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(toilet);
      return acc;
    }, {} as Record<string, Tables['toilets'][]>);

    // Keep the first occurrence of each toilet and delete the rest
    for (const [key, duplicates] of Object.entries(groupedToilets) as [string, Tables['toilets'][]][]) {
      if (duplicates.length > 1) {
        // Keep the first one, delete the rest
        const [keep, ...toDelete] = duplicates;
        
        for (const toilet of toDelete) {
          // Delete associated ratings and reviews first
          await supabase
            .from('ratings')
            .delete()
            .eq('toilet_id', toilet.id);

          await supabase
            .from('reviews')
            .delete()
            .eq('toilet_id', toilet.id);

          // Then delete the toilet
          const { error: deleteError } = await supabase
            .from('toilets')
            .delete()
            .eq('id', toilet.id);

          if (deleteError) {
            console.error(`Error deleting duplicate toilet ${toilet.id}:`, deleteError);
          }
        }
      }
    }

    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Error cleaning up database:', error);
  }
}

cleanupDatabase(); 