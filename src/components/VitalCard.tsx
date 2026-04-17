// VitalCard — displays a single vital sign with label, value, and color state

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Colors} from '../theme/colors';

interface VitalCardProps {
  label: string;
  value: string;
  unit?: string;
  color: string; // semantic status color
}

export function VitalCard({label, value, color, unit}: VitalCardProps) {
  const flash = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  // Flash the value briefly when it changes
  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;

    Animated.sequence([
      Animated.timing(flash, {toValue: 0.4, duration: 80, useNativeDriver: true}),
      Animated.timing(flash, {toValue: 1, duration: 160, useNativeDriver: true}),
    ]).start();
  }, [value]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Animated.Text style={[styles.value, {color, opacity: flash}]}>
          {value}
        </Animated.Text>
        {unit && <Text style={[styles.unit, {color}]}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 72,
  },
  label: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 6,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 32,
  },
  unit: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    paddingBottom: 2,
  },
});
