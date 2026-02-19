import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../constants/theme';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shopName, setShopName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const { signUp, isLoading } = useAuth();

    const handleRegister = async () => {
        if (!email || !password || !shopName || !ownerName) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        try {
            await signUp(email.trim(), password, shopName, ownerName);
            Alert.alert('Success', 'Account created! Please check your email to verify.');
        } catch (e: any) {
            Alert.alert('Registration Failed', e.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
                <TextInput
                    style={styles.input}
                    placeholder="Shop Name"
                    placeholderTextColor={Colors.textMuted}
                    value={shopName}
                    onChangeText={setShopName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Owner Name"
                    placeholderTextColor={Colors.textMuted}
                    value={ownerName}
                    onChangeText={setOwnerName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.xl, paddingTop: Spacing.lg },
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
    button: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonText: { color: Colors.white, fontSize: FontSize.md, fontWeight: 'bold' },
});
