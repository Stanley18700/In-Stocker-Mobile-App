import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { InventoryStackParamList } from '../types';
import InventoryListScreen from '../../../features/inventory/screens/InventoryListScreen';
import ProductDetailScreen from '../../../features/inventory/screens/ProductDetailScreen';
import AddProductScreen from '../../../features/inventory/screens/AddProductScreen';
import EditProductScreen from '../../../features/inventory/screens/EditProductScreen';
import BarcodeScannerScreen from '../../../features/inventory/screens/BarcodeScannerScreen';
import BufferStockScreen from '../../../features/inventory/screens/BufferStockScreen';
import { Colors } from '../../theme';
import BackButton from '../../../shared/components/BackButton';

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
                options={({ navigation }) => ({
                    title: 'Product Detail',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
            <Stack.Screen
                name="AddProduct"
                component={AddProductScreen}
                options={({ navigation }) => ({
                    title: 'Add Product',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
            <Stack.Screen
                name="EditProduct"
                component={EditProductScreen}
                options={({ navigation }) => ({
                    title: 'Edit Product',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
            <Stack.Screen
                name="BarcodeScanner"
                component={BarcodeScannerScreen}
                options={{ title: 'Scan Barcode', headerShown: false }}
            />
            <Stack.Screen
                name="BufferStock"
                component={BufferStockScreen}
                options={({ navigation }) => ({
                    title: 'Buffer Stock Recommendations',
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
            />
        </Stack.Navigator>
    );
}
