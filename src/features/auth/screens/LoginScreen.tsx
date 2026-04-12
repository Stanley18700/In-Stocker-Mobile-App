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
import { useAuthStore } from '../store/authStore';
import InputField from '../../../shared/components/InputField';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../../core/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../core/navigation/types';

const BRAND_BLUE = '#1D4ED8';
const BRAND_BLUE_DARK = '#1E40AF';

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
            setError(result);
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
                    <Text style={styles.brandTagline}>Inventory made simple</Text>
                </View>

                {/* ── Form card ───────────────────────────────────────── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Welcome back 👋</Text>
                    <Text style={styles.cardSubtitle}>Sign in to manage your shop</Text>

                    <View style={styles.formGap} />

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

                    {/* Error banner */}
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

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Sign up link */}
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
        paddingTop: 60,
        paddingBottom: 48,
        paddingHorizontal: Spacing.xl,
    },
    logoBadge: {
        width: 80,
        height: 80,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    logoEmoji: {
        fontSize: 40,
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
        minHeight: 480,
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
