Need to install the following packages:
supabase@2.23.4

export interface Rating {
  cleanliness: number;
  accessibility: number;
  quality: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  cleanliness: number;
  accessibility: number;
  quality: number;
  comment: string;
  date: string;
}

export interface Toilet {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  isPaid: boolean;
  ratings: {
    cleanliness: number;
    accessibility: number;
    quality: number;
  };
  reviews: Review[];
  images: string[];
}
