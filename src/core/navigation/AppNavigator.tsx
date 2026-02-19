import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { Colors } from '../theme';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { user, isLoading, initializeAuth } = useAuthStore();

    // Restore persisted session on app startup
    useEffect(() => {
        initializeAuth();
    }, []);

    // Splash / loading state while session is being restored
    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // Authenticated — show main app
                    <Stack.Screen name="Main" component={MainNavigator} />
                ) : (
                    // Unauthenticated — show auth flow
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
});
