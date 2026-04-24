// Static intervention definitions — rules from PHASE1_SIMULATION_SPEC.md section 4

import {InterventionDefinition, Vitals} from '../types';

export const INTERVENTIONS: Record<string, InterventionDefinition> = {
  oxygen: {
    id: 'oxygen',
    name: 'OXYGEN',
    cooldownSeconds: 12,
    effectDurationTicks: 10,
    eligibleWhen: (v: Vitals) => v.spo2 < 95,
  },

  iv_fluids: {
    id: 'iv_fluids',
    name: 'IV FLUIDS',
    cooldownSeconds: 20,
    effectDurationTicks: 12,
    eligibleWhen: (v: Vitals) => v.sbp < 100,
  },

  rate_control: {
    id: 'rate_control',
    name: 'RATE-CONTROL',
    cooldownSeconds: 25,
    effectDurationTicks: 8,
    eligibleWhen: (v: Vitals) => v.hr > 110,
  },

  cardioversion: {
    id: 'cardioversion',
    name: 'CARDIOVERSION',
    cooldownSeconds: 45,
    effectDurationTicks: 1, // instant effect
    eligibleWhen: (v: Vitals) => v.rhythm === 'tachy' && v.hr > 130,
  },
};
