// Stability score formula — from PHASE1_SIMULATION_SPEC.md section 1.3

import {Vitals, StabilityState, SeverityTier} from './types';

function hrPenalty(hr: number): number {
  if (hr > 160) return 35;
  if (hr > 130) return 20;
  if (hr > 100) return 10;
  if (hr < 50) return 25;
  return 0;
}

function sbpPenalty(sbp: number): number {
  if (sbp < 80) return 35;
  if (sbp < 90) return 15;
  if (sbp > 160) return 10;
  return 0;
}

function spo2Penalty(spo2: number): number {
  if (spo2 < 85) return 40;
  if (spo2 < 90) return 25;
  if (spo2 < 95) return 10;
  return 0;
}

function rhythmPenalty(rhythm: Vitals['rhythm']): number {
  if (rhythm === 'vfib') return 50;
  if (rhythm === 'tachy') return 10;
  return 0;
}

function tierFromScore(score: number): SeverityTier {
  if (score >= 75) return 'stable';
  if (score >= 50) return 'warning';
  if (score >= 25) return 'critical';
  return 'failing';
}

export function computeStability(vitals: Vitals): StabilityState {
  const raw =
    100 -
    hrPenalty(vitals.hr) -
    sbpPenalty(vitals.sbp) -
    spo2Penalty(vitals.spo2) -
    rhythmPenalty(vitals.rhythm);

  const score = Math.max(0, Math.min(100, raw));
  return {score, tier: tierFromScore(score)};
}
