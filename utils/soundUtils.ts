
// Singleton AudioContext
let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Pre-generate a noise buffer for "paper/shaker" sounds
const getNoiseBuffer = (ctx: AudioContext) => {
  if (!noiseBuffer) {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
};

export const playSound = (type: 'click' | 'page-turn' | 'success' | 'toggle' | 'lock' | 'soft' | 'pop') => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    switch (type) {
      case 'click': // Game-style Click (Brawl Stars inspired: Punchy & Crisp)
      case 'pop':   
        const oscClick = ctx.createOscillator();
        const gainClick = ctx.createGain();
        
        // Triangle wave gives it that "8-bit/Game UI" crispness
        oscClick.type = 'triangle';
        
        // Frequency sweep for impact (High to Low fast)
        oscClick.frequency.setValueAtTime(800, now);
        oscClick.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        
        // Volume envelope: Fast attack, short decay
        // Reduced volume to ~30% of original (0.15 -> 0.05)
        gainClick.gain.setValueAtTime(0, now);
        gainClick.gain.linearRampToValueAtTime(0.05, now + 0.01); 
        gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        oscClick.connect(gainClick);
        gainClick.connect(ctx.destination);
        
        oscClick.start(now);
        oscClick.stop(now + 0.1);
        break;

      case 'page-turn': // "Swish" sound for tabs (White noise with LowPass filter)
      case 'soft':      // Mapping soft to page-turn
        const noise = ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(ctx);
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(600, now); // Muffled sound like paper
        
        const noiseGain = ctx.createGain();
        // Reduced volume to ~30% of original (0.15 -> 0.05)
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.05); // Fade in
        noiseGain.gain.linearRampToValueAtTime(0, now + 0.2);   // Fade out
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.25);
        break;

      case 'toggle': // A small switch sound
        const oscTog = ctx.createOscillator();
        const gainTog = ctx.createGain();
        
        oscTog.type = 'triangle';
        oscTog.frequency.setValueAtTime(400, now);
        
        // Reduced volume significantly (0.05 -> 0.02)
        gainTog.gain.setValueAtTime(0.02, now);
        gainTog.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        oscTog.connect(gainTog);
        gainTog.connect(ctx.destination);
        
        oscTog.start(now);
        oscTog.stop(now + 0.05);
        break;

      case 'success': // Pleasant chime (kept but softer)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainSucc = ctx.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
        
        // Reduced volume significantly (0.05 -> 0.02)
        gainSucc.gain.setValueAtTime(0.02, now);
        gainSucc.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc1.connect(gainSucc);
        osc2.connect(gainSucc);
        gainSucc.connect(ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.3);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.5);
        break;
        
      case 'lock': // Dull "thud" instead of buzzer
        const oscLock = ctx.createOscillator();
        const gainLock = ctx.createGain();
        
        oscLock.type = 'square'; // Square wave for texture
        oscLock.frequency.setValueAtTime(100, now);
        oscLock.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        const lockFilter = ctx.createBiquadFilter();
        lockFilter.type = 'lowpass';
        lockFilter.frequency.value = 200; // Filter out high buzz
        
        // Reduced volume to ~30% of original (0.1 -> 0.03)
        gainLock.gain.setValueAtTime(0.03, now);
        gainLock.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        oscLock.connect(lockFilter);
        lockFilter.connect(gainLock);
        gainLock.connect(ctx.destination);
        
        oscLock.start(now);
        oscLock.stop(now + 0.15);
        break;
    }
  } catch (e) {
    // Silent fail if audio context not allowed
  }
};
