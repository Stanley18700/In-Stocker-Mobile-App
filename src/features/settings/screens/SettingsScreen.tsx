import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../../core/theme';

export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>⚙️</Text>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Coming soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emoji: { fontSize: 48, marginBottom: Spacing.md },
    title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
    subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: Spacing.xs },
});
