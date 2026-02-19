import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useInventory } from '../hooks/useInventory';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../constants/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../../core/navigation/types';
import { Product } from '../../../shared/types/product';
import { formatCurrency } from '../../../shared/utils/formatters';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'InventoryList'>;
};

export default function InventoryListScreen({ navigation }: Props) {
    const { products, isLoading, fetchProducts, setSelectedProduct } = useInventory();

    useEffect(() => {
        fetchProducts();
    }, []);

    const handlePress = (product: Product) => {
        setSelectedProduct(product);
        navigation.navigate('ProductDetail', { productId: product.id });
    };

    const renderItem = ({ item }: { item: Product }) => {
        const isLow = item.quantity <= item.lowStockThreshold;
        return (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
                <View style={styles.cardLeft}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.sku}>SKU: {item.sku}</Text>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                    <View style={[styles.badge, isLow ? styles.badgeLow : styles.badgeOk]}>
                        <Text style={[styles.badgeText, { color: isLow ? Colors.danger : Colors.secondary }]}>
                            {item.quantity} in stock
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {isLoading && products.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchProducts} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.empty}>No products yet. Add your first one!</Text>
                    }
                />
            )}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddProduct')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.md },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardLeft: { flex: 1 },
    cardRight: { alignItems: 'flex-end' },
    productName: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.textPrimary },
    sku: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    price: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.primary },
    badge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
    badgeOk: { backgroundColor: Colors.secondaryLight },
    badgeLow: { backgroundColor: Colors.dangerLight },
    badgeText: { fontSize: FontSize.xs, fontWeight: 'bold' },
    empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: FontSize.md },
    fab: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.lg,
        backgroundColor: Colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    fabText: { color: Colors.white, fontSize: 28, fontWeight: 'normal', lineHeight: 32 },
});
