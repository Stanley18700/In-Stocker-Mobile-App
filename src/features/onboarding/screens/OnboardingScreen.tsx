import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Shadow,
    Spacing,
} from '../../../core/theme';
import { useOnboardingStore } from '../store/onboardingStore';

type Slide = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    subtitle: string;
    bullets: string[];
};

type PolicySection = {
    title: string;
    body: string;
    bullets?: string[];
};

const slides: Slide[] = [
    {
        icon: 'storefront-outline',
        title: 'Welcome to In-Stocker',
        subtitle: 'Built for small retail shops that need clear, simple inventory decisions.',
        bullets: [
            'Track products and stock in one place',
            'Record daily sales in seconds',
            'See what needs attention before stock runs out',
        ],
    },
    {
        icon: 'warning-outline',
        title: 'The Problem We Solve',
        subtitle: 'Shop owners often guess what to buy, causing shortages or dead stock.',
        bullets: [
            'Uncertain supply makes restocking stressful',
            'Manual tracking is slow and error-prone',
            'Overbuying ties up cash and shelf space',
        ],
    },
    {
        icon: 'analytics-outline',
        title: 'How In-Stocker Helps',
        subtitle: 'Turn sales history into practical reorder actions.',
        bullets: [
            'Low-stock alerts flag risk items early',
            'Buffer stock suggestions reduce guesswork',
            'Sales reports support monthly and yearly planning',
        ],
    },
];

const policySections: PolicySection[] = [
    {
        title: 'What data we collect',
        body: 'In-Stocker collects account, profile, inventory, and sales data that you enter so core features can work correctly.',
        bullets: [
            'Account info: email and password (handled securely through Firebase Authentication)',
            'Profile info: shop name and owner name',
            'Inventory data: products, SKU/barcode, quantities, thresholds, and prices',
            'Sales data: sold items, quantity, totals, and timestamps',
        ],
    },
    {
        title: 'How we use your data',
        body: 'Your data is used only to provide and improve inventory and sales management in the app.',
        bullets: [
            'Display stock status and low-stock alerts',
            'Generate buffer stock recommendations from sales history',
            'Create sales history views and reports',
            'Sync your records across sessions when signed in',
        ],
    },
    {
        title: 'Third-party services',
        body: 'We use Firebase services (Google) for authentication and cloud database storage. We do not sell your personal information.',
    },
    {
        title: 'Your choices and rights',
        body: 'You can request account/data deletion and manage device permissions at any time.',
        bullets: [
            'Camera access is optional and only used for barcode scanning',
            'You can still manually enter SKU codes if camera permission is denied',
            'Contact support for data deletion requests',
        ],
    },
    {
        title: 'Contact',
        body: 'For privacy questions or requests, contact: 6731503077@lamduan.mfu.ac.th',
    },
];

export default function OnboardingScreen() {
    const markCompleted = useOnboardingStore((s) => s.markCompleted);
    const [index, setIndex] = useState(0);
    const [step, setStep] = useState<'slides' | 'policy'>('slides');
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const cardAnim = useRef(new Animated.Value(1)).current;

    const isPolicyStep = step === 'policy';
    const isLastSlide = index === slides.length - 1;
    const totalSteps = slides.length + 1;
    const activeStep = isPolicyStep ? totalSteps : index + 1;
    const slide = useMemo(() => slides[index], [index]);

    useEffect(() => {
        cardAnim.setValue(0.96);
        Animated.timing(cardAnim, {
            toValue: 1,
            duration: 240,
            useNativeDriver: true,
        }).start();
    }, [cardAnim, index]);

    const next = async () => {
        if (!isPolicyStep && !isLastSlide) {
            setIndex((v) => Math.min(v + 1, slides.length - 1));
            return;
        }

        if (!isPolicyStep && isLastSlide) {
            setStep('policy');
            return;
        }

        if (!acceptedPrivacy || isSaving) {
            return;
        }

        setIsSaving(true);
        await markCompleted();
        setIsSaving(false);
    };

    const prev = () => {
        if (isPolicyStep) {
            setStep('slides');
            return;
        }
        setIndex((v) => Math.max(v - 1, 0));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.brand}>In-Stocker</Text>
                <Text style={styles.progress}>Step {activeStep} of {totalSteps}</Text>
            </View>

            {!isPolicyStep ? (
                <>
                    <Animated.View
                        style={[
                            styles.card,
                            Shadow.md,
                            {
                                opacity: cardAnim,
                                transform: [
                                    {
                                        translateY: cardAnim.interpolate({
                                            inputRange: [0.96, 1],
                                            outputRange: [6, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.iconWrap}>
                            <Ionicons name={slide.icon} size={34} color={Colors.primary} />
                        </View>

                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.subtitle}>{slide.subtitle}</Text>

                        <View style={styles.bulletsWrap}>
                            {slide.bullets.map((item) => (
                                <View key={item} style={styles.bulletRow}>
                                    <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
                                    <Text style={styles.bulletText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    <View style={styles.dotsRow}>
                        {slides.map((_, dotIndex) => (
                            <View
                                key={String(dotIndex)}
                                style={[
                                    styles.dot,
                                    dotIndex === index && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                </>
            ) : (
                <View style={[styles.privacyCard, Shadow.sm]}>
                    <Text style={styles.privacyTitle}>Privacy Policy</Text>
                    <Text style={styles.privacyUpdated}>Last updated: April 2026</Text>
                    <ScrollView style={styles.privacyScroll}>
                        {policySections.map((section) => (
                            <View key={section.title} style={styles.policySection}>
                                <Text style={styles.policySectionTitle}>{section.title}</Text>
                                <Text style={styles.privacyText}>{section.body}</Text>
                                {section.bullets?.map((item) => (
                                    <Text key={item} style={styles.policyBullet}>• {item}</Text>
                                ))}
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setAcceptedPrivacy((v) => !v)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.checkbox, acceptedPrivacy && styles.checkboxChecked]}>
                            {acceptedPrivacy && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                        </View>
                        <Text style={styles.checkboxLabel}>
                            I have read and agree to this Privacy Policy.
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.secondaryBtn, index === 0 && !isPolicyStep && styles.secondaryBtnDisabled]}
                    disabled={index === 0 && !isPolicyStep}
                    onPress={prev}
                >
                    <Text style={[styles.secondaryBtnText, index === 0 && !isPolicyStep && styles.secondaryBtnTextDisabled]}>
                        Back
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.primaryBtn,
                        isPolicyStep && !acceptedPrivacy && styles.primaryBtnDisabled,
                    ]}
                    onPress={next}
                    disabled={isPolicyStep && !acceptedPrivacy}
                >
                    <Text style={styles.primaryBtnText}>
                        {isPolicyStep
                            ? (isSaving ? 'Finishing...' : 'Agree & Get Started')
                            : (isLastSlide ? 'Review Policy' : 'Next')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl,
        paddingBottom: Spacing.xl,
    },
    header: {
        marginBottom: Spacing.md,
    },
    brand: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    progress: {
        marginTop: 2,
        color: Colors.textMuted,
        fontSize: FontSize.xs,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    iconWrap: {
        width: 58,
        height: 58,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        marginBottom: Spacing.md,
    },
    bulletsWrap: {
        gap: Spacing.sm,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.borderStrong,
        opacity: 0.45,
    },
    dotActive: {
        width: 22,
        opacity: 1,
        backgroundColor: Colors.primary,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    bulletText: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSize.sm,
    },
    privacyCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    privacyTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    privacyUpdated: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        marginBottom: Spacing.sm,
    },
    privacyScroll: {
        maxHeight: 260,
        marginBottom: Spacing.sm,
    },
    policySection: {
        marginBottom: Spacing.md,
    },
    policySectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    privacyText: {
        color: Colors.textSecondary,
        fontSize: FontSize.xs,
        lineHeight: 18,
    },
    policyBullet: {
        marginTop: 4,
        color: Colors.textSecondary,
        fontSize: FontSize.xs,
        lineHeight: 18,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: Colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxLabel: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSize.sm,
    },
    footer: {
        marginTop: 'auto',
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    secondaryBtn: {
        flex: 1,
        minHeight: 48,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
    },
    secondaryBtnDisabled: {
        borderColor: Colors.border,
    },
    secondaryBtnText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.textPrimary,
    },
    secondaryBtnTextDisabled: {
        color: Colors.textMuted,
    },
    primaryBtn: {
        flex: 1.3,
        minHeight: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
    },
    primaryBtnDisabled: {
        backgroundColor: Colors.textMuted,
    },
    primaryBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
});
