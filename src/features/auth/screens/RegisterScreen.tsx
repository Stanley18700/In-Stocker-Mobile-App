import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import InputField from '../../../shared/components/InputField';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import { Colors, Spacing, FontSize, FontWeight } from '../../../core/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../core/navigation/types';

function parseFirebaseError(code: string): string {
    switch (code) {
        case 'auth/email-already-in-use': return 'An account with this email already exists.';
        case 'auth/invalid-email': return 'Please enter a valid email address.';
        case 'auth/weak-password': return 'Password must be at least 6 characters.';
        case 'auth/network-request-failed': return 'Network error. Check your connection.';
        case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
        case 'auth/configuration-not-found':
        case 'auth/operation-not-allowed': return 'Email/Password sign-in is not enabled. Please contact support.';
        default: return 'Registration failed. Please try again.';
    }
}

export default function RegisterScreen() {
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'Register'>>();
    const { signUp, isLoading } = useAuth();

    const [shopName, setShopName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        setError(null);

        if (!shopName.trim() || !ownerName.trim() || !email.trim() || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Please enter a valid email address (e.g. you@example.com).');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        try {
            await signUp(email.trim(), password, shopName.trim(), ownerName.trim());
        } catch (e: any) {
            const code = e?.code ?? '';
            setError(parseFirebaseError(code));
        }
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Set up your shop on In-Stocker</Text>

                {/* Form */}
                <View style={styles.form}>
                    <InputField
                        label="Shop Name"
                        value={shopName}
                        onChangeText={setShopName}
                        placeholder="e.g. My Corner Store"
                    />
                    <InputField
                        label="Owner Name"
                        value={ownerName}
                        onChangeText={setOwnerName}
                        placeholder="e.g. John Doe"
                    />
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
                        placeholder="At least 6 characters"
                        secureTextEntry
                        textContentType="newPassword"
                    />

                    {error && <Text style={styles.error}>{error}</Text>}

                    <PrimaryButton
                        title="Create Account"
                        onPress={handleRegister}
                        loading={isLoading}
                    />
                </View>

                {/* Sign In link */}
                <TouchableOpacity
                    style={styles.footer}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.footerText}>
                        Already have an account?{' '}
                        <Text style={styles.footerLink}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
        flexGrow: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    logo: { fontSize: 64, marginBottom: Spacing.sm },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
    },
    form: { width: '100%', maxWidth: 400 },
    error: {
        color: Colors.danger,
        fontSize: FontSize.sm,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    footer: { marginTop: Spacing.xl },
    footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    footerLink: { color: Colors.primary, fontWeight: FontWeight.bold },
});
