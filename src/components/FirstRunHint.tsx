// FirstRunHint — dismissible banner shown on first launch of each scenario
// Disappears after the player's first intervention tap

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Colors} from '../theme/colors';

interface FirstRunHintProps {
  visible: boolean;
}

export function FirstRunHint({visible}: FirstRunHintProps) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.container, {opacity}]} pointerEvents="none">
      <Text style={styles.text}>Watch the vitals. Choose an intervention.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
