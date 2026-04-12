import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SalesStackParamList } from '../types';
import RecordSaleScreen from '../../../features/sales/screens/RecordSaleScreen';
import SalesHistoryScreen from '../../../features/sales/screens/SalesHistoryScreen';
import ReportsScreen from '../../../features/sales/screens/ReportsScreen';
import { Colors } from '../../theme';
import BackButton from '../../../shared/components/BackButton';

const Stack = createStackNavigator<SalesStackParamList>();

export default function SalesStack() {
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
                name="RecordSale"
                component={RecordSaleScreen}
                options={{ title: 'Record Sale' }}
            />
            <Stack.Screen
                name="SalesHistory"
                component={SalesHistoryScreen}
                options={({ navigation }) => ({
                    title: 'Sales History',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
            <Stack.Screen
                name="Reports"
                component={ReportsScreen}
                options={({ navigation }) => ({
                    title: 'Reports & Analytics',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
        </Stack.Navigator>
    );
}
