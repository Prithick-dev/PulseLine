// GameplayScreen — Phase 5 full UI + Phase 6 feedback layer
// Monitor zone: scrolling waveform + 2×2 vitals grid
// Controls zone: 2×2 intervention buttons with cooldown rings
// Feedback: haptics + sound cues on every meaningful state change

import React, {useEffect, useRef, useCallback} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {InterventionId, RootStackParamList, SeverityTier, Vitals} from '../../simulation/types';
import {useGameStore} from '../../store/gameStore';
import {initSimulation, tick, applyIntervention} from '../../simulation/engine';
import {SCENARIOS} from '../../simulation/scenarios';
import {INTERVENTIONS} from '../../simulation/interventions';
import {useFeedback} from '../../simulation/useFeedback';
import {configureAudio, unloadAll} from '../../audio';
import {StatusBanner} from '../../components/StatusBanner';
import {Waveform} from '../../components/Waveform';
import {VitalCard} from '../../components/VitalCard';
import {ActionButton} from '../../components/ActionButton';
import {FirstRunHint} from '../../components/FirstRunHint';
import {isFirstRunDismissed, setFirstRunDismissed} from '../../storage/persistence';
import {Colors} from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Gameplay'>;

// Intervention display config
const INTERVENTION_CONFIG: Record<InterventionId, {label: string; icon: string}> = {
  oxygen:        {label: 'OXYGEN',      icon: '💨'},
  iv_fluids:     {label: 'IV FLUIDS',   icon: '💉'},
  rate_control:  {label: 'RATE-CTRL',   icon: '🫀'},
  cardioversion: {label: 'CARDIOVERT',  icon: '⚡'},
};

const INTERVENTION_ORDER: InterventionId[] = [
  'oxygen',
  'iv_fluids',
  'rate_control',
  'cardioversion',
];

export function GameplayScreen({route, navigation}: Props) {
  const {scenarioId} = route.params;
  const {simulation, clearSimulation} = useGameStore();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {width: screenWidth} = useWindowDimensions();
  const [showHint, setShowHint] = React.useState(false);

  // Configure audio on mount, unload on unmount
  useEffect(() => {
    configureAudio();
    return () => { unloadAll(); };
  }, []);

  // Initialize simulation on mount
  useEffect(() => {
    const initial = initSimulation(scenarioId);
    useGameStore.getState().setSimulation(initial);

    // Show first-run hint if not yet dismissed for this scenario
    if (!isFirstRunDismissed(scenarioId)) {
      setShowHint(true);
    }

    tickRef.current = setInterval(() => {
      useGameStore.setState(state => {
        if (!state.simulation) return state;
        return {simulation: tick(state.simulation)};
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      clearSimulation();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  // Fire haptic + sound cues on state changes
  useFeedback(simulation);

  // Navigate to result when outcome is set
  useEffect(() => {
    if (!simulation?.outcome) return;
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    navigation.replace('Result', {
      scenarioId: simulation.scenarioId,
      outcome: simulation.outcome,
      score: simulation.score,
      elapsedSeconds: simulation.elapsedSeconds,
      parTimeSeconds: simulation.parTimeSeconds,
      correctActions: simulation.correctActions,
      harmfulActions: simulation.harmfulActions,
    });
  }, [simulation?.outcome]);

  const handleIntervention = useCallback((id: InterventionId) => {
    // Dismiss first-run hint on first tap
    if (showHint) {
      setShowHint(false);
      setFirstRunDismissed(scenarioId);
    }
    useGameStore.setState(state => {
      if (!state.simulation) return state;
      return {simulation: applyIntervention(state.simulation, id)};
    });
  }, [showHint, scenarioId]);

  if (!simulation) return null;

  const scenario = SCENARIOS[scenarioId];
  const {vitals, stability, interventions} = simulation;
  const timeRemaining = simulation.timeLimitSeconds - simulation.elapsedSeconds;

  // Waveform color tracks HR severity
  const waveColor = vitalColor(hrTier(vitals.hr));

  return (
    <View style={styles.container}>
      {/* ── Status bar ─────────────────────────────────────────── */}
      <StatusBanner
        scenarioName={scenario.name}
        timeRemaining={timeRemaining}
        tier={stability.tier}
        stabilityScore={stability.score}
      />

      {/* ── Monitor zone ────────────────────────────────────────── */}
      <View style={styles.monitorZone}>
        {/* Waveform */}
        <View style={styles.waveformContainer}>
          <Waveform
            hr={vitals.hr}
            width={screenWidth}
            color={waveColor}
          />
        </View>

        {/* 2×2 vitals grid */}
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalsRow}>
            <VitalCard
              label="HEART RATE"
              value={String(Math.round(vitals.hr))}
              unit="bpm"
              color={vitalColor(hrTier(vitals.hr))}
            />
            <VitalCard
              label="SpO₂"
              value={String(Math.round(vitals.spo2))}
              unit="%"
              color={vitalColor(spo2Tier(vitals.spo2))}
            />
          </View>
          <View style={styles.vitalsRow}>
            <VitalCard
              label="BLOOD PRESSURE"
              value={`${Math.round(vitals.sbp)}/${Math.round(vitals.dbp)}`}
              color={vitalColor(sbpTier(vitals.sbp))}
            />
            <VitalCard
              label="RHYTHM"
              value={vitals.rhythm.toUpperCase()}
              color={vitalColor(rhythmTier(vitals.rhythm))}
            />
          </View>
        </View>
      </View>

      {/* ── Controls zone ───────────────────────────────────────── */}
      <View style={styles.controlsZone}>
        <FirstRunHint visible={showHint} />
        <View style={styles.buttonGrid}>
          {INTERVENTION_ORDER.map(id => {
            const def = INTERVENTIONS[id];
            const ivState = interventions[id];
            const isAvailable = scenario.availableInterventions.includes(id);
            const isEligible = def.eligibleWhen(vitals);

            return (
              <ActionButton
                key={id}
                label={INTERVENTION_CONFIG[id].label}
                icon={INTERVENTION_CONFIG[id].icon}
                cooldownRemaining={ivState.cooldownRemaining}
                cooldownTotal={def.cooldownSeconds}
                eligible={isEligible}
                available={isAvailable}
                onPress={() => handleIntervention(id)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Tier helpers ─────────────────────────────────────────────────────────────

function vitalColor(tier: SeverityTier | string): string {
  switch (tier) {
    case 'stable':   return Colors.stable;
    case 'warning':  return Colors.warning;
    case 'critical': return Colors.critical;
    case 'failing':  return Colors.failing;
    default:         return Colors.textPrimary;
  }
}

function hrTier(hr: number): SeverityTier {
  if (hr >= 60 && hr <= 100) return 'stable';
  if ((hr > 100 && hr <= 130) || (hr >= 50 && hr < 60)) return 'warning';
  if (hr <= 160) return 'critical';
  return 'failing';
}

function sbpTier(sbp: number): SeverityTier {
  if (sbp >= 90 && sbp <= 140) return 'stable';
  if (sbp >= 80) return 'warning';
  if (sbp >= 60) return 'critical';
  return 'failing';
}

function spo2Tier(spo2: number): SeverityTier {
  if (spo2 >= 95) return 'stable';
  if (spo2 >= 90) return 'warning';
  if (spo2 >= 85) return 'critical';
  return 'failing';
}

function rhythmTier(rhythm: Vitals['rhythm']): SeverityTier {
  if (rhythm === 'sinus') return 'stable';
  if (rhythm === 'tachy') return 'warning';
  return 'failing';
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  monitorZone: {
    flex: 55,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  waveformContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    overflow: 'hidden',
  },
  vitalsGrid: {
    flex: 1,
    padding: 10,
    gap: 8,
  },
  vitalsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  controlsZone: {
    flex: 40,
    padding: 12,
    justifyContent: 'center',
  },
  buttonGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
