import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Colors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

// Stacks & Screens
import HomeScreen from '../../features/home/screens/HomeScreen';
import InventoryStack from './stacks/InventoryStack';
import SalesStack from './stacks/SalesStack';
import AlertsScreen from '../../features/alerts/screens/AlertsScreen';
import SettingsStack from './stacks/SettingsStack';
import { useAlertsStore } from '../../features/alerts/store/alertsStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

function getTabIcon(routeName: keyof MainTabParamList, focused: boolean): keyof typeof Ionicons.glyphMap {
    switch (routeName) {
        case 'Home':
            return focused ? 'home' : 'home-outline';
        case 'Inventory':
            return focused ? 'cube' : 'cube-outline';
        case 'Sales':
            return focused ? 'cart' : 'cart-outline';
        case 'Alerts':
            return focused ? 'notifications' : 'notifications-outline';
        case 'Settings':
            return focused ? 'settings' : 'settings-outline';
        default:
            return focused ? 'ellipse' : 'ellipse-outline';
    }
}

export default function MainNavigator() {
    const alertCount = useAlertsStore((s) => s.lowStockProducts.length);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size, focused }) => (
                    <Ionicons
                        name={getTabIcon(route.name, focused)}
                        size={size ?? 22}
                        color={color}
                    />
                ),
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    paddingBottom: 6,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: 'bold',
                },
                headerStyle: { backgroundColor: Colors.surface },
                headerTitleStyle: {
                    color: Colors.textPrimary,
                    fontWeight: 'bold',
                    fontSize: 18,
                },
                headerShadowVisible: false,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Dashboard' }}
            />
            <Tab.Screen
                name="Inventory"
                component={InventoryStack}
                options={{ headerShown: false, title: 'Inventory' }}
            />
            <Tab.Screen
                name="Sales"
                component={SalesStack}
                options={{ headerShown: false, title: 'Sales' }}
            />
            <Tab.Screen
                name="Alerts"
                component={AlertsScreen}
                options={{
                    title: 'Alerts',
                    tabBarBadge: alertCount > 0 ? alertCount : undefined,
                    tabBarBadgeStyle: { backgroundColor: Colors.danger },
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsStack}
                options={{ headerShown: false, title: 'Settings' }}
            />
        </Tab.Navigator>
    );
}
