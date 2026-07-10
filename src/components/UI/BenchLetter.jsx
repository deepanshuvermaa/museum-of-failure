import React, { useEffect } from 'react';
import useMuseumStore from '../../store/useMuseumStore';

export default function BenchLetter() {
  const benchActive = useMuseumStore(s => s.benchActive);
  const setBenchActive = useMuseumStore(s => s.setBenchActive);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && benchActive) setBenchActive(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [benchActive, setBenchActive]);

  if (!benchActive) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        // Red crumpled paper background filling entire screen
        background: 'radial-gradient(ellipse at 50% 40%, #5a1515 0%, #2a0808 50%, #120404 100%)',
        animation: 'fadeIn 0.5s ease',
        zIndex: 25,
        padding: '24px',
      }}
      onClick={() => setBenchActive(false)}
    >
      {/* Red texture noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            repeating-conic-gradient(rgba(80,20,20,0.03) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px,
            radial-gradient(ellipse at 30% 60%, rgba(120,30,30,0.15), transparent 70%),
            radial-gradient(ellipse at 70% 30%, rgba(100,20,20,0.1), transparent 60%)
          `,
        }}
      />

      {/* Close */}
      <button
        className="fixed cursor-pointer transition-all duration-300"
        style={{
          top: '16px', right: '16px', zIndex: 26,
          padding: '8px 18px',
          fontFamily: 'var(--font-poppins)',
          fontSize: '0.68rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.7)',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
        onClick={() => setBenchActive(false)}
      >
        <span style={{ fontSize: '0.8rem' }}>✕</span> Close
      </button>

      {/* Paper card — CSS-designed old paper look */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          width: '92vw',
          maxHeight: '82vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'fadeInUp 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)',
          // Aged parchment effect
          background: `
            linear-gradient(180deg, #f5edda 0%, #ede2c8 20%, #e8dcc0 50%, #ede2c8 80%, #f0e6d0 100%)
          `,
          borderRadius: '2px',
          boxShadow: `
            0 2px 4px rgba(0,0,0,0.2),
            0 8px 24px rgba(0,0,0,0.3),
            0 24px 60px rgba(0,0,0,0.4),
            inset 0 0 60px rgba(160,130,80,0.08)
          `,
          // Torn/rough edge simulation
          clipPath: 'polygon(0.5% 0.3%, 2% 0%, 98% 0%, 99.5% 0.5%, 100% 2%, 99.8% 98%, 99.5% 99.5%, 98% 100%, 2% 99.8%, 0.3% 99.5%, 0% 98%, 0.2% 2%)',
        }}
      >
        {/* Paper texture overlay — subtle grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              repeating-conic-gradient(rgba(140,120,80,0.02) 0% 25%, transparent 0% 50%) 0 0 / 3px 3px
            `,
            borderRadius: '2px',
          }}
        />

        {/* Aging stain spots */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '15%', left: '5%', width: '60px', height: '40px',
            background: 'radial-gradient(ellipse, rgba(180,150,100,0.08), transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '20%', right: '8%', width: '80px', height: '50px',
            background: 'radial-gradient(ellipse, rgba(160,130,80,0.06), transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Content */}
        <div style={{ padding: '2.8rem 2rem 2.2rem', position: 'relative' }}>
          {/* Header ornament */}
          <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-oswald)',
                fontSize: '0.5rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#6a5030',
                fontWeight: 500,
              }}
            >
              Museum of Failures
            </div>
            {/* Decorative line */}
            <div style={{ width: '40px', height: '1px', background: '#b8a070', margin: '6px auto' }} />
          </div>

          <h2
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#1a0e04',
              lineHeight: 1.25,
              marginBottom: '0.2rem',
            }}
          >
            A Letter to the Visitor
          </h2>

          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-fell)',
              fontStyle: 'italic',
              fontSize: '0.68rem',
              color: '#7a6040',
              marginBottom: '1rem',
            }}
          >
            Written from the bench, on a quiet evening
          </div>

          {/* Divider */}
          <div style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg, transparent, #b8a070, transparent)', margin: '0 auto 1rem' }} />

          {/* Body */}
          <div
            style={{
              fontFamily: 'var(--font-poppins)',
              fontSize: '0.72rem',
              lineHeight: 1.7,
              color: '#1e1408',
              fontWeight: 400,
            }}
          >
            <p style={{ marginBottom: '0.7rem' }}>Dear visitor,</p>

            <p style={{ marginBottom: '0.7rem' }}>
              You've walked through these halls and seen the wreckage — the ventures that
              collapsed, the clients I lost, the months I spent polishing code nobody ever ran.
            </p>

            <p style={{ marginBottom: '0.7rem' }}>
              I built this museum not out of shame, but out of reverence. Every failure
              taught me something the successes never could.
            </p>

            <p style={{ marginBottom: '0.7rem' }}>
              The world shows you its highlights. LinkedIn is a museum of victories.
              This is the other place — the honest one.
            </p>

            {/* Timeline — clean, minimal */}
            <div
              style={{
                margin: '1rem 0',
                padding: '0.8rem 1rem',
                borderLeft: '2px solid #8a7040',
                background: 'rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-oswald)',
                  fontSize: '0.5rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#6a5030',
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                }}
              >
                Timeline
              </div>

              {[
                ['2019', 'First client ghosted my invoice.'],
                ['2020', 'Built a feature nobody used.'],
                ['2021', 'Launched a product to silence.'],
                ['2022', 'Lost a €12K client in 48 hours.'],
                ['2023', 'Perfectionism froze me for 3 months.'],
                ['2024', 'Team of 4 imploded.'],
                ['2025', 'Still here. Still failing forward.'],
              ].map(([yr, txt], i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.2rem', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-oswald)', fontSize: '0.68rem', fontWeight: 600, color: '#5a3a18', flexShrink: 0, width: '32px' }}>{yr}</span>
                  <span style={{ fontSize: '0.68rem', color: '#2a1800', lineHeight: 1.45 }}>{txt}</span>
                </div>
              ))}
            </div>

            <p style={{ marginBottom: '0.7rem' }}>
              If you've made it this far, perhaps you too carry some beautiful, quiet failures.
            </p>

            <p style={{ marginBottom: '0.7rem' }}>
              Now go see the <em style={{ color: '#5a3a18' }}>Museum of Glory</em> — you've earned it.
            </p>

            <div style={{ marginTop: '1rem', fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: '0.8rem', color: '#1a0e04' }}>
              — With honesty,<br /><strong>The Curator</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
