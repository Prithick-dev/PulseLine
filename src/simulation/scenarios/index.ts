// Static scenario definitions — initial states from PHASE1_SIMULATION_SPEC.md section 7

import {ScenarioDefinition} from '../types';

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  tachyarrhythmia: {
    id: 'tachyarrhythmia',
    name: 'TACHYARRHYTHMIA',
    description: 'Heart rate critical. Rhythm unstable.',
    difficulty: 'warning',
    initialVitals: {
      hr: 145,
      sbp: 105,
      dbp: 70,
      spo2: 93,
      rhythm: 'tachy',
    },
    timeLimitSeconds: 90,
    parTimeSeconds: 60,
    availableInterventions: ['oxygen', 'rate_control', 'cardioversion'],
  },

  hypoxemia: {
    id: 'hypoxemia',
    name: 'HYPOXEMIA',
    description: 'Oxygen saturation falling. Act fast.',
    difficulty: 'warning',
    initialVitals: {
      hr: 108,
      sbp: 112,
      dbp: 74,
      spo2: 86,
      rhythm: 'sinus',
    },
    timeLimitSeconds: 90,
    parTimeSeconds: 55,
    availableInterventions: ['oxygen', 'iv_fluids', 'rate_control', 'cardioversion'],
  },

  hypotensive_shock: {
    id: 'hypotensive_shock',
    name: 'HYPOTENSIVE SHOCK',
    description: 'Blood pressure collapsing. Perfusion failing.',
    difficulty: 'critical',
    initialVitals: {
      hr: 118,
      sbp: 78,
      dbp: 50,
      spo2: 91,
      rhythm: 'sinus',
    },
    timeLimitSeconds: 120,
    parTimeSeconds: 75,
    availableInterventions: ['oxygen', 'iv_fluids'],
  },
};
