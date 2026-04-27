// Static intervention definitions — rules from PHASE1_SIMULATION_SPEC.md section 4

import {InterventionDefinition, InterventionId, Vitals} from '../types';

export const INTERVENTIONS: Record<InterventionId, InterventionDefinition> = {
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
    eligibleWhen: (v: Vitals, scenarioId) =>
      v.sbp < 100 && scenarioId !== 'critical_hypoglycemia',
  },

  rate_control: {
    id: 'rate_control',
    name: 'RATE-CONTROL',
    cooldownSeconds: 25,
    effectDurationTicks: 8,
    eligibleWhen: (v: Vitals, scenarioId) =>
      v.hr > 110 &&
      scenarioId !== 'panic_attack' &&
      scenarioId !== 'critical_hypoglycemia',
  },

  cardioversion: {
    id: 'cardioversion',
    name: 'CARDIOVERSION',
    cooldownSeconds: 45,
    effectDurationTicks: 1, // instant effect
    eligibleWhen: (v: Vitals, scenarioId) =>
      v.rhythm === 'tachy' &&
      v.hr > 130 &&
      scenarioId !== 'panic_attack' &&
      scenarioId !== 'critical_hypoglycemia',
  },

  guided_breathing: {
    id: 'guided_breathing',
    name: 'GUIDED BREATHING',
    cooldownSeconds: 18,
    effectDurationTicks: 10,
    eligibleWhen: (v: Vitals, scenarioId) =>
      scenarioId === 'panic_attack' &&
      (v.hr > 115 || v.sbp > 150 || v.spo2 < 95),
  },

  glucose: {
    id: 'glucose',
    name: 'GLUCOSE',
    cooldownSeconds: 24,
    effectDurationTicks: 10,
    eligibleWhen: (v: Vitals, scenarioId) =>
      scenarioId === 'critical_hypoglycemia' &&
      (v.hr > 105 || v.sbp < 100 || v.rhythm === 'tachy'),
  },
};
