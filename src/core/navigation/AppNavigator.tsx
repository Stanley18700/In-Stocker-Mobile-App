import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../../features/auth/store/authStore';
import { usePreferencesStore } from '../../features/settings/store/preferencesStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { Colors } from '../theme';
import { inventoryService } from '../../features/inventory/services/inventoryService';
import { salesService } from '../../features/sales/services/salesService';
import { useInventoryStore } from '../../features/inventory/store/inventoryStore';
import { useSalesStore } from '../../features/sales/store/salesStore';
import { useAlertsStore } from '../../features/alerts/store/alertsStore';
import {
    initializeLocalNotifications,
    notifyStockThresholdChanges,
} from '../../features/alerts/services/localNotificationsService';
import OnboardingScreen from '../../features/onboarding/screens/OnboardingScreen';
import { useOnboardingStore } from '../../features/onboarding/store/onboardingStore';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { user, isLoading, initializeAuth } = useAuthStore();
    const { completed: onboardingCompleted, hydrated: onboardingHydrated, hydrate: hydrateOnboarding } = useOnboardingStore();
    const previousLowMapRef = React.useRef<Map<string, boolean>>(new Map());
    const previousOutMapRef = React.useRef<Map<string, boolean>>(new Map());
    const hasPrimedInventoryRef = React.useRef(false);

    // Restore persisted session and preferences on app startup
    useEffect(() => {
        initializeAuth();
        void hydrateOnboarding();
    }, []);

    useEffect(() => {
        if (!user?.id) {
            useInventoryStore.getState().setProducts([]);
            useInventoryStore.getState().setSelectedProduct(null);
            useSalesStore.getState().setSales([]);
            useAlertsStore.getState().setLowStockProducts([]);
            usePreferencesStore.getState().resetToDefaults();
            previousLowMapRef.current = new Map();
            previousOutMapRef.current = new Map();
            hasPrimedInventoryRef.current = false;
            return;
        }

        void usePreferencesStore.getState().hydrate(user.id);
        void initializeLocalNotifications();

        const unsubscribeInventory = inventoryService.subscribeAll(
            user.id,
            (products) => {
                useInventoryStore.getState().setProducts(products);

                const lowStockProducts = products.filter(
                    (p) => p.quantity <= p.lowStockThreshold
                );
                useAlertsStore.getState().setLowStockProducts(lowStockProducts);

                const nextLowMap = new Map<string, boolean>();
                const nextOutMap = new Map<string, boolean>();
                const newlyLowStock = [];
                const newlyOutOfStock = [];

                for (const product of products) {
                    const isLow = product.quantity <= product.lowStockThreshold;
                    const isOut = product.quantity === 0;
                    nextLowMap.set(product.id, isLow);
                    nextOutMap.set(product.id, isOut);

                    const wasLow = previousLowMapRef.current.get(product.id) ?? false;
                    const wasOut = previousOutMapRef.current.get(product.id) ?? false;

                    if (hasPrimedInventoryRef.current && isLow && !wasLow) {
                        newlyLowStock.push(product);
                    }
                    if (hasPrimedInventoryRef.current && isOut && !wasOut) {
                        newlyOutOfStock.push(product);
                    }
                }

                previousLowMapRef.current = nextLowMap;
                previousOutMapRef.current = nextOutMap;

                if (!hasPrimedInventoryRef.current) {
                    hasPrimedInventoryRef.current = true;
                    return;
                }

                if (newlyLowStock.length > 0 || newlyOutOfStock.length > 0) {
                    void notifyStockThresholdChanges({
                        newlyLowStock,
                        newlyOutOfStock,
                    });
                }
            },
            (error) => {
                console.error('Realtime inventory sync failed', error);
            }
        );

        const unsubscribeSales = salesService.subscribeHistory(
            user.id,
            (sales) => {
                useSalesStore.getState().setSales(sales);
            },
            (error) => {
                console.error('Realtime sales sync failed', error);
            }
        );

        return () => {
            unsubscribeInventory();
            unsubscribeSales();
        };
    }, [user?.id]);

    // Splash / loading state while session is being restored
    if (isLoading || !onboardingHydrated) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!onboardingCompleted ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : user ? (
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
