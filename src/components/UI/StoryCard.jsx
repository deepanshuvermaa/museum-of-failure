import React, { useEffect, useRef, useMemo } from 'react';
import useMuseumStore from '../../store/useMuseumStore';

function Sparkles({ count = 30 }) {
  const sparkles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    })),
    [count]
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 41 }}>
      {sparkles.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,213,79,0.4) 50%, transparent 100%)',
            animation: `star-twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function StoryCard() {
  const activeExhibit = useMuseumStore(s => s.activeExhibit);
  const storyOpen = useMuseumStore(s => s.storyOpen);
  const setStoryOpen = useMuseumStore(s => s.setStoryOpen);
  const isMobile = useMuseumStore(s => s.isMobile);
  const scrollRef = useRef();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && storyOpen) {
        setStoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [storyOpen, setStoryOpen]);

  useEffect(() => {
    if (storyOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [storyOpen]);

  if (!storyOpen || !activeExhibit) return null;

  const ex = activeExhibit;
  const s = ex.story;
  const px = isMobile ? '16px' : '32px 16px';

  return (
    <div
      ref={scrollRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        overflowY: 'auto',
        padding: px,
        background: 'rgba(2,2,8,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        animation: 'fadeIn 0.5s ease',
      }}
    >
      {!isMobile && <Sparkles count={35} />}

      <div style={{
        maxWidth: isMobile ? '100%' : '700px',
        margin: '0 auto',
        animation: 'fadeInUp 0.6s ease',
        position: 'relative', zIndex: 42,
      }}>
        {/* Top section */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: isMobile ? '20px' : '48px',
            paddingBottom: isMobile ? '24px' : '40px',
            marginBottom: isMobile ? '24px' : '40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '6px 18px',
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: isMobile ? '14px' : '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.04)',
              fontFamily: 'var(--font-poppins)',
              fontWeight: 400,
            }}
          >
            Full Story
          </span>
          <h1
            style={{
              lineHeight: 1.1,
              marginBottom: '12px',
              fontFamily: 'var(--font-oswald)',
              fontSize: isMobile ? '1.5rem' : 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: 600,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {ex.title}
          </h1>
          <p
            style={{
              fontSize: isMobile ? '0.85rem' : '1rem',
              fontFamily: 'var(--font-poppins)',
              fontWeight: 500,
              color: '#ffffff',
              opacity: 0.6,
            }}
          >
            {ex.era} &mdash; Exhibit {ex.roman}
          </p>
        </div>

        {/* Timeline */}
        <StorySection title="Timeline of Events">
          {s.timeline.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: isMobile ? '12px' : '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 0 8px rgba(255,255,255,0.3)',
                }} />
                {i < s.timeline.length - 1 && (
                  <div style={{ width: '1px', flex: 1, minHeight: '24px', marginTop: '4px', background: 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
              <div>
                <div style={{
                  fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#ffffff', opacity: 0.5,
                  fontFamily: 'var(--font-opensans)', fontWeight: 600,
                }}>
                  {t.date}
                </div>
                <div style={{
                  fontSize: isMobile ? '0.85rem' : '0.92rem', lineHeight: 1.65, marginTop: '2px',
                  color: '#ffffff', opacity: 0.7,
                  fontFamily: 'var(--font-poppins)', fontWeight: 300,
                }}>
                  {t.text}
                </div>
              </div>
            </div>
          ))}
        </StorySection>

        {/* Mistakes */}
        <StorySection title="The Mistakes">
          {s.mistakes.map((m, i) => (
            <div
              key={i}
              style={{
                padding: '10px 0',
                fontSize: isMobile ? '0.85rem' : '0.92rem',
                lineHeight: 1.65,
                color: '#ffffff',
                opacity: 0.7,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontFamily: 'var(--font-poppins)',
                fontWeight: 300,
              }}
            >
              &mdash; {m}
            </div>
          ))}
        </StorySection>

        {/* Lessons */}
        <StorySection title="What I Learned">
          {s.lessons.map((l, i) => (
            <div
              key={i}
              style={{
                padding: isMobile ? '16px' : '22px',
                marginBottom: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '1.8rem',
                  lineHeight: 1,
                  fontFamily: 'var(--font-lobster)',
                  color: 'rgba(255,255,255,0.12)',
                }}
              >
                {l.n}
              </div>
              <div
                style={{
                  fontSize: isMobile ? '0.88rem' : '0.95rem',
                  lineHeight: 1.7,
                  marginTop: '6px',
                  color: '#ffffff',
                  opacity: 0.85,
                  fontFamily: 'var(--font-poppins)',
                  fontWeight: 500,
                }}
              >
                {l.t}
              </div>
            </div>
          ))}
        </StorySection>

        {/* Back button */}
        <button
          style={{
            display: 'block',
            margin: '40px auto 24px',
            padding: isMobile ? '12px 36px' : '12px 44px',
            fontSize: '0.82rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'var(--font-poppins)',
            fontWeight: 500,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
          onClick={() => setStoryOpen(false)}
        >
          Back to Exhibit
        </button>
      </div>
    </div>
  );
}

function StorySection({ title, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h3
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          marginBottom: '18px',
          paddingBottom: '10px',
          fontFamily: 'var(--font-oswald)',
          fontWeight: 400,
          color: '#ffffff',
          opacity: 0.45,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
