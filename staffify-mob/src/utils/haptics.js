/**
 * Staffify Dual-Engine Tactile Haptic Service
 * Works seamlessly across Capacitor Native Shells (Android/iOS) and Mobile Browsers/PWAs (navigator.vibrate).
 * Fails safely and silently on non-supporting or desktop platforms.
 */

let CapacitorHaptics = null;

// Dynamically check for Capacitor Haptics plugin
if (typeof window !== "undefined" && window.Capacitor?.isPluginAvailable?.("Haptics")) {
  import("@capacitor/haptics")
    .then((module) => {
      CapacitorHaptics = module.Haptics;
    })
    .catch(() => {});
}

export const hapticLight = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.impact({ style: "LIGHT" });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
  } catch {}
};

export const hapticMedium = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.impact({ style: "MEDIUM" });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }
  } catch {}
};

export const hapticSuccess = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.notification({ type: "SUCCESS" });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 45, 30]);
    }
  } catch {}
};

export const hapticWarning = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.notification({ type: "WARNING" });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([45, 60]);
    }
  } catch {}
};

export const hapticError = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.notification({ type: "ERROR" });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([50, 40, 50]);
    }
  } catch {}
};

export const hapticSelection = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.selectionChanged();
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
  } catch {}
};

export default {
  hapticLight,
  hapticMedium,
  hapticSuccess,
  hapticWarning,
  hapticError,
  hapticSelection,
};
