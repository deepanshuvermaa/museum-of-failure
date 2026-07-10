import React, { useEffect, useRef, useState } from 'react';
import useMuseumStore from '../../store/useMuseumStore';

// Crisp 1200x630 Open Graph share image via Canvas (2x for retina sharpness).
function generateShareImage(exhibit) {
  return new Promise((resolve) => {
    const w = 1200, h = 630, s = 2;
    const canvas = document.createElement('canvas');
    canvas.width = w * s; canvas.height = h * s;
    const ctx = canvas.getContext('2d');
    ctx.scale(s, s);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#070a16');
    bg.addColorStop(0.55, '#0b1024');
    bg.addColorStop(1, '#05070f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Gold frame
    ctx.strokeStyle = 'rgba(201,168,76,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, w - 68, h - 68);

    ctx.textBaseline = 'alphabetic';

    // Brand
    ctx.textAlign = 'left';
    try { ctx.letterSpacing = '6px'; } catch (e) {}
    ctx.font = '600 20px Poppins, sans-serif';
    ctx.fillStyle = '#E4C46A';
    ctx.fillText('MUSEUM OF FAILURES', 80, 104);

    // Big numeral · era
    try { ctx.letterSpacing = '3px'; } catch (e) {}
    ctx.font = '700 34px Georgia, serif';
    ctx.fillStyle = 'rgba(228,196,106,0.85)';
    ctx.fillText(`EXHIBIT ${exhibit.roman}  ·  ${exhibit.era}`, 80, 250);

    // Title (wrapped, large)
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    ctx.fillStyle = '#F6F1E5';
    let fs = 84;
    const maxW = w - 160;
    const fit = () => {
      ctx.font = `700 ${fs}px Georgia, serif`;
      const words = exhibit.title.split(' ');
      const lines = []; let line = '';
      for (const word of words) {
        const t = line + word + ' ';
        if (ctx.measureText(t).width > maxW && line) { lines.push(line.trim()); line = word + ' '; }
        else line = t;
      }
      lines.push(line.trim());
      return lines;
    };
    let lines = fit();
    while (lines.length > 2 && fs > 52) { fs -= 6; lines = fit(); }
    let ty = 340;
    lines.forEach((ln) => { ctx.fillText(ln, 80, ty); ty += fs * 1.15; });

    // Divider
    ctx.strokeStyle = 'rgba(228,196,106,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(80, ty + 6); ctx.lineTo(300, ty + 6); ctx.stroke();

    // Tagline
    ctx.font = 'italic 28px Georgia, serif';
    ctx.fillStyle = 'rgba(222,208,176,0.75)';
    const tl = exhibit.tagline.replace(/"/g, '');
    ctx.fillText(tl.length > 70 ? tl.slice(0, 67) + '…' : tl, 80, ty + 50);

    // Footer
    ctx.font = '400 18px Poppins, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('museumoffailures.com', 80, h - 60);

    canvas.toBlob((b) => resolve(b), 'image/png');
  });
}

const shareUrl = (exhibit) =>
  `${typeof window !== 'undefined' ? window.location.origin : ''}/#exhibit-${exhibit.id + 1}`;
const shareText = (exhibit) =>
  `"${exhibit.title}" — a failure, framed in gold at the Museum of Failures.`;

export default function ShareCard({ exhibit, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const blobRef = useRef(null);
  const isMobile = useMuseumStore(s => s.isMobile);

  useEffect(() => {
    let alive = true;
    generateShareImage(exhibit).then((blob) => {
      if (!alive) return;
      blobRef.current = blob;
      setImageUrl(URL.createObjectURL(blob));
    });
    return () => { alive = false; };
  }, [exhibit]);

  if (!exhibit) return null;

  const url = shareUrl(exhibit);
  const text = shareText(exhibit);

  const download = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `museum-of-failures-${exhibit.roman.toLowerCase()}.png`;
    a.click();
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) {}
  };
  const nativeShare = async () => {
    try {
      const data = { title: 'Museum of Failures', text, url };
      if (navigator.canShare && blobRef.current && navigator.canShare({ files: [new File([blobRef.current], 'card.png', { type: 'image/png' })] })) {
        data.files = [new File([blobRef.current], 'museum-of-failures.png', { type: 'image/png' })];
      }
      if (navigator.share) await navigator.share(data); else copyLink();
    } catch (e) {}
  };
  const openX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  const openLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 50, animation: 'fadeIn 0.3s ease', padding: '16px' }} onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.88)' }} />
      <div
        style={{
          position: 'relative', zIndex: 51, maxWidth: '560px', width: '100%',
          padding: isMobile ? '22px' : '30px',
          background: 'rgba(9,11,22,0.97)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '16px',
          boxShadow: '0 30px 90px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 900, fontSize: '1.5rem', color: '#f2ede2', letterSpacing: '-0.01em' }}>Share this failure</h3>
          <button onClick={onClose} aria-label="Close" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>&#10005;</button>
        </div>

        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.15)', marginBottom: '18px', aspectRatio: '1200 / 630', background: '#0b1024' }}>
          {imageUrl
            ? <img src={imageUrl} alt={`${exhibit.title} share card`} style={{ width: '100%', display: 'block' }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(228,196,106,0.6)', fontFamily: 'var(--font-fell)', fontStyle: 'italic', fontSize: '0.9rem' }}>Preparing your card…</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px' }}>
          <ShareAction label="Share" onClick={nativeShare} primary />
          <ShareAction label="X / Twitter" onClick={openX} />
          <ShareAction label="LinkedIn" onClick={openLinkedIn} />
          <ShareAction label={copied ? 'Copied ✓' : 'Copy link'} onClick={copyLink} />
        </div>
        <button onClick={download} style={{ marginTop: '10px', width: '100%', padding: '11px', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-poppins)', fontWeight: 500, border: '1px solid rgba(186,215,247,0.14)', background: 'transparent', color: 'rgba(210,226,246,0.75)', borderRadius: '8px', cursor: 'pointer' }}>
          Download image (PNG)
        </button>
      </div>
    </div>
  );
}

function ShareAction({ label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '11px 8px', fontSize: '0.72rem', letterSpacing: '0.06em',
        fontFamily: 'var(--font-poppins)', fontWeight: primary ? 600 : 500,
        border: `1px solid rgba(201,168,76,${primary ? 0.5 : 0.2})`,
        background: primary ? 'rgba(201,168,76,0.16)' : 'rgba(255,255,255,0.03)',
        color: primary ? '#FFF3D6' : 'rgba(232,224,206,0.9)',
        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.25s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,213,79,0.7)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(201,168,76,${primary ? 0.5 : 0.2})`; }}
    >{label}</button>
  );
}

export function ShareButton({ exhibit, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 16px', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontWeight: 400, border: '1px solid rgba(186,215,247,0.08)', background: 'rgba(152,192,239,0.02)', color: 'rgba(186,215,247,0.7)', borderRadius: '6px' }}>Share</button>
  );
}
