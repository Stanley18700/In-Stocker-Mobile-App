import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../constants/theme';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.avatar}>👤</Text>
                <Text style={styles.shopName}>{user?.shopName ?? '—'}</Text>
                <Text style={styles.ownerName}>{user?.ownerName ?? '—'}</Text>
                <Text style={styles.email}>{user?.email ?? '—'}</Text>
            </View>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatar: { fontSize: 56, marginBottom: Spacing.md },
    shopName: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    ownerName: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xs },
    email: { fontSize: FontSize.sm, color: Colors.textMuted },
    signOutBtn: {
        backgroundColor: Colors.dangerLight,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    signOutText: { color: Colors.danger, fontWeight: 'bold', fontSize: FontSize.md },
});
