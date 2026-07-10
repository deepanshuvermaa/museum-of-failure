import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMuseumStore from '../../store/useMuseumStore';

// First-visit coach mark. The whole experience hinges on clicking paintings,
// and there is no innate affordance for that (none at all on touch) — so we say it once.
export default function HallHint() {
  const scene = useMuseumStore(s => s.scene);
  const hintSeen = useMuseumStore(s => s.hintSeen);
  const dismissHint = useMuseumStore(s => s.dismissHint);
  const activeExhibit = useMuseumStore(s => s.activeExhibit);
  const benchActive = useMuseumStore(s => s.benchActive);
  const indexOpen = useMuseumStore(s => s.indexOpen);
  const isMobile = useMuseumStore(s => s.isMobile);

  // Any first interaction counts as "understood" — dismiss permanently.
  useEffect(() => {
    if (!hintSeen && (activeExhibit || benchActive || indexOpen)) dismissHint();
  }, [activeExhibit, benchActive, indexOpen, hintSeen, dismissHint]);

  const show = scene === 'hall' && !hintSeen && !activeExhibit && !benchActive && !indexOpen;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed flex justify-center"
          style={{
            zIndex: 22, left: 0, right: 0, bottom: isMobile ? '84px' : '92px',
            padding: '0 16px', pointerEvents: 'none',
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: isMobile ? '10px 14px' : '12px 18px',
            background: 'rgba(8,10,20,0.82)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '40px',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}>
            <span aria-hidden style={{ fontSize: '1.05rem', filter: 'drop-shadow(0 0 6px rgba(255,213,79,0.5))' }}>&#128072;</span>
            <span style={{
              fontFamily: 'var(--font-poppins)', fontWeight: 300,
              fontSize: isMobile ? '0.7rem' : '0.78rem', color: 'rgba(240,244,252,0.9)',
              letterSpacing: '0.02em', lineHeight: 1.4,
            }}>
              {isMobile ? 'Tap a painting to read its story' : 'Click any painting to read its story · click the bench for a letter'}
            </span>
            <button
              onClick={dismissHint}
              aria-label="Dismiss hint"
              style={{
                flexShrink: 0, marginLeft: '2px', width: '22px', height: '22px', borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.16)', background: 'transparent',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.62rem', lineHeight: 1,
              }}
            >&#10005;</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
