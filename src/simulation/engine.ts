// Simulation engine — full tick-based update logic
// All rules derived from PHASE1_SIMULATION_SPEC.md

import {
  SimulationState,
  ScenarioId,
  InterventionId,
  ThresholdCounters,
  Vitals,
} from './types';
import {SCENARIOS} from './scenarios';
import {INTERVENTIONS} from './interventions';
import {computeStability} from './formulas';

// ─── Initialization ───────────────────────────────────────────────────────────

function emptyThresholds(): ThresholdCounters {
  return {
    ssAtZero: 0,
    vfibTicks: 0,
    sbpBelowFifty: 0,
    spo2BelowSeventy: 0,
    hrAbove150: 0,
    hrAbove180: 0,
    hrAbove140: 0,
    hrAbove160: 0,
    spo2Below90: 0,
    spo2Below85: 0,
    spo2Below80: 0,
    sbpBelow80: 0,
    sbpBelow70: 0,
    sbpBelow60: 0,
    ssAbove75: 0,
  };
}

export function initSimulation(scenarioId: ScenarioId): SimulationState {
  const scenario = SCENARIOS[scenarioId];
  const vitals = {...scenario.initialVitals};
  const stability = computeStability(vitals);

  const interventionIds = Object.keys(INTERVENTIONS) as InterventionId[];
  const interventions = Object.fromEntries(
    interventionIds.map(id => [
      id,
      {id, cooldownRemaining: 0, activeTicksRemaining: 0},
    ]),
  ) as SimulationState['interventions'];

  return {
    scenarioId,
    vitals,
    stability,
    interventions,
    thresholds: emptyThresholds(),
    elapsedSeconds: 0,
    timeLimitSeconds: scenario.timeLimitSeconds,
    parTimeSeconds: scenario.parTimeSeconds,
    score: 0,
    correctActions: 0,
    harmfulActions: 0,
    outcome: null,
    firstRunHintDismissed: false,
  };
}

// ─── Tick ─────────────────────────────────────────────────────────────────────

export function tick(state: SimulationState): SimulationState {
  if (state.outcome !== null) {
    return state;
  }

  const next: SimulationState = {
    ...state,
    vitals: {...state.vitals},
    thresholds: {...state.thresholds},
    interventions: {...state.interventions},
    elapsedSeconds: state.elapsedSeconds + 1,
  };

  // Tick down cooldowns and active effect durations
  for (const id of Object.keys(next.interventions) as InterventionId[]) {
    const iv = next.interventions[id];
    next.interventions[id] = {
      ...iv,
      cooldownRemaining: Math.max(0, iv.cooldownRemaining - 1),
      activeTicksRemaining: Math.max(0, iv.activeTicksRemaining - 1),
    };
  }

  // Apply passive deterioration for the active scenario
  applyDeterioration(next);

  // Apply active intervention effects
  applyActiveInterventions(next);

  // Clamp vitals to physiologic limits
  next.vitals.hr = clamp(next.vitals.hr, 20, 250);
  next.vitals.sbp = clamp(next.vitals.sbp, 30, 220);
  next.vitals.dbp = clamp(next.vitals.dbp, 10, 140);
  next.vitals.spo2 = clamp(next.vitals.spo2, 50, 100);

  // Recompute stability
  next.stability = computeStability(next.vitals);

  // Update threshold counters (uses updated vitals + stability)
  next.thresholds = updateThresholds(next);

  // Near-death recovery bonus: SS was failing (<25) last tick, now stable (>=75)
  if (
    state.stability.score < 25 &&
    next.stability.score >= 75
  ) {
    next.score = next.score + 300;
  }

  // Check fail/success conditions
  next.outcome = evaluateOutcome(next);

  // Award time bonus on success
  if (next.outcome === 'stabilized') {
    const timeSaved = next.parTimeSeconds - next.elapsedSeconds;
    if (timeSaved > 0) {
      next.score = next.score + timeSaved * 10;
    }
    next.score = next.score + 1000; // base stabilization bonus
  }

  return next;
}

// ─── Deterioration ────────────────────────────────────────────────────────────

function applyDeterioration(state: SimulationState): void {
  const {scenarioId, vitals, thresholds: t} = state;

  if (scenarioId === 'tachyarrhythmia') {
    deteriorateTachyarrhythmia(vitals, t);
  } else if (scenarioId === 'hypoxemia') {
    deteriorateHypoxemia(vitals, t);
  } else if (scenarioId === 'hypotensive_shock') {
    deteriorateHypotensiveShock(vitals, t);
  }
}

// Scenario 1 — Tachyarrhythmia
// Spec: HR +2/tick baseline; rhythm transitions at sustained thresholds;
//       SBP drops when HR high; SpO2 drops when HR very high
function deteriorateTachyarrhythmia(vitals: Vitals, t: ThresholdCounters): void {
  // Baseline: HR rises every tick
  vitals.hr += 2;

  // Rhythm transitions (deterministic threshold-based)
  if (t.hrAbove180 >= 10) {
    vitals.rhythm = 'vfib';
  } else if (t.hrAbove150 >= 10) {
    vitals.rhythm = 'tachy';
  }

  // Secondary perfusion compromise (tuned: -0.5/tick to allow recovery via IV Fluids)
  if (vitals.hr > 140) {
    vitals.sbp -= 0.5;
  }

  // Secondary hypoxia
  if (vitals.hr > 160) {
    vitals.spo2 -= 0.5;
  }
}

// Scenario 2 — Hypoxemia
// Spec: SpO2 -1/tick baseline; hypoxic tachycardia; secondary BP drop;
//       rhythm transition at sustained SpO2 < 80
function deteriorateHypoxemia(vitals: Vitals, t: ThresholdCounters): void {
  // Baseline: SpO2 falls every tick
  vitals.spo2 -= 1;

  // Hypoxic tachycardia
  if (t.spo2Below90 >= 8) {
    vitals.hr += 3;
  }

  // Secondary BP drop from hypoxia
  if (t.spo2Below85 >= 5) {
    vitals.sbp -= 2;
  }

  // Rhythm transition (deterministic: 6s sustained < 80)
  if (t.spo2Below80 >= 6) {
    vitals.rhythm = 'tachy';
  }
}

// Scenario 3 — Hypotensive Shock
// Spec: SBP -2/tick baseline; compensatory tachycardia; secondary SpO2 drop;
//       rhythm transition at sustained SBP < 60
function deteriorateHypotensiveShock(vitals: Vitals, t: ThresholdCounters): void {
  // Baseline: SBP falls every tick (tuned: -1.5 so IV Fluids can outpace the drop)
  vitals.sbp -= 1.5;

  // Compensatory tachycardia
  if (t.sbpBelow80 >= 10) {
    vitals.hr += 3;
  }

  // Secondary SpO2 drop from poor perfusion
  if (t.sbpBelow70 >= 8) {
    vitals.spo2 -= 1;
  }

  // Rhythm transition (deterministic: 6s sustained < 60)
  if (t.sbpBelow60 >= 6) {
    vitals.rhythm = 'tachy';
  }
}

// ─── Active Intervention Effects ──────────────────────────────────────────────

function applyActiveInterventions(state: SimulationState): void {
  const {vitals, interventions, scenarioId} = state;

  // Oxygen — SpO2 +2/tick (or +1/tick if cardiac-origin in Scenario 3)
  if (interventions.oxygen.activeTicksRemaining > 0) {
    const gain = scenarioId === 'hypotensive_shock' ? 1 : 2;
    vitals.spo2 += gain;
  }

  // IV Fluids — SBP +4/tick (or +1.5/tick if HR > 140); overshoot risk handled on apply
  if (interventions.iv_fluids.activeTicksRemaining > 0) {
    const gain = vitals.hr > 140 ? 1.5 : 4;
    vitals.sbp += gain;
  }

  // Rate-Control — HR -5/tick
  if (interventions.rate_control.activeTicksRemaining > 0) {
    vitals.hr -= 5;
  }

  // Cardioversion effect is instant and applied in applyIntervention — no per-tick effect
}

// ─── Intervention Application ─────────────────────────────────────────────────

// Called when a player taps an intervention button.
// Handles immediate effects, risks, and scoring.
export function applyIntervention(
  state: SimulationState,
  id: InterventionId,
): SimulationState {
  if (state.outcome !== null) return state;

  const definition = INTERVENTIONS[id];
  const current = state.interventions[id];

  // Block if on cooldown
  if (current.cooldownRemaining > 0) return state;

  const isEligible = definition.eligibleWhen(state.vitals);

  const next: SimulationState = {
    ...state,
    vitals: {...state.vitals},
    interventions: {
      ...state.interventions,
      [id]: {
        id,
        cooldownRemaining: definition.cooldownSeconds,
        activeTicksRemaining: definition.effectDurationTicks,
      },
    },
  };

  if (isEligible) {
    next.correctActions = state.correctActions + 1;
    next.score = state.score + 150;
    applyEligibleEffect(next, id);
  } else {
    next.harmfulActions = state.harmfulActions + 1;
    next.score = Math.max(0, state.score - 200);
    applyIneligiblePenalty(next, id);
  }

  next.stability = computeStability(next.vitals);
  return next;
}

// Immediate effects when intervention is correctly applied
function applyEligibleEffect(state: SimulationState, id: InterventionId): void {
  const {vitals} = state;

  if (id === 'iv_fluids') {
    // Overshoot risk: if SBP already > 120, apply harmful +10 flat
    if (vitals.sbp > 120) {
      vitals.sbp += 10;
    }
    // Normal case: per-tick gain handled in applyActiveInterventions
  }

  if (id === 'rate_control') {
    // Immediate SBP drop on use
    const sbpDrop = vitals.sbp < 90 ? 8 : 3;
    vitals.sbp -= sbpDrop;
    // Per-tick HR reduction handled in applyActiveInterventions
  }

  if (id === 'cardioversion') {
    // Instant rhythm and HR reset
    vitals.hr = 90;
    vitals.rhythm = 'sinus';
    // Immediate SBP drop
    vitals.sbp -= 10;
  }
}

// Immediate penalties when intervention is misapplied (ineligible)
function applyIneligiblePenalty(state: SimulationState, id: InterventionId): void {
  const {vitals} = state;

  if (id === 'cardioversion') {
    // Misapplied to sinus rhythm — severe penalty
    vitals.sbp -= 20;
    vitals.hr = 55;
  }

  if (id === 'rate_control') {
    // Applied when HR not high enough — still causes BP drop
    vitals.sbp -= 3;
  }

  if (id === 'iv_fluids') {
    // Applied when SBP not low — overshoot
    vitals.sbp += 10;
  }

  // Oxygen misapply (SpO2 already >=95) — no direct harm, just wasted cooldown
}

// ─── Threshold Counters ────────────────────────────────────────────────────────

function updateThresholds(state: SimulationState): ThresholdCounters {
  const {vitals, stability, thresholds: t} = state;

  return {
    ssAtZero: stability.score === 0 ? t.ssAtZero + 1 : 0,
    vfibTicks: vitals.rhythm === 'vfib' ? t.vfibTicks + 1 : 0,
    sbpBelowFifty: vitals.sbp < 50 ? t.sbpBelowFifty + 1 : 0,
    spo2BelowSeventy: vitals.spo2 < 70 ? t.spo2BelowSeventy + 1 : 0,
    hrAbove150: vitals.hr > 150 ? t.hrAbove150 + 1 : 0,
    hrAbove180: vitals.hr > 180 ? t.hrAbove180 + 1 : 0,
    hrAbove140: vitals.hr > 140 ? t.hrAbove140 + 1 : 0,
    hrAbove160: vitals.hr > 160 ? t.hrAbove160 + 1 : 0,
    spo2Below90: vitals.spo2 < 90 ? t.spo2Below90 + 1 : 0,
    spo2Below85: vitals.spo2 < 85 ? t.spo2Below85 + 1 : 0,
    spo2Below80: vitals.spo2 < 80 ? t.spo2Below80 + 1 : 0,
    sbpBelow80: vitals.sbp < 80 ? t.sbpBelow80 + 1 : 0,
    sbpBelow70: vitals.sbp < 70 ? t.sbpBelow70 + 1 : 0,
    sbpBelow60: vitals.sbp < 60 ? t.sbpBelow60 + 1 : 0,
    ssAbove75: stability.score >= 75 ? t.ssAbove75 + 1 : 0,
  };
}

// ─── Outcome Evaluation ────────────────────────────────────────────────────────

function evaluateOutcome(state: SimulationState): SimulationState['outcome'] {
  const {thresholds: t, elapsedSeconds, timeLimitSeconds} = state;

  if (t.ssAtZero >= 5) return 'patient_lost';
  if (t.vfibTicks >= 10) return 'patient_lost';
  if (t.sbpBelowFifty >= 8) return 'patient_lost';
  if (t.spo2BelowSeventy >= 6) return 'patient_lost';
  if (elapsedSeconds >= timeLimitSeconds) return 'patient_lost';

  if (t.ssAbove75 >= 15) return 'stabilized';

  return null;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
