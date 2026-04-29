import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../../../core/navigation/types';
import { usePreferencesStore } from '../store/preferencesStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../../core/theme';
import AppModal from '../../../shared/components/AppModal';
import { useAuthStore } from '../../auth/store/authStore';
import { changeLanguage } from '../../../core/i18n';
import { useTranslation } from 'react-i18next';

type Props = {
    navigation: StackNavigationProp<SettingsStackParamList, 'EditPreferences'>;
};

// Myanmar Kyat first since that's the app's default currency
const CURRENCY_OPTIONS = ['K', '฿', '$', '€', '£', '¥'];
const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'my', label: 'မြန်မာ' },
];

export default function EditPreferencesScreen({ navigation }: Props) {
    const { t } = useTranslation();
    const {
        threshold, setThreshold,
        currency, setCurrency,
        appLanguage, setAppLanguage,
        savePreferences, isSaving
    } = usePreferencesStore();
    const userId = useAuthStore((s) => s.user?.id);

    const [thresholdText, setThresholdText] = useState(String(threshold));
    const [selectedCurrency, setSelectedCurrency] = useState(currency);
    const [selectedLanguage, setSelectedLanguage] = useState(appLanguage);
    const [errorModal, setErrorModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSave = async () => {
        if (!userId) {
            setErrorMsg(t('editPreferences.errorAuth'));
            setErrorModal(true);
            return;
        }
        const parsed = parseInt(thresholdText, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 9999) {
            setErrorMsg(t('editPreferences.errorNumber'));
            setErrorModal(true);
            return;
        }
        try {
            setThreshold(parsed);
            setCurrency(selectedCurrency);
            setAppLanguage(selectedLanguage);
            await changeLanguage(selectedLanguage);
            await savePreferences(userId);
            navigation.goBack();
        } catch {
            setErrorMsg(t('editPreferences.errorSave'));
            setErrorModal(true);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
        >
            {/* ── Low-Stock Threshold ── */}
            <Text style={styles.sectionTitle}>{t('editPreferences.thresholdTitle')}</Text>
            <Text style={styles.sectionHint}>
                {t('editPreferences.thresholdHint')}
            </Text>
            <TextInput
                style={styles.input}
                value={thresholdText}
                onChangeText={setThresholdText}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="5"
                placeholderTextColor={Colors.textMuted}
            />

            {/* ── Currency Symbol ── */}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>{t('editPreferences.currencyTitle')}</Text>
            <Text style={styles.sectionHint}>
                {t('editPreferences.currencyHint')}
            </Text>
            <View style={styles.currenciesRow}>
                {CURRENCY_OPTIONS.map((c) => (
                    <TouchableOpacity
                        key={c}
                        style={[
                            styles.currencyChip,
                            selectedCurrency === c && styles.currencyChipSelected,
                        ]}
                        onPress={() => setSelectedCurrency(c)}
                    >
                        <Text
                            style={[
                                styles.currencyChipText,
                                selectedCurrency === c && styles.currencyChipTextSelected,
                            ]}
                        >
                            {c}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Language ── */}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>{t('editPreferences.languageTitle')}</Text>
            <Text style={styles.sectionHint}>
                {t('editPreferences.languageHint')}
            </Text>
            <View style={styles.currenciesRow}>
                {LANGUAGE_OPTIONS.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.languageChip,
                            selectedLanguage === lang.code && styles.currencyChipSelected,
                        ]}
                        onPress={() => setSelectedLanguage(lang.code)}
                    >
                        <Text
                            style={[
                                styles.currencyChipText,
                                selectedLanguage === lang.code && styles.currencyChipTextSelected,
                            ]}
                        >
                            {lang.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
                <Text style={styles.saveBtnText}>{isSaving ? t('editPreferences.saving') : t('editPreferences.saveBtn')}</Text>
            </TouchableOpacity>

            {/* Validation error modal */}
            <AppModal
                visible={errorModal}
                iconName="alert-circle-outline"
                iconColor={Colors.warning}
                iconBg={Colors.warningLight}
                title={t('common.error')}
                message={errorMsg}
                confirmLabel={t('common.ok')}
                onConfirm={() => setErrorModal(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    sectionHint: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
        lineHeight: 20,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 54,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        lineHeight: 20,
        textAlignVertical: 'center',
        includeFontPadding: false,
        ...Shadow.sm,
    },
    currenciesRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        flexWrap: 'wrap',
    },
    currencyChip: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    languageChip: {
        paddingHorizontal: Spacing.lg,
        height: 52,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencyChipSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '18',
    },
    currencyChipText: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
        fontWeight: FontWeight.medium,
    },
    currencyChipTextSelected: {
        color: Colors.primary,
        fontWeight: FontWeight.bold,
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    saveBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
});
