import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Colors,
    Spacing,
    FontSize,
    BorderRadius,
} from '../../core/theme';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InputFieldProps extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    label?: string;
    error?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InputField({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    label,
    error,
    style,
    ...rest
}: InputFieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isHidden, setIsHidden] = useState(secureTextEntry);

    return (
        <View style={styles.wrapper}>
            {/* Optional label */}
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputRow,
                    isFocused && styles.inputFocused,
                    !!error && styles.inputError,
                ]}
            >
                <TextInput
                    style={[styles.input, style]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={isHidden}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    {...rest}
                />

                {/* Toggle visibility for password fields */}
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsHidden((prev) => !prev)}
                        style={styles.eyeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Text style={styles.eyeIcon}>{isHidden ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Inline error message */}
            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        minHeight: 50,
    },
    inputFocused: {
        borderColor: Colors.primary,
    },
    inputError: {
        borderColor: Colors.danger,
    },
    input: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        paddingVertical: Spacing.sm,
    },
    eyeBtn: {
        paddingLeft: Spacing.sm,
    },
    eyeIcon: {
        fontSize: 16,
    },
    errorText: {
        fontSize: FontSize.xs,
        color: Colors.danger,
        marginTop: Spacing.xs,
    },
});
