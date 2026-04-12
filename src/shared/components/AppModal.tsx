/**
 * AppModal — A reusable in-app modal dialog that works on both web and mobile.
 *
 * Replaces window.alert / window.confirm / Alert.alert so the UX is always
 * consistent with the app's design system, regardless of platform.
 *
 * Usage:
 *   <AppModal
 *     visible={showModal}
 *     title="Confirm Sale"
 *     message="3 items · K 420,000"
 *     onConfirm={handleConfirm}
 *     onCancel={() => setShowModal(false)}
 *   />
 *
 * For an info-only (no cancel) dialog, omit onCancel and set confirmLabel="OK".
 */

import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../core/theme';

interface AppModalButton {
    label: string;
    onPress: () => void;
    /** 'primary' = filled brand colour, 'danger' = red, 'ghost' = outlined */
    variant?: 'primary' | 'danger' | 'ghost';
}

interface AppModalProps {
    visible: boolean;
    /** Emoji or short word shown in a circle at the top */
    icon?: string;
    title: string;
    message?: string;
    /** Primary action button (right-side / top) */
    confirmLabel?: string;
    onConfirm: () => void;
    confirmVariant?: 'primary' | 'danger';
    /** Optional cancel button — omit for info-only dialogs */
    cancelLabel?: string;
    onCancel?: () => void;
}

export default function AppModal({
    visible,
    icon,
    title,
    message,
    confirmLabel = 'Confirm',
    onConfirm,
    confirmVariant = 'primary',
    cancelLabel = 'Cancel',
    onCancel,
}: AppModalProps) {
    const confirmStyle =
        confirmVariant === 'danger' ? styles.btnDanger : styles.btnPrimary;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Icon badge */}
                    {icon ? (
                        <View style={styles.iconBadge}>
                            <Text style={styles.iconText}>{icon}</Text>
                        </View>
                    ) : null}

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    {message ? (
                        <Text style={styles.message}>{message}</Text>
                    ) : null}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Buttons */}
                    <View style={[styles.btnRow, !onCancel && styles.btnRowSingle]}>
                        {onCancel && (
                            <TouchableOpacity
                                style={[styles.btn, styles.btnGhost]}
                                onPress={onCancel}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.btnGhostText}>{cancelLabel}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.btn, confirmStyle, !onCancel && styles.btnFull]}
                            onPress={onConfirm}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 20px 60px rgba(0,0,0,0.25)' } as any
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.20,
                shadowRadius: 24,
                elevation: 16,
            }),
    },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.surfaceAlt,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    iconText: {
        fontSize: 30,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    message: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.sm,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.md,
    },
    btnRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        width: '100%',
    },
    btnRowSingle: {
        justifyContent: 'center',
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnFull: {
        flex: 1,
    },
    btnPrimary: {
        backgroundColor: Colors.primary,
    },
    btnDanger: {
        backgroundColor: Colors.danger,
    },
    btnGhost: {
        backgroundColor: Colors.surfaceAlt,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    btnPrimaryText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    btnGhostText: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
});
