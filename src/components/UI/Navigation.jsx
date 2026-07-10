import React from 'react';
import useMuseumStore from '../../store/useMuseumStore';

export default function Navigation() {
  const scene = useMuseumStore(s => s.scene);
  const hallView = useMuseumStore(s => s.hallView);
  const setHallView = useMuseumStore(s => s.setHallView);
  const activeExhibit = useMuseumStore(s => s.activeExhibit);
  const benchActive = useMuseumStore(s => s.benchActive);
  const storyOpen = useMuseumStore(s => s.storyOpen);
  const isMobile = useMuseumStore(s => s.isMobile);
  const indexOpen = useMuseumStore(s => s.indexOpen);
  const setIndexOpen = useMuseumStore(s => s.setIndexOpen);

  if (scene !== 'hall' || activeExhibit || benchActive || storyOpen || indexOpen) return null;

  const views = [
    { key: 'left', label: 'Left', icon: '◁' },
    { key: 'panoramic', label: 'All', icon: '◇' },
    { key: 'center', label: 'Centre', icon: '□' },
    { key: 'right', label: 'Right', icon: '▷' },
  ];

  return (
    <>
      {/* === INDEX / COLLECTION BUTTON === */}
      <div style={{ position: 'fixed', top: isMobile ? '10px' : '16px', left: isMobile ? '10px' : '16px', zIndex: 21 }}>
        <button
          onClick={() => setIndexOpen(true)}
          aria-label="Open the collection index"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: isMobile ? '8px 12px' : '9px 16px',
            fontSize: isMobile ? '0.6rem' : '0.68rem',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '40px',
            boxShadow: '0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            transition: 'color 0.3s, border-color 0.3s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.color = '#FFD54F'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(255,255,255,0.82)'; }}
        >
          <span style={{ fontSize: '0.85em', lineHeight: 1 }}>&#9783;</span>
          {isMobile ? 'All' : 'The Collection'}
        </button>
      </div>

      {/* === NAVIGATION BAR === */}
      <div
        style={{
          position: 'fixed',
          top: isMobile ? '10px' : '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: isMobile ? '4px 5px' : '5px 6px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '40px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {views.map(v => {
          const isActive = hallView === v.key;
          return (
            <button
              key={v.key}
              style={{
                padding: isMobile ? '7px 14px' : '8px 20px',
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'var(--font-poppins)',
                fontWeight: isActive ? 600 : 400,
                border: 'none',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.3s ease',
                borderRadius: '30px',
                outline: 'none',
                boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.06)' : 'none',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.color = '#ffffff';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.color = 'rgba(255,255,255,0.55)';
                  e.target.style.background = 'transparent';
                }
              }}
              onClick={() => setHallView(v.key === hallView && v.key !== 'panoramic' ? 'panoramic' : v.key)}
            >
              {isMobile ? v.icon : v.label}
            </button>
          );
        })}
      </div>

      {/* === Museum of Glory link === */}
      {!isMobile && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 20 }}>
          <button
            style={{
              padding: '7px 16px',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-poppins)',
              fontWeight: 400,
              border: '1px solid rgba(201,168,76,0.25)',
              background: 'rgba(201,168,76,0.05)',
              color: 'rgba(255,213,79,0.7)',
              transition: 'all 0.3s ease',
              borderRadius: '20px',
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(201,168,76,0.12)';
              e.target.style.color = '#FFD54F';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(201,168,76,0.05)';
              e.target.style.color = 'rgba(255,213,79,0.7)';
            }}
            onClick={() => window.open('https://deepanshuverma.site/portfolio', '_blank')}
          >
            Museum of Glory &rarr;
          </button>
        </div>
      )}
    </>
  );
}
