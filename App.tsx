import 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import AppNavigator from './src/core/navigation/AppNavigator';

// Expo SDK 53+ shows a noisy red LogBox in Expo Go when expo-notifications is present.
// This does not affect standalone / production builds.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

export default function App() {
  const [fontsLoaded] = useFonts({
    Ionicons: require('./assets/fonts/Ionicons-v2.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
