import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Vibration,
    Platform,
    TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { InventoryStackParamList } from '../../../core/navigation/types';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../../core/theme';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'BarcodeScanner'>;
    route: RouteProp<InventoryStackParamList, 'BarcodeScanner'>;
};

export default function BarcodeScannerScreen({ navigation, route }: Props) {
    const { returnTo } = route.params;
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [manualSku, setManualSku] = useState('');

    // Automatically request permission when the screen mounts
    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    const handleBarcodeScan = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        if (Platform.OS !== 'web') {
            Vibration.vibrate(100);
        }
        // Navigate back to the origin screen with the scanned value
        navigation.navigate(returnTo, { scannedSku: data });
    };

    const handleManualSubmit = () => {
        if (manualSku.trim()) {
            setScanned(true);
            navigation.navigate(returnTo, { scannedSku: manualSku.trim() });
        }
    };

    // ── Permission denied ──────────────────────────────────────────────────
    if (!permission) {
        return (
            <View style={styles.center}>
                <Text style={styles.message}>Requesting camera permission…</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.icon}>📷</Text>
                <Text style={styles.message}>Camera access is required to scan barcodes.</Text>
                {permission.canAskAgain ? (
                    <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                        <Text style={styles.grantBtnText}>Grant Permission</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.hint}>
                        Please enable camera permission in your device settings.
                    </Text>
                )}
                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Scanner ─────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarcodeScan}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        'qr', 'ean13', 'ean8', 'code128', 'code39',
                        'upc_a', 'upc_e', 'itf14', 'codabar',
                    ],
                }}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Scan Barcode</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Viewfinder cutout */}
                <View style={styles.viewfinderArea}>
                    <View style={styles.darken} />
                    <View style={styles.viewfinderRow}>
                        <View style={styles.darken} />
                        <View style={styles.viewfinder}>
                            {/* Corner brackets */}
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />
                        </View>
                        <View style={styles.darken} />
                    </View>
                    <View style={styles.darken} />
                </View>

                {/* Bottom hint & Web Fallback */}
                <View style={styles.bottomBar}>
                    {scanned ? (
                        <>
                            <Text style={styles.scannedText}>✓ Barcode scanned!</Text>
                            <TouchableOpacity
                                style={styles.rescanBtn}
                                onPress={() => setScanned(false)}
                            >
                                <Text style={styles.rescanBtnText}>Scan Again</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.hint}>
                                Point the camera at a barcode or QR code
                            </Text>

                            {/* Fallback for Web where CameraView barcode scanning is limited */}
                            {Platform.OS === 'web' && (
                                <View style={styles.webFallbackContainer}>
                                    <Text style={styles.webFallbackHint}>
                                        Note: Web barcode scanning is limited. Enter manually if it fails to scan.
                                    </Text>
                                    <View style={styles.manualInputRow}>
                                        <TextInput
                                            style={styles.manualInput}
                                            placeholder="Enter SKU manually..."
                                            placeholderTextColor="#ccc"
                                            value={manualSku}
                                            onChangeText={setManualSku}
                                            onSubmitEditing={handleManualSubmit}
                                        />
                                        <TouchableOpacity
                                            style={styles.manualSubmitBtn}
                                            onPress={handleManualSubmit}
                                        >
                                            <Text style={styles.manualSubmitText}>Go</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}

const VIEWFINDER_SIZE = 260;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.background,
    },
    icon: { fontSize: 64, marginBottom: Spacing.md },
    message: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        lineHeight: 24,
    },
    hint: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    grantBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    grantBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    cancelBtn: {
        marginTop: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
    },
    cancelBtnText: { fontSize: FontSize.md, color: Colors.textSecondary },

    // ── Overlay layout ──────────────────────────────────────────────────────
    overlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'column',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Spacing.xl + 16,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: { color: '#fff', fontSize: 20, fontWeight: FontWeight.bold },
    topTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },

    viewfinderArea: {
        flex: 1,
        flexDirection: 'column',
    },
    viewfinderRow: {
        flexDirection: 'row',
        height: VIEWFINDER_SIZE,
    },
    darken: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    viewfinder: {
        width: VIEWFINDER_SIZE,
        height: VIEWFINDER_SIZE,
        backgroundColor: 'transparent',
    },

    // Corners
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: '#fff',
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderTopLeftRadius: 4,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderTopRightRadius: 4,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderBottomLeftRadius: 4,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderBottomRightRadius: 4,
    },

    bottomBar: {
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        gap: Spacing.md,
    },
    scannedText: {
        color: '#4ADE80',
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    rescanBtn: {
        borderColor: '#fff',
        borderWidth: 1.5,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
    },
    rescanBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.medium },

    // Web Fallback
    webFallbackContainer: {
        marginTop: Spacing.lg,
        alignItems: 'center',
        width: '100%',
        maxWidth: 300,
    },
    webFallbackHint: {
        color: '#ffcc00',
        fontSize: FontSize.xs,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    manualInputRow: {
        flexDirection: 'row',
        width: '100%',
        gap: Spacing.sm,
    },
    manualInput: {
        flex: 1,
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.sm,
    },
    manualSubmitBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        justifyContent: 'center',
    },
    manualSubmitText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
