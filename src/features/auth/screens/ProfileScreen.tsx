import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../../core/theme';
import { formatDate } from '../../../shared/utils/formatters';
import { SettingsStackParamList } from '../../../core/navigation/types';

type Props = {
    navigation: StackNavigationProp<SettingsStackParamList, 'Profile'>;
};

export default function ProfileScreen({ navigation }: Props) {
    const { user } = useAuthStore();

    const rows = [
        { label: 'Shop Name', value: user?.shopName ?? '—' },
        { label: 'Owner Name', value: user?.ownerName ?? '—' },
        { label: 'Email', value: user?.email ?? '—' },
        { label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>🏪</Text>
                <Text style={styles.shopName}>{user?.shopName ?? '—'}</Text>
                <Text style={styles.ownerName}>{user?.ownerName ?? '—'}</Text>
            </View>

            <View style={styles.card}>
                {rows.map((row, i) => (
                    <View
                        key={row.label}
                        style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
                    >
                        <Text style={styles.rowLabel}>{row.label}</Text>
                        <Text style={styles.rowValue}>{row.value}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditProfile')}
            >
                <Text style={styles.editBtnText}>✏️  Edit Profile</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    avatar: { fontSize: 64, marginBottom: Spacing.sm },
    shopName: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    ownerName: { fontSize: FontSize.md, color: Colors.textSecondary },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    rowLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    rowValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semibold, flexShrink: 1, textAlign: 'right' },
    editBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    editBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
});
