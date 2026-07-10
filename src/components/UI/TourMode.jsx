import React, { useEffect, useRef, useState } from 'react';
import useMuseumStore from '../../store/useMuseumStore';
import { EXHIBITS } from '../../data/exhibits';

// Auto-tour: camera pans wall-by-wall, pausing at each painting
const TOUR_SEQUENCE = [
  { view: 'left', duration: 6000, label: 'Left Hall' },
  { view: 'center', duration: 6000, label: 'Centre Hall' },
  { view: 'right', duration: 6000, label: 'Right Hall' },
  { view: 'panoramic', duration: 4000, label: 'Panoramic View' },
];

export default function TourMode() {
  const scene = useMuseumStore(s => s.scene);
  const tourActive = useMuseumStore(s => s.tourActive);
  const setTourActive = useMuseumStore(s => s.setTourActive);
  const setHallView = useMuseumStore(s => s.setHallView);
  const activeExhibit = useMuseumStore(s => s.activeExhibit);
  const isMobile = useMuseumStore(s => s.isMobile);

  const [tourStep, setTourStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // Listen for T key to toggle tour
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const state = useMuseumStore.getState();
      if (state.scene !== 'hall' || state.activeExhibit || state.storyOpen || state.benchActive) return;

      if (e.key === 't' || e.key === 'T') {
        if (state.tourActive) {
          state.setTourActive(false);
        } else {
          state.setTourActive(true);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Tour logic
  useEffect(() => {
    if (!tourActive || paused || activeExhibit) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const step = TOUR_SEQUENCE[tourStep];
    setHallView(step.view);

    timerRef.current = setTimeout(() => {
      setTourStep((tourStep + 1) % TOUR_SEQUENCE.length);
    }, step.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tourActive, tourStep, paused, activeExhibit]);

  // Reset on deactivate
  useEffect(() => {
    if (!tourActive) {
      setTourStep(0);
      setPaused(false);
    }
  }, [tourActive]);

  // Exit tour on exhibit open
  useEffect(() => {
    if (activeExhibit && tourActive) {
      setTourActive(false);
    }
  }, [activeExhibit]);

  // Handle key controls during tour
  useEffect(() => {
    if (!tourActive) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setTourActive(false);
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
      if (e.key === 'ArrowRight') setTourStep(s => (s + 1) % TOUR_SEQUENCE.length);
      if (e.key === 'ArrowLeft') setTourStep(s => (s - 1 + TOUR_SEQUENCE.length) % TOUR_SEQUENCE.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tourActive]);

  if (scene !== 'hall' || !tourActive) return null;

  const step = TOUR_SEQUENCE[tourStep];
  const progress = ((tourStep + 1) / TOUR_SEQUENCE.length) * 100;

  return (
    <div
      className="fixed z-20"
      style={{
        bottom: isMobile ? '60px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        animation: 'fadeIn 0.5s ease',
      }}
    >
      {/* Tour label */}
      <div style={{
        fontFamily: 'var(--font-poppins)', fontSize: '0.6rem',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(255,213,79,0.6)',
      }}>
        {paused ? 'Tour Paused' : `Viewing: ${step.label}`}
      </div>

      {/* Progress bar */}
      <div style={{
        width: isMobile ? '200px' : '280px',
        height: '3px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'rgba(255,213,79,0.5)',
          transition: 'width 0.5s ease',
          borderRadius: '2px',
        }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <TourBtn onClick={() => setTourStep(s => (s - 1 + TOUR_SEQUENCE.length) % TOUR_SEQUENCE.length)}>&#8249;</TourBtn>
        <TourBtn onClick={() => setPaused(p => !p)}>{paused ? '\u25B6' : '\u23F8'}</TourBtn>
        <TourBtn onClick={() => setTourStep(s => (s + 1) % TOUR_SEQUENCE.length)}>&#8250;</TourBtn>
        <TourBtn onClick={() => setTourActive(false)} accent>&#10005;</TourBtn>
      </div>

      {!isMobile && (
        <div style={{
          fontFamily: 'var(--font-poppins)', fontSize: '0.48rem',
          color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em',
        }}>
          Space: pause &middot; Arrows: skip &middot; Esc: exit &middot; T: toggle
        </div>
      )}
    </div>
  );
}

function TourBtn({ children, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '28px', height: '28px', borderRadius: '50%',
        border: `1px solid rgba(${accent ? '255,160,120' : '255,255,255'},0.15)`,
        background: 'rgba(0,0,0,0.3)',
        color: accent ? 'rgba(255,160,120,0.7)' : 'rgba(255,255,255,0.5)',
        cursor: 'pointer', fontSize: '0.7rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
    >{children}</button>
  );
}
