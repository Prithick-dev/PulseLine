// Audio module — all sound cues for PulseLine
// Uses react-native-sound (no Expo dependency)
// Respects the sound toggle from settingsStore.
// Degrades silently if assets are not yet present (Phase 8 will add files).

import Sound from 'react-native-sound';
import {useSettingsStore} from '../store/settingsStore';

// Enable playback in silence mode on iOS
Sound.setCategory('Playback');

type SoundKey =
  | 'beep'
  | 'alarmWarning'
  | 'alarmCritical'
  | 'interventionApply'
  | 'stabilized'
  | 'patientLost'
  | 'rejection';

// Maps sound keys to filenames (without extension)
// Files should be placed in:
//   iOS: added to Xcode project bundle
//   Android: android/app/src/main/res/raw/
const SOUND_FILES: Record<SoundKey, string> = {
  beep:              'beep',
  alarmWarning:      'alarm_warning',
  alarmCritical:     'alarm_critical',
  interventionApply: 'intervention_apply',
  stabilized:        'stabilized',
  patientLost:       'patient_lost',
  rejection:         'rejection',
};

// Cache of loaded Sound objects
const soundCache: Partial<Record<SoundKey, Sound>> = {};

function isEnabled(): boolean {
  return useSettingsStore.getState().soundEnabled;
}

function loadSound(key: SoundKey): Promise<Sound | null> {
  return new Promise(resolve => {
    if (soundCache[key]) {
      resolve(soundCache[key]!);
      return;
    }
    const filename = SOUND_FILES[key];
    const sound = new Sound(filename, Sound.MAIN_BUNDLE, error => {
      if (error) {
        // Asset not yet present — degrade silently
        resolve(null);
        return;
      }
      soundCache[key] = sound;
      resolve(sound);
    });
  });
}

async function play(key: SoundKey): Promise<void> {
  if (!isEnabled()) return;
  const sound = await loadSound(key);
  if (!sound) return;
  // Stop and replay from beginning
  sound.stop(() => {
    sound.play();
  });
}

// ─── Public sound API ─────────────────────────────────────────────────────────

export function soundBeep(): void              { play('beep'); }
export function soundAlarmWarning(): void      { play('alarmWarning'); }
export function soundAlarmCritical(): void     { play('alarmCritical'); }
export function soundInterventionApply(): void { play('interventionApply'); }
export function soundStabilized(): void        { play('stabilized'); }
export function soundPatientLost(): void       { play('patientLost'); }
export function soundRejection(): void         { play('rejection'); }

// Unload all sounds — call on GameplayScreen unmount
export function unloadAll(): void {
  for (const key of Object.keys(soundCache) as SoundKey[]) {
    soundCache[key]?.release();
    delete soundCache[key];
  }
}

// configureAudio is kept as a no-op for API compatibility with GameplayScreen
export function configureAudio(): void {
  // Sound.setCategory already called at module load time
}
