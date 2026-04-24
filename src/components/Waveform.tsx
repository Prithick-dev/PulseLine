// Waveform — real-time scrolling ECG line using react-native-gifted-charts
// New data points are pushed every frame interval based on current HR.
// The chart auto-scrolls to the latest point, producing a continuous monitor effect.

import React, {useEffect, useRef, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import {Colors} from '../theme/colors';

const CANVAS_HEIGHT = 100;
const MAX_POINTS = 150; // visible window of data points
const TICK_MS = 50; // push a new sample every 50ms for smooth animation

// Generate one ECG-like cycle as normalised y values (0..1)
// 0 = baseline, positive = upward deflection
function generateEcgCycle(): number[] {
  const samples: number[] = [];
  const cycleLen = 60; // samples per heartbeat cycle
  for (let i = 0; i < cycleLen; i++) {
    const t = i / cycleLen;
    let y = 0;
    // P-wave (small bump ~t=0.1)
    if (t > 0.08 && t < 0.2) {
      y += 0.08 * Math.sin(((t - 0.08) / 0.12) * Math.PI);
    }
    // QRS complex (sharp spike ~t=0.35)
    if (t > 0.28 && t < 0.38) {
      y -= 0.12 * Math.sin(((t - 0.28) / 0.05) * Math.PI);
    }
    if (t > 0.33 && t < 0.43) {
      y += 0.55 * Math.sin(((t - 0.33) / 0.05) * Math.PI);
    }
    if (t > 0.38 && t < 0.48) {
      y -= 0.08 * Math.sin(((t - 0.38) / 0.05) * Math.PI);
    }
    // T-wave (slow bump ~t=0.6)
    if (t > 0.52 && t < 0.75) {
      y += 0.12 * Math.sin(((t - 0.52) / 0.23) * Math.PI);
    }
    samples.push(y);
  }
  return samples;
}

// Pre-compute a single ECG cycle
const ECG_CYCLE = generateEcgCycle();

interface WaveformProps {
  hr: number; // current heart rate — drives cycle speed
  width: number; // container width in px
  color: string; // line color
}

export function Waveform({hr, width, color}: WaveformProps) {
  const [data, setData] = React.useState<{value: number}[]>(() =>
    Array.from({length: MAX_POINTS}, () => ({value: 0})),
  );

  // Use refs to avoid re-creating the interval on every HR change
  const hrRef = useRef(hr);
  const cycleIndexRef = useRef(0);

  useEffect(() => {
    hrRef.current = hr;
  }, [hr]);

  const pushSample = useCallback(() => {
    // Samples per beat cycle based on HR
    // At 60 bpm → 1 beat/sec → 20 samples/beat at 50ms intervals
    // At 120 bpm → 2 beats/sec → 10 samples/beat
    const currentHr = hrRef.current;
    const beatsPerSec = Math.max(20, Math.min(250, currentHr)) / 60;
    const samplesPerBeat = 1000 / TICK_MS / beatsPerSec;

    // Map cycle index to ECG_CYCLE position
    const cyclePos =
      (cycleIndexRef.current / samplesPerBeat) * ECG_CYCLE.length;
    const idx = Math.floor(cyclePos) % ECG_CYCLE.length;
    const amplitude = ECG_CYCLE[idx] * CANVAS_HEIGHT * 0.4;

    cycleIndexRef.current = (cycleIndexRef.current + 1) % 10000;

    setData(prev => {
      const next = [...prev, {value: amplitude}];
      if (next.length > MAX_POINTS) {
        return next.slice(next.length - MAX_POINTS);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(pushSample, TICK_MS);
    return () => clearInterval(interval);
  }, [pushSample]);

  const spacing = width / MAX_POINTS;

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        width={width}
        height={CANVAS_HEIGHT}
        spacing={spacing}
        initialSpacing={0}
        endSpacing={0}
        color={color}
        thickness={2}
        hideDataPoints
        hideYAxisText
        hideAxesAndRules
        yAxisOffset={-CANVAS_HEIGHT * 0.25}
        maxValue={CANVAS_HEIGHT * 0.5}
        mostNegativeValue={-CANVAS_HEIGHT * 0.25}
        curved
        curvature={0.15}
        scrollToEnd
        disableScroll
        adjustToWidth
        areaChart={false}
        isAnimated={false}
        animateOnDataChange={false}
        backgroundColor={Colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
});
