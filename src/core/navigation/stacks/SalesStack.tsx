import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SalesStackParamList } from '../types';
import RecordSaleScreen from '../../../features/sales/screens/RecordSaleScreen';
import SalesHistoryScreen from '../../../features/sales/screens/SalesHistoryScreen';
import { Colors } from '../../theme/colors';

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
                options={{ title: 'Sales History' }}
            />
        </Stack.Navigator>
    );
}
