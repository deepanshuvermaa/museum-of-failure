import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMuseumStore from '../../store/useMuseumStore';
import { EXHIBITS } from '../../data/exhibits';
import { ExhibitIcon } from '../../data/icons.jsx';

// A directory of every exhibit — solves "I can't see what's in here".
// Clicking a card jumps the camera to that wall and opens the story.
export default function ExhibitIndex() {
  const scene = useMuseumStore(s => s.scene);
  const indexOpen = useMuseumStore(s => s.indexOpen);
  const setIndexOpen = useMuseumStore(s => s.setIndexOpen);
  const setActiveExhibit = useMuseumStore(s => s.setActiveExhibit);
  const setHallView = useMuseumStore(s => s.setHallView);
  const isMobile = useMuseumStore(s => s.isMobile);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && indexOpen) setIndexOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [indexOpen, setIndexOpen]);

  const open = scene === 'hall' && indexOpen;

  const jump = (ex) => {
    setHallView(ex.wall === 'left' ? 'left' : ex.wall === 'right' ? 'right' : 'center');
    setActiveExhibit(ex);
    setIndexOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0"
          style={{ zIndex: 34, background: 'rgba(3,3,10,0.97)', overflowY: 'auto' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Ambient wash */}
          <div className="fixed inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 55%)',
          }} />

          <div style={{ position: 'relative', maxWidth: '1180px', margin: '0 auto', padding: isMobile ? '28px 18px 60px' : '54px 40px 80px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: isMobile ? '24px' : '40px' }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-oswald)', fontSize: '0.62rem', letterSpacing: '0.35em',
                  textTransform: 'uppercase', color: 'rgba(201,168,76,0.8)', marginBottom: '10px',
                }}>
                  The Collection &middot; {EXHIBITS.length} Exhibits
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-fraunces)', fontWeight: 900,
                  fontSize: isMobile ? '2rem' : '3.2rem', color: '#efe9dc', lineHeight: 1.02,
                  letterSpacing: '-0.01em',
                }}>
                  Every Failure, Framed
                </h2>
                <p style={{
                  fontFamily: 'var(--font-fell)', fontStyle: 'italic',
                  fontSize: isMobile ? '0.85rem' : '1rem', color: 'rgba(212,197,160,0.7)', marginTop: '8px',
                }}>
                  Choose an exhibit to walk to it.
                </p>
              </div>
              <button
                onClick={() => setIndexOpen(false)}
                aria-label="Close index"
                style={{
                  flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid rgba(186,215,247,0.2)', background: 'rgba(5,6,15,0.5)',
                  color: 'rgba(220,232,248,0.8)', cursor: 'pointer', fontSize: '0.9rem',
                }}
              >&#10005;</button>
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: isMobile ? '12px' : '18px',
            }}>
              {EXHIBITS.map((ex, i) => (
                <motion.button
                  key={ex.id}
                  onClick={() => jump(ex)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
                  whileHover={{ y: -4 }}
                  style={{
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    padding: '18px', borderRadius: '10px',
                    background: 'linear-gradient(150deg, rgba(20,22,36,0.9), rgba(10,12,22,0.9))',
                    border: '1px solid rgba(186,215,247,0.08)',
                    transition: 'border-color 0.3s, background 0.3s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(186,215,247,0.08)'; }}
                >
                  <div style={{
                    flexShrink: 0, width: '46px', height: '46px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'radial-gradient(circle at 50% 35%, rgba(201,168,76,0.18), rgba(0,0,0,0.2))',
                    border: '1px solid rgba(201,168,76,0.25)',
                    color: '#E4C46A',
                  }}><ExhibitIcon id={ex.id} size={22} strokeWidth={1.6} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-oswald)', fontSize: '0.55rem', letterSpacing: '0.2em',
                      textTransform: 'uppercase', color: 'rgba(201,168,76,0.75)', marginBottom: '5px',
                    }}>
                      {ex.roman} &middot; {ex.era} &middot; {ex.wall} hall
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.12rem',
                      color: '#efe9dc', lineHeight: 1.18, marginBottom: '6px',
                    }}>
                      {ex.title}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-fell)', fontStyle: 'italic', fontSize: '0.9rem',
                      color: 'rgba(206,220,236,0.72)', lineHeight: 1.4,
                    }}>
                      {ex.tagline.replace(/"/g, '')}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
