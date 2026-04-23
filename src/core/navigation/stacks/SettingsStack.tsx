import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsStackParamList } from '../types';
import SettingsScreen from '../../../features/settings/screens/SettingsScreen';
import ProfileScreen from '../../../features/auth/screens/ProfileScreen';
import EditProfileScreen from '../../../features/settings/screens/EditProfileScreen';
import EditPreferencesScreen from '../../../features/settings/screens/EditPreferencesScreen';
import PrivacyPolicyScreen from '../../../features/settings/screens/PrivacyPolicyScreen';
import { Colors } from '../../theme';
import BackButton from '../../../shared/components/BackButton';

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
                options={({ navigation }) => ({
                    title: 'My Profile',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={({ navigation }) => ({
                    title: 'Edit Profile',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
            <Stack.Screen
                name="EditPreferences"
                component={EditPreferencesScreen}
                options={({ navigation }) => ({
                    title: 'Preferences',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
            <Stack.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicyScreen}
                options={({ navigation }) => ({
                    title: 'Privacy Policy',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
        </Stack.Navigator>
    );
}
