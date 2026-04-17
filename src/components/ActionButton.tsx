// ActionButton — intervention button with cooldown ring and eligibility state

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import {Canvas, Path, Skia} from '@shopify/react-native-skia';
import {Colors} from '../theme/colors';

const RING_SIZE = 44;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface ActionButtonProps {
  label: string;
  icon: string;
  cooldownRemaining: number;  // seconds remaining (0 = ready)
  cooldownTotal: number;      // total cooldown in seconds
  eligible: boolean;          // whether condition is met right now
  available: boolean;         // whether this intervention is in the scenario
  onPress: () => void;
}

export function ActionButton({
  label,
  icon,
  cooldownRemaining,
  cooldownTotal,
  eligible,
  available,
  onPress,
}: ActionButtonProps) {
  if (!available) return null;

  const onCooldown = cooldownRemaining > 0;
  const progress = onCooldown ? cooldownRemaining / cooldownTotal : 0;

  // Pulse animation when eligible and ready
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (eligible && !onCooldown) {
      pulseAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {toValue: 1.03, duration: 600, useNativeDriver: true}),
          Animated.timing(pulse, {toValue: 1, duration: 600, useNativeDriver: true}),
        ]),
      );
      pulseAnim.current.start();
    } else {
      pulseAnim.current?.stop();
      pulse.setValue(1);
    }
    return () => pulseAnim.current?.stop();
  }, [eligible, onCooldown]);

  // Cooldown ring path
  const ringPath = Skia.Path.Make();
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  // Draw arc from top (-π/2), clockwise by (1-progress)*2π
  const startAngle = -Math.PI / 2;
  const sweepAngle = (1 - progress) * 2 * Math.PI;
  ringPath.addArc(
    {x: cx - RING_RADIUS, y: cy - RING_RADIUS, width: RING_RADIUS * 2, height: RING_RADIUS * 2},
    (startAngle * 180) / Math.PI,
    (sweepAngle * 180) / Math.PI,
  );

  const borderColor = onCooldown
    ? Colors.border
    : eligible
    ? Colors.stable
    : Colors.textMuted;

  return (
    <Animated.View style={[styles.wrapper, {transform: [{scale: pulse}]}]}>
      <TouchableOpacity
        style={[
          styles.button,
          {borderColor},
          onCooldown && styles.buttonCooldown,
          !eligible && !onCooldown && styles.buttonIneligible,
        ]}
        onPress={onPress}
        activeOpacity={0.7}>
        {/* Cooldown ring overlay */}
        {onCooldown && (
          <View style={styles.ringContainer}>
            <Canvas style={{width: RING_SIZE, height: RING_SIZE}}>
              {/* Background track */}
              <Path
                path={(() => {
                  const bg = Skia.Path.Make();
                  bg.addArc(
                    {x: cx - RING_RADIUS, y: cy - RING_RADIUS, width: RING_RADIUS * 2, height: RING_RADIUS * 2},
                    0,
                    360,
                  );
                  return bg;
                })()}
                color={Colors.border}
                style="stroke"
                strokeWidth={RING_STROKE}
              />
              {/* Progress arc */}
              <Path
                path={ringPath}
                color={Colors.warning}
                style="stroke"
                strokeWidth={RING_STROKE}
                strokeCap="round"
              />
            </Canvas>
            <Text style={styles.cooldownText}>{cooldownRemaining}s</Text>
          </View>
        )}

        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, onCooldown && styles.labelCooldown]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 88,
    overflow: 'hidden',
  },
  buttonCooldown: {
    opacity: 0.5,
  },
  buttonIneligible: {
    opacity: 0.6,
    borderStyle: 'dashed',
  },
  ringContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  cooldownText: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  icon: {
    fontSize: 22,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  labelCooldown: {
    color: Colors.textMuted,
  },
});
