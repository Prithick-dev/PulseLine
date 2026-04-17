// Waveform — scrolling ECG-style line using React Native Skia + Reanimated
// The waveform is driven by a rolling buffer of HR-derived sample points.
// It scrolls continuously left on the UI thread — zero React re-renders.

import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Canvas, Path, Skia} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import {Colors} from '../theme/colors';

const CANVAS_HEIGHT = 80;
const BUFFER_SIZE = 120; // how many samples we keep
const SCROLL_SPEED_PER_SEC = 60; // px/s — how fast the line scrolls left

// Generate one ECG-like cycle as normalised y values (0..1)
// 0 = top of canvas, 1 = bottom
function generateEcgCycle(hrNorm: number): number[] {
  // hrNorm: 0 (low HR, slow) to 1 (high HR, fast)
  // Returns 30 samples for one beat
  const samples: number[] = [];
  for (let i = 0; i < 30; i++) {
    const t = i / 30;
    // Baseline
    let y = 0.5;
    // P-wave (small bump ~t=0.1)
    if (t > 0.08 && t < 0.2) y -= 0.08 * Math.sin(((t - 0.08) / 0.12) * Math.PI);
    // QRS complex (sharp spike ~t=0.35)
    if (t > 0.28 && t < 0.38) y += 0.12 * Math.sin(((t - 0.28) / 0.05) * Math.PI);
    if (t > 0.33 && t < 0.43) y -= 0.55 * Math.sin(((t - 0.33) / 0.05) * Math.PI);
    if (t > 0.38 && t < 0.48) y += 0.08 * Math.sin(((t - 0.38) / 0.05) * Math.PI);
    // T-wave (slow bump ~t=0.6)
    if (t > 0.52 && t < 0.75) y -= 0.12 * Math.sin(((t - 0.52) / 0.23) * Math.PI);
    samples.push(Math.max(0.05, Math.min(0.95, y)));
  }
  return samples;
}

interface WaveformProps {
  hr: number;       // current heart rate — drives cycle speed + amplitude
  width: number;    // container width in px
  color: string;    // line color
}

export function Waveform({hr, width, color}: WaveformProps) {
  // Normalised HR: 0 = 40bpm, 1 = 200bpm
  const hrNorm = Math.max(0, Math.min(1, (hr - 40) / 160));

  // Rolling sample buffer — holds BUFFER_SIZE y-values
  const buffer = useSharedValue<number[]>(
    Array.from({length: BUFFER_SIZE}, () => 0.5),
  );

  // Scroll offset — advances on the UI thread at SCROLL_SPEED_PER_SEC px/s
  const scrollX = useSharedValue(0);

  useEffect(() => {
    scrollX.value = withRepeat(
      withTiming(BUFFER_SIZE, {
        duration: (BUFFER_SIZE / SCROLL_SPEED_PER_SEC) * 1000,
        easing: Easing.linear,
      }),
      -1, // infinite
      false,
    );
  }, []);

  // Inject new ECG samples whenever HR changes
  useEffect(() => {
    const cycle = generateEcgCycle(hrNorm);
    runOnUI(() => {
      'worklet';
      const current = buffer.value.slice();
      // Append cycle samples, keeping buffer at BUFFER_SIZE
      current.push(...cycle);
      buffer.value = current.slice(-BUFFER_SIZE);
    })();
  }, [Math.round(hr / 5)]); // re-inject when HR changes by >=5

  // Build the Skia path on the UI thread using the current buffer + scroll
  const path = useDerivedValue(() => {
    'worklet';
    const pts = buffer.value;
    const skPath = Skia.Path.Make();
    const step = width / (pts.length - 1);

    const offsetX = (scrollX.value / BUFFER_SIZE) * width;

    for (let i = 0; i < pts.length; i++) {
      const x = i * step - offsetX;
      const y = pts[i] * CANVAS_HEIGHT;
      if (i === 0) skPath.moveTo(x, y);
      else skPath.lineTo(x, y);
    }
    return skPath;
  });

  return (
    <Canvas style={[styles.canvas, {width, height: CANVAS_HEIGHT}]}>
      <Path
        path={path}
        color={color}
        style="stroke"
        strokeWidth={1.8}
        strokeCap="round"
        strokeJoin="round"
      />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: 'transparent',
  },
});
