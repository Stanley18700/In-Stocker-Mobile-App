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
        case 'auth/operation-not-allowed': return 'Email/Password sign-in is not enabled. Please contact support.';
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

    // ── Responsive values ───────────────────────────────────────────────────
    const isSmall  = height < 680;
    const isTablet = width >= 600;
    const isLarge  = height > 900;

    const heroV     = isSmall ? 24 : isLarge ? 56 : 40;
    const logoSize  = isSmall ? 56 : 72;
    const logoEmoji = isSmall ? 28 : 36;
    const titleSize = isSmall ? 20 : 26;
    const cardRadius = isTablet ? 32 : 28;
    const formWidth = isTablet ? Math.min(width * 0.72, 480) : '100%' as const;

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
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Brand panel ─────────────────────────────────────── */}
                <View style={[styles.brandPanel, { paddingVertical: heroV }]}>
                    {isTablet ? (
                        <View style={{ width: formWidth, alignItems: 'center' }}>
                            <BrandContent logoSize={logoSize} logoEmoji={logoEmoji} titleSize={titleSize} isSmall={isSmall} />
                        </View>
                    ) : (
                        <BrandContent logoSize={logoSize} logoEmoji={logoEmoji} titleSize={titleSize} isSmall={isSmall} />
                    )}
                </View>

                {/* ── Form card ───────────────────────────────────────── */}
                <View style={[styles.cardOuter, { borderTopLeftRadius: cardRadius, borderTopRightRadius: cardRadius }]}>
                    <View style={[styles.cardInner, { width: formWidth, alignSelf: 'center' }]}>
                        <Text style={[styles.cardTitle, isSmall && { fontSize: FontSize.lg }]}>
                            Create your account
                        </Text>
                        <Text style={styles.cardSubtitle}>
                            It only takes a minute to get started.
                        </Text>

                        <View style={{ height: isSmall ? Spacing.sm : Spacing.lg }} />

                        {/* Shop info */}
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

                        {/* Account details */}
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

function BrandContent({
    logoSize, logoEmoji, titleSize, isSmall,
}: {
    logoSize: number;
    logoEmoji: number;
    titleSize: number;
    isSmall: boolean;
}) {
    return (
        <>
            <View style={[styles.logoBadge, { width: logoSize, height: logoSize, borderRadius: logoSize * 0.28 }]}>
                <Text style={{ fontSize: logoEmoji }}>📦</Text>
            </View>
            <Text style={[styles.brandName, { fontSize: titleSize }]}>In-Stocker</Text>
            {!isSmall && (
                <Text style={styles.brandTagline}>Set up your shop today</Text>
            )}
        </>
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
        paddingHorizontal: Spacing.xl,
    },
    logoBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    brandName: {
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
    cardOuter: {
        flex: 1,
        backgroundColor: Colors.background,
        marginTop: -16,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: 40,
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
