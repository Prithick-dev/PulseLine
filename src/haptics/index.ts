// Haptics module — all haptic feedback for PulseLine
// Uses react-native-haptic-feedback (no Expo dependency)
// Reads the settings store to respect the haptics toggle.

import {trigger, HapticFeedbackTypes} from 'react-native-haptic-feedback';
import {useSettingsStore} from '../store/settingsStore';

function isEnabled(): boolean {
  return useSettingsStore.getState().hapticsEnabled;
}

function fire(type: HapticFeedbackTypes): void {
  if (!isEnabled()) return;
  trigger(type);
}

// Correct intervention applied — satisfying confirmation
export function hapticCorrectAction(): void {
  fire(HapticFeedbackTypes.notificationSuccess);
}

// Misapplied or ineligible intervention — sharp rejection
export function hapticHarmfulAction(): void {
  fire(HapticFeedbackTypes.notificationError);
}

// Patient stabilized — strong success pulse
export function hapticStabilized(): void {
  fire(HapticFeedbackTypes.notificationSuccess);
}

// Deterioration warning — subtle alert on tier drop
export function hapticDeteriorationWarning(): void {
  fire(HapticFeedbackTypes.impactMedium);
}

// Failure — heavy impact
export function hapticPatientLost(): void {
  fire(HapticFeedbackTypes.impactHeavy);
}

// Heartbeat tick — light pulse in sync with HR
export function hapticHeartbeat(): void {
  fire(HapticFeedbackTypes.impactLight);
}
