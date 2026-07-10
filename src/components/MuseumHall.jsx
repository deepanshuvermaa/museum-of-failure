import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import PaintingFrame from './PaintingFrame';
import Bench from './Bench';
import Particles from './Particles';
import { WALL_EXHIBITS } from '../data/exhibits';
import useMuseumStore from '../store/useMuseumStore';
import { getTheme } from '../themes';

const W = 16, H = 6, D = 10;

// Global brightness multiplier — the hall read too dark to comfortably read nameplates.
const LIGHT_BOOST = 1.4;

export default function MuseumHall({ visible = true }) {
  const groupRef = useRef();
  const builtRef = useRef(false);
  const lightsRef = useRef([]);
  const matsRef = useRef({ walls: [], gold: null, floor: null, pillars: null, dotFloor: null });
  const appliedThemeRef = useRef(null);
  const transitionFrames = useRef(0);
  const loadedTextureRef = useRef(null); // currently loaded texture path
  const textureLoaderRef = useRef(new THREE.TextureLoader());
  // Store individual wall mat refs with their repeat/offset config for texture swaps
  const wallTexConfigs = useRef([]);

  const hoveredFrame = useMuseumStore(s => s.hoveredFrame);

  // Dynamically dim lights on hover
  useFrame(() => {
    const isHovered = hoveredFrame !== null;
    lightsRef.current.forEach(({ light, base }) => {
      const target = isHovered ? base * 0.3 : base;
      light.intensity += (target - light.intensity) * 0.08;
    });
  });

  // React to theme changes — lerp ALL materials, lights, fog, background
  const { scene: threeScene } = useThree();
  useFrame(() => {
    const currentTheme = useMuseumStore.getState().theme;
    const t = getTheme(currentTheme);

    // Detect theme change — start transition + load new texture
    if (currentTheme !== appliedThemeRef.current) {
      transitionFrames.current = 120;
      appliedThemeRef.current = currentTheme;

      // Load the new wall texture if it's different
      if (t.wallTexture !== loadedTextureRef.current) {
        loadedTextureRef.current = t.wallTexture;
        const isStretch = t.tileMode === 'stretch';
        textureLoaderRef.current.load(t.wallTexture, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          tex.anisotropy = 16;

          if (isStretch) {
            // Scene paintings: one image per wall, no tiling
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
          } else {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
          }

          wallTexConfigs.current.forEach(({ mat, rx, ry, ox, oy }) => {
            if (mat.map) mat.map.dispose();
            const tt = tex.clone();
            if (isStretch) {
              tt.wrapS = THREE.ClampToEdgeWrapping;
              tt.wrapT = THREE.ClampToEdgeWrapping;
              tt.repeat.set(1, 1);
              tt.offset.set(0, 0);
            } else {
              tt.wrapS = THREE.RepeatWrapping;
              tt.wrapT = THREE.RepeatWrapping;
              tt.repeat.set(rx, ry);
              tt.offset.set(ox, oy);
            }
            tt.needsUpdate = true;
            tt.minFilter = THREE.LinearFilter;
            tt.magFilter = THREE.LinearFilter;
            tt.anisotropy = 16;
            mat.map = tt;
            mat.needsUpdate = true;
          });
        });
      }
    }

    // Skip if no transition in progress
    if (transitionFrames.current <= 0) return;
    transitionFrames.current--;

    const speed = 0.06;

    // Wall materials — lerp the tint color (texture * color = visible result)
    const wallTint = new THREE.Color(t.wallTint);
    const wallEmissive = new THREE.Color(t.wallEmissive);
    matsRef.current.walls.forEach(mat => {
      mat.color.lerp(wallTint, speed);
      mat.emissive.lerp(wallEmissive, speed);
    });

    // Gold trim
    if (matsRef.current.gold) {
      matsRef.current.gold.color.lerp(new THREE.Color(t.goldColor), speed);
      matsRef.current.gold.emissive.lerp(new THREE.Color(t.goldEmissive), speed);
    }

    // Floor
    if (matsRef.current.floor) {
      matsRef.current.floor.color.lerp(new THREE.Color(t.floorColor), speed);
    }

    // Pillars
    if (matsRef.current.pillars) {
      matsRef.current.pillars.color.lerp(new THREE.Color(t.pillarColor), speed);
      matsRef.current.pillars.emissive.lerp(new THREE.Color(t.wallEmissive), speed);
    }

    // Light colors + base intensities
    const lc = t.lightColors;
    lightsRef.current.forEach((entry) => {
      const { light, role } = entry;
      if (role === 'hemi') {
        light.color.lerp(new THREE.Color(lc.hemisphere.sky), speed);
        light.groundColor.lerp(new THREE.Color(lc.hemisphere.ground), speed);
        entry.base += (lc.hemisphere.intensity * LIGHT_BOOST - entry.base) * speed;
      } else if (role === 'ambient') {
        light.color.lerp(new THREE.Color(lc.ambient.color), speed);
        entry.base += (lc.ambient.intensity * LIGHT_BOOST - entry.base) * speed;
      } else if (role === 'overhead') {
        light.color.lerp(new THREE.Color(lc.overhead.color), speed);
        entry.base += (lc.overhead.intensity * LIGHT_BOOST - entry.base) * speed;
      } else if (role === 'accent') {
        light.color.lerp(new THREE.Color(lc.accent.color), speed);
        entry.base += (lc.accent.intensity * LIGHT_BOOST - entry.base) * speed;
      } else if (role === 'floor') {
        light.color.lerp(new THREE.Color(lc.floor.color), speed);
        entry.base += (lc.floor.intensity * LIGHT_BOOST - entry.base) * speed;
      }
    });

    // Fog + background
    const fogColor = new THREE.Color(t.fogColor);
    if (threeScene.fog) {
      threeScene.fog.color.lerp(fogColor, speed);
    }
    if (threeScene.background instanceof THREE.Color) {
      threeScene.background.lerp(fogColor, speed);
    }
  });

  useEffect(() => {
    if (builtRef.current) return;
    builtRef.current = true;

    const group = groupRef.current;
    const loader = new THREE.TextureLoader();
    const added = [];
    const add = (obj) => { group.add(obj); added.push(obj); };

    const t = getTheme(useMuseumStore.getState().theme);
    appliedThemeRef.current = useMuseumStore.getState().theme;

    const wallGeo = (w, h) => new THREE.PlaneGeometry(w, h);

    const makeWallMat = () => {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(t.wallTint), side: THREE.DoubleSide, roughness: 0.6,
        emissive: new THREE.Color(t.wallEmissive), emissiveIntensity: 0.3,
      });
      matsRef.current.walls.push(mat);
      return mat;
    };

    // 4 WALLS
    const leftMat = makeWallMat();
    const left = new THREE.Mesh(wallGeo(D, H), leftMat);
    left.position.set(-W / 2, H / 2, 0); left.rotation.y = Math.PI / 2;
    add(left);

    const rightMat = makeWallMat();
    const right = new THREE.Mesh(wallGeo(D, H), rightMat);
    right.position.set(W / 2, H / 2, 0); right.rotation.y = -Math.PI / 2;
    add(right);

    const backMat = makeWallMat();
    const back = new THREE.Mesh(wallGeo(W, H), backMat);
    back.position.set(0, H / 2, -D / 2);
    add(back);

    const entrMatL = makeWallMat();
    const entrMatR = makeWallMat();
    const entrMatT = makeWallMat();
    const entrLeft = new THREE.Mesh(wallGeo(W / 2 - 2, H), entrMatL);
    entrLeft.position.set(-W / 4 - 1, H / 2, D / 2); entrLeft.rotation.y = Math.PI;
    add(entrLeft);
    const entrRight = new THREE.Mesh(wallGeo(W / 2 - 2, H), entrMatR);
    entrRight.position.set(W / 4 + 1, H / 2, D / 2); entrRight.rotation.y = Math.PI;
    add(entrRight);
    const entrTop = new THREE.Mesh(wallGeo(4, H - 4), entrMatT);
    entrTop.position.set(0, H - (H - 4) / 2, D / 2); entrTop.rotation.y = Math.PI;
    add(entrTop);

    // CEILING
    const ceilMat = makeWallMat();
    const ceil = new THREE.Mesh(wallGeo(W, D), ceilMat);
    ceil.position.set(0, H, 0); ceil.rotation.x = Math.PI / 2;
    add(ceil);

    // FLOOR
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024; floorCanvas.height = 1024;
    const fCtx = floorCanvas.getContext('2d');
    const fBase = fCtx.createLinearGradient(0, 0, 1024, 1024);
    fBase.addColorStop(0, '#12100e');
    fBase.addColorStop(0.3, '#1a1510');
    fBase.addColorStop(0.5, '#141210');
    fBase.addColorStop(0.7, '#1a1510');
    fBase.addColorStop(1, '#12100e');
    fCtx.fillStyle = fBase;
    fCtx.fillRect(0, 0, 1024, 1024);
    const tileSize = 128;
    fCtx.strokeStyle = 'rgba(160, 130, 80, 0.08)';
    fCtx.lineWidth = 1.5;
    for (let x = 0; x <= 1024; x += tileSize) {
      fCtx.beginPath(); fCtx.moveTo(x, 0); fCtx.lineTo(x, 1024); fCtx.stroke();
    }
    for (let y = 0; y <= 1024; y += tileSize) {
      fCtx.beginPath(); fCtx.moveTo(0, y); fCtx.lineTo(1024, y); fCtx.stroke();
    }
    for (let tx = 0; tx < 1024; tx += tileSize) {
      for (let ty = 0; ty < 1024; ty += tileSize) {
        const hue = 20 + Math.random() * 25;
        const lightness = 6 + Math.random() * 4;
        fCtx.fillStyle = `hsla(${hue}, 20%, ${lightness}%, ${0.3 + Math.random() * 0.2})`;
        fCtx.fillRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
      }
    }
    for (let i = 0; i < 25; i++) {
      fCtx.strokeStyle = `rgba(${140 + Math.random() * 40}, ${110 + Math.random() * 30}, ${60 + Math.random() * 30}, ${0.02 + Math.random() * 0.03})`;
      fCtx.lineWidth = 0.5 + Math.random() * 1.5;
      fCtx.beginPath();
      let vx = Math.random() * 1024, vy = Math.random() * 1024;
      fCtx.moveTo(vx, vy);
      for (let j = 0; j < 20; j++) { vx += Math.random() * 40 - 20; vy += Math.random() * 40 - 15; fCtx.lineTo(vx, vy); }
      fCtx.stroke();
    }
    const fGlow = fCtx.createRadialGradient(512, 512, 0, 512, 512, 450);
    fGlow.addColorStop(0, 'rgba(180, 140, 60, 0.04)');
    fGlow.addColorStop(0.5, 'rgba(120, 90, 40, 0.02)');
    fGlow.addColorStop(1, 'transparent');
    fCtx.fillStyle = fGlow;
    fCtx.fillRect(0, 0, 1024, 1024);
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping; floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(2, 1.25); floorTex.needsUpdate = true;
    const floorMat = new THREE.MeshPhysicalMaterial({
      map: floorTex, color: t.floorColor, roughness: 0.25, metalness: 0.3,
      clearcoat: 0.35, clearcoatRoughness: 0.35,
    });
    matsRef.current.floor = floorMat;
    const floor = new THREE.Mesh(wallGeo(W, D), floorMat);
    floor.position.set(0, 0, 0); floor.rotation.x = -Math.PI / 2;
    add(floor);

    // GOLD TRIM
    const goldMat = new THREE.MeshStandardMaterial({
      color: t.goldColor, metalness: 0.85, roughness: 0.2,
      emissive: new THREE.Color(t.goldEmissive), emissiveIntensity: 0.15,
    });
    matsRef.current.gold = goldMat;
    const addTrim = (y, thick) => {
      [
        { pos: [-W / 2 + 0.05, y, 0], rot: [0, Math.PI / 2, 0], len: D },
        { pos: [W / 2 - 0.05, y, 0], rot: [0, -Math.PI / 2, 0], len: D },
        { pos: [0, y, -D / 2 + 0.05], rot: [0, 0, 0], len: W },
        { pos: [0, y, D / 2 - 0.05], rot: [0, 0, 0], len: W },
      ].forEach(tt => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(tt.len, thick, 0.06), goldMat);
        m.position.set(...tt.pos); m.rotation.set(...tt.rot);
        add(m);
      });
    };
    addTrim(0.8, 0.06);
    addTrim(H - 0.06, 0.08);

    // CORNER PILLARS
    const cMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(t.pillarColor), roughness: 0.5,
      emissive: new THREE.Color(t.wallEmissive), emissiveIntensity: 0.3,
    });
    matsRef.current.pillars = cMat;
    const ps = 0.3;
    [
      [-W / 2 + ps / 2, H / 2, -D / 2 + ps / 2],
      [W / 2 - ps / 2, H / 2, -D / 2 + ps / 2],
      [-W / 2 + ps / 2, H / 2, D / 2 - ps / 2],
      [W / 2 - ps / 2, H / 2, D / 2 - ps / 2],
    ].forEach(p => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(ps, H, ps), cMat);
      m.position.set(...p);
      add(m);
    });

    // LIGHTING with roles for theme updates
    const lc = t.lightColors;
    const B = LIGHT_BOOST;
    const hemi = new THREE.HemisphereLight(lc.hemisphere.sky, lc.hemisphere.ground, lc.hemisphere.intensity * B);
    add(hemi); lightsRef.current.push({ light: hemi, base: lc.hemisphere.intensity * B, role: 'hemi' });

    const amb = new THREE.AmbientLight(lc.ambient.color, lc.ambient.intensity * B);
    add(amb); lightsRef.current.push({ light: amb, base: lc.ambient.intensity * B, role: 'ambient' });

    const oh = new THREE.PointLight(lc.overhead.color, lc.overhead.intensity * B, 26);
    oh.position.set(0, 5.8, 0); add(oh);
    lightsRef.current.push({ light: oh, base: lc.overhead.intensity * B, role: 'overhead' });

    [[-6, 4, 0], [6, 4, 0], [0, 4, -4], [0, 3.5, 4]].forEach(p => {
      const l = new THREE.PointLight(lc.accent.color, lc.accent.intensity * B, 16);
      l.position.set(...p); add(l);
      lightsRef.current.push({ light: l, base: lc.accent.intensity * B, role: 'accent' });
    });

    const warm = new THREE.PointLight(lc.floor.color, 0.6 * B, 10);
    warm.position.set(0, 1.5, 4); add(warm);
    lightsRef.current.push({ light: warm, base: 0.6 * B, role: 'floor' });
    [[-4, 0.2, 0], [4, 0.2, 0], [0, 0.2, -2]].forEach(p => {
      const l = new THREE.PointLight(lc.floor.color, lc.floor.intensity * B, 5);
      l.position.set(...p); add(l);
      lightsRef.current.push({ light: l, base: lc.floor.intensity * B, role: 'floor' });
    });

    // Store wall material configs for texture swapping
    wallTexConfigs.current = [
      { mat: leftMat,  rx: 1.2, ry: 0.8, ox: 0,    oy: 0 },
      { mat: rightMat, rx: 1.2, ry: 0.8, ox: 0.35, oy: 0 },
      { mat: backMat,  rx: 2.0, ry: 0.8, ox: 0.1,  oy: 0.1 },
      { mat: ceilMat,  rx: 1.5, ry: 1.0, ox: 0.5,  oy: 0.5 },
      { mat: entrMatL, rx: 1.0, ry: 0.8, ox: 0.6,  oy: 0 },
      { mat: entrMatR, rx: 1.0, ry: 0.8, ox: 0.2,  oy: 0 },
      { mat: entrMatT, rx: 0.5, ry: 0.4, ox: 0.4,  oy: 0.3 },
    ];

    // Load initial theme texture
    loadedTextureRef.current = t.wallTexture;
    const initStretch = t.tileMode === 'stretch';
    loader.load(t.wallTexture, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true; tex.anisotropy = 16;
      if (initStretch) {
        tex.wrapS = THREE.ClampToEdgeWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
      } else {
        tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
      }

      wallTexConfigs.current.forEach(({ mat, rx, ry, ox, oy }) => {
        const tt = tex.clone();
        if (initStretch) {
          tt.wrapS = THREE.ClampToEdgeWrapping; tt.wrapT = THREE.ClampToEdgeWrapping;
          tt.repeat.set(1, 1); tt.offset.set(0, 0);
        } else {
          tt.wrapS = THREE.RepeatWrapping; tt.wrapT = THREE.RepeatWrapping;
          tt.repeat.set(rx, ry); tt.offset.set(ox, oy);
        }
        tt.needsUpdate = true;
        tt.minFilter = THREE.LinearFilter; tt.magFilter = THREE.LinearFilter;
        tt.anisotropy = 16;
        mat.map = tt;
        mat.emissiveIntensity = 0.15;
        mat.needsUpdate = true;
      });
    });

    return () => {
      added.forEach(c => {
        group.remove(c);
        if (c.geometry) c.geometry.dispose();
        if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
      });
      lightsRef.current = [];
      matsRef.current = { walls: [], gold: null, floor: null, pillars: null, dotFloor: null };
      builtRef.current = false;
    };
  }, []);

  const LF = [
    [-W / 2 + 0.15, 3.0, -3.3, 0.6],
    [-W / 2 + 0.15, 3.0, -1.3, 0.6],
    [-W / 2 + 0.15, 3.0, 0.7, 0.6],
    [-W / 2 + 0.15, 3.0, 2.7, 0.6],
  ];
  const CF = [
    [-5.2, 3.0, -D / 2 + 0.15, 0.6],
    [-1.8, 3.0, -D / 2 + 0.15, 0.6],
    [1.8, 3.0, -D / 2 + 0.15, 0.6],
    [5.2, 3.0, -D / 2 + 0.15, 0.6],
  ];
  const RF = [
    [W / 2 - 0.15, 3.0, -3.3, 0.6],
    [W / 2 - 0.15, 3.0, -1.3, 0.6],
    [W / 2 - 0.15, 3.0, 0.7, 0.6],
    [W / 2 - 0.15, 3.0, 2.7, 0.6],
  ];

  return (
    <group ref={groupRef} visible={visible}>
      <Particles />

      {WALL_EXHIBITS.left.map((ex, i) => {
        const f = LF[i];
        return f ? <PaintingFrame key={ex.id} exhibit={ex} position={[f[0], f[1], f[2]]} rotation={[0, Math.PI / 2, 0]} scale={f[3]} /> : null;
      })}
      {WALL_EXHIBITS.center.map((ex, i) => {
        const f = CF[i];
        return f ? <PaintingFrame key={ex.id} exhibit={ex} position={[f[0], f[1], f[2]]} rotation={[0, 0, 0]} scale={f[3]} /> : null;
      })}
      {WALL_EXHIBITS.right.map((ex, i) => {
        const f = RF[i];
        return f ? <PaintingFrame key={ex.id} exhibit={ex} position={[f[0], f[1], f[2]]} rotation={[0, -Math.PI / 2, 0]} scale={f[3]} /> : null;
      })}

      <Bench position={[0, 0, -2.5]} />
      <DotFloor />
    </group>
  );
}

function DotFloor() {
  const pointsRef = useRef();
  const matRef = useRef();
  const W = 16, D = 10;
  const COLS = 32, ROWS = 20;

  const { positions, basePositions } = React.useMemo(() => {
    const positions = new Float32Array(COLS * ROWS * 3);
    const basePositions = new Float32Array(COLS * ROWS * 3);
    let idx = 0;
    for (let ix = 0; ix < COLS; ix++) {
      for (let iz = 0; iz < ROWS; iz++) {
        const x = (ix / (COLS - 1) - 0.5) * W;
        const z = (iz / (ROWS - 1) - 0.5) * D;
        positions[idx] = x;
        positions[idx + 1] = 0.02;
        positions[idx + 2] = z;
        basePositions[idx] = x;
        basePositions[idx + 1] = 0.02;
        basePositions[idx + 2] = z;
        idx += 3;
      }
    }
    return { positions, basePositions };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const reduced = useMuseumStore.getState().reducedMotion;
    if (!reduced) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      const t = state.clock.elapsedTime;
      let idx = 0;
      for (let ix = 0; ix < COLS; ix++) {
        for (let iz = 0; iz < ROWS; iz++) {
          posAttr.array[idx + 1] = 0.02 + Math.sin((ix + t * 0.8) * 0.5) * 0.015 + Math.sin((iz + t * 0.6) * 0.4) * 0.015;
          idx += 3;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Update dot color from theme
    if (matRef.current) {
      const theme = getTheme(useMuseumStore.getState().theme);
      matRef.current.color.lerp(new THREE.Color(theme.goldColor), 0.03);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={COLS * ROWS} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color="#C9A84C"
        size={0.04}
        transparent
        opacity={0.2}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
