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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import InputField from '../../../shared/components/InputField';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '../../../core/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../core/navigation/types';

function parseFirebaseError(code: string, fallbackMessage?: string): string {
    switch (code) {
        case 'auth/email-already-in-use': return 'An account with this email already exists.';
        case 'auth/invalid-email': return 'Please enter a valid email address.';
        case 'auth/weak-password': return 'Password must be at least 6 characters.';
        case 'auth/network-request-failed': return 'Network error. Check your connection.';
        case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
        case 'auth/configuration-not-found':
        case 'auth/operation-not-allowed': return 'Email/Password sign-in is not enabled. Please contact support.';
        case 'permission-denied': return 'Cannot save profile to database. Check Firestore rules for /users/{uid}.';
        case 'unavailable': return 'Database is temporarily unavailable. Please try again.';
        default: return fallbackMessage || 'Registration failed. Please try again.';
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
            const message = parseFirebaseError(code, e?.message);
            setError(message);
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
                <View style={styles.logo}>
                    <Ionicons name="cube" size={56} color={Colors.primary} />
                </View>
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
    flex: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xxl,
    },
    logo: { alignItems: 'center', marginBottom: Spacing.sm },
    title: {
        fontSize: FontSize.xxxl,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
        ...Shadow.md,
    },
    error: {
        color: Colors.danger,
        fontSize: FontSize.sm,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    footer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    footerLink: { color: Colors.primary, fontWeight: FontWeight.bold },
});
