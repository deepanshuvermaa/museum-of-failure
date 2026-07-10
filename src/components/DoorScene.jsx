import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useMuseumStore from '../store/useMuseumStore';

const DOOR_W = 1.8;
const DOOR_H = 4.5;
const DOOR_DEPTH = 0.18;

export default function DoorScene() {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();
  const glowRef = useRef();
  const glowPlaneRef = useRef();
  const groupRef = useRef();
  const swirlLightsRef = useRef([]);
  const swirlPlanesRef = useRef([]);

  // === RICH MATERIALS ===

  // Dark mahogany door wood
  const doorWoodMat = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 1024;
    const ctx = c.getContext('2d');
    const base = ctx.createLinearGradient(0, 0, 0, 1024);
    base.addColorStop(0, '#1a0d06');
    base.addColorStop(0.3, '#2a1408');
    base.addColorStop(0.5, '#1e0f05');
    base.addColorStop(0.7, '#2a1408');
    base.addColorStop(1, '#1a0d06');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 1024);
    for (let i = 0; i < 120; i++) {
      const y = Math.random() * 1024;
      ctx.strokeStyle = `rgba(${50 + Math.random() * 30}, ${25 + Math.random() * 15}, ${8 + Math.random() * 8}, ${0.1 + Math.random() * 0.15})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 512; x += 6) {
        ctx.lineTo(x, y + Math.sin(x * 0.01 + i * 0.3) * 2);
      }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({
      map: tex, color: '#3a1c0a',
      roughness: 0.35, metalness: 0.15,
      clearcoat: 0.3, clearcoatRoughness: 0.4,
    });
  }, []);

  // Warm limestone/marble facade
  const stoneMat = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#c8bca0';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(${140 + Math.random() * 60}, ${120 + Math.random() * 50}, ${80 + Math.random() * 40}, ${0.03 + Math.random() * 0.06})`;
      ctx.fillRect(x, y, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }
    for (let i = 0; i < 15; i++) {
      ctx.strokeStyle = `rgba(${100 + Math.random() * 40}, ${85 + Math.random() * 30}, ${60 + Math.random() * 20}, ${0.04 + Math.random() * 0.04})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      let x = Math.random() * 512, y = Math.random() * 512;
      ctx.moveTo(x, y);
      for (let j = 0; j < 30; j++) {
        x += Math.random() * 20 - 10;
        y += Math.random() * 20 - 5;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return new THREE.MeshStandardMaterial({
      map: tex, color: '#6a6050',
      roughness: 0.75, metalness: 0.02,
    });
  }, []);

  const darkStoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8a8070', roughness: 0.85, metalness: 0.02,
  }), []);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C9A84C', metalness: 0.88, roughness: 0.15,
    emissive: '#8B6914', emissiveIntensity: 0.15,
  }), []);

  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e0e04', roughness: 0.45, metalness: 0.2,
  }), []);

  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3a3535', roughness: 0.6, metalness: 0.15,
  }), []);

  // Silhouette figure material — pure black
  const silhouetteMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#000000',
  }), []);

  // Swirling starry night light spill texture
  const swirlSpillTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 1024;
    const ctx = c.getContext('2d');
    // Transparent base
    ctx.clearRect(0, 0, 1024, 1024);
    // Golden-blue swirling light
    const grad = ctx.createRadialGradient(512, 200, 0, 512, 512, 512);
    grad.addColorStop(0, 'rgba(255, 213, 79, 0.9)');
    grad.addColorStop(0.15, 'rgba(255, 193, 7, 0.6)');
    grad.addColorStop(0.3, 'rgba(100, 170, 255, 0.4)');
    grad.addColorStop(0.5, 'rgba(43, 94, 167, 0.25)');
    grad.addColorStop(0.7, 'rgba(11, 29, 58, 0.1)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Swirl streaks
    for (let i = 0; i < 30; i++) {
      const startX = 512 + (Math.random() - 0.5) * 300;
      const startY = 200 + Math.random() * 200;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let x = startX, y = startY;
      for (let j = 0; j < 40; j++) {
        const angle = Math.sin(x * 0.005 + i) * 3 + Math.cos(y * 0.004) * 2;
        x += Math.cos(angle) * 15;
        y += Math.sin(angle) * 15 + 5;
        ctx.lineTo(x, y);
      }
      const isGold = Math.random() < 0.4;
      ctx.strokeStyle = isGold
        ? `rgba(255, 213, 79, ${0.15 + Math.random() * 0.2})`
        : `rgba(100, 160, 255, ${0.1 + Math.random() * 0.15})`;
      ctx.lineWidth = 4 + Math.random() * 8;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Starry night backdrop behind doors — use high-res procedural
  const starryBackdropTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2048; c.height = 2048;
    const ctx = c.getContext('2d');

    // Deep cosmic background
    const bg = ctx.createLinearGradient(0, 0, 0, 2048);
    bg.addColorStop(0, '#0B1D3A');
    bg.addColorStop(0.3, '#0d2247');
    bg.addColorStop(0.5, '#1A2A5A');
    bg.addColorStop(0.7, '#0f1e40');
    bg.addColorStop(1, '#091428');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 2048, 2048);

    // Bold swirls
    function drawSwirl(cx, cy, radius, turns, color, lineW, alpha) {
      ctx.beginPath();
      ctx.lineWidth = lineW;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      for (let t = 0; t < turns * Math.PI * 2; t += 0.04) {
        const r = radius * (1 - t / (turns * Math.PI * 2)) + lineW;
        const x = cx + Math.cos(t) * r;
        const y = cy + Math.sin(t) * r;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Large swirls
    drawSwirl(500, 600, 250, 3.5, '#2B5EA7', 22, 0.7);
    drawSwirl(500, 600, 180, 3, '#4A90D9', 14, 0.5);
    drawSwirl(500, 600, 120, 2, '#FFD54F', 8, 0.4);
    drawSwirl(1500, 500, 280, 4, '#1E4D8C', 24, 0.65);
    drawSwirl(1500, 500, 200, 3, '#3D7AC7', 16, 0.5);
    drawSwirl(1500, 500, 100, 2, '#FFD54F', 10, 0.35);
    drawSwirl(1024, 1300, 220, 3, '#2B5EA7', 18, 0.6);
    drawSwirl(1024, 1300, 150, 2.5, '#5BA0E0', 12, 0.45);
    drawSwirl(300, 1500, 160, 2.5, '#1A3F7A', 16, 0.55);
    drawSwirl(1700, 1400, 180, 3, '#2B5EA7', 18, 0.5);

    // Flowing brush strokes
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      let x = Math.random() * 2048, y = Math.random() * 2048;
      ctx.moveTo(x, y);
      for (let j = 0; j < 40; j++) {
        const angle = Math.sin(x * 0.006 + i * 0.5) * 2.5 + Math.cos(y * 0.005 + i * 0.3) * 2;
        x += Math.cos(angle) * 14;
        y += Math.sin(angle) * 14;
        ctx.lineTo(x, y);
      }
      const isYellow = Math.random() < 0.25;
      const hue = isYellow ? 45 + Math.random() * 15 : 210 + Math.random() * 40;
      const lightness = isYellow ? 60 + Math.random() * 20 : 35 + Math.random() * 25;
      ctx.strokeStyle = `hsla(${hue}, 70%, ${lightness}%, ${0.08 + Math.random() * 0.15})`;
      ctx.lineWidth = 3 + Math.random() * 10;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Stars
    function drawStar(sx, sy, size, brightness) {
      const outer = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 8);
      outer.addColorStop(0, `rgba(255, 213, 79, ${brightness * 0.5})`);
      outer.addColorStop(0.3, `rgba(255, 193, 7, ${brightness * 0.2})`);
      outer.addColorStop(1, 'transparent');
      ctx.fillStyle = outer;
      ctx.fillRect(sx - size * 8, sy - size * 8, size * 16, size * 16);
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 220, ${brightness})`;
      ctx.fill();
    }

    const starPositions = [
      [350, 300, 14, 0.9], [900, 160, 16, 0.95], [1500, 240, 13, 0.85],
      [1850, 400, 12, 0.8], [700, 800, 15, 0.9], [1300, 1000, 14, 0.85],
      [200, 1100, 12, 0.75], [1600, 900, 13, 0.8],
    ];
    starPositions.forEach(([x, y, s, b]) => drawStar(x, y, s, b));
    for (let i = 0; i < 25; i++) {
      drawStar(Math.random() * 2048, Math.random() * 2048, 4 + Math.random() * 7, 0.4 + Math.random() * 0.4);
    }

    // Moon
    const moonX = 1800, moonY = 200, moonR = 50;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 5);
    moonGlow.addColorStop(0, 'rgba(255, 213, 79, 0.4)');
    moonGlow.addColorStop(0.3, 'rgba(255, 193, 7, 0.15)');
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(moonX - moonR * 5, moonY - moonR * 5, moonR * 10, moonR * 10);
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD54F';
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(moonX + 20, moonY - 10, moonR * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = '#0d2247';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Also try loading the high-res image as an alternative
  const starryBackdropRef = useRef();
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/starry-night.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      if (starryBackdropRef.current) {
        starryBackdropRef.current.material.map = tex;
        starryBackdropRef.current.material.color.set('#ffffff');
        starryBackdropRef.current.material.emissive.set('#101830');
        starryBackdropRef.current.material.emissiveIntensity = 0.3;
        starryBackdropRef.current.material.needsUpdate = true;
      }
    });
  }, []);

  useFrame((state) => {
    const { scene, doorProgress } = useMuseumStore.getState();
    if (scene !== 'hero' && scene !== 'entering') {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }
    if (groupRef.current) groupRef.current.visible = true;

    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = doorProgress * (Math.PI / 2.2);
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = -doorProgress * (Math.PI / 2.2);
    }
    if (glowRef.current) {
      glowRef.current.intensity = doorProgress * 6;
    }
    if (glowPlaneRef.current) {
      glowPlaneRef.current.material.opacity = doorProgress * 0.3;
    }

    // Animate swirl light spill — intensity follows door progress
    const t = state.clock.elapsedTime;
    swirlLightsRef.current.forEach((light, i) => {
      if (light) {
        const pulse = 0.7 + Math.sin(t * 0.8 + i * 1.5) * 0.3;
        light.intensity = doorProgress * 2.5 * pulse;
      }
    });
    swirlPlanesRef.current.forEach((plane, i) => {
      if (plane) {
        plane.material.opacity = doorProgress * 0.35;
        plane.rotation.z = Math.sin(t * 0.3 + i * 0.8) * 0.05;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 7]}>

      {/* === STARRY NIGHT BACKDROP — vivid, large, visible through door gap === */}
      <mesh ref={starryBackdropRef} position={[0, DOOR_H / 2 + 1, -3]}>
        <planeGeometry args={[26, DOOR_H + 10]} />
        <meshStandardMaterial
          map={starryBackdropTex}
          color="#c0c8e0"
          emissive="#0a1530"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* === AMBIENT DEEP SKY === */}
      <mesh position={[0, 5, -7]}>
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial color="#030510" />
      </mesh>

      {/* === SWIRLING LIGHT SPILL FROM DOORS === */}
      {/* Golden-blue light that spills onto steps and ground */}
      <mesh
        ref={el => { swirlPlanesRef.current[0] = el; }}
        position={[0, 0.05, 2.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial
          map={swirlSpillTex}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Vertical light spill on underside of entablature */}
      <mesh
        ref={el => { swirlPlanesRef.current[1] = el; }}
        position={[0, DOOR_H + 1.2, 0.8]}
      >
        <planeGeometry args={[5, 2]} />
        <meshBasicMaterial
          map={swirlSpillTex}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Swirl spill lights — golden-blue point lights that animate */}
      <pointLight
        ref={el => { swirlLightsRef.current[0] = el; }}
        position={[0, 1.5, 1.5]}
        color="#FFD54F"
        intensity={0}
        distance={12}
      />
      <pointLight
        ref={el => { swirlLightsRef.current[1] = el; }}
        position={[-1.5, 0.5, 2]}
        color="#6688cc"
        intensity={0}
        distance={8}
      />
      <pointLight
        ref={el => { swirlLightsRef.current[2] = el; }}
        position={[1.5, 0.5, 2]}
        color="#6688cc"
        intensity={0}
        distance={8}
      />
      <pointLight
        ref={el => { swirlLightsRef.current[3] = el; }}
        position={[0, 0.3, 3]}
        color="#FFE082"
        intensity={0}
        distance={10}
      />

      {/* === LIGHTING — dramatic, cinematic === */}
      <ambientLight color="#0a0e1a" intensity={0.3} />
      <pointLight position={[-3.8, 2, 2.5]} color="#FFD54F" intensity={1.5} distance={12} />
      <pointLight position={[3.8, 2, 2.5]} color="#FFD54F" intensity={1.5} distance={12} />
      <pointLight position={[0, 8, 2]} color="#6688cc" intensity={1.0} distance={18} />
      <pointLight position={[0, 3, 7]} color="#bbbbdd" intensity={0.5} distance={20} />
      <pointLight position={[0, 2.5, -0.5]} color="#FFE082" intensity={0.6} distance={8} />

      {/* === GROUND PLANE === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 3]} material={floorMat}>
        <planeGeometry args={[22, 14]} />
      </mesh>

      {/* === MAIN FACADE WALL === */}
      <mesh position={[0, DOOR_H / 2 + 1.2, -0.18]} material={stoneMat}>
        <boxGeometry args={[10, DOOR_H + 3.5, 0.35]} />
      </mesh>

      {/* === DOOR SURROUND === */}
      <mesh position={[0, DOOR_H + 0.35, 0.15]} material={stoneMat}>
        <boxGeometry args={[DOOR_W * 2 + 1.6, 0.7, 0.65]} />
      </mesh>
      <mesh position={[-DOOR_W - 0.55, DOOR_H / 2, 0.15]} material={stoneMat}>
        <boxGeometry args={[0.5, DOOR_H + 0.1, 0.65]} />
      </mesh>
      <mesh position={[DOOR_W + 0.55, DOOR_H / 2, 0.15]} material={stoneMat}>
        <boxGeometry args={[0.5, DOOR_H + 0.1, 0.65]} />
      </mesh>

      {/* Gold trim around door opening */}
      <mesh position={[0, DOOR_H + 0.02, 0.48]} material={goldMat}>
        <boxGeometry args={[DOOR_W * 2 + 0.08, 0.04, 0.04]} />
      </mesh>
      <mesh position={[-DOOR_W - 0.02, DOOR_H / 2, 0.48]} material={goldMat}>
        <boxGeometry args={[0.04, DOOR_H, 0.04]} />
      </mesh>
      <mesh position={[DOOR_W + 0.02, DOOR_H / 2, 0.48]} material={goldMat}>
        <boxGeometry args={[0.04, DOOR_H, 0.04]} />
      </mesh>

      {/* === ARCHWAY === */}
      <ArchRing radius={DOOR_W + 0.8} depth={0.55} yBase={DOOR_H + 0.1} mat={stoneMat} z={0.1} />
      <ArchRing radius={DOOR_W + 0.15} depth={0.08} yBase={DOOR_H + 0.1} mat={goldMat} z={0.42} />

      {/* === KEYSTONE === */}
      <mesh position={[0, DOOR_H + DOOR_W + 0.85, 0.15]}>
        <boxGeometry args={[0.4, 0.5, 0.6]} />
        <meshStandardMaterial color="#d4c0a0" roughness={0.7} />
      </mesh>
      <mesh position={[0, DOOR_H + DOOR_W + 0.85, 0.48]} material={goldMat}>
        <sphereGeometry args={[0.12, 12, 12]} />
      </mesh>

      {/* === COLUMNS === */}
      {[-DOOR_W - 1.5, DOOR_W + 1.5].map((x, i) => (
        <group key={i} position={[x, 0, 0.45]}>
          <mesh position={[0, 0.15, 0]} material={stoneMat}>
            <boxGeometry args={[0.95, 0.3, 0.95]} />
          </mesh>
          <mesh position={[0, 0.38, 0]} material={stoneMat}>
            <boxGeometry args={[0.8, 0.16, 0.8]} />
          </mesh>
          <mesh position={[0, DOOR_H / 2 + 0.5, 0]} material={stoneMat}>
            <cylinderGeometry args={[0.22, 0.26, DOOR_H - 0.6, 20]} />
          </mesh>
          {Array.from({ length: 12 }).map((_, j) => {
            const angle = (j / 12) * Math.PI * 2;
            const cx = Math.cos(angle) * 0.25;
            const cz = Math.sin(angle) * 0.25;
            return (
              <mesh key={j} position={[cx, DOOR_H / 2 + 0.5, cz]}>
                <boxGeometry args={[0.008, DOOR_H - 0.8, 0.008]} />
                <meshStandardMaterial color="#b5a890" roughness={0.85} />
              </mesh>
            );
          })}
          <mesh position={[0, DOOR_H + 0.02, 0]} material={stoneMat}>
            <cylinderGeometry args={[0.32, 0.24, 0.12, 20]} />
          </mesh>
          <mesh position={[0, DOOR_H + 0.14, 0]} material={stoneMat}>
            <boxGeometry args={[0.72, 0.12, 0.72]} />
          </mesh>
          <mesh position={[0, DOOR_H + 0.08, 0]} material={goldMat}>
            <torusGeometry args={[0.28, 0.015, 8, 24]} />
          </mesh>
        </group>
      ))}

      {/* === ENTABLATURE === */}
      <mesh position={[0, DOOR_H + 1.6, 0.25]} material={stoneMat}>
        <boxGeometry args={[9, 0.45, 0.5]} />
      </mesh>
      <mesh position={[0, DOOR_H + 1.95, 0.35]} material={stoneMat}>
        <boxGeometry args={[9.5, 0.12, 0.6]} />
      </mesh>
      <mesh position={[0, DOOR_H + 1.5, 0.52]} material={goldMat}>
        <boxGeometry args={[8, 0.06, 0.04]} />
      </mesh>

      {/* Dentil blocks */}
      {Array.from({ length: 36 }).map((_, i) => (
        <mesh key={i} position={[-5.4 + i * 0.31, DOOR_H + 1.82, 0.48]}>
          <boxGeometry args={[0.1, 0.1, 0.08]} />
          <meshStandardMaterial color="#c0b498" roughness={0.75} />
        </mesh>
      ))}

      {/* === DOORS === */}
      <group ref={leftDoorRef} position={[-DOOR_W, 0, 0]}>
        <mesh position={[DOOR_W / 2, DOOR_H / 2, 0]} material={doorWoodMat} castShadow>
          <boxGeometry args={[DOOR_W, DOOR_H, DOOR_DEPTH]} />
        </mesh>
        <DoorPanels x={DOOR_W / 2} doorW={DOOR_W} doorH={DOOR_H} panelMat={panelMat} goldMat={goldMat} depth={DOOR_DEPTH} />
        <group position={[DOOR_W - 0.18, DOOR_H / 2, DOOR_DEPTH / 2 + 0.01]}>
          <mesh material={goldMat}>
            <boxGeometry args={[0.08, 0.3, 0.02]} />
          </mesh>
          <mesh position={[0, 0, 0.035]} material={goldMat}>
            <torusGeometry args={[0.055, 0.012, 8, 16]} />
          </mesh>
        </group>
      </group>

      <group ref={rightDoorRef} position={[DOOR_W, 0, 0]}>
        <mesh position={[-DOOR_W / 2, DOOR_H / 2, 0]} material={doorWoodMat} castShadow>
          <boxGeometry args={[DOOR_W, DOOR_H, DOOR_DEPTH]} />
        </mesh>
        <DoorPanels x={-DOOR_W / 2} doorW={DOOR_W} doorH={DOOR_H} panelMat={panelMat} goldMat={goldMat} depth={DOOR_DEPTH} />
        <group position={[-DOOR_W + 0.18, DOOR_H / 2, DOOR_DEPTH / 2 + 0.01]}>
          <mesh material={goldMat}>
            <boxGeometry args={[0.08, 0.3, 0.02]} />
          </mesh>
          <mesh position={[0, 0, 0.035]} material={goldMat}>
            <torusGeometry args={[0.055, 0.012, 8, 16]} />
          </mesh>
        </group>
      </group>

      {/* === LIGHT SPILL THROUGH DOOR === */}
      <pointLight ref={glowRef} position={[0, DOOR_H / 2, -0.5]} color="#FFE082" intensity={0} distance={20} />
      <mesh ref={glowPlaneRef} position={[0, DOOR_H / 2, -0.15]}>
        <planeGeometry args={[DOOR_W * 2, DOOR_H]} />
        <meshBasicMaterial color="#FFD54F" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* === SILHOUETTED FIGURE ON STEPS === */}
      {/* Small human silhouette gazing into the light, back to viewer */}
      <group position={[0, 0.52, 1.8]}>
        {/* Body/torso */}
        <mesh position={[0, 0.45, 0]} material={silhouetteMat}>
          <boxGeometry args={[0.18, 0.35, 0.1]} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.7, 0]} material={silhouetteMat}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
        {/* Left leg */}
        <mesh position={[-0.045, 0.17, 0]} material={silhouetteMat}>
          <boxGeometry args={[0.07, 0.28, 0.08]} />
        </mesh>
        {/* Right leg */}
        <mesh position={[0.045, 0.17, 0]} material={silhouetteMat}>
          <boxGeometry args={[0.07, 0.28, 0.08]} />
        </mesh>
        {/* Left arm */}
        <mesh position={[-0.12, 0.45, 0]} material={silhouetteMat}>
          <boxGeometry args={[0.05, 0.25, 0.05]} />
        </mesh>
        {/* Right arm */}
        <mesh position={[0.12, 0.45, 0]} material={silhouetteMat}>
          <boxGeometry args={[0.05, 0.25, 0.05]} />
        </mesh>
      </group>

      {/* === WALL SCONCE LANTERNS === */}
      {[-3.8, 3.8].map((x, i) => (
        <group key={i} position={[x, 2.5, 0.6]}>
          <mesh material={goldMat}>
            <boxGeometry args={[0.04, 0.04, 0.25]} />
          </mesh>
          <mesh position={[0, -0.08, 0.12]}>
            <boxGeometry args={[0.04, 0.2, 0.04]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.25, 0.12]}>
            <boxGeometry args={[0.16, 0.22, 0.16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, -0.25, 0.12]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#FFD54F" />
          </mesh>
          <mesh position={[0, -0.12, 0.12]} material={goldMat}>
            <cylinderGeometry args={[0.02, 0.1, 0.06, 6]} />
          </mesh>
        </group>
      ))}

      {/* === STEPS === */}
      {[0, 1, 2].map((step) => (
        <mesh key={step} position={[0, step * 0.16 + 0.08, 1 + step * 0.45]} material={darkStoneMat}>
          <boxGeometry args={[DOOR_W * 2 + 2.5, 0.16, 0.45]} />
        </mesh>
      ))}
      {[0, 1, 2].map((step) => (
        <mesh key={`trim-${step}`} position={[0, step * 0.16 + 0.165, 1 + step * 0.45 + 0.22]} material={goldMat}>
          <boxGeometry args={[DOOR_W * 2 + 2.5, 0.006, 0.006]} />
        </mesh>
      ))}
    </group>
  );
}

// Semi-circular arch
function ArchRing({ radius, depth, yBase, mat, z }) {
  const segments = 20;
  return (
    <group position={[0, 0, z]}>
      {Array.from({ length: segments }).map((_, i) => {
        const a1 = (i / segments) * Math.PI;
        const a2 = ((i + 1) / segments) * Math.PI;
        const x1 = Math.cos(a1) * radius, y1 = Math.sin(a1) * radius + yBase;
        const x2 = Math.cos(a2) * radius, y2 = Math.sin(a2) * radius + yBase;
        const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
        const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        return (
          <mesh key={i} position={[cx, cy, 0]} rotation={[0, 0, angle]} material={mat}>
            <boxGeometry args={[len + 0.02, 0.14, depth]} />
          </mesh>
        );
      })}
    </group>
  );
}

// Relief panels on door
function DoorPanels({ x, doorW, doorH, panelMat, goldMat, depth }) {
  const cols = 2;
  const rows = 3;
  const pw = (doorW - 0.24) / cols;
  const ph = (doorH - 0.4) / rows;
  const panels = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = x - doorW / 2 + 0.12 + pw * c + pw / 2;
      const py = 0.2 + ph * r + ph / 2;
      panels.push(
        <group key={`${r}-${c}`}>
          <mesh position={[px, py, depth / 2 + 0.005]} material={panelMat}>
            <boxGeometry args={[pw - 0.06, ph - 0.06, 0.02]} />
          </mesh>
          <mesh position={[px, py + (ph - 0.06) / 2, depth / 2 + 0.012]} material={goldMat}>
            <boxGeometry args={[pw - 0.04, 0.015, 0.008]} />
          </mesh>
          <mesh position={[px, py - (ph - 0.06) / 2, depth / 2 + 0.012]} material={goldMat}>
            <boxGeometry args={[pw - 0.04, 0.015, 0.008]} />
          </mesh>
          <mesh position={[px - (pw - 0.06) / 2, py, depth / 2 + 0.012]} material={goldMat}>
            <boxGeometry args={[0.015, ph - 0.08, 0.008]} />
          </mesh>
          <mesh position={[px + (pw - 0.06) / 2, py, depth / 2 + 0.012]} material={goldMat}>
            <boxGeometry args={[0.015, ph - 0.08, 0.008]} />
          </mesh>
          {[
            [px - (pw - 0.08) / 2, py + (ph - 0.08) / 2],
            [px + (pw - 0.08) / 2, py + (ph - 0.08) / 2],
            [px - (pw - 0.08) / 2, py - (ph - 0.08) / 2],
            [px + (pw - 0.08) / 2, py - (ph - 0.08) / 2],
          ].map((pos, j) => (
            <mesh key={j} position={[pos[0], pos[1], depth / 2 + 0.016]} material={goldMat}>
              <sphereGeometry args={[0.018, 6, 6]} />
            </mesh>
          ))}
        </group>
      );
    }
  }

  return <group>{panels}</group>;
}
