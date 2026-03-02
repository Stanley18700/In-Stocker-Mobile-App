import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Colors } from '../theme';

// Stacks & Screens
import HomeScreen from '../../features/home/screens/HomeScreen';
import InventoryStack from './stacks/InventoryStack';
import SalesStack from './stacks/SalesStack';
import AlertsScreen from '../../features/alerts/screens/AlertsScreen';
import SettingsStack from './stacks/SettingsStack';
import { useAlertsStore } from '../../features/alerts/store/alertsStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon map
const TAB_ICONS: Record<keyof MainTabParamList, string> = {
    Home: '🏠',
    Inventory: '📦',
    Sales: '🛒',
    Alerts: '🔔',
    Settings: '⚙️',
};

export default function MainNavigator() {
    const alertCount = useAlertsStore((s) => s.lowStockProducts.length);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color }) => (
                    <Text style={{ fontSize: 20, color }}>
                        {TAB_ICONS[route.name]}
                    </Text>
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
