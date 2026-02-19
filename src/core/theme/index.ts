// =============================================================================
// In-Stocker — Theme System
// Import individual tokens or the default `theme` object.
// =============================================================================

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const Colors = {
    // Brand
    primary: '#2563EB',  // Blue 600
    primaryLight: '#DBEAFE',  // Blue 100
    primaryDark: '#1D4ED8',  // Blue 700

    secondary: '#10B981',  // Emerald 500
    secondaryLight: '#D1FAE5',  // Emerald 100
    secondaryDark: '#059669',  // Emerald 600

    // Semantic
    danger: '#EF4444',  // Red 500
    dangerLight: '#FEE2E2',  // Red 100
    dangerDark: '#DC2626',  // Red 600

    warning: '#F59E0B',  // Amber 500
    warningLight: '#FEF3C7',  // Amber 100
    warningDark: '#D97706',  // Amber 600

    success: '#22C55E',  // Green 500
    successLight: '#DCFCE7',  // Green 100
    successDark: '#16A34A',  // Green 600

    // Neutrals
    background: '#F8FAFC',  // Slate 50
    surface: '#FFFFFF',  // White
    surfaceAlt: '#F1F5F9',  // Slate 100

    border: '#E2E8F0',  // Slate 200
    borderStrong: '#CBD5E1',  // Slate 300

    textPrimary: '#1E293B',  // Slate 800
    textSecondary: '#64748B',  // Slate 500
    textMuted: '#94A3B8',  // Slate 400
    textInverse: '#FFFFFF',

    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
} as const;

// ---------------------------------------------------------------------------
// Spacing — base unit: 8px
// ---------------------------------------------------------------------------

export const Spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,   // base
    md: 16,  // 2×
    lg: 24,  // 3×
    xl: 32,  // 4×
    xxl: 48,  // 6×
    xxxl: 64,  // 8×
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
} as const;

export const FontWeight = {
    regular: 'normal',
    medium: '500',
    semibold: '600',
    bold: 'bold',
    extrabold: '900',
} as const;


export const LineHeight = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
} as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------

export const BorderRadius = {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Shadows (cross-platform)
// ---------------------------------------------------------------------------

export const Shadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
} as const;

// ---------------------------------------------------------------------------
// Composed theme object — use this for convenience
// ---------------------------------------------------------------------------

export const theme = {
    colors: Colors,
    spacing: Spacing,
    fontSize: FontSize,
    fontWeight: FontWeight,
    lineHeight: LineHeight,
    borderRadius: BorderRadius,
    shadow: Shadow,
} as const;

export type Theme = typeof theme;
