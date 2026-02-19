import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../core/theme';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PrimaryButtonProps extends TouchableOpacityProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PrimaryButton({
    title,
    onPress,
    loading = false,
    disabled,
    style,
    ...rest
}: PrimaryButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled, style]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
            ) : (
                <Text style={styles.label}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonDisabled: {
        backgroundColor: Colors.textMuted,
    },
    label: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.3,
    },
});
