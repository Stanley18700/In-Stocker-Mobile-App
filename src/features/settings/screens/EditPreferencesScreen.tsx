import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../../../core/navigation/types';
import { useAlertsStore } from '../../alerts/store/alertsStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../../core/theme';

type Props = {
    navigation: StackNavigationProp<SettingsStackParamList, 'EditPreferences'>;
};

const CURRENCY_OPTIONS = ['฿', '$', '€', '£', '¥'];

export default function EditPreferencesScreen({ navigation }: Props) {
    const { threshold, setThreshold } = useAlertsStore();
    const { currency, setCurrency } = usePreferencesStore();

    const [thresholdText, setThresholdText] = useState(String(threshold));
    const [selectedCurrency, setSelectedCurrency] = useState(currency);

    const handleSave = () => {
        const parsed = parseInt(thresholdText, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 9999) {
            Alert.alert('Invalid Threshold', 'Please enter a whole number between 1 and 9999.');
            return;
        }
        setThreshold(parsed);
        setCurrency(selectedCurrency);
        navigation.goBack();
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
        >
            {/* ── Low-Stock Threshold ── */}
            <Text style={styles.sectionTitle}>Low-Stock Threshold</Text>
            <Text style={styles.sectionHint}>
                Products with stock at or below this number will trigger an alert.
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
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Currency Symbol</Text>
            <Text style={styles.sectionHint}>
                This symbol will be shown throughout the app.
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

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Preferences</Text>
            </TouchableOpacity>
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
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
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
