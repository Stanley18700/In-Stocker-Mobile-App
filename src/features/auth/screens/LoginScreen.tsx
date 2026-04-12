import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import InputField from '../../../shared/components/InputField';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../../core/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../core/navigation/types';

const BRAND_BLUE = '#1D4ED8';

export default function LoginScreen() {
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'Login'>>();
    const { login, isLoading } = useAuthStore();
    const { width, height } = useWindowDimensions();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // ── Responsive breakpoints ──────────────────────────────────────────────
    const isTablet      = width >= 600;
    const heroHeight    = height * 0.32;          // brand panel = 32% of screen
    const cardMinHeight = height * 0.68;          // card fills remaining 68%
    const formMaxWidth  = isTablet ? Math.min(width * 0.72, 480) : undefined;
    const logoSize      = Math.min(heroHeight * 0.38, 80);   // scales with panel
    const logoRadius    = logoSize * 0.28;
    const titleSize     = Math.min(heroHeight * 0.16, 28);

    const handleLogin = async () => {
        setError(null);
        if (!email.trim() || !password) {
            setError('Please enter your email and password.');
            return;
        }
        const result = await login(email.trim(), password);
        if (result) setError(result);
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
                        <Text style={{ fontSize: logoSize * 0.5 }}>📦</Text>
                    </View>
                    <Text style={[styles.brandName, { fontSize: titleSize }]}>In-Stocker</Text>
                    {heroHeight > 160 && (
                        <Text style={styles.brandTagline}>Inventory made simple</Text>
                    )}
                </View>

                {/* ── Form card ───────────────────────────────────────── */}
                <View style={[styles.card, { minHeight: cardMinHeight }]}>
                    {/* Centre on tablets / wide screens */}
                    <View style={[styles.cardInner, formMaxWidth ? { maxWidth: formMaxWidth, alignSelf: 'center', width: '100%' } : undefined]}>
                        <Text style={styles.cardTitle}>Welcome back 👋</Text>
                        <Text style={styles.cardSubtitle}>Sign in to manage your shop</Text>

                        <View style={{ height: Spacing.lg }} />

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
                            placeholder="Enter your password"
                            secureTextEntry
                            textContentType="password"
                        />

                        {error ? (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorIcon}>⚠️</Text>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <PrimaryButton
                            title="Sign In"
                            onPress={handleLogin}
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
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.footerText}>
                                Don't have an account?{' '}
                                <Text style={styles.footerLink}>Create one free →</Text>
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

    // ── Brand panel (fixed pixel height) ──
    brandPanel: {
        backgroundColor: BRAND_BLUE,
        alignItems: 'center',
        justifyContent: 'center',
        // height set dynamically
    },
    logoBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
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

    // ── Form card (white, rounded top) ──
    card: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: 40,
        marginTop: -16,
    },
    cardInner: {
        // maxWidth / alignSelf set dynamically for tablet
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
