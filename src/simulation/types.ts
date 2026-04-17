// Core simulation types for PulseLine
// All values derived from PHASE1_SIMULATION_SPEC.md

export type RhythmState = 'sinus' | 'tachy' | 'vfib';

export type SeverityTier = 'stable' | 'warning' | 'critical' | 'failing';

export type ScenarioId = 'tachyarrhythmia' | 'hypoxemia' | 'hypotensive_shock';

export type InterventionId = 'oxygen' | 'iv_fluids' | 'rate_control' | 'cardioversion';

export type OutcomeType = 'stabilized' | 'patient_lost';

// Live vital signs — floats internally, displayed as integers
export interface Vitals {
  hr: number;       // Heart rate (bpm)
  sbp: number;      // Systolic blood pressure (mmHg)
  dbp: number;      // Diastolic blood pressure (mmHg)
  spo2: number;     // Oxygen saturation (%)
  rhythm: RhythmState;
}

// Derived stability score and tier
export interface StabilityState {
  score: number;    // 0–100
  tier: SeverityTier;
}

// Per-intervention runtime state
export interface InterventionState {
  id: InterventionId;
  cooldownRemaining: number;  // seconds remaining on cooldown (0 = ready)
  activeTicksRemaining: number; // ticks remaining for ongoing effect (0 = not active)
}

// Counters for consecutive ticks in a danger threshold
export interface ThresholdCounters {
  ssAtZero: number;         // consecutive ticks SS = 0
  vfibTicks: number;        // consecutive ticks rhythm = vfib
  sbpBelowFifty: number;    // consecutive ticks SBP < 50
  spo2BelowSeventy: number; // consecutive ticks SpO2 < 70
  // Scenario-specific deterioration counters
  hrAbove150: number;       // ticks HR > 150 (Scenario 1)
  hrAbove180: number;       // ticks HR > 180 (Scenario 1)
  hrAbove140: number;       // ticks HR > 140 (Scenario 1)
  hrAbove160: number;       // ticks HR > 160 (Scenario 1)
  spo2Below90: number;      // ticks SpO2 < 90 (Scenario 2)
  spo2Below85: number;      // ticks SpO2 < 85 (Scenario 2)
  spo2Below80: number;      // ticks SpO2 < 80 (Scenario 2)
  sbpBelow80: number;       // ticks SBP < 80 (Scenario 3)
  sbpBelow70: number;       // ticks SBP < 70 (Scenario 3)
  sbpBelow60: number;       // ticks SBP < 60 (Scenario 3)
  // Success counter
  ssAbove75: number;        // consecutive ticks SS >= 75
}

// Full simulation state — single source of truth during gameplay
export interface SimulationState {
  scenarioId: ScenarioId;
  vitals: Vitals;
  stability: StabilityState;
  interventions: Record<InterventionId, InterventionState>;
  thresholds: ThresholdCounters;
  elapsedSeconds: number;
  timeLimitSeconds: number;
  parTimeSeconds: number;
  score: number;
  correctActions: number;
  harmfulActions: number;
  outcome: OutcomeType | null;   // null = in progress
  firstRunHintDismissed: boolean;
}

// Scenario definition — static config, not runtime state
export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  difficulty: SeverityTier;
  initialVitals: Vitals;
  timeLimitSeconds: number;
  parTimeSeconds: number;
  availableInterventions: InterventionId[];
}

// Intervention definition — static config
export interface InterventionDefinition {
  id: InterventionId;
  name: string;
  cooldownSeconds: number;
  effectDurationTicks: number;
  eligibleWhen: (vitals: Vitals) => boolean;
}

// Navigation param list — typed for react-navigation
export type RootStackParamList = {
  Launch: undefined;
  Home: undefined;
  ScenarioSelect: undefined;
  Gameplay: { scenarioId: ScenarioId };
  Result: {
    scenarioId: ScenarioId;
    outcome: OutcomeType;
    score: number;
    elapsedSeconds: number;
    parTimeSeconds: number;
    correctActions: number;
    harmfulActions: number;
  };
  Settings: undefined;
};
