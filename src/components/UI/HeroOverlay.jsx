import React, { useEffect, useRef } from 'react';
import useMuseumStore from '../../store/useMuseumStore';

export default function HeroOverlay() {
  const scene = useMuseumStore(s => s.scene);
  const doorProgress = useMuseumStore(s => s.doorProgress);
  const scrollAccum = useRef(0);
  const transitionStarted = useRef(false);
  const touchY = useRef(0);
  const rafRef = useRef(null);

  // Programmatic entry — drives the door open on a click (fallback for when
  // scroll/swipe doesn't register, and a clearer call-to-action than "scroll").
  const animateEnter = () => {
    if (transitionStarted.current) return;
    const state = useMuseumStore.getState();
    state.setScene('entering');

    if (state.reducedMotion) {
      transitionStarted.current = true;
      scrollAccum.current = 1;
      state.setDoorProgress(1);
      setTimeout(() => useMuseumStore.getState().enterHall(), 200);
      return;
    }

    const start = scrollAccum.current;
    const startedAt = performance.now();
    const duration = 1700;
    const tick = (now) => {
      const p = Math.min(1, (now - startedAt) / duration);
      // easeInOutCubic
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const val = start + (1 - start) * eased;
      scrollAccum.current = val;
      useMuseumStore.getState().setDoorProgress(val);
      if (p >= 1) {
        transitionStarted.current = true;
        setTimeout(() => useMuseumStore.getState().enterHall(), 400);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      const state = useMuseumStore.getState();
      if (state.scene !== 'hero' && state.scene !== 'entering') return;
      if (transitionStarted.current) return;

      scrollAccum.current += e.deltaY * 0.0012;
      scrollAccum.current = Math.max(0, Math.min(1, scrollAccum.current));
      state.setDoorProgress(scrollAccum.current);

      if (scrollAccum.current > 0 && state.scene === 'hero') {
        state.setScene('entering');
      }
      if (scrollAccum.current >= 1 && !transitionStarted.current) {
        transitionStarted.current = true;
        setTimeout(() => useMuseumStore.getState().setScene('hall'), 600);
      }
    };

    const handleTouchStart = (e) => { touchY.current = e.touches[0].clientY; };
    const handleTouchMove = (e) => {
      const state = useMuseumStore.getState();
      if (state.scene !== 'hero' && state.scene !== 'entering') return;
      if (transitionStarted.current) return;
      const dy = touchY.current - e.touches[0].clientY;
      touchY.current = e.touches[0].clientY;
      // Higher sensitivity on mobile for easier scrolling
      scrollAccum.current += dy * 0.008;
      scrollAccum.current = Math.max(0, Math.min(1, scrollAccum.current));
      state.setDoorProgress(scrollAccum.current);
      if (scrollAccum.current > 0 && state.scene === 'hero') state.setScene('entering');
      if (scrollAccum.current >= 1 && !transitionStarted.current) {
        transitionStarted.current = true;
        setTimeout(() => useMuseumStore.getState().setScene('hall'), 600);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  if (scene === 'hall') return null;

  const textOpacity = Math.max(0, 1 - doorProgress * 2.5);
  const overlayOpacity = scene === 'entering' ? Math.max(0, 1 - doorProgress * 1.5) : 1;

  return (
    <div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
      style={{ opacity: overlayOpacity }}
    >
      {/* Cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 55%, rgba(255,213,79,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,${0.75 - doorProgress * 0.5}) 100%)
          `,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(11,29,58,0.6) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Title section */}
      <div
        className="relative z-10 text-center px-6"
        style={{
          opacity: textOpacity,
          transform: `translateY(${-20 + doorProgress * -60}px)`,
          maxWidth: '90vw',
        }}
      >
        <p
          className="tracking-[0.4em] uppercase mb-5"
          style={{
            fontFamily: 'var(--font-oswald)',
            fontWeight: 300,
            fontSize: 'clamp(0.55rem, 1.5vw, 0.9rem)',
            color: '#ffffff',
            animation: 'fadeInUp 1.2s 0.2s ease both',
            textShadow: '0 2px 16px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.9)',
            background: 'rgba(0,0,0,0.25)',
            padding: '8px 20px',
            borderRadius: '2px',
            backdropFilter: 'blur(4px)',
            display: 'inline-block',
          }}
        >
          An Exhibition of Honest Reckoning
        </p>

        <h1
          className="leading-[1.05] tracking-tight mb-6"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(2.4rem, 9vw, 7rem)',
            fontWeight: 900,
            color: '#ffffff',
            textShadow: '0 3px 20px rgba(0,0,0,1), 0 0 80px rgba(0,0,0,0.7), 0 6px 30px rgba(0,0,0,0.9)',
            animation: 'fadeInUp 1.2s 0.4s ease both',
          }}
        >
          Museum of Failures
        </h1>

        {/* Decorative divider */}
        <div
          className="mx-auto mb-6 flex items-center justify-center gap-3"
          style={{ animation: 'fadeInUp 1s 0.6s ease both' }}
        >
          <div style={{ width: 'clamp(40px, 10vw, 80px)', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7))' }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
          <div style={{ width: 'clamp(40px, 10vw, 80px)', height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.7), transparent)' }} />
        </div>

        <p
          className="tracking-[0.15em]"
          style={{
            fontFamily: 'var(--font-fell)',
            fontStyle: 'italic',
            fontSize: 'clamp(0.85rem, 2.5vw, 1.3rem)',
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            animation: 'fadeInUp 1s 0.8s ease both',
          }}
        >
          &mdash; Have a walkthrough &mdash;
        </p>

        {/* Primary call-to-action — no longer gated behind scroll */}
        <button
          onClick={animateEnter}
          className="hero-enter-btn"
          style={{
            pointerEvents: 'auto',
            marginTop: 'clamp(20px, 4vh, 40px)',
            padding: '13px 34px',
            fontFamily: 'var(--font-poppins)',
            fontWeight: 500,
            fontSize: 'clamp(0.65rem, 1.6vw, 0.8rem)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#F5EBD0',
            background: 'rgba(201,168,76,0.10)',
            border: '1px solid rgba(201,168,76,0.55)',
            borderRadius: '2px',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 6px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,220,120,0.15)',
            transition: 'background 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
            animation: 'fadeInUp 1s 1.05s ease both',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(201,168,76,0.20)';
            e.currentTarget.style.borderColor = 'rgba(255,213,79,0.9)';
            e.currentTarget.style.color = '#FFF3D6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(201,168,76,0.10)';
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)';
            e.currentTarget.style.color = '#F5EBD0';
          }}
        >
          Enter the Museum
        </button>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        style={{
          opacity: textOpacity * 0.7,
          animation: 'fadeInUp 1s 1.5s ease both',
        }}
      >
        <div className="relative w-px h-12 overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              height: '40%',
              background: 'linear-gradient(to bottom, transparent, #ffffff)',
              animation: 'scrollLine 2s ease-in-out infinite',
            }}
          />
        </div>
        <span
          className="text-[0.6rem] tracking-[0.3em] uppercase"
          style={{ color: '#ffffff', opacity: 0.7 }}
        >
          {typeof window !== 'undefined' && 'ontouchstart' in window ? 'or swipe up to walk in' : 'or scroll to walk in'}
        </span>
      </div>

      {/* Rolling counter */}
      {doorProgress > 0.01 && doorProgress < 1 && (
        <div className="absolute bottom-5 right-5 flex items-center gap-1" style={{ animation: 'fadeIn 0.5s ease' }}>
          <RollingCounter value={Math.round(doorProgress * 100)} />
          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>%</span>
        </div>
      )}

      <style>{`
        @keyframes scrollLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </div>
  );
}

function RollingCounter({ value }) {
  const digits = String(value).padStart(2, '0').split('');
  return (
    <div style={{ display: 'flex', overflow: 'hidden', height: '18px', gap: '1px' }}>
      {digits.map((d, i) => (
        <RollingDigit key={i} digit={parseInt(d)} />
      ))}
    </div>
  );
}

function RollingDigit({ digit }) {
  return (
    <div style={{ width: '11px', height: '18px', overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          transform: `translateY(-${digit * 18}px)`,
        }}
      >
        {[0,1,2,3,4,5,6,7,8,9].map(n => (
          <div
            key={n}
            style={{
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-oswald)',
              fontSize: '0.75rem',
              fontWeight: 400,
              color: '#ffffff',
              opacity: 0.6,
              lineHeight: 1,
            }}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
