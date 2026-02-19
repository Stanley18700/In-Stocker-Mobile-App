import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Colors } from '../theme/colors';

// Stacks & Screens
import HomeScreen from '../../features/home/screens/HomeScreen';
import InventoryStack from './stacks/InventoryStack';
import SalesStack from './stacks/SalesStack';
import SettingsScreen from '../../features/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon map
const TAB_ICONS: Record<keyof MainTabParamList, string> = {
    Home: '🏠',
    Inventory: '📦',
    Sales: '🛒',
    Settings: '⚙️',
};

export default function MainNavigator() {
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
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
        </Tab.Navigator>
    );
}
