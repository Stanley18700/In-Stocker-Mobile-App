import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Shadow,
    Spacing,
} from '../../../core/theme';

const PRIVACY_POLICY_URL = 'https://in-stocker-d26b7.web.app/privacy-policy.html';

export default function PrivacyPolicyScreen() {
    const openFullPolicy = async () => {
        try {
            await Linking.openURL(PRIVACY_POLICY_URL);
        } catch {
            // Keep screen usable if browser open fails on any platform/runtime.
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            <View style={[styles.card, Shadow.sm]}>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.updated}>Last updated: April 2026</Text>

                <Text style={styles.body}>
                    In-Stocker collects account, inventory, and sales data to provide stock tracking,
                    low-stock alerts, and reorder recommendations. Data is stored securely using Firebase services.
                </Text>

                <Text style={styles.sectionTitle}>What we use data for</Text>
                <Text style={styles.bullet}>• Inventory visibility and stock alerts</Text>
                <Text style={styles.bullet}>• Buffer stock recommendations from sales history</Text>
                <Text style={styles.bullet}>• Sales reports for planning and decision making</Text>

                <Text style={styles.sectionTitle}>Your control</Text>
                <Text style={styles.body}>
                    You can update profile/preferences inside the app and request account or data deletion via support.
                </Text>

                <TouchableOpacity style={styles.button} onPress={openFullPolicy}>
                    <Text style={styles.buttonText}>View Full Policy</Text>
                </TouchableOpacity>

                <Text style={styles.linkHint}>{PRIVACY_POLICY_URL}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    inner: {
        padding: Spacing.lg,
    },
    card: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    updated: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    body: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 21,
    },
    bullet: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 21,
    },
    button: {
        marginTop: Spacing.lg,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 46,
    },
    buttonText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    linkHint: {
        marginTop: Spacing.sm,
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
});
