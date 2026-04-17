// Audio module — all sound cues for PulseLine
// Uses expo-av Audio.Sound with lazy loading.
// Respects the sound toggle from settingsStore.
// Degrades silently if assets are not yet present (Phase 8 will add files).

import {Audio, AVPlaybackSource} from 'expo-av';
import {useSettingsStore} from '../store/settingsStore';

// Sound asset registry — populated once assets exist.
// Keys map to bundled require() calls. Missing assets degrade silently.
// To add a sound: drop the .wav into assets/sounds/ and uncomment its entry.
const SOUND_REGISTRY: Record<string, AVPlaybackSource | null> = {
  beep:              null, // require('../../assets/sounds/beep.wav')
  alarmWarning:      null, // require('../../assets/sounds/alarm_warning.wav')
  alarmCritical:     null, // require('../../assets/sounds/alarm_critical.wav')
  interventionApply: null, // require('../../assets/sounds/intervention_apply.wav')
  stabilized:        null, // require('../../assets/sounds/stabilized.wav')
  patientLost:       null, // require('../../assets/sounds/patient_lost.wav')
  rejection:         null, // require('../../assets/sounds/rejection.wav')
};

type SoundKey = keyof typeof SOUND_REGISTRY;

// Cache of loaded Sound objects
const soundCache: Partial<Record<SoundKey, Audio.Sound>> = {};

function isEnabled(): boolean {
  return useSettingsStore.getState().soundEnabled;
}

async function getSound(key: SoundKey): Promise<Audio.Sound | null> {
  const source = SOUND_REGISTRY[key];
  if (!source) return null; // asset not yet present

  if (soundCache[key]) return soundCache[key]!;
  try {
    const {sound} = await Audio.Sound.createAsync(source, {
      shouldPlay: false,
      volume: 1.0,
    });
    soundCache[key] = sound;
    return sound;
  } catch {
    return null;
  }
}

async function play(key: SoundKey): Promise<void> {
  if (!isEnabled()) return;
  const sound = await getSound(key);
  if (!sound) return;
  try {
    await sound.replayAsync();
  } catch {
    // Ignore playback errors — never crash the game loop
  }
}

// Configure audio mode on startup (called once from Navigator on mount)
export async function configureAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });
  } catch {
    // Non-fatal
  }
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
export async function unloadAll(): Promise<void> {
  for (const key of Object.keys(soundCache) as SoundKey[]) {
    try {
      await soundCache[key]?.unloadAsync();
    } catch {
      // Ignore
    }
    delete soundCache[key];
  }
}
