// useFeedback — watches simulation state and fires sound + haptic cues
// Called once inside GameplayScreen. Compares previous vs current state each render.

import {useEffect, useRef} from 'react';
import {SimulationState, SeverityTier} from './types';
import {
  hapticCorrectAction,
  hapticHarmfulAction,
  hapticDeteriorationWarning,
  hapticStabilized,
  hapticPatientLost,
  hapticHeartbeat,
} from '../haptics';
import {
  soundBeep,
  soundAlarmWarning,
  soundAlarmCritical,
  soundInterventionApply,
  soundStabilized,
  soundPatientLost,
  soundRejection,
} from '../audio';

const TIER_SEVERITY: Record<SeverityTier, number> = {
  stable:   0,
  warning:  1,
  critical: 2,
  failing:  3,
};

export function useFeedback(simulation: SimulationState | null): void {
  const prev = useRef<SimulationState | null>(null);

  // Heartbeat tick counter — fires beep roughly once per HR cycle
  const beatCounter = useRef(0);

  useEffect(() => {
    if (!simulation) return;

    const p = prev.current;
    prev.current = simulation;

    if (!p) return; // first render — no comparison yet

    // ── Outcome ───────────────────────────────────────────────────────────────
    if (!p.outcome && simulation.outcome === 'stabilized') {
      soundStabilized();
      hapticStabilized();
      return;
    }
    if (!p.outcome && simulation.outcome === 'patient_lost') {
      soundPatientLost();
      hapticPatientLost();
      return;
    }

    // ── Intervention results (correctActions or harmfulActions incremented) ──
    if (simulation.correctActions > p.correctActions) {
      soundInterventionApply();
      hapticCorrectAction();
    }
    if (simulation.harmfulActions > p.harmfulActions) {
      soundRejection();
      hapticHarmfulAction();
    }

    // ── Tier drop (severity increased) ────────────────────────────────────────
    const prevSeverity = TIER_SEVERITY[p.stability.tier];
    const nextSeverity = TIER_SEVERITY[simulation.stability.tier];

    if (nextSeverity > prevSeverity) {
      hapticDeteriorationWarning();
      if (simulation.stability.tier === 'critical' || simulation.stability.tier === 'failing') {
        soundAlarmCritical();
      } else {
        soundAlarmWarning();
      }
    }

    // ── Sustained critical/failing alarm — repeat every 5 ticks ──────────────
    if (
      (simulation.stability.tier === 'critical' || simulation.stability.tier === 'failing') &&
      simulation.elapsedSeconds > 0 &&
      simulation.elapsedSeconds % 5 === 0
    ) {
      soundAlarmCritical();
    }

    // ── Heartbeat beep — fires at a rate proportional to HR ──────────────────
    // Approximately once per beat: HR 60 → every 1s, HR 120 → every 0.5s
    // We run on 1s ticks, so we approximate by counting ticks
    beatCounter.current += 1;
    const beatsPerTick = simulation.vitals.hr / 60; // beats per second = HR/60
    if (beatCounter.current >= Math.round(1 / beatsPerTick)) {
      soundBeep();
      hapticHeartbeat();
      beatCounter.current = 0;
    }
  }, [simulation?.elapsedSeconds, simulation?.outcome, simulation?.correctActions, simulation?.harmfulActions]);
}
