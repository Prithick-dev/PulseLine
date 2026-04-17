// StatusBanner — top strip showing scenario name, timer, and stability indicator

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {SeverityTier} from '../simulation/types';
import {Colors} from '../theme/colors';

function tierColor(tier: SeverityTier): string {
  switch (tier) {
    case 'stable':   return Colors.stable;
    case 'warning':  return Colors.warning;
    case 'critical': return Colors.critical;
    case 'failing':  return Colors.failing;
  }
}

function tierLabel(tier: SeverityTier): string {
  switch (tier) {
    case 'stable':   return 'STABLE';
    case 'warning':  return 'WARNING';
    case 'critical': return 'CRITICAL';
    case 'failing':  return 'FAILING';
  }
}

interface StatusBannerProps {
  scenarioName: string;
  timeRemaining: number;   // seconds
  tier: SeverityTier;
  stabilityScore: number;
}

export function StatusBanner({
  scenarioName,
  timeRemaining,
  tier,
  stabilityScore,
}: StatusBannerProps) {
  const mm = String(Math.floor(Math.max(0, timeRemaining) / 60)).padStart(2, '0');
  const ss = String(Math.max(0, timeRemaining % 60)).padStart(2, '0');

  // Blink the dot when critical or failing
  const blink = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (tier === 'critical' || tier === 'failing') {
      const speed = tier === 'failing' ? 300 : 600;
      blinkAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(blink, {toValue: 0.15, duration: speed, useNativeDriver: true}),
          Animated.timing(blink, {toValue: 1, duration: speed, useNativeDriver: true}),
        ]),
      );
      blinkAnim.current.start();
    } else {
      blinkAnim.current?.stop();
      blink.setValue(1);
    }
    return () => blinkAnim.current?.stop();
  }, [tier]);

  const color = tierColor(tier);

  return (
    <View style={styles.container}>
      {/* Left: scenario name */}
      <Text style={styles.scenarioLabel} numberOfLines={1}>
        {scenarioName}
      </Text>

      {/* Center: timer */}
      <Text
        style={[
          styles.timer,
          timeRemaining <= 15 && styles.timerUrgent,
        ]}>
        {mm}:{ss}
      </Text>

      {/* Right: stability indicator */}
      <View style={styles.stabilityGroup}>
        <Animated.View
          style={[styles.dot, {backgroundColor: color, opacity: blink}]}
        />
        <Text style={[styles.tierLabel, {color}]}>{tierLabel(tier)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scenarioLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
  },
  timer: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    flex: 1,
  },
  timerUrgent: {
    color: Colors.critical,
  },
  stabilityGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
