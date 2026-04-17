// Semantic color palette — from PHASE2_UX_SPEC.md section 5
export const Colors = {
  // Backgrounds
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A26',

  // Semantic status colors
  stable: '#22C55E',    // green
  warning: '#F59E0B',   // amber
  critical: '#EF4444',  // red
  failing: '#991B1B',   // dark red

  // Action accent
  oxygen: '#3B82F6',    // blue

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#475569',

  // UI chrome
  border: '#1E293B',
  buttonDefault: '#1E293B',
  buttonDimmed: '#111827',
} as const;

export type ColorKey = keyof typeof Colors;
