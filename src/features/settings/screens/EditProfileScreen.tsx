import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../../../core/navigation/types';
import { useAuthStore } from '../../auth/store/authStore';
import { authService } from '../../auth/services/authService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../../core/theme';
import AppModal from '../../../shared/components/AppModal';

type Props = {
    navigation: StackNavigationProp<SettingsStackParamList, 'EditProfile'>;
};

type ModalState = 'none' | 'validation' | 'error';

export default function EditProfileScreen({ navigation }: Props) {
    const { user, updateUser } = useAuthStore();

    const [shopName, setShopName] = useState(user?.shopName ?? '');
    const [ownerName, setOwnerName] = useState(user?.ownerName ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [modal, setModal] = useState<ModalState>('none');
    const [errorMsg, setErrorMsg] = useState('');

    const isDirty =
        shopName.trim() !== (user?.shopName ?? '') ||
        ownerName.trim() !== (user?.ownerName ?? '');

    const handleSave = async () => {
        if (!shopName.trim() || !ownerName.trim()) {
            setErrorMsg('Shop name and owner name cannot be empty.');
            setModal('validation');
            return;
        }
        if (!user?.id) return;

        setIsSaving(true);
        try {
            await authService.updateProfile(user.id, {
                shopName: shopName.trim(),
                ownerName: ownerName.trim(),
            });
            // Update in-memory store immediately so UI reflects change
            updateUser({ shopName: shopName.trim(), ownerName: ownerName.trim() });
            navigation.goBack();
        } catch (e: any) {
            setErrorMsg(e.message ?? 'Could not update profile.');
            setModal('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.hint}>
                Update your shop and owner name. Your email address cannot be changed.
            </Text>

            <Text style={styles.label}>Shop Name *</Text>
            <TextInput
                style={styles.input}
                value={shopName}
                onChangeText={setShopName}
                placeholder="e.g. My Corner Store"
                placeholderTextColor={Colors.textMuted}
                maxLength={60}
            />

            <Text style={styles.label}>Owner Name *</Text>
            <TextInput
                style={styles.input}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="e.g. John Doe"
                placeholderTextColor={Colors.textMuted}
                maxLength={60}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={[styles.input, styles.inputReadonly]}
                value={user?.email ?? ''}
                editable={false}
            />
            <Text style={styles.readonlyHint}>Email cannot be changed.</Text>

            <TouchableOpacity
                style={[styles.saveBtn, (!isDirty || isSaving) && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!isDirty || isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
            </TouchableOpacity>

            {/* Validation error */}
            <AppModal
                visible={modal === 'validation'}
                icon="⚠️"
                title="Required Fields"
                message={errorMsg}
                confirmLabel="OK"
                onConfirm={() => setModal('none')}
            />

            {/* Save error */}
            <AppModal
                visible={modal === 'error'}
                icon="❌"
                title="Save Failed"
                message={errorMsg}
                confirmLabel="OK"
                confirmVariant="danger"
                onConfirm={() => setModal('none')}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg },
    hint: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
        lineHeight: 20,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
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
        marginBottom: Spacing.md,
        ...Shadow.sm,
    },
    inputReadonly: {
        backgroundColor: Colors.surfaceAlt,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
        borderColor: Colors.border,
    },
    readonlyHint: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginBottom: Spacing.lg,
        marginTop: -Spacing.xs,
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    saveBtnDisabled: { backgroundColor: Colors.textMuted },
    saveBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
});
