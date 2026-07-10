import React, { useState } from 'react';
import useMuseumStore from '../../store/useMuseumStore';
import { THEMES, THEME_KEYS } from '../../themes';

export default function ThemePicker() {
  const scene = useMuseumStore(s => s.scene);
  const theme = useMuseumStore(s => s.theme);
  const setTheme = useMuseumStore(s => s.setTheme);
  const activeExhibit = useMuseumStore(s => s.activeExhibit);
  const storyOpen = useMuseumStore(s => s.storyOpen);
  const benchActive = useMuseumStore(s => s.benchActive);
  const isMobile = useMuseumStore(s => s.isMobile);

  const [open, setOpen] = useState(false);

  if (scene !== 'hall' || activeExhibit || storyOpen || benchActive) return null;

  return (
    <>
      {/* Themes button — sits directly under The Collection */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Change museum theme"
        style={{
          position: 'fixed',
          top: isMobile ? '52px' : '64px',
          left: isMobile ? '10px' : '16px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: isMobile ? '8px 12px' : '9px 16px',
          fontSize: isMobile ? '0.6rem' : '0.68rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-poppins)',
          fontWeight: 500,
          borderRadius: '40px',
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.82)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          transition: 'all 0.3s',
        }}
        title="Change theme"
      >
        <span style={{ fontSize: '0.9em', lineHeight: 1 }}>{'\u2699'}</span>
        {isMobile ? 'Theme' : 'Themes'}
      </button>

      {/* Theme picker overlay */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 50, animation: 'fadeIn 0.3s ease' }}
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)' }} />

          <div
            style={{
              position: 'relative', zIndex: 51,
              maxWidth: isMobile ? '95vw' : '640px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: isMobile ? '24px 16px' : '32px',
              background: 'rgba(8,10,20,0.95)',
              border: '1px solid rgba(186,215,247,0.08)',
              borderRadius: '12px',
              boxShadow: '0 0 80px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-oswald)', fontSize: '0.6rem',
                letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.6)', marginBottom: '8px',
              }}>
                Choose Your Aesthetic
              </div>
              <h3 style={{
                fontFamily: 'var(--font-fraunces)', fontSize: '1.7rem',
                fontWeight: 900, color: '#f2ede2', letterSpacing: '-0.01em',
              }}>
                How should your museum feel?
              </h3>
            </div>

            {/* Theme cards — grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '20px',
            }}>
              {THEME_KEYS.map(key => {
                const t = THEMES[key];
                const isActive = theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      try { localStorage.setItem('museum-theme', key); } catch (e) {}
                    }}
                    style={{
                      padding: '0',
                      background: isActive ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1.5px solid ${isActive ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Real painting thumbnail */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16 / 10',
                      overflow: 'hidden',
                      borderBottom: `1px solid ${isActive ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <img
                        src={t.wallTexture}
                        alt={`${t.name} by ${t.artist}`}
                        loading="lazy"
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          filter: isActive ? 'none' : 'saturate(0.85) brightness(0.8)',
                          transition: 'all 0.3s',
                        }}
                      />
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: '8px', right: '8px',
                          padding: '3px 8px', borderRadius: '20px',
                          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                          fontFamily: 'var(--font-poppins)', fontSize: '0.5rem',
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                          color: t.accentColor, border: `1px solid ${t.accentColor}66`,
                        }}>Active</div>
                      )}
                    </div>

                    {/* Name + artist */}
                    <div style={{ padding: isMobile ? '10px 12px' : '12px 14px' }}>
                      <div style={{
                        fontFamily: 'var(--font-playfair)',
                        fontSize: isMobile ? '0.8rem' : '0.92rem',
                        fontWeight: 700,
                        color: isActive ? '#f2ede2' : 'rgba(240,240,236,0.85)',
                        marginBottom: '2px', lineHeight: 1.2,
                      }}>
                        {t.name}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-fell)', fontStyle: 'italic',
                        fontSize: '0.72rem',
                        color: 'rgba(216,201,164,0.65)',
                      }}>
                        {t.artist}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Note about images */}
            <div style={{
              fontFamily: 'var(--font-poppins)', fontSize: '0.5rem',
              color: 'rgba(255,255,255,0.2)', textAlign: 'center',
              marginBottom: '16px', lineHeight: 1.6,
            }}>
              Each theme changes the wall paintings, lighting, and atmosphere
            </div>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              style={{
                display: 'block', margin: '0 auto',
                padding: '10px 32px',
                fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                fontFamily: 'var(--font-poppins)', fontWeight: 500,
                border: '1px solid rgba(201,168,76,0.2)',
                background: 'rgba(201,168,76,0.06)',
                color: 'rgba(255,245,224,0.7)',
                borderRadius: '6px', cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
