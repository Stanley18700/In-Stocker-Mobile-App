import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { InventoryStackParamList } from '../types';
import InventoryListScreen from '../../../features/inventory/screens/InventoryListScreen';
import ProductDetailScreen from '../../../features/inventory/screens/ProductDetailScreen';
import AddProductScreen from '../../../features/inventory/screens/AddProductScreen';
import EditProductScreen from '../../../features/inventory/screens/EditProductScreen';
import BarcodeScannerScreen from '../../../features/inventory/screens/BarcodeScannerScreen';
import { Colors } from '../../theme';

const Stack = createStackNavigator<InventoryStackParamList>();

export default function InventoryStack() {
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
                name="InventoryList"
                component={InventoryListScreen}
                options={{ title: 'Inventory' }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'Product Detail' }}
            />
            <Stack.Screen
                name="AddProduct"
                component={AddProductScreen}
                options={{ title: 'Add Product' }}
            />
            <Stack.Screen
                name="EditProduct"
                component={EditProductScreen}
                options={{ title: 'Edit Product' }}
            />
            <Stack.Screen
                name="BarcodeScanner"
                component={BarcodeScannerScreen}
                options={{ title: 'Scan Barcode', headerShown: false }}
            />
        </Stack.Navigator>
    );
}
