import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Platform,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../hooks/useInventory';
import {
    Colors,
    Spacing,
    FontSize,
    BorderRadius,
    FontWeight,
    Shadow,
} from '../../../core/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../../core/navigation/types';
import { Product } from '../../../shared/types/product';
import { formatCurrency } from '../../../shared/utils/formatters';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'InventoryList'>;
};

export default function InventoryListScreen({ navigation }: Props) {
    const { products, isLoading, fetchProducts, setSelectedProduct } = useInventory();
    const [query, setQuery] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const filtered = query.trim()
        ? products.filter(
              (p) =>
                  p.name.toLowerCase().includes(query.toLowerCase()) ||
                  p.sku.toLowerCase().includes(query.toLowerCase())
          )
        : products;

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
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or SKU..."
                    placeholderTextColor={Colors.textMuted}
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <Text style={styles.clearBtn}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>
            {isLoading && products.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchProducts} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.empty}>
                            {query ? 'No products match your search.' : 'No products yet. Add your first one!'}
                        </Text>
                    }
                />
            )}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddProduct')}
                accessibilityRole="button"
                accessibilityLabel="Add product"
            >
                <Ionicons name="add" size={30} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        margin: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
        ...Shadow.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        height: 36,
        paddingVertical: 0,
    },
    clearBtn: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontWeight: FontWeight.semibold,
        paddingVertical: Spacing.xs,
    },
    list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
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
        ...Shadow.sm,
    },
    cardLeft: { flex: 1 },
    cardRight: { alignItems: 'flex-end' },
    productName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
    sku: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
    badge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
    badgeOk: { backgroundColor: Colors.secondaryLight },
    badgeLow: { backgroundColor: Colors.dangerLight },
    badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
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
        ...Shadow.md,
        ...Platform.select({
            web: { cursor: 'pointer' },
            default: {},
        }),
    },
});

