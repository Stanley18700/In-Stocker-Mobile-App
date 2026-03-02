import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsStackParamList } from '../types';
import SettingsScreen from '../../../features/settings/screens/SettingsScreen';
import ProfileScreen from '../../../features/auth/screens/ProfileScreen';
import EditProfileScreen from '../../../features/settings/screens/EditProfileScreen';
import EditPreferencesScreen from '../../../features/settings/screens/EditPreferencesScreen';
import { Colors } from '../../theme';

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: Colors.surface },
                headerTintColor: Colors.primary,
                headerTitleStyle: { fontWeight: 'bold', color: Colors.textPrimary },
                cardStyle: { backgroundColor: Colors.background },
            }}
        >
            <Stack.Screen
                name="SettingsList"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'My Profile' }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Edit Profile' }}
            />
            <Stack.Screen
                name="EditPreferences"
                component={EditPreferencesScreen}
                options={{ title: 'Preferences' }}
            />
        </Stack.Navigator>
    );
}
