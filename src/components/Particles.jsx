import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useMuseumStore from '../store/useMuseumStore';
import { getTheme } from '../themes';

const PARTICLE_COUNT = 150;

function createSparkleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
  grad.addColorStop(0, 'rgba(255, 255, 240, 1)');
  grad.addColorStop(0.15, 'rgba(255, 230, 150, 0.8)');
  grad.addColorStop(0.3, 'rgba(255, 213, 79, 0.4)');
  grad.addColorStop(0.6, 'rgba(255, 200, 50, 0.1)');
  grad.addColorStop(1, 'rgba(255, 200, 50, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  ctx.strokeStyle = 'rgba(255, 255, 220, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 12); ctx.lineTo(32, 52);
  ctx.moveTo(12, 32); ctx.lineTo(52, 32);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 220, 0.3)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(18, 18); ctx.lineTo(46, 46);
  ctx.moveTo(46, 18); ctx.lineTo(18, 46);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function Particles() {
  const pointsRef = useRef();
  const matRef = useRef();
  const sparkleTex = useMemo(() => createSparkleTexture(), []);

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const offsets = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = Math.random() * 5.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
      speeds[i] = 0.05 + Math.random() * 0.25;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    return { positions, speeds, offsets };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    // Respect reduced-motion: keep particles present but still (no drift/rise).
    if (useMuseumStore.getState().reducedMotion) {
      if (matRef.current) {
        const t = getTheme(useMuseumStore.getState().theme);
        matRef.current.color.lerp(new THREE.Color(t.particleColor), 0.03);
        matRef.current.opacity += (t.particleOpacity - matRef.current.opacity) * 0.03;
      }
      return;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posAttr.array[i3 + 1] += speeds[i] * 0.002;
      posAttr.array[i3] += Math.sin(time * 0.4 + offsets[i]) * 0.0008;
      posAttr.array[i3 + 2] += Math.cos(time * 0.25 + offsets[i]) * 0.0008;

      if (posAttr.array[i3 + 1] > 5.9) {
        posAttr.array[i3 + 1] = 0.1;
        posAttr.array[i3] = (Math.random() - 0.5) * 15;
        posAttr.array[i3 + 2] = (Math.random() - 0.5) * 9;
      }
    }
    posAttr.needsUpdate = true;

    // Update color from theme
    if (matRef.current) {
      const t = getTheme(useMuseumStore.getState().theme);
      matRef.current.color.lerp(new THREE.Color(t.particleColor), 0.03);
      matRef.current.opacity += (t.particleOpacity - matRef.current.opacity) * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        map={sparkleTex}
        color="#FFD54F"
        size={0.06}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
