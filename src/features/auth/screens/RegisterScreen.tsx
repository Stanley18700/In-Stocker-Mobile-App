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
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../../core/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../core/navigation/types';

const BRAND_BLUE = '#1D4ED8';

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
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Brand panel ─────────────────────────────────────── */}
                <View style={styles.brandPanel}>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoEmoji}>📦</Text>
                    </View>
                    <Text style={styles.brandName}>In-Stocker</Text>
                    <Text style={styles.brandTagline}>Set up your shop today</Text>
                </View>

                {/* ── Form card ───────────────────────────────────────── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Create your account</Text>
                    <Text style={styles.cardSubtitle}>
                        It only takes a minute to get started.
                    </Text>

                    <View style={styles.formGap} />

                    {/* Shop info section */}
                    <Text style={styles.sectionLabel}>SHOP INFORMATION</Text>
                    <InputField
                        label="Shop Name"
                        value={shopName}
                        onChangeText={setShopName}
                        placeholder="e.g. My Corner Store"
                        autoCapitalize="words"
                    />
                    <InputField
                        label="Owner Name"
                        value={ownerName}
                        onChangeText={setOwnerName}
                        placeholder="e.g. John Doe"
                        autoCapitalize="words"
                    />

                    {/* Account section */}
                    <Text style={[styles.sectionLabel, { marginTop: Spacing.xs }]}>ACCOUNT DETAILS</Text>
                    <InputField
                        label="Email address"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        autoCapitalize="none"
                    />
                    <InputField
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="At least 6 characters"
                        secureTextEntry
                        textContentType="newPassword"
                    />

                    {/* Error banner */}
                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorIcon}>⚠️</Text>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <PrimaryButton
                        title="Create Account"
                        onPress={handleRegister}
                        loading={isLoading}
                        style={styles.button}
                    />

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Sign in link */}
                    <TouchableOpacity
                        style={styles.footer}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.footerText}>
                            Already have an account?{' '}
                            <Text style={styles.footerLink}>Sign In →</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BRAND_BLUE,
    },
    scroll: {
        flexGrow: 1,
    },

    // ── Brand panel ──
    brandPanel: {
        backgroundColor: BRAND_BLUE,
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 44,
        paddingHorizontal: Spacing.xl,
    },
    logoBadge: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    logoEmoji: {
        fontSize: 36,
    },
    brandName: {
        fontSize: FontSize.xxxl,
        fontWeight: FontWeight.extrabold,
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    brandTagline: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 0.3,
    },

    // ── Form card ──
    card: {
        flex: 1,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xxxl,
        marginTop: -16,
    },
    cardTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    formGap: {
        height: Spacing.lg,
    },

    // ── Section label ──
    sectionLabel: {
        fontSize: 10,
        fontWeight: FontWeight.bold,
        color: Colors.textMuted,
        letterSpacing: 1.2,
        marginBottom: Spacing.sm,
    },

    // ── Error banner ──
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        gap: Spacing.xs,
    },
    errorIcon: {
        fontSize: 14,
    },
    errorText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.danger,
        fontWeight: FontWeight.medium,
    },

    // ── Button ──
    button: {
        marginTop: Spacing.xs,
        borderRadius: BorderRadius.lg,
        minHeight: 54,
    },

    // ── Divider ──
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.medium,
    },

    // ── Footer ──
    footer: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    footerText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    footerLink: {
        color: BRAND_BLUE,
        fontWeight: FontWeight.bold,
    },
});
