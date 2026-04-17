// Settings store — sound and haptics toggles
// Persists to MMKV on every change

import {create} from 'zustand';
import {getSoundEnabled, setSoundEnabled, getHapticsEnabled, setHapticsEnabled} from '../storage/persistence';

interface SettingsStore {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

export const useSettingsStore = create<SettingsStore>(() => ({
  soundEnabled: getSoundEnabled(),
  hapticsEnabled: getHapticsEnabled(),

  toggleSound: () => {
    useSettingsStore.setState(state => {
      const next = !state.soundEnabled;
      setSoundEnabled(next);
      return {soundEnabled: next};
    });
  },

  toggleHaptics: () => {
    useSettingsStore.setState(state => {
      const next = !state.hapticsEnabled;
      setHapticsEnabled(next);
      return {hapticsEnabled: next};
    });
  },
}));
