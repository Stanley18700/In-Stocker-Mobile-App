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
        title: '1) Who we are',
        body: 'This Privacy Policy describes how Nyan SInt Zaw ("we", "us") collects, uses, and shares information when you use the In-Stocker mobile application (the "App"). Contact: 6731503077@lamduan.mfu.ac.th',
    },
    {
        title: '2) What the App does',
        body: 'In-Stocker is an inventory and sales tracking app. It helps you:',
        bullets: [
            'Create and manage product records (name, SKU/barcode, quantity, price, category, low-stock threshold).',
            'Record sales and view sales history and reports.',
            'Receive low-stock views/alerts inside the App.',
            'Scan barcodes/QR codes using your device camera (optional; you can also enter SKUs manually).',
        ],
    },
    {
        title: '3.1 Information you provide',
        body: 'We collect the information needed to provide app features:',
        bullets: [
            'Account information: email address and password (for sign-in). Passwords are handled by our authentication provider and are not stored in plain text by us.',
            'Profile information: shop name and owner name (optional fields used to personalize your profile).',
            'Inventory data: product details such as product name, SKU/barcode, quantity, price, category, and low-stock threshold.',
            'Sales data: items sold, quantities, unit prices, totals, and timestamps.',
        ],
    },
    {
        title: '3.2 Device features and 3.3 local storage',
        body: 'Camera access is optional and used only for barcode/QR scanning. The App does not require access to contacts, SMS, call logs, or precise location. Preferences such as currency symbol and default threshold are stored locally on your device.',
    },
    {
        title: '4) How we use information',
        body: 'We use your data to provide secure core app functionality and synchronization.',
        bullets: [
            'Display stock status and low-stock alerts',
            'Generate buffer stock recommendations from sales history',
            'Create sales history views and reports',
            'Sync your records across sessions when signed in',
            'Maintain app security, prevent abuse, and troubleshoot technical issues.',
        ],
    },
    {
        title: '5) Third-party services',
        body: 'We use Firebase (Google) for authentication and cloud database storage (Firebase Authentication and Cloud Firestore). Firebase privacy: https://firebase.google.com/support/privacy',
    },
    {
        title: '6) Sharing of information',
        body: 'We do not sell your personal information. We share information only with service providers (e.g., Firebase), for legal/safety reasons, or during business changes such as mergers/acquisitions where legally required.',
    },
    {
        title: '7) Data retention',
        body: 'We retain account, profile, inventory, and sales data as long as needed to provide the App and while you keep your account. You may request deletion at 6731503077@lamduan.mfu.ac.th.',
    },
    {
        title: '8) Security',
        body: 'We use reasonable administrative, technical, and physical safeguards designed to protect your information. No method of transmission or storage is 100% secure.',
    },
    {
        title: '9) Children’s privacy',
        body: 'The App is not directed to children under 13 (or local legal age), and we do not knowingly collect personal information from children.',
    },
    {
        title: '10) Your choices and rights',
        body: 'You can manage your data and permissions at any time.',
        bullets: [
            'Access/update: you can update certain profile information within the App.',
            'Delete: you can request account/data deletion via 6731503077@lamduan.mfu.ac.th.',
            'Device permissions: you can control camera permission from your device settings. If denied, you can still enter SKUs manually.',
        ],
    },
    {
        title: '11) Changes to this policy',
        body: 'We may update this Privacy Policy from time to time and will post the updated version with a new "Last updated" date.',
    },
    {
        title: '12) Contact us',
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
                    <Text style={styles.privacyUpdated}>Last updated: April 22, 2026</Text>
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
        flex: 1,
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
        flex: 1,
        minHeight: 0,
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
