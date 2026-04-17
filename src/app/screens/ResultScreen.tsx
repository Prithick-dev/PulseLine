import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../simulation/types';
import {setBestScore, getBestScore} from '../../storage/persistence';
import {Colors} from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export function ResultScreen({route, navigation}: Props) {
  const {
    scenarioId,
    outcome,
    score,
    elapsedSeconds,
    parTimeSeconds,
    correctActions,
    harmfulActions,
  } = route.params;

  const isSuccess = outcome === 'stabilized';
  const timeDiff = parTimeSeconds - elapsedSeconds;

  // Best score (read before updating so we can show previous best)
  const prevBest = useRef(getBestScore(scenarioId));
  const isNewBest = isSuccess && score > prevBest.current;

  useEffect(() => {
    if (isSuccess) setBestScore(scenarioId, score);
  }, []);

  // Score count-up animation
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(score / 40);
    const interval = setInterval(() => {
      current = Math.min(current + step, score);
      setDisplayScore(current);
      if (current >= score) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  // Entrance slide-up animation
  const slideY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, {toValue: 0, duration: 400, useNativeDriver: true}),
      Animated.timing(opacity, {toValue: 1, duration: 400, useNativeDriver: true}),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, {opacity, transform: [{translateY: slideY}]}]}>
        {/* Outcome */}
        <Text style={[styles.outcome, {color: isSuccess ? Colors.stable : Colors.critical}]}>
          {isSuccess ? 'STABILIZED' : 'PATIENT LOST'}
        </Text>

        {/* Score */}
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreValue}>{displayScore}</Text>
          <Text style={styles.scoreLabel}>SCORE</Text>
          {isNewBest && (
            <Text style={styles.newBest}>NEW BEST</Text>
          )}
          {!isNewBest && prevBest.current > 0 && (
            <Text style={styles.prevBest}>Best: {prevBest.current}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsBlock}>
          <StatRow label="Time" value={`${elapsedSeconds}s`} />
          <StatRow
            label="Par"
            value={`${parTimeSeconds}s`}
            note={timeDiff > 0 ? `+${timeDiff * 10} pts` : undefined}
          />
          <StatRow label="Correct actions" value={String(correctActions)} />
          <StatRow
            label="Harmful actions"
            value={String(harmfulActions)}
            accent={harmfulActions > 0}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.replace('Gameplay', {scenarioId})}>
            <Text style={styles.buttonLabel}>RETRY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('Home')}>
            <Text style={[styles.buttonLabel, styles.buttonLabelSecondary]}>HOME</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function StatRow({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{label}</Text>
      <View style={statStyles.right}>
        <Text style={[statStyles.value, accent && {color: Colors.critical}]}>
          {value}
        </Text>
        {note && <Text style={statStyles.note}>{note}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  inner: {
    paddingHorizontal: 32,
    gap: 36,
  },
  outcome: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    lineHeight: 80,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 3,
  },
  newBest: {
    fontSize: 11,
    color: Colors.stable,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 2,
  },
  prevBest: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  statsBlock: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: Colors.stable,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
    letterSpacing: 4,
  },
  buttonLabelSecondary: {
    color: Colors.textSecondary,
  },
});

const statStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  note: {
    fontSize: 11,
    color: Colors.stable,
  },
});
