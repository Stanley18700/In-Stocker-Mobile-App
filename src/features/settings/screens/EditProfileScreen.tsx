import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../../../core/navigation/types';
import { useAuthStore } from '../../auth/store/authStore';
import { authService } from '../../auth/services/authService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../../core/theme';

type Props = {
    navigation: StackNavigationProp<SettingsStackParamList, 'EditProfile'>;
};

export default function EditProfileScreen({ navigation }: Props) {
    const { user, updateUser } = useAuthStore();

    const [shopName, setShopName] = useState(user?.shopName ?? '');
    const [ownerName, setOwnerName] = useState(user?.ownerName ?? '');
    const [isSaving, setIsSaving] = useState(false);

    const isDirty =
        shopName.trim() !== (user?.shopName ?? '') ||
        ownerName.trim() !== (user?.ownerName ?? '');

    const handleSave = async () => {
        if (!shopName.trim() || !ownerName.trim()) {
            Alert.alert('Error', 'Shop name and owner name cannot be empty.');
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
            Alert.alert('Save Failed', e.message ?? 'Could not update profile.');
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
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    inputReadonly: {
        backgroundColor: '#F1F5F9',
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
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
    saveBtnDisabled: {
        backgroundColor: Colors.textMuted,
    },
    saveBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
});
