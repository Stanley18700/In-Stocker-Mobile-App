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

    // ── Responsive values ───────────────────────────────────────────────────
    const isSmall    = height < 680;          // e.g. iPhone SE, short Android
    const isTablet   = width  >= 600;         // tablets, landscape phones, web
    const isLarge    = height > 900;          // large phones / iPads in portrait

    const heroV      = isSmall ? 32 : isLarge ? 72 : 52;   // vertical padding in blue panel
    const logoSize   = isSmall ? 60 : 76;
    const logoEmoji  = isSmall ? 32 : 40;
    const titleSize  = isSmall ? 22 : 28;
    const cardRadius = isTablet ? 32 : 28;
    const formWidth  = isTablet ? Math.min(width * 0.72, 480) : '100%' as const;

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
                        // On tablet/web: center the inner content with a max width
                        <View style={{ width: formWidth, alignItems: 'center' }}>
                            <BrandContent
                                logoSize={logoSize}
                                logoEmoji={logoEmoji}
                                titleSize={titleSize}
                                isSmall={isSmall}
                            />
                        </View>
                    ) : (
                        <BrandContent
                            logoSize={logoSize}
                            logoEmoji={logoEmoji}
                            titleSize={titleSize}
                            isSmall={isSmall}
                        />
                    )}
                </View>

                {/* ── Form card ───────────────────────────────────────── */}
                <View style={[styles.cardOuter, { borderTopLeftRadius: cardRadius, borderTopRightRadius: cardRadius }]}>
                    {/* Centre content on wide screens */}
                    <View style={[styles.cardInner, { width: formWidth, alignSelf: 'center' }]}>
                        <Text style={[styles.cardTitle, isSmall && { fontSize: FontSize.lg }]}>
                            Welcome back 👋
                        </Text>
                        <Text style={styles.cardSubtitle}>Sign in to manage your shop</Text>

                        <View style={{ height: isSmall ? Spacing.md : Spacing.lg }} />

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

// ── Extracted brand content so it can be wrapped for tablet ──────────────────
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
                <Text style={styles.brandTagline}>Inventory made simple</Text>
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
    cardInner: {
        // width and alignSelf set dynamically above
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
