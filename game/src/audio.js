// Generated sound only: every effect is a few WebAudio oscillators, no audio files.
// The context is created lazily on the first user gesture (browsers require one), and
// every call is a safe no-op until then or while muted.

/** Create the sound board: find chimes that rise with the combo, a wrong buzz, a hint
 *  shimmer, a low-time tick and a complete jingle. */
export function createAudio() {
  let context = null;
  let muted = false;

  function ensureContext() {
    if (context) return context;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      context = new AC();
    } catch {
      return null;
    }
    return context;
  }

  function tone(freq, start, duration, type, gainValue) {
    const ctx = ensureContext();
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    gain.gain.setValueAtTime(gainValue, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  }

  return {
    /** Call from a user gesture so the context may start. */
    unlock() {
      const ctx = ensureContext();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    playFind(combo) {
      const base = 523 * Math.pow(2, Math.min(combo, 5) / 6);
      tone(base, 0, 0.18, 'sine', 0.22);
      tone(base * 1.5, 0.07, 0.22, 'sine', 0.18);
    },
    playWrong() {
      tone(140, 0, 0.2, 'sawtooth', 0.12);
      tone(110, 0.05, 0.22, 'sawtooth', 0.1);
    },
    playHint() {
      tone(880, 0, 0.3, 'sine', 0.1);
      tone(1175, 0.1, 0.35, 'sine', 0.08);
      tone(1568, 0.2, 0.4, 'sine', 0.06);
    },
    playTick() {
      tone(1200, 0, 0.06, 'square', 0.05);
    },
    playComplete() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'sine', 0.18));
    },
    playFailed() {
      [392, 330, 262].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.16));
    },
    setMuted(value) {
      muted = value;
    },
    isMuted() {
      return muted;
    },
  };
}
