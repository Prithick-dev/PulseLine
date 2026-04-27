// Static scenario definitions — initial states from PHASE1_SIMULATION_SPEC.md section 7

import {ScenarioDefinition, ScenarioId} from '../types';

export const SCENARIOS: Record<ScenarioId, ScenarioDefinition> = {
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
    availableInterventions: ['oxygen', 'iv_fluids', 'rate_control', 'cardioversion'],
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

  panic_attack: {
    id: 'panic_attack',
    name: 'PANIC ATTACK',
    description: 'Sympathetic surge. Breathing control is key.',
    difficulty: 'warning',
    initialVitals: {
      hr: 138,
      sbp: 164,
      dbp: 92,
      spo2: 97,
      rhythm: 'sinus',
    },
    timeLimitSeconds: 100,
    parTimeSeconds: 65,
    availableInterventions: ['oxygen', 'guided_breathing', 'rate_control', 'cardioversion'],
  },

  critical_hypoglycemia: {
    id: 'critical_hypoglycemia',
    name: 'CRITICAL HYPOGLYCEMIA',
    description: 'Sugar crash with collapse risk. Give glucose fast.',
    difficulty: 'critical',
    initialVitals: {
      hr: 126,
      sbp: 88,
      dbp: 56,
      spo2: 96,
      rhythm: 'tachy',
    },
    timeLimitSeconds: 105,
    parTimeSeconds: 70,
    availableInterventions: ['oxygen', 'iv_fluids', 'glucose', 'rate_control'],
  },
};
