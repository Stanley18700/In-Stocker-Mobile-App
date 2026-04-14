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
    Shadow,
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

    const isEmailLike =
        rest.keyboardType === 'email-address' ||
        rest.textContentType === 'emailAddress' ||
        rest.autoComplete === 'email';

    const defaultAutoCapitalize: TextInputProps['autoCapitalize'] = isEmailLike
        ? 'none'
        : secureTextEntry
            ? 'none'
            : 'sentences';

    const defaultAutoCorrect = isEmailLike ? false : !secureTextEntry;

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
                    autoCapitalize={rest.autoCapitalize ?? defaultAutoCapitalize}
                    autoCorrect={rest.autoCorrect ?? defaultAutoCorrect}
                    {...rest}
                />

                {/* Toggle visibility for password fields */}
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsHidden((prev) => !prev)}
                        style={styles.eyeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Text style={styles.eyeIcon}>{isHidden ? 'Show' : 'Hide'}</Text>
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
        fontWeight: '500',
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        minHeight: 54,
        ...Shadow.sm,
    },
    inputFocused: {
        borderColor: Colors.primary,
        backgroundColor: Colors.surface,
        ...Shadow.md,
    },
    inputError: {
        borderColor: Colors.danger,
    },
    input: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xs,
        lineHeight: 20,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    eyeBtn: {
        marginLeft: Spacing.sm,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.xs,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.surfaceAlt,
    },
    eyeIcon: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    errorText: {
        fontSize: FontSize.xs,
        color: Colors.danger,
        marginTop: Spacing.xs,
    },
});
