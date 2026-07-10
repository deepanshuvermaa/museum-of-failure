import React from 'react';

// Professional line icons (24x24, stroke-based) — one per exhibit, keyed by id.
// Used both as React components (ExhibitIcon) and drawn onto canvas (drawIcon),
// so the 3D paintings, the index, the modal, and the share card all match.
export const EXHIBIT_ICON_PATHS = {
  0: [ // Ghosted invoice — file/receipt
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6', 'M9 9H8', 'M16 13H8', 'M16 17H8',
  ],
  1: [ // Feature nobody used — box
    'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
    'M3.3 7 12 12l8.7-5', 'M12 22V12',
  ],
  2: [ // Startup that drowned — waves
    'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.5 0 2.5 2 5 2 1.3 0 1.9-.5 2.5-1',
    'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 1.3 0 1.9-.5 2.5-1',
    'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 1.3 0 1.9-.5 2.5-1',
  ],
  3: [ // Rebrand that confused — palette
    'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.6z',
    'M8.5 8.5h.01', 'M15.5 8.5h.01', 'M17 12.5h.01',
  ],
  4: [ // Client lost in a day — clock
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2',
  ],
  5: [ // Perfectionism — target
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z',
    'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  ],
  6: [ // Team imploded — users
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  7: [ // Partnership dissolved — broken link
    'M9 17H7A5 5 0 0 1 7 7h2', 'M15 7h2a5 5 0 0 1 4.9 6', 'M8 12h3', 'M15 12h1',
  ],
  8: [ // Burnout — flame
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  ],
  9: [ // Launch nobody saw — rocket
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
    'M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
    'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0',
    'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  ],
  10: [ // Pitch fell flat — microphone
    'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z',
    'M19 10v2a7 7 0 0 1-14 0v-2', 'M12 19v3',
  ],
  11: [ // Scope that swallowed — expand
    'M8 3H5a2 2 0 0 0-2 2v3', 'M21 8V5a2 2 0 0 0-2-2h-3',
    'M3 16v3a2 2 0 0 0 2 2h3', 'M16 21h3a2 2 0 0 0 2-2v-3',
  ],
};

export function ExhibitIcon({ id, size = 24, color = 'currentColor', strokeWidth = 1.6, style }) {
  const paths = EXHIBIT_ICON_PATHS[id] || [];
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true"
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// Draw the same icon onto a 2D canvas context, centered at (cx, cy).
export function drawIcon(ctx, id, cx, cy, size, color = '#E8DFC8') {
  const paths = EXHIBIT_ICON_PATHS[id];
  if (!paths) return;
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.3, size * 0.045) / s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  paths.forEach((d) => { try { ctx.stroke(new Path2D(d)); } catch (e) {} });
  ctx.restore();
}
