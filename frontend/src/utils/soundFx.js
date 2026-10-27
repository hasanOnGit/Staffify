/**
 * Staffify Enterprise Web Audio Synthesizer
 * Zero-asset audio feedback system using the browser Web Audio API.
 * High-performance, offline-ready, and non-blocking.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const isSoundEnabled = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("staffify_ui_sound") !== "false";
};

export const setSoundEnabled = (enabled) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("staffify_ui_sound", enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent("staffify_sound_toggled", { detail: { enabled } }));
};

export const toggleSound = () => {
  const current = isSoundEnabled();
  setSoundEnabled(!current);
  if (!current) {
    playNotificationDing();
  }
  return !current;
};

/**
 * Play a synthesized tone with envelope
 */
const playTone = (frequency, duration = 0.15, type = "sine", gainLevel = 0.08) => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.debug("Audio playback ignored:", err);
  }
};

/**
 * Punch In (Ascending double chime)
 */
export const playPunchInSound = () => {
  if (!isSoundEnabled()) return;
  playTone(523.25, 0.12, "sine", 0.08); // C5
  setTimeout(() => {
    playTone(783.99, 0.22, "sine", 0.09); // G5
  }, 100);
};

/**
 * Punch Out (Descending double chime)
 */
export const playPunchOutSound = () => {
  if (!isSoundEnabled()) return;
  playTone(659.25, 0.12, "sine", 0.08); // E5
  setTimeout(() => {
    playTone(440.0, 0.22, "sine", 0.07); // A4
  }, 100);
};

/**
 * Enterprise Approval / Success Triad (C5 -> E5 -> G5)
 */
export const playSuccessChime = () => {
  if (!isSoundEnabled()) return;
  playTone(523.25, 0.12, "sine", 0.06);
  setTimeout(() => playTone(659.25, 0.12, "sine", 0.06), 75);
  setTimeout(() => playTone(783.99, 0.25, "sine", 0.08), 150);
};

/**
 * High-pitch notification bell
 */
export const playNotificationDing = () => {
  if (!isSoundEnabled()) return;
  playTone(1046.5, 0.2, "sine", 0.07); // C6
};

/**
 * Subtle tactile micro-tick
 */
export const playClickTick = () => {
  if (!isSoundEnabled()) return;
  playTone(800, 0.03, "sine", 0.02);
};
