import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/lib/database/db';
import AppNavigator from './src/core/navigation/AppNavigator';

// Initialize SQLite tables once on app startup (synchronous, safe to call here)
initDatabase();

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
