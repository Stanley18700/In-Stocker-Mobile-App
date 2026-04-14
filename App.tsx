import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import AppNavigator from './src/core/navigation/AppNavigator';

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
