import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
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
        case 'auth/operation-not-allowed': return 'Email/Password sign-in is not enabled.';
        default: return 'Registration failed. Please try again.';
    }
}

export default function RegisterScreen() {
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'Register'>>();
    const { signUp, isLoading } = useAuth();
    const { width, height } = useWindowDimensions();

    const [shopName, setShopName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // ── Responsive values ────────────────────────────────────────────────────
    // Register has 4 fields so give it a smaller hero (25%) vs login (32%)
    const isTablet      = width >= 600;
    const heroHeight    = height * 0.25;
    const cardMinHeight = height * 0.75;
    const formMaxWidth  = isTablet ? Math.min(width * 0.72, 480) : undefined;
    const logoSize      = Math.min(heroHeight * 0.40, 68);
    const logoRadius    = logoSize * 0.28;
    const titleSize     = Math.min(heroHeight * 0.20, 26);

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
            setError(parseFirebaseError(e?.code ?? ''));
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ minHeight: height }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Brand panel ─────────────────────────────────────── */}
                <View style={[styles.brandPanel, { height: heroHeight }]}>
                    <View style={[
                        styles.logoBadge,
                        { width: logoSize, height: logoSize, borderRadius: logoRadius },
                    ]}>
                        <Text style={{ fontSize: logoSize * 0.50 }}>📦</Text>
                    </View>
                    <Text style={[styles.brandName, { fontSize: titleSize }]}>In-Stocker</Text>
                    {heroHeight > 140 && (
                        <Text style={styles.brandTagline}>Set up your shop today</Text>
                    )}
                </View>

                {/* ── Form card ───────────────────────────────────────── */}
                <View style={[styles.card, { minHeight: cardMinHeight }]}>
                    <View style={[
                        styles.cardInner,
                        formMaxWidth
                            ? { maxWidth: formMaxWidth, alignSelf: 'center', width: '100%' }
                            : undefined,
                    ]}>
                        <Text style={styles.cardTitle}>Create your account</Text>
                        <Text style={styles.cardSubtitle}>It only takes a minute to get started.</Text>

                        <View style={{ height: Spacing.md }} />

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

                        <Text style={[styles.sectionLabel, { marginTop: 4 }]}>ACCOUNT DETAILS</Text>
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

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

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
        flex: 1,
        backgroundColor: BRAND_BLUE,
    },

    // ── Brand panel (pixel height) ──
    brandPanel: {
        backgroundColor: BRAND_BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    brandName: {
        fontWeight: FontWeight.extrabold,
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    brandTagline: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.72)',
        letterSpacing: 0.3,
    },

    // ── Form card ──
    card: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: 40,
        marginTop: -16,
    },
    cardInner: {},
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
    errorIcon: { fontSize: 14 },
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
        minHeight: 52,
    },

    // ── Divider ──
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.medium,
    },

    // ── Footer ──
    footer: { alignItems: 'center', paddingVertical: Spacing.sm },
    footerText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    footerLink: { color: BRAND_BLUE, fontWeight: FontWeight.bold },
});
