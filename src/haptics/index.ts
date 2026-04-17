// Haptics module — all haptic feedback for PulseLine
// Reads the settings store to respect the haptics toggle.
// All calls are fire-and-forget (void Promise) — never block the tick loop.

import * as Haptics from 'expo-haptics';
import {useSettingsStore} from '../store/settingsStore';

function isEnabled(): boolean {
  return useSettingsStore.getState().hapticsEnabled;
}

// Correct intervention applied — satisfying confirmation
export function hapticCorrectAction(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Misapplied or ineligible intervention — sharp rejection
export function hapticHarmfulAction(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

// Patient stabilized — strong success pulse
export function hapticStabilized(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Deterioration warning — subtle alert on tier drop
export function hapticDeteriorationWarning(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

// Failure — heavy impact
export function hapticPatientLost(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

// Heartbeat tick — light pulse in sync with HR (used sparingly)
export function hapticHeartbeat(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
