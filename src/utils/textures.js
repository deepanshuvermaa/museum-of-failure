import * as THREE from 'three';
import { drawIcon } from '../data/icons.jsx';

// Generate a VIVID Starry Night texture — high-res, no pixelation
// Mobile devices get 2048 to avoid WebGL context loss
export function createStarryNightTexture(width = 2048, height = 2048) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base: deep midnight blue gradient
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, '#0B1D3A');
  baseGrad.addColorStop(0.3, '#0d2247');
  baseGrad.addColorStop(0.5, '#1A2A5A');
  baseGrad.addColorStop(0.7, '#0f1e40');
  baseGrad.addColorStop(1, '#091428');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Scale factor relative to 2048 base
  const s = width / 2048;

  // === SWIRL PATTERNS ===
  function drawSwirl(cx, cy, radius, turns, color, lineW, alpha) {
    ctx.beginPath();
    ctx.lineWidth = lineW * s;
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    for (let t = 0; t < turns * Math.PI * 2; t += 0.03) {
      const r = radius * s * (1 - t / (turns * Math.PI * 2)) + lineW * s;
      const x = cx * s + Math.cos(t) * r;
      const y = cy * s + Math.sin(t) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Large prominent swirls
  const swirlConfigs = [
    { cx: 500, cy: 600, r: 200, turns: 3.5, color: '#2B5EA7', w: 20, a: 0.7 },
    { cx: 500, cy: 600, r: 150, turns: 3, color: '#4A90D9', w: 14, a: 0.5 },
    { cx: 500, cy: 600, r: 100, turns: 2, color: '#FFD54F', w: 7, a: 0.38 },

    { cx: 1480, cy: 500, r: 220, turns: 4, color: '#1E4D8C', w: 22, a: 0.65 },
    { cx: 1480, cy: 500, r: 160, turns: 3, color: '#3D7AC7', w: 16, a: 0.5 },
    { cx: 1480, cy: 500, r: 95, turns: 2, color: '#FFD54F', w: 9, a: 0.32 },

    { cx: 1024, cy: 1300, r: 180, turns: 3, color: '#2B5EA7', w: 18, a: 0.6 },
    { cx: 1024, cy: 1300, r: 120, turns: 2.5, color: '#5BA0E0', w: 12, a: 0.42 },
    { cx: 1024, cy: 1300, r: 65, turns: 1.8, color: '#FFC107', w: 6, a: 0.3 },

    { cx: 300, cy: 1500, r: 140, turns: 2.5, color: '#1A3F7A', w: 16, a: 0.55 },
    { cx: 1750, cy: 1400, r: 160, turns: 3, color: '#2B5EA7', w: 17, a: 0.5 },
    { cx: 920, cy: 300, r: 110, turns: 2.2, color: '#3D7AC7', w: 14, a: 0.48 },
    { cx: 1700, cy: 200, r: 90, turns: 2, color: '#4A90D9', w: 12, a: 0.4 },
    { cx: 200, cy: 1000, r: 130, turns: 2.8, color: '#2B5EA7', w: 15, a: 0.45 },
  ];

  swirlConfigs.forEach(c => drawSwirl(c.cx, c.cy, c.r, c.turns, c.color, c.w, c.a));

  // === FLOWING BRUSH STROKES — more of them, smoother ===
  for (let i = 0; i < 120; i++) {
    ctx.beginPath();
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    ctx.moveTo(startX, startY);

    let x = startX, y = startY;
    const len = 35 + Math.random() * 50;
    for (let j = 0; j < len; j++) {
      const angle = Math.sin(x * 0.004 / s + i * 0.5) * 2.5 + Math.cos(y * 0.003 / s + i * 0.3) * 2;
      x += Math.cos(angle) * 14 * s;
      y += Math.sin(angle) * 14 * s;
      ctx.lineTo(x, y);
    }

    const isYellow = Math.random() < 0.22;
    const hue = isYellow ? 45 + Math.random() * 15 : 210 + Math.random() * 40;
    const lightness = isYellow ? 60 + Math.random() * 20 : 35 + Math.random() * 25;
    const alpha = 0.06 + Math.random() * 0.14;
    ctx.strokeStyle = `hsla(${hue}, 70%, ${lightness}%, ${alpha})`;
    ctx.lineWidth = (3 + Math.random() * 10) * s;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // === STAR BURSTS ===
  function drawStar(x, y, size, brightness) {
    x *= s; y *= s; size *= s;
    const outerGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 8);
    outerGrad.addColorStop(0, `rgba(255, 213, 79, ${brightness * 0.5})`);
    outerGrad.addColorStop(0.3, `rgba(255, 193, 7, ${brightness * 0.2})`);
    outerGrad.addColorStop(0.6, `rgba(110, 198, 255, ${brightness * 0.08})`);
    outerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(x - size * 8, y - size * 8, size * 16, size * 16);

    const innerGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
    innerGrad.addColorStop(0, `rgba(255, 255, 240, ${brightness})`);
    innerGrad.addColorStop(0.4, `rgba(255, 230, 130, ${brightness * 0.8})`);
    innerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGrad;
    ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);

    for (let ring = 1; ring <= 3; ring++) {
      ctx.beginPath();
      ctx.arc(x, y, size * (2 + ring * 1.5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 213, 79, ${brightness * (0.3 - ring * 0.08)})`;
      ctx.lineWidth = (3 - ring * 0.5) * s;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 220, ${brightness})`;
    ctx.fill();
  }

  drawStar(370, 300, 14, 0.9);
  drawStar(920, 160, 16, 0.95);
  drawStar(1530, 240, 13, 0.85);
  drawStar(1850, 400, 12, 0.8);
  drawStar(720, 800, 15, 0.9);
  drawStar(1330, 1000, 14, 0.85);
  drawStar(200, 1100, 12, 0.75);
  drawStar(1640, 900, 13, 0.8);

  for (let i = 0; i < 20; i++) {
    drawStar(
      Math.random() * 2048,
      Math.random() * 2048,
      4 + Math.random() * 7,
      0.4 + Math.random() * 0.4
    );
  }

  // Twinkles
  for (let i = 0; i < 60; i++) {
    const sx = Math.random() * width;
    const sy = Math.random() * height;
    const sr = (1 + Math.random() * 3) * s;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 248, 220, ${0.3 + Math.random() * 0.5})`;
    ctx.fill();

    const tg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 4);
    tg.addColorStop(0, 'rgba(255, 230, 150, 0.3)');
    tg.addColorStop(1, 'transparent');
    ctx.fillStyle = tg;
    ctx.fillRect(sx - sr * 4, sy - sr * 4, sr * 8, sr * 8);
  }

  // === CRESCENT MOON ===
  const moonX = 1800 * s;
  const moonY = 200 * s;
  const moonR = 50 * s;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 5);
  moonGlow.addColorStop(0, 'rgba(255, 213, 79, 0.35)');
  moonGlow.addColorStop(0.3, 'rgba(255, 193, 7, 0.12)');
  moonGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(moonX - moonR * 5, moonY - moonR * 5, moonR * 10, moonR * 10);
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD54F';
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(moonX + 18 * s, moonY - 8 * s, moonR * 0.85, 0, Math.PI * 2);
  ctx.fillStyle = '#0d2247';
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

// Golden ornate frame texture
export function createGoldTexture(width = 256, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#6b4f0a');
  grad.addColorStop(0.15, '#C9A84C');
  grad.addColorStop(0.3, '#F0D890');
  grad.addColorStop(0.5, '#E8CC80');
  grad.addColorStop(0.7, '#C9A84C');
  grad.addColorStop(0.85, '#8B6914');
  grad.addColorStop(1, '#6b4f0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const grad2 = ctx.createLinearGradient(width, 0, 0, height);
  grad2.addColorStop(0, 'rgba(240, 216, 144, 0.3)');
  grad2.addColorStop(0.5, 'rgba(139, 105, 20, 0.15)');
  grad2.addColorStop(1, 'rgba(240, 216, 144, 0.2)');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 200}, ${Math.random() > 0.5 ? 220 : 160}, ${Math.random() > 0.5 ? 80 : 0}, 0.04)`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1 + Math.random(), 1 + Math.random());
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Floor texture
export function createFloorTexture(width = 1024, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(201, 168, 76, 0.03)';
  ctx.lineWidth = 0.5;
  const tileSize = 64;
  for (let x = 0; x < width; x += tileSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += tileSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.5);
  grad.addColorStop(0, 'rgba(110, 198, 255, 0.02)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Painting canvas texture with text
export function createPaintingTexture(exhibit, w = 512, h = 640) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Deep charcoal/navy background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0a0e1a');
  bg.addColorStop(0.3, '#10152a');
  bg.addColorStop(0.5, '#0e1222');
  bg.addColorStop(0.7, '#10152a');
  bg.addColorStop(1, '#0a0e1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Canvas weave
  for (let y = 0; y < h; y += 3) {
    ctx.strokeStyle = `rgba(255,255,255,${0.01 + (y % 6 === 0 ? 0.01 : 0)})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  for (let x = 0; x < w; x += 3) {
    ctx.strokeStyle = `rgba(255,255,255,${0.008})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }

  // Subtle border
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(14, 14, w - 28, h - 28);

  // Spotlight from top
  const spot = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.7);
  spot.addColorStop(0, 'rgba(255, 213, 79, 0.15)');
  spot.addColorStop(1, 'transparent');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, w, h);

  // Roman numeral watermark
  if (exhibit.roman) {
    ctx.font = `bold ${w * 0.24}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(201, 168, 76, 0.14)';
    ctx.fillText(exhibit.roman, w / 2, h * 0.16);
  }

  // Icon with circle bg
  const iconY = h * 0.30;
  const iconRadius = w * 0.1;

  const iconGrad = ctx.createRadialGradient(w / 2, iconY, 0, w / 2, iconY, iconRadius * 1.5);
  iconGrad.addColorStop(0, 'rgba(201, 168, 76, 0.15)');
  iconGrad.addColorStop(0.6, 'rgba(26, 42, 90, 0.3)');
  iconGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = iconGrad;
  ctx.beginPath();
  ctx.arc(w / 2, iconY, iconRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(201, 168, 76, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2, iconY, iconRadius * 1.2, 0, Math.PI * 2);
  ctx.stroke();

  drawIcon(ctx, exhibit.id, w / 2, iconY, iconRadius * 1.4, '#F0E6CC');

  // Year
  ctx.textBaseline = 'alphabetic';
  ctx.font = `italic ${w * 0.055}px Georgia, serif`;
  ctx.fillStyle = '#FFD54F';
  ctx.fillText(exhibit.era, w / 2, h * 0.44);

  // Decorative line
  ctx.strokeStyle = 'rgba(255, 213, 79, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.25, h * 0.47);
  ctx.lineTo(w * 0.75, h * 0.47);
  ctx.stroke();

  const drawDiamond = (x, y, size) => {
    ctx.fillStyle = 'rgba(255, 213, 79, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
  };
  drawDiamond(w * 0.25, h * 0.47, 3);
  drawDiamond(w * 0.75, h * 0.47, 3);

  // Title
  ctx.fillStyle = '#F5F3EE';
  ctx.font = `bold ${w * 0.072}px Georgia, serif`;
  const words = exhibit.title.split(' ');
  let line = '';
  let lineY = h * 0.57;
  const maxWidth = w * 0.78;
  const lineHeight = w * 0.085;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), w / 2, lineY);
      line = word + ' ';
      lineY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), w / 2, lineY);

  // Tagline
  ctx.font = `italic ${w * 0.045}px Georgia, serif`;
  ctx.fillStyle = 'rgba(212, 197, 160, 0.75)';
  ctx.fillText(exhibit.tagline.replace(/"/g, ''), w / 2, lineY + lineHeight * 1.3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Ceiling texture
export function createCeilingTexture(width = 2048, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const baseGrad = ctx.createLinearGradient(0, 0, width, 0);
  baseGrad.addColorStop(0, '#0B1D3A');
  baseGrad.addColorStop(0.5, '#1A2A5A');
  baseGrad.addColorStop(1, '#0B1D3A');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 8; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 50 + Math.random() * 120;
    ctx.beginPath();
    ctx.lineWidth = 8 + Math.random() * 10;
    const isYellow = Math.random() < 0.3;
    ctx.strokeStyle = isYellow
      ? `rgba(255, 213, 79, ${0.2 + Math.random() * 0.2})`
      : `rgba(43, 94, 167, ${0.3 + Math.random() * 0.3})`;
    for (let t = 0; t < 4 * Math.PI; t += 0.08) {
      const rr = r * (1 - t / (4 * Math.PI));
      const x = cx + Math.cos(t) * rr;
      const y = cy + Math.sin(t) * rr;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 2 + Math.random() * 5;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    grad.addColorStop(0, `rgba(255, 245, 190, ${0.5 + Math.random() * 0.5})`);
    grad.addColorStop(0.4, 'rgba(255, 213, 79, 0.2)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 220, ${0.6 + Math.random() * 0.4})`;
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}
