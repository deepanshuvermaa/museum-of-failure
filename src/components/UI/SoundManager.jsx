import React, { useEffect, useRef, useCallback } from 'react';
import useMuseumStore from '../../store/useMuseumStore';

function createAmbientContext() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Low drone — filtered noise
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.08;
  droneGain.connect(master);

  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 200;
  droneFilter.Q.value = 2;
  droneFilter.connect(droneGain);

  const bufferSize = ctx.sampleRate * 4;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  noise.connect(droneFilter);
  noise.start();

  // Deep tones
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 55;
  const osc1Gain = ctx.createGain();
  osc1Gain.gain.value = 0.03;
  osc1.connect(osc1Gain);
  osc1Gain.connect(master);
  osc1.start();

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 82.5;
  const osc2Gain = ctx.createGain();
  osc2Gain.gain.value = 0.015;
  osc2.connect(osc2Gain);
  osc2Gain.connect(master);
  osc2.start();

  // Sparkle tones
  let sparkleInterval = setInterval(() => {
    if (ctx.state === 'closed') return;
    if (master.gain.value < 0.01) return;
    const notes = [523, 659, 784, 880, 1047, 1319];
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.015 + Math.random() * 0.015, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2 + Math.random() * 2);
    osc.connect(g);
    g.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 4);
  }, 3000 + Math.random() * 5000);

  return {
    ctx,
    master,
    setVolume: (v) => {
      if (ctx.state === 'closed') return;
      // Cancel any scheduled ramps and set cleanly
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(Math.max(0, v), ctx.currentTime + 0.5);
    },
    resume: () => {
      if (ctx.state === 'suspended') return ctx.resume();
      return Promise.resolve();
    },
    destroy: () => {
      clearInterval(sparkleInterval);
      try { noise.stop(); } catch (e) {}
      try { osc1.stop(); } catch (e) {}
      try { osc2.stop(); } catch (e) {}
      try { ctx.close(); } catch (e) {}
    },
  };
}

export default function SoundManager() {
  const scene = useMuseumStore(s => s.scene);
  const doorProgress = useMuseumStore(s => s.doorProgress);
  const soundEnabled = useMuseumStore(s => s.soundEnabled);
  const setSoundEnabled = useMuseumStore(s => s.setSoundEnabled);
  const isMobile = useMuseumStore(s => s.isMobile);
  const audioRef = useRef(null);

  const toggleSound = useCallback(() => {
    const newVal = !useMuseumStore.getState().soundEnabled;
    setSoundEnabled(newVal);

    if (newVal && !audioRef.current) {
      // Must create AudioContext inside a click handler (user gesture)
      audioRef.current = createAmbientContext();
    }
    if (audioRef.current) {
      audioRef.current.resume().then(() => {
        const state = useMuseumStore.getState();
        const vol = state.scene === 'hall' ? 0.18 : (state.scene === 'entering' ? state.doorProgress * 0.12 : 0);
        audioRef.current.setVolume(newVal ? vol : 0);
      });
    }
  }, [setSoundEnabled]);

  // Update volume when scene changes
  useEffect(() => {
    if (!audioRef.current || !soundEnabled) return;
    audioRef.current.resume().then(() => {
      const vol = scene === 'hall' ? 0.18 : (scene === 'entering' ? doorProgress * 0.12 : 0);
      audioRef.current.setVolume(vol);
    });
  }, [scene, doorProgress, soundEnabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.destroy();
        audioRef.current = null;
      }
    };
  }, []);

  // Don't show on hero screen
  if (scene === 'hero') return null;

  return (
    <button
      onClick={toggleSound}
      style={{
        position: 'fixed',
        bottom: isMobile ? '12px' : '16px',
        left: isMobile ? '12px' : '16px',
        zIndex: 20,
        width: isMobile ? '36px' : '40px',
        height: isMobile ? '36px' : '40px',
        borderRadius: '50%',
        border: `1px solid ${soundEnabled ? 'rgba(255,213,79,0.3)' : 'rgba(255,255,255,0.12)'}`,
        background: soundEnabled ? 'rgba(255,213,79,0.08)' : 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: soundEnabled ? 'rgba(255,213,79,0.9)' : 'rgba(255,255,255,0.35)',
        transition: 'all 0.3s',
        fontFamily: 'var(--font-poppins)',
        fontSize: '0.6rem',
        fontWeight: 400,
      }}
      title={soundEnabled ? 'Mute' : 'Enable sound'}
    >
      {soundEnabled ? 'ON' : 'OFF'}
    </button>
  );
}
