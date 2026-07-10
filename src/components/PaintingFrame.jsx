import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPaintingTexture, createGoldTexture } from '../utils/textures';
import useMuseumStore from '../store/useMuseumStore';

const FRAME_W = 1.5;
const FRAME_H = 2.0;
const FRAME_D = 0.18;
const BORDER = 0.22;

// Generate a carved/ornate gold frame texture with depth
function createOrnateFrameTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');

  // Base burnished gold
  const base = ctx.createLinearGradient(0, 0, 512, 512);
  base.addColorStop(0, '#4a3510');
  base.addColorStop(0.15, '#8B6914');
  base.addColorStop(0.3, '#C9A84C');
  base.addColorStop(0.45, '#E8D080');
  base.addColorStop(0.55, '#C9A84C');
  base.addColorStop(0.7, '#8B6914');
  base.addColorStop(0.85, '#C9A84C');
  base.addColorStop(1, '#4a3510');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  // Cross highlight
  const cross = ctx.createLinearGradient(512, 0, 0, 512);
  cross.addColorStop(0, 'rgba(240, 220, 150, 0.2)');
  cross.addColorStop(0.5, 'rgba(100, 70, 20, 0.1)');
  cross.addColorStop(1, 'rgba(240, 220, 150, 0.15)');
  ctx.fillStyle = cross;
  ctx.fillRect(0, 0, 512, 512);

  // Patina/aging grain
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const dark = Math.random() > 0.5;
    ctx.fillStyle = dark
      ? `rgba(40, 25, 5, ${0.02 + Math.random() * 0.06})`
      : `rgba(255, 220, 120, ${0.01 + Math.random() * 0.04})`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  // Carved groove patterns (horizontal lines simulating carved molding)
  for (let y = 0; y < 512; y += 16) {
    ctx.strokeStyle = `rgba(60, 40, 10, ${0.08 + Math.random() * 0.06})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
    // Highlight below groove
    ctx.strokeStyle = `rgba(240, 210, 130, ${0.04 + Math.random() * 0.04})`;
    ctx.beginPath();
    ctx.moveTo(0, y + 1);
    ctx.lineTo(512, y + 1);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// Engraved brass nameplate — real, readable text (numeral · year + title).
// Drawn to canvas so it stays consistent with the project's zero-external-asset approach.
function createNameplateTexture(exhibit) {
  const W = 2048, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Brass base
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#1c130a');
  base.addColorStop(0.5, '#0a0703');
  base.addColorStop(1, '#1c130a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Inset engraved border
  ctx.strokeStyle = 'rgba(201,168,76,0.6)';
  ctx.lineWidth = 5;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Kicker line: numeral · year
  try { ctx.letterSpacing = '6px'; } catch (e) {}
  ctx.font = '700 74px Georgia, serif';
  ctx.fillStyle = '#E4C46A';
  ctx.fillText(`${exhibit.roman}   ·   ${exhibit.era}`, W / 2, 150);

  // Title — upright (not italic) for legibility at distance
  try { ctx.letterSpacing = '1px'; } catch (e) {}
  ctx.fillStyle = '#F5EFE2';
  let size = 118;
  ctx.font = `700 ${size}px Georgia, serif`;
  while (ctx.measureText(exhibit.title).width > W - 130 && size > 60) {
    size -= 6;
    ctx.font = `700 ${size}px Georgia, serif`;
  }
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 10;
  ctx.fillText(exhibit.title, W / 2, 330);
  ctx.shadowBlur = 0;
  try { ctx.letterSpacing = '0px'; } catch (e) {}

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

export default function PaintingFrame({ exhibit, position, rotation = [0, 0, 0], scale = 1 }) {
  const groupRef = useRef();
  const spotRef = useRef();
  const [hovered, setHovered] = useState(false);
  const setActiveExhibit = useMuseumStore(s => s.setActiveExhibit);
  const setHoveredFrame = useMuseumStore(s => s.setHoveredFrame);
  const setHallView = useMuseumStore(s => s.setHallView);

  const paintingTexture = useMemo(() => createPaintingTexture(exhibit), [exhibit]);
  const frameTex = useMemo(() => createOrnateFrameTexture(), []);
  const nameplateTex = useMemo(() => createNameplateTexture(exhibit), [exhibit]);
  const plateGlowRef = useRef();
  const reducedMotion = useMuseumStore(s => s.reducedMotion);

  // Main ornate gold material — aged, rich, with depth
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: frameTex,
    color: '#B89030',
    metalness: 0.82,
    roughness: 0.28,
    emissive: '#3a2508',
    emissiveIntensity: 0.15,
    bumpMap: frameTex,
    bumpScale: 0.02,
  }), [frameTex]);

  // Inner bright gold liner
  const linerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8CC80',
    metalness: 0.9,
    roughness: 0.12,
    emissive: '#8B6914',
    emissiveIntensity: 0.2,
  }), []);

  // Dark shadow recess between layers
  const recessMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0600',
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  // Check if ANY frame is hovered (not just this one)
  const globalHovered = useMuseumStore(s => s.hoveredFrame);
  const isAnyHovered = globalHovered !== null;
  const isThisHovered = globalHovered === exhibit.id;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Hover lift
      const targetY = hovered ? 0.04 : 0;
      groupRef.current.position.y += (targetY - (groupRef.current.position.y - position[1])) * 0.06;
      // Breathing — subtle scale oscillation (0.2% over 4s); off when reduced-motion
      const breathe = reducedMotion ? 1 : 1 + Math.sin(t * 1.5 + exhibit.id * 0.7) * 0.002;
      groupRef.current.scale.setScalar(scale * breathe);
    }
    // Nameplate glow — gently pulses so touch users read the frame as interactive
    if (plateGlowRef.current) {
      const pulse = reducedMotion ? 0.35 : 0.28 + Math.sin(t * 2 + exhibit.id) * 0.14;
      plateGlowRef.current.material.emissiveIntensity = isThisHovered ? 0.85 : pulse;
    }
    if (spotRef.current) {
      const targetIntensity = isThisHovered ? 10 : (isAnyHovered ? 0.5 : 3);
      spotRef.current.intensity = THREE.MathUtils.lerp(
        spotRef.current.intensity, targetIntensity, 0.08
      );
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (exhibit.wall === 'left') setHallView('left');
    else if (exhibit.wall === 'right') setHallView('right');
    else setHallView('center');
    setActiveExhibit(exhibit);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredFrame(exhibit.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredFrame(null);
    document.body.style.cursor = 'default';
  };

  const hw = FRAME_W / 2;
  const hh = FRAME_H / 2;
  const fz = FRAME_D / 2;
  const IB = 0.06; // inner border

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Spotlight */}
      <spotLight
        ref={spotRef}
        position={[0, 2, 0.9]}
        angle={0.5}
        penumbra={0.85}
        intensity={2}
        color="#fff5e0"
        distance={5}
        castShadow
      />
      <mesh position={[0, 1.7, 0.35]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#fff5c0" transparent opacity={hovered ? 0.9 : 0.4} />
      </mesh>

      <group onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        {/* === OUTER FRAME — single thick box per side, beveled look via material === */}
        {/* Top */}
        <mesh position={[0, hh + BORDER / 2, fz]} material={frameMat}>
          <boxGeometry args={[FRAME_W + BORDER * 2, BORDER, FRAME_D]} />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -hh - BORDER / 2, fz]} material={frameMat}>
          <boxGeometry args={[FRAME_W + BORDER * 2, BORDER, FRAME_D]} />
        </mesh>
        {/* Left */}
        <mesh position={[-hw - BORDER / 2, 0, fz]} material={frameMat}>
          <boxGeometry args={[BORDER, FRAME_H, FRAME_D]} />
        </mesh>
        {/* Right */}
        <mesh position={[hw + BORDER / 2, 0, fz]} material={frameMat}>
          <boxGeometry args={[BORDER, FRAME_H, FRAME_D]} />
        </mesh>

        {/* === OUTER LIP — thin raised edge === */}
        <mesh position={[0, hh + BORDER + 0.015, fz + 0.005]} material={linerMat}>
          <boxGeometry args={[FRAME_W + BORDER * 2 + 0.04, 0.03, FRAME_D - 0.02]} />
        </mesh>
        <mesh position={[0, -hh - BORDER - 0.015, fz + 0.005]} material={linerMat}>
          <boxGeometry args={[FRAME_W + BORDER * 2 + 0.04, 0.03, FRAME_D - 0.02]} />
        </mesh>
        <mesh position={[-hw - BORDER - 0.015, 0, fz + 0.005]} material={linerMat}>
          <boxGeometry args={[0.03, FRAME_H + 0.02, FRAME_D - 0.02]} />
        </mesh>
        <mesh position={[hw + BORDER + 0.015, 0, fz + 0.005]} material={linerMat}>
          <boxGeometry args={[0.03, FRAME_H + 0.02, FRAME_D - 0.02]} />
        </mesh>

        {/* === INNER RECESS — dark channel between frame and canvas === */}
        <mesh position={[0, hh + 0.025, fz + 0.03]} material={recessMat}>
          <boxGeometry args={[FRAME_W + 0.04, 0.04, 0.04]} />
        </mesh>
        <mesh position={[0, -hh - 0.025, fz + 0.03]} material={recessMat}>
          <boxGeometry args={[FRAME_W + 0.04, 0.04, 0.04]} />
        </mesh>
        <mesh position={[-hw - 0.025, 0, fz + 0.03]} material={recessMat}>
          <boxGeometry args={[0.04, FRAME_H - 0.02, 0.04]} />
        </mesh>
        <mesh position={[hw + 0.025, 0, fz + 0.03]} material={recessMat}>
          <boxGeometry args={[0.04, FRAME_H - 0.02, 0.04]} />
        </mesh>

        {/* === INNER LINER — bright gold slip === */}
        <mesh position={[0, hh - IB / 2, fz + 0.05]} material={linerMat}>
          <boxGeometry args={[FRAME_W + 0.01, IB, 0.03]} />
        </mesh>
        <mesh position={[0, -hh + IB / 2, fz + 0.05]} material={linerMat}>
          <boxGeometry args={[FRAME_W + 0.01, IB, 0.03]} />
        </mesh>
        <mesh position={[-hw + IB / 2, 0, fz + 0.05]} material={linerMat}>
          <boxGeometry args={[IB, FRAME_H - IB * 2, 0.03]} />
        </mesh>
        <mesh position={[hw - IB / 2, 0, fz + 0.05]} material={linerMat}>
          <boxGeometry args={[IB, FRAME_H - IB * 2, 0.03]} />
        </mesh>

        {/* === CORNER ORNAMENTS — subtle rosette clusters === */}
        {[
          [-hw - BORDER / 2, hh + BORDER / 2],
          [hw + BORDER / 2, hh + BORDER / 2],
          [-hw - BORDER / 2, -hh - BORDER / 2],
          [hw + BORDER / 2, -hh - BORDER / 2],
        ].map(([cx, cy], i) => (
          <group key={i} position={[cx, cy, fz + FRAME_D / 2 + 0.005]}>
            <mesh material={linerMat}>
              <sphereGeometry args={[0.05, 10, 10]} />
            </mesh>
            {[0, 1, 2, 3].map(j => {
              const a = (j / 4) * Math.PI * 2 + Math.PI / 4;
              return (
                <mesh key={j} position={[Math.cos(a) * 0.06, Math.sin(a) * 0.06, 0]} material={frameMat}>
                  <sphereGeometry args={[0.022, 6, 6]} />
                </mesh>
              );
            })}
          </group>
        ))}

        {/* === PAINTING === */}
        <mesh position={[0, 0, fz + 0.055]}>
          <planeGeometry args={[FRAME_W - IB * 2, FRAME_H - IB * 2]} />
          <meshStandardMaterial
            map={paintingTexture}
            roughness={0.7}
            emissive="#181510"
            emissiveIntensity={isThisHovered ? 0.6 : (isAnyHovered ? 0.03 : 0.15)}
          />
        </mesh>

        {/* Back */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[FRAME_W + BORDER * 2 + 0.05, FRAME_H + BORDER * 2 + 0.05]} />
          <meshStandardMaterial color="#0a0800" side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Nameplate — engraved brass placard with the exhibit numeral + title.
          Also clickable, and glows gently to signal interactivity (esp. on touch). */}
      <group
        position={[0, -hh - BORDER - 0.34, fz]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Brass backing */}
        <mesh material={frameMat}>
          <boxGeometry args={[1.42, 0.34, 0.03]} />
        </mesh>
        {/* Engraved face with text */}
        <mesh ref={plateGlowRef} position={[0, 0, 0.02]}>
          <planeGeometry args={[1.36, 0.3]} />
          <meshStandardMaterial
            map={nameplateTex}
            transparent
            roughness={0.55}
            metalness={0.2}
            emissive="#C9A84C"
            emissiveMap={nameplateTex}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Hover glow */}
      {hovered && (
        <pointLight position={[0, 0, 0.6]} color="#FFD54F" intensity={1.2} distance={2.5} />
      )}
    </group>
  );
}
