# Toiletty

A React Native application for finding and reviewing public toilets. Built with Expo and TypeScript.

## Features

- Interactive map interface for locating nearby toilets
- Detailed toilet information including:
  - Cleanliness ratings
  - Accessibility ratings
  - Quality ratings
  - Payment status
  - User reviews
- Add new toilet locations with:
  - Name and address
  - Payment status
  - Initial ratings
- Review system with:
  - Separate ratings for cleanliness, accessibility, and quality
  - Optional comments
  - User attribution
- Distance-based sorting of nearby toilets
- Modern and intuitive UI design

## Tech Stack

- React Native 0.72.9
- React 19.0.0
- Expo 53
- TypeScript
- React Navigation v6
- React Native Maps
- Bottom Tab Navigator

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start --clear
```

3. Run on expo go:
- Press `s` to switch to go from developement buil

## Environment Setup

### iOS
Add the following to your `Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby toilets</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need your location to show nearby toilets</string>
```

### Android
Add the following to your `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## Project Structure

- `/screens` - Main application screens
  - `HomeScreen.tsx` - Main landing page
  - `Map.tsx` - Interactive map view
  - `ToiletDetail.tsx` - Detailed toilet information
  - `CreateToilet.tsx` - Add new toilet form
- `/components` - Reusable UI components
- `/lib` - Utility functions and API integration
- `/types` - TypeScript type definitions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
