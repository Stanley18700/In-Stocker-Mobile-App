import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import InputField from '../../../shared/components/InputField';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import { Colors, FontSize, FontWeight, Spacing } from '../../../core/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../core/navigation/types';

export default function LoginScreen() {
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'Login'>>();
    const { login, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);

        if (!email.trim() || !password) {
            setError('Please enter your email and password.');
            return;
        }

        const result = await login(email.trim(), password);

        if (result) {
            // result is an error string when login fails
            setError(result);
        }
        // On success, useAuthStore updates session → AppNavigator
        // automatically switches to MainNavigator. No navigation call needed.
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <Text style={styles.logo}>📦</Text>
                <Text style={styles.title}>In-Stocker</Text>
                <Text style={styles.subtitle}>Sign in to manage your shop</Text>

                {/* Form */}
                <View style={styles.form}>
                    <InputField
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                    />
                    <InputField
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                        textContentType="password"
                    />

                    {/* Error message */}
                    {error && <Text style={styles.error}>{error}</Text>}

                    <PrimaryButton
                        title="Sign In"
                        onPress={handleLogin}
                        loading={isLoading}
                        style={styles.button}
                    />

                    {/* Sign Up Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.link}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
    },
    logo: {
        fontSize: 56,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.xxxl,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    form: {
    },
    error: {
        fontSize: FontSize.sm,
        color: Colors.danger,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    button: {
        marginTop: Spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    footerText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
    link: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
});
