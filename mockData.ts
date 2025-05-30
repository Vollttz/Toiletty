import { Toilet } from './types';

export const mockToilets: Toilet[] = [
  {
    id: '1',
    name: 'Sunnyvale Public Library Restroom',
    address: '665 W Olive Ave, Sunnyvale, CA 94086',
    distance: 0.3,
    latitude: 37.3687,
    longitude: -122.0364,
    ratings: {
      cleanliness: 4.5,
      accessibility: 4.0,
      quality: 4.2
    },
    isPaid: false,
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        rating: 4.5,
        comment: 'Very clean and well-maintained. Good accessibility features.',
        date: '2024-03-15'
      }
    ]
  },
  {
    id: '2',
    name: 'Target Store Restroom',
    address: '121 W Washington Ave, Sunnyvale, CA 94086',
    distance: 0.7,
    latitude: 37.3712,
    longitude: -122.0398,
    ratings: {
      cleanliness: 4.8,
      accessibility: 4.5,
      quality: 4.7
    },
    isPaid: false,
    reviews: [
      {
        id: '3',
        userId: 'user3',
        userName: 'Mike Johnson',
        rating: 5.0,
        comment: 'Excellent facilities! Very clean and spacious.',
        date: '2024-03-13'
      }
    ]
  },
  {
    id: '3',
    name: 'Sunnyvale Community Center Restroom',
    address: '550 E Remington Dr, Sunnyvale, CA 94087',
    distance: 0.9,
    latitude: 37.3667,
    longitude: -122.0333,
    ratings: {
      cleanliness: 3.5,
      accessibility: 3.0,
      quality: 3.2
    },
    isPaid: false,
    reviews: [
      {
        id: '4',
        userId: 'user4',
        userName: 'Sarah Wilson',
        rating: 3.0,
        comment: 'Basic facilities but could use some maintenance.',
        date: '2024-03-12'
      }
    ]
  }
]; 