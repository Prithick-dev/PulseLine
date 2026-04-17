// Local persistence abstraction using react-native-mmkv
// Stores: best scores, settings, first-run flags

import {createMMKV} from 'react-native-mmkv';
import {ScenarioId} from '../simulation/types';

const storage = createMMKV();

// Keys
const KEYS = {
  bestScore: (id: ScenarioId) => `best_score_${id}`,
  firstRunDismissed: (id: ScenarioId) => `first_run_dismissed_${id}`,
  soundEnabled: 'setting_sound_enabled',
  hapticsEnabled: 'setting_haptics_enabled',
} as const;

// Best scores
export function getBestScore(scenarioId: ScenarioId): number {
  return storage.getNumber(KEYS.bestScore(scenarioId)) ?? 0;
}

export function setBestScore(scenarioId: ScenarioId, score: number): void {
  const current = getBestScore(scenarioId);
  if (score > current) {
    storage.set(KEYS.bestScore(scenarioId), score);
  }
}

// First-run hint flags
export function isFirstRunDismissed(scenarioId: ScenarioId): boolean {
  return storage.getBoolean(KEYS.firstRunDismissed(scenarioId)) ?? false;
}

export function setFirstRunDismissed(scenarioId: ScenarioId): void {
  storage.set(KEYS.firstRunDismissed(scenarioId), true);
}

// Settings
export function getSoundEnabled(): boolean {
  return storage.getBoolean(KEYS.soundEnabled) ?? true;
}

export function setSoundEnabled(enabled: boolean): void {
  storage.set(KEYS.soundEnabled, enabled);
}

export function getHapticsEnabled(): boolean {
  return storage.getBoolean(KEYS.hapticsEnabled) ?? true;
}

export function setHapticsEnabled(enabled: boolean): void {
  storage.set(KEYS.hapticsEnabled, enabled);
}
