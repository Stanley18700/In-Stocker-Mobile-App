import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../../core/theme';
import { useAuthStore } from '../../auth/store/authStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../../../core/navigation/types';
import { usePreferencesStore } from '../store/preferencesStore';
import { APP_CONFIG } from '../../../constants/config';
import AppModal from '../../../shared/components/AppModal';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    navigation: StackNavigationProp<SettingsStackParamList, 'SettingsList'>;
};

interface SettingsRow {
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value?: string;
    onPress: () => void;
}

export default function SettingsScreen({ navigation }: Props) {
    const { user, logout } = useAuthStore();
    const { threshold, currency } = usePreferencesStore();
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    const rows: SettingsRow[] = [
        {
            iconName: 'person-circle-outline',
            label: 'My Profile',
            value: user?.shopName,
            onPress: () => navigation.navigate('Profile'),
        },
        {
            iconName: 'notifications-outline',
            label: 'Low Stock Threshold',
            value: `${threshold} units`,
            onPress: () => navigation.navigate('EditPreferences'),
        },
        {
            iconName: 'cash-outline',
            label: 'Currency',
            value: currency,
            onPress: () => navigation.navigate('EditPreferences'),
        },
        {
            iconName: 'document-text-outline',
            label: 'Privacy Policy',
            onPress: () => navigation.navigate('PrivacyPolicy'),
        },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            {/* Account card */}
            <View style={styles.accountCard}>
                <View style={styles.avatar}>
                    <Ionicons name="storefront-outline" size={36} color={Colors.primary} />
                </View>
                <View style={styles.accountInfo}>
                    <Text style={styles.shopName}>{user?.shopName ?? '—'}</Text>
                    <Text style={styles.ownerName}>{user?.ownerName ?? '—'}</Text>
                    <Text style={styles.email}>{user?.email ?? '—'}</Text>
                </View>
            </View>

            {/* Settings rows */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>GENERAL</Text>
                {rows.map((row, i) => (
                    <TouchableOpacity
                        key={row.label}
                        style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
                        onPress={row.onPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={row.iconName} size={20} color={Colors.textSecondary} style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>{row.label}</Text>
                        <View style={styles.rowRight}>
                            {row.value ? (
                                <Text style={styles.rowValue}>{row.value}</Text>
                            ) : null}
                            <Text style={styles.chevron}>›</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sign out */}
            <TouchableOpacity style={styles.signOutBtn} onPress={() => setShowSignOutModal(true)}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.version}>{APP_CONFIG.appName} v1.0.0</Text>

            {/* Sign-out confirmation modal */}
            <AppModal
                visible={showSignOutModal}
                iconName="log-out-outline"
                iconColor={Colors.danger}
                iconBg={Colors.dangerLight}
                title="Sign Out"
                message="Are you sure you want to sign out?"
                confirmLabel="Sign Out"
                confirmVariant="danger"
                onConfirm={() => { setShowSignOutModal(false); logout(); }}
                cancelLabel="Cancel"
                onCancel={() => setShowSignOutModal(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg },
    accountCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatar: { marginRight: Spacing.md, alignItems: 'center', justifyContent: 'center', width: 44, height: 44 },
    accountInfo: { flex: 1 },
    shopName: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    ownerName: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
    email: { fontSize: FontSize.xs, color: Colors.textMuted },
    section: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.textMuted,
        letterSpacing: 1,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    rowIcon: { marginRight: Spacing.md },
    rowLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
    rowRight: { flexDirection: 'row', alignItems: 'center' },
    rowValue: { fontSize: FontSize.sm, color: Colors.textMuted, marginRight: Spacing.xs },
    chevron: { fontSize: 20, color: Colors.textMuted, lineHeight: 24 },
    signOutBtn: {
        backgroundColor: Colors.dangerLight,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    signOutText: { color: Colors.danger, fontWeight: FontWeight.bold, fontSize: FontSize.md },
    version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted },
});
