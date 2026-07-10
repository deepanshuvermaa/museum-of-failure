import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import useMuseumStore from '../store/useMuseumStore';

export default function Bench({ position = [0, 0, 0] }) {
  const [hovered, setHovered] = useState(false);
  const setBenchActive = useMuseumStore(s => s.setBenchActive);
  const reducedMotion = useMuseumStore(s => s.reducedMotion);
  const labelRef = useRef();
  const letterMeshRef = useRef();

  const seatW = 2.4, seatD = 0.55, seatH = 0.08, seatY = 0.50;
  const legW = 0.06, legH = seatY;

  // Load letter.jpg as texture
  const letterTex = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/letter.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Floating label — says what it is, not just "tap me".
  const tapTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 176;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 176);
    // Subtle glow bg
    const glow = ctx.createRadialGradient(256, 78, 0, 256, 78, 210);
    glow.addColorStop(0, 'rgba(255, 213, 79, 0.14)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 512, 176);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Primary line — serif, warm cream
    ctx.font = 'italic 600 52px Georgia, serif';
    ctx.fillStyle = '#FFF3D6';
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 8;
    ctx.fillText('A Letter For You', 256, 58);
    ctx.shadowBlur = 0;
    // Secondary line — small caps instruction
    try { ctx.letterSpacing = '6px'; } catch (e) {}
    ctx.font = '600 22px "Poppins", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,213,79,0.85)';
    ctx.fillText('CLICK TO READ', 256, 108);
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    // Arrow pointing down to the bench
    ctx.fillStyle = 'rgba(255,213,79,0.9)';
    ctx.beginPath();
    ctx.moveTo(240, 140); ctx.lineTo(256, 160); ctx.lineTo(272, 140);
    ctx.closePath();
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Bounce + billboard the label so it stays readable from any hall view.
  useFrame((state) => {
    if (labelRef.current) {
      const bob = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
      labelRef.current.position.y = seatY + 0.62 + bob;
      labelRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  // Warm chestnut wood material - visible against dark floor
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6B3A2A',
    roughness: 0.45,
    metalness: 0.08,
    emissive: new THREE.Color('#2a1510'),
    emissiveIntensity: 0.25,
  }), []);

  // Lighter wood top surface
  const woodTopMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8B5A3A',
    roughness: 0.4,
    metalness: 0.05,
    emissive: new THREE.Color('#3a2218'),
    emissiveIntensity: 0.2,
  }), []);

  // Wrought iron / aged bronze legs
  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a3520',
    roughness: 0.35,
    metalness: 0.7,
    emissive: new THREE.Color('#1a0f08'),
    emissiveIntensity: 0.15,
  }), []);

  // Gold accent material
  const goldAccentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C9A84C',
    metalness: 0.85,
    roughness: 0.2,
    emissive: new THREE.Color('#8B6914'),
    emissiveIntensity: 0.2,
  }), []);

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); setBenchActive(true); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* === SEAT === */}
      {/* Main seat slab */}
      <mesh position={[0, seatY, 0]} material={woodMat}>
        <boxGeometry args={[seatW, seatH, seatD]} />
      </mesh>
      {/* Top surface - slightly lighter */}
      <mesh position={[0, seatY + seatH / 2 + 0.003, 0]} material={woodTopMat}>
        <boxGeometry args={[seatW - 0.02, 0.006, seatD - 0.02]} />
      </mesh>
      {/* Gold trim edge around seat */}
      <mesh position={[0, seatY + seatH / 2 + 0.007, 0]} material={goldAccentMat}>
        <boxGeometry args={[seatW + 0.02, 0.003, seatD + 0.02]} />
      </mesh>

      {/* === APRON (support beam under seat) === */}
      <mesh position={[0, seatY - seatH / 2 - 0.025, -seatD / 2 + 0.03]} material={woodMat}>
        <boxGeometry args={[seatW - 0.2, 0.05, 0.03]} />
      </mesh>
      <mesh position={[0, seatY - seatH / 2 - 0.025, seatD / 2 - 0.03]} material={woodMat}>
        <boxGeometry args={[seatW - 0.2, 0.05, 0.03]} />
      </mesh>

      {/* === LEGS - ornate turned style === */}
      {[
        [-seatW / 2 + 0.12, 0, -seatD / 2 + 0.08],
        [seatW / 2 - 0.12, 0, -seatD / 2 + 0.08],
        [-seatW / 2 + 0.12, 0, seatD / 2 - 0.08],
        [seatW / 2 - 0.12, 0, seatD / 2 - 0.08],
      ].map((p, i) => (
        <group key={i} position={p}>
          {/* Main leg post */}
          <mesh position={[0, legH / 2, 0]} material={metalMat}>
            <cylinderGeometry args={[0.025, 0.03, legH, 8]} />
          </mesh>
          {/* Bulge detail at mid-leg */}
          <mesh position={[0, legH * 0.4, 0]} material={metalMat}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
          {/* Top connection plate */}
          <mesh position={[0, legH - 0.01, 0]} material={metalMat}>
            <cylinderGeometry args={[0.04, 0.025, 0.03, 8]} />
          </mesh>
          {/* Foot pad */}
          <mesh position={[0, 0.01, 0]} material={metalMat}>
            <cylinderGeometry args={[0.035, 0.04, 0.02, 8]} />
          </mesh>
        </group>
      ))}

      {/* === STRETCHERS (cross bars between legs) === */}
      {/* Front stretcher */}
      <mesh position={[0, legH * 0.2, -seatD / 2 + 0.08]} material={metalMat}>
        <cylinderGeometry args={[0.012, 0.012, seatW - 0.2, 6]} />
      </mesh>
      <mesh position={[0, legH * 0.2, -seatD / 2 + 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, seatW - 0.2, 6]} />
        <meshStandardMaterial color="#4a3520" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Back stretcher */}
      <mesh position={[0, legH * 0.2, seatD / 2 - 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, seatW - 0.2, 6]} />
        <meshStandardMaterial color="#4a3520" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Side stretchers */}
      <mesh position={[-seatW / 2 + 0.12, legH * 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, seatD - 0.12, 6]} />
        <meshStandardMaterial color="#4a3520" roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[seatW / 2 - 0.12, legH * 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, seatD - 0.12, 6]} />
        <meshStandardMaterial color="#4a3520" roughness={0.35} metalness={0.7} />
      </mesh>

      {/* === LETTER on the bench (using letter.jpg) === */}
      <mesh
        ref={letterMeshRef}
        position={[0.1, seatY + seatH / 2 + 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0.05]}
      >
        <planeGeometry args={[0.45, 0.65]} />
        <meshStandardMaterial map={letterTex} roughness={0.8} />
      </mesh>

      {/* === Floating "A Letter For You" label (billboards toward camera) === */}
      <group ref={labelRef} position={[0, seatY + 0.62, 0]}>
        <mesh>
          <planeGeometry args={[0.92, 0.32]} />
          <meshBasicMaterial map={tapTex} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* === LIGHTING === */}
      {/* Warm spotlight on bench */}
      <pointLight position={[0, 1.2, 0]} color="#FFD54F" intensity={hovered ? 2.0 : 0.6} distance={4} />
      {/* Rim light for visibility */}
      <pointLight position={[0, 0.3, 0.8]} color="#FFE082" intensity={0.4} distance={3} />
      <pointLight position={[0, 0.3, -0.8]} color="#FFE082" intensity={0.4} distance={3} />
    </group>
  );
}
