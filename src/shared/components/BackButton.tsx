/**
 * BackButton — A cross-platform header back button.
 *
 * React Navigation's default back arrow doesn't render on Expo Web.
 * Use this as the `headerLeft` option in all sub-screens.
 *
 * Usage in a Stack.Screen:
 *   options={({ navigation }) => ({
 *     headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
 *   })}
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight } from '../../core/theme';

interface Props {
    onPress: () => void;
    label?: string;
}

export default function BackButton({ onPress, label = 'Back' }: Props) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.btn} activeOpacity={0.7}>
            <Text style={styles.text}>‹  {label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    text: {
        color: Colors.primary,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
});
