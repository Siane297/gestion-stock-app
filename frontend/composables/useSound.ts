/**
 * Composable pour gérer les effets sonores (Beeps) via Web Audio API
 */
export const useSound = () => {
  // Contexte audio partagé (créé à la volée pour éviter les erreurs SSR)
  const getAudioContext = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return null;
    return new AudioContext();
  };

  /**
   * Jouer un son de succès (Beep aigu et court)
   */
  const playSuccessBeep = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Configuration du son : "Beep" plus doux mais moderne (Sine 1200Hz)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      
      // Enveloppe (Volume) : Attaque très rapide, Decay naturel
      // Cela donne un son "percussif" mais rond, pas agressif
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01); // Attaque
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15); // Release

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  /**
   * Jouer un son d'erreur (Grave et plus long)
   */
  const playErrorBeep = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  return {
    playSuccessBeep,
    playErrorBeep
  };
};
