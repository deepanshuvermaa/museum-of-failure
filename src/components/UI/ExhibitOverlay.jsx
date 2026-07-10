import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMuseumStore from '../../store/useMuseumStore';
import { EXHIBITS } from '../../data/exhibits';
import ShareCard from './ShareCard';
import { ExhibitIcon } from '../../data/icons.jsx';

export default function ExhibitOverlay() {
  const activeExhibit = useMuseumStore(s => s.activeExhibit);
  const setActiveExhibit = useMuseumStore(s => s.setActiveExhibit);
  const setStoryOpen = useMuseumStore(s => s.setStoryOpen);
  const storyOpen = useMuseumStore(s => s.storyOpen);
  const setHallView = useMuseumStore(s => s.setHallView);
  const isMobile = useMuseumStore(s => s.isMobile);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (activeExhibit) {
      const idx = EXHIBITS.findIndex(e => e.id === activeExhibit.id);
      if (idx !== -1) setCurrentIdx(idx);
    }
  }, [activeExhibit]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!activeExhibit || storyOpen) return;
      if (e.key === 'Escape') setActiveExhibit(null);
      if (e.key === 'ArrowRight') navigateNext();
      if (e.key === 'ArrowLeft') navigatePrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeExhibit, storyOpen, currentIdx]);

  if (!activeExhibit || storyOpen) return null;

  const ex = EXHIBITS[currentIdx];

  function navigateNext() {
    const next = (currentIdx + 1) % EXHIBITS.length;
    setDirection(1);
    setCurrentIdx(next);
    setActiveExhibit(EXHIBITS[next]);
    const w = EXHIBITS[next].wall;
    setHallView(w === 'left' ? 'left' : w === 'right' ? 'right' : 'center');
  }

  function navigatePrev() {
    const prev = (currentIdx - 1 + EXHIBITS.length) % EXHIBITS.length;
    setDirection(-1);
    setCurrentIdx(prev);
    setActiveExhibit(EXHIBITS[prev]);
    const w = EXHIBITS[prev].wall;
    setHallView(w === 'left' ? 'left' : w === 'right' ? 'right' : 'center');
  }

  // Touch swipe handlers for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0) navigateNext();
      else navigatePrev();
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.97 }),
  };

  // ===== MOBILE LAYOUT =====
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 flex flex-col"
        style={{ zIndex: 30, animation: 'fadeIn 0.3s ease' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(3,3,10,0.97)' }} />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between" style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(186,215,247,0.06)',
        }}>
          <div style={{
            fontFamily: 'var(--font-poppins)', fontSize: '0.55rem',
            color: 'rgba(186,215,247,0.4)', letterSpacing: '0.15em',
          }}>
            {currentIdx + 1} / {EXHIBITS.length}
          </div>
          <button
            style={{
              width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '1px solid rgba(186,215,247,0.1)',
              color: 'rgba(186,215,247,0.6)', background: 'transparent',
              borderRadius: '50%', fontSize: '0.75rem',
            }}
            onClick={() => setActiveExhibit(null)}
          >&#10005;</button>
        </div>

        {/* Scrollable content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={ex.id}
            custom={direction}
            variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="relative z-10 flex-1 overflow-y-auto"
            style={{ padding: '0 16px 100px' }}
          >
            {/* Compact painting header */}
            <div style={{
              textAlign: 'center', padding: '24px 0 20px',
              borderBottom: '1px solid rgba(186,215,247,0.05)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', color: '#E4C46A' }}><ExhibitIcon id={ex.id} size={40} strokeWidth={1.5} /></div>
              <div style={{
                fontFamily: 'var(--font-poppins)', fontSize: '0.55rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.6)', marginBottom: '8px',
              }}>
                {ex.era} &middot; Exhibit {ex.roman} &middot; {ex.wall} Hall
              </div>
              <h2 style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: '1.75rem', fontWeight: 900,
                color: '#f2ede2', lineHeight: 1.15,
                marginBottom: '6px',
              }}>
                {ex.title}
              </h2>
              <p style={{
                fontFamily: 'var(--font-fell)', fontStyle: 'italic',
                fontSize: '0.82rem', color: 'rgba(216,201,164,0.72)',
              }}>
                {ex.tagline}
              </p>
            </div>

            {/* Content sections */}
            <ContentSection label="What it was" accentColor="rgba(186,215,247,0.72)">
              <p style={{
                fontSize: '0.96rem', lineHeight: 1.8,
                color: 'rgba(222,238,250,0.85)',
                fontFamily: 'var(--font-poppins)', fontWeight: 300,
              }}>
                {ex.what}
              </p>
            </ContentSection>

            <ContentSection label="Why it failed" accentColor="rgba(255,168,130,0.75)">
              <p style={{
                fontSize: '0.96rem', lineHeight: 1.8,
                color: 'rgba(222,238,250,0.85)',
                fontFamily: 'var(--font-poppins)', fontWeight: 300,
              }}>
                {ex.why}
              </p>
            </ContentSection>

            <ContentSection label="What I learned" accentColor="rgba(201,168,76,0.6)">
              <div style={{
                padding: '14px 16px',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.01) 100%)',
                borderLeft: '2px solid rgba(201,168,76,0.3)',
                borderRadius: '0 8px 8px 0',
              }}>
                <p style={{
                  fontSize: '0.98rem', lineHeight: 1.85,
                  color: 'rgba(255,245,224,0.8)',
                  fontFamily: 'var(--font-fell)', fontStyle: 'italic',
                }}>
                  &ldquo;{ex.learn}&rdquo;
                </p>
              </div>
            </ContentSection>
          </motion.div>
        </AnimatePresence>

        {/* Fixed bottom bar */}
        <div className="relative z-10" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 16px',
          background: 'linear-gradient(0deg, rgba(3,3,10,0.98) 60%, transparent)',
          paddingTop: '28px',
          display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center',
        }}>
          {/* Nav arrows + full story */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
            <button
              onClick={navigatePrev}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '1px solid rgba(186,215,247,0.12)',
                background: 'rgba(5,6,15,0.6)', color: 'rgba(186,215,247,0.7)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
              }}
            >&#8249;</button>

            <button
              onClick={() => setShareOpen(true)}
              style={{
                padding: '10px 14px',
                fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontWeight: 400,
                border: '1px solid rgba(186,215,247,0.12)',
                background: 'rgba(152,192,239,0.03)',
                color: 'rgba(186,215,247,0.6)', borderRadius: '6px', flexShrink: 0,
              }}
            >Share</button>

            <button
              onClick={() => setStoryOpen(true)}
              style={{
                flex: 1, padding: '10px',
                fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontWeight: 500,
                border: '1px solid rgba(201,168,76,0.25)',
                background: 'rgba(201,168,76,0.06)',
                color: 'rgba(255,245,224,0.85)', borderRadius: '6px',
              }}
            >Full Story</button>

            <button
              onClick={navigateNext}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '1px solid rgba(186,215,247,0.12)',
                background: 'rgba(5,6,15,0.6)', color: 'rgba(186,215,247,0.7)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
              }}
            >&#8250;</button>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {EXHIBITS.map((_, i) => (
              <div
                key={i}
                onClick={() => { setDirection(i > currentIdx ? 1 : -1); setCurrentIdx(i); setActiveExhibit(EXHIBITS[i]); }}
                style={{
                  width: i === currentIdx ? '16px' : '4px', height: '4px', borderRadius: '2px',
                  background: i === currentIdx ? 'rgba(186,215,247,0.7)' : 'rgba(186,215,247,0.15)',
                  transition: 'all 0.3s', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Swipe hint */}
          <div style={{
            fontFamily: 'var(--font-poppins)', fontSize: '0.5rem',
            color: 'rgba(186,215,247,0.2)', letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            Swipe to navigate
          </div>
        </div>
        {shareOpen && <ShareCard exhibit={ex} onClose={() => setShareOpen(false)} />}
      </div>
    );
  }

  // ===== DESKTOP LAYOUT =====
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 30, animation: 'fadeIn 0.4s ease' }}
      onClick={() => setActiveExhibit(null)}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(3,3,10,0.96)' }} />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(26,42,90,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(152,192,239,0.06) 0%, transparent 50%)',
      }} />

      {/* Navigation arrows */}
      <div className="absolute z-40" style={{ left: '16px', top: '50%', marginTop: '-22px' }}>
        <motion.button
          onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: '1px solid rgba(186,215,247,0.12)',
            background: 'rgba(5,6,15,0.5)', color: 'rgba(186,215,247,0.7)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.3rem',
            backdropFilter: 'blur(8px)', transition: 'border-color 0.3s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(186,215,247,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(186,215,247,0.12)'; }}
        >&#8249;</motion.button>
      </div>

      <div className="absolute z-40" style={{ right: '16px', top: '50%', marginTop: '-22px' }}>
        <motion.button
          onClick={(e) => { e.stopPropagation(); navigateNext(); }}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: '1px solid rgba(186,215,247,0.12)',
            background: 'rgba(5,6,15,0.5)', color: 'rgba(186,215,247,0.7)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.3rem',
            backdropFilter: 'blur(8px)', transition: 'border-color 0.3s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(186,215,247,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(186,215,247,0.12)'; }}
        >&#8250;</motion.button>
      </div>

      {/* Progress dots */}
      <div className="absolute z-40 flex gap-1.5" style={{ bottom: '18px', left: '50%', transform: 'translateX(-50%)' }}>
        {EXHIBITS.map((_, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); setDirection(i > currentIdx ? 1 : -1); setCurrentIdx(i); setActiveExhibit(EXHIBITS[i]); }}
            style={{
              width: i === currentIdx ? '20px' : '5px', height: '5px', borderRadius: '3px',
              background: i === currentIdx ? 'rgba(186,215,247,0.7)' : 'rgba(186,215,247,0.15)',
              transition: 'all 0.3s', cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute z-40" style={{ top: '14px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-poppins)', fontSize: '0.6rem', color: 'rgba(186,215,247,0.3)', letterSpacing: '0.2em' }}>
        {currentIdx + 1} / {EXHIBITS.length}
      </div>

      {/* MAIN CARD — SPLIT LAYOUT */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={ex.id}
          custom={direction}
          variants={slideVariants}
          initial="enter" animate="center" exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-30 flex overflow-hidden"
          style={{
            maxWidth: '1100px', width: 'calc(100% - 80px)', maxHeight: '80vh',
            background: 'rgba(8,10,20,0.95)',
            border: '1px solid rgba(186,215,247,0.06)',
            borderRadius: '12px',
            boxShadow: '0 0 100px rgba(0,0,0,0.6), 0 0 40px rgba(11,29,58,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* LEFT PANEL — PAINTING */}
          <div className="exhibit-left-panel" style={{
            width: '42%', minWidth: '320px', position: 'relative',
            background: 'linear-gradient(135deg, #141a30 0%, #1b2440 45%, #12182c 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            borderRight: '1px solid rgba(186,215,247,0.04)',
            overflow: 'hidden', flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.18) 0%, transparent 62%)',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: '30%', right: '30%',
              height: '60%',
              background: 'linear-gradient(180deg, rgba(255,245,224,0.06) 0%, transparent 100%)',
              clipPath: 'polygon(35% 0, 65% 0, 90% 100%, 10% 100%)',
            }} />

            <div style={{ position: 'relative', padding: '40px 30px' }}>
              <div style={{
                position: 'relative', padding: '12px',
                background: 'linear-gradient(135deg, #4a3510, #C9A84C, #8B6914, #E8D080, #C9A84C, #4a3510)',
                borderRadius: '4px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,220,120,0.2), inset 0 -1px 0 rgba(40,25,5,0.4)',
              }}>
                <div style={{
                  padding: '4px',
                  background: 'linear-gradient(135deg, #8B6914, #E8CC80, #C9A84C)',
                  borderRadius: '2px',
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #141a2e, #1a2140, #131a30)',
                    padding: '28px 24px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '320px',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'radial-gradient(ellipse at 50% 0%, rgba(255,213,79,0.12) 0%, transparent 60%)',
                    }} />
                    <div style={{
                      position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                      fontFamily: 'Georgia, serif', fontSize: '4rem', fontWeight: 'bold',
                      color: 'rgba(201,168,76,0.1)', lineHeight: 1,
                    }}>
                      {ex.roman}
                    </div>
                    <div style={{
                      fontSize: '3.5rem', marginBottom: '16px',
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', inset: '-16px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
                      }} />
                      <span style={{ position: 'relative', display: 'inline-flex', color: '#F0E6CC' }}><ExhibitIcon id={ex.id} size={56} strokeWidth={1.4} /></span>
                    </div>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontStyle: 'italic',
                      fontSize: '0.85rem', color: '#FFD54F',
                      marginBottom: '12px', position: 'relative',
                    }}>
                      {ex.era}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      marginBottom: '16px',
                    }}>
                      <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,213,79,0.5))' }} />
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,213,79,0.5)', transform: 'rotate(45deg)' }} />
                      <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, rgba(255,213,79,0.5), transparent)' }} />
                    </div>
                    <h3 style={{
                      fontFamily: 'Georgia, serif', fontWeight: 'bold',
                      fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                      color: '#F5F3EE', textAlign: 'center',
                      lineHeight: 1.3, position: 'relative',
                    }}>
                      {ex.title}
                    </h3>
                    <p style={{
                      fontFamily: 'Georgia, serif', fontStyle: 'italic',
                      fontSize: '0.75rem', color: 'rgba(212,197,160,0.7)',
                      textAlign: 'center', marginTop: '8px',
                      position: 'relative',
                    }}>
                      {ex.tagline.replace(/"/g, '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              padding: '6px 20px',
              background: 'linear-gradient(135deg, #4a3510, #8B6914, #C9A84C, #8B6914, #4a3510)',
              borderRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', marginTop: '-8px',
            }}>
              <div style={{
                padding: '4px 16px', background: '#0a0600', borderRadius: '1px',
                fontFamily: 'var(--font-poppins)', fontSize: '0.55rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.7)', textAlign: 'center',
              }}>
                Exhibit {ex.roman} &mdash; {ex.era}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL — CONTENT */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
          }}>
            <button
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 5,
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '1px solid rgba(186,215,247,0.1)',
                color: 'rgba(186,215,247,0.5)', background: 'rgba(5,6,15,0.4)',
                borderRadius: '50%', fontSize: '0.8rem', transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(186,215,247,0.08)'; e.target.style.color = '#bad6f7'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(5,6,15,0.4)'; e.target.style.color = 'rgba(186,215,247,0.5)'; }}
              onClick={() => setActiveExhibit(null)}
            >&#10005;</button>

            <div style={{
              padding: '28px 32px 20px',
              borderBottom: '1px solid rgba(186,215,247,0.05)',
            }}>
              <div style={{
                display: 'inline-block', padding: '3px 12px',
                border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px',
                fontFamily: 'var(--font-poppins)', fontSize: '0.6rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.6)', fontWeight: 400, marginBottom: '14px',
              }}>
                {ex.era} &mdash; {ex.wall} Hall
              </div>
              <h2 style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(1.7rem, 3.4vw, 2.5rem)',
                fontWeight: 900, color: '#f2ede2', letterSpacing: '-0.01em',
                lineHeight: 1.15, marginBottom: '8px',
              }}>
                {ex.title}
              </h2>
              <p style={{
                fontFamily: 'var(--font-fell)', fontStyle: 'italic',
                fontSize: '0.9rem', color: 'rgba(216,201,164,0.72)', lineHeight: 1.4,
              }}>
                {ex.tagline}
              </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
              <ContentSection label="What it was" accentColor="rgba(186,215,247,0.72)">
                <p style={{
                  fontSize: '0.98rem', lineHeight: 1.85,
                  color: 'rgba(222,238,250,0.85)',
                  fontFamily: 'var(--font-poppins)', fontWeight: 300,
                }}>{ex.what}</p>
              </ContentSection>

              <ContentSection label="Why it failed" accentColor="rgba(255,168,130,0.75)">
                <p style={{
                  fontSize: '0.98rem', lineHeight: 1.85,
                  color: 'rgba(222,238,250,0.85)',
                  fontFamily: 'var(--font-poppins)', fontWeight: 300,
                }}>{ex.why}</p>
              </ContentSection>

              <ContentSection label="What I learned" accentColor="rgba(201,168,76,0.6)">
                <div style={{
                  padding: '18px 20px',
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.01) 100%)',
                  borderLeft: '2px solid rgba(201,168,76,0.3)',
                  borderRadius: '0 8px 8px 0',
                }}>
                  <p style={{
                    fontSize: '1.04rem', lineHeight: 1.85,
                    color: 'rgba(255,246,228,0.9)',
                    fontFamily: 'var(--font-fell)', fontStyle: 'italic',
                  }}>
                    &ldquo;{ex.learn}&rdquo;
                  </p>
                </div>
              </ContentSection>
            </div>

            <div style={{
              padding: '14px 32px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '1px solid rgba(186,215,247,0.04)',
              background: 'rgba(0,0,0,0.15)',
              gap: '8px',
            }}>
              <ModalBtn onClick={() => setActiveExhibit(null)}>Back to Hall</ModalBtn>
              <div style={{ display: 'flex', gap: '8px' }}>
                <ModalBtn onClick={() => setShareOpen(true)}>Share</ModalBtn>
                <ModalBtn primary onClick={() => setStoryOpen(true)}>See Full Story</ModalBtn>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {shareOpen && <ShareCard exhibit={ex} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function ContentSection({ label, accentColor, children }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '10px', paddingBottom: '6px',
      }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '1px',
          background: accentColor, transform: 'rotate(45deg)', flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--font-oswald)', fontSize: '0.6rem',
          letterSpacing: '0.25em', textTransform: 'uppercase',
          color: accentColor, fontWeight: 400,
        }}>{label}</span>
        <div style={{
          flex: 1, height: '1px',
          background: `linear-gradient(90deg, ${accentColor.replace('0.5', '0.15').replace('0.6', '0.15')}, transparent)`,
        }} />
      </div>
      {children}
    </div>
  );
}

function ModalBtn({ children, primary, onClick }) {
  return (
    <button
      style={{
        padding: '8px 22px', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
        cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontWeight: primary ? 500 : 300,
        border: `1px solid rgba(${primary ? '201,168,76' : '186,215,247'},${primary ? 0.25 : 0.08})`,
        background: `rgba(${primary ? '201,168,76' : '152,192,239'},${primary ? 0.06 : 0.02})`,
        color: primary ? 'rgba(255,245,224,0.85)' : 'rgba(186,215,247,0.7)',
        borderRadius: '6px', transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.target.style.background = `rgba(${primary ? '201,168,76' : '152,192,239'},0.12)`;
        e.target.style.borderColor = `rgba(${primary ? '201,168,76' : '186,215,247'},0.4)`;
      }}
      onMouseLeave={(e) => {
        e.target.style.background = `rgba(${primary ? '201,168,76' : '152,192,239'},${primary ? 0.06 : 0.02})`;
        e.target.style.borderColor = `rgba(${primary ? '201,168,76' : '186,215,247'},${primary ? 0.25 : 0.08})`;
      }}
      onClick={onClick}
    >{children}</button>
  );
}
