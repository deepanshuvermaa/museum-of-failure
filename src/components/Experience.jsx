import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import CameraController from './CameraController';
import DoorScene from './DoorScene';
import MuseumHall from './MuseumHall';
import useMuseumStore from '../store/useMuseumStore';
import { getTheme } from '../themes';

// Set initial fog/background once, then let MuseumHall's useFrame handle theme transitions
function SceneSetup() {
  const { scene } = useThree();

  useEffect(() => {
    const t = getTheme(useMuseumStore.getState().theme);
    scene.background = new THREE.Color(t.fogColor);
    scene.fog = new THREE.Fog(t.fogColor, 20, 50);
  }, [scene]);

  return null;
}

// Dynamically update fog near/far based on scene state (not color — that's theme-driven)
function FogController() {
  const { scene: threeScene } = useThree();
  const sceneState = useMuseumStore(s => s.scene);
  const doorProgress = useMuseumStore(s => s.doorProgress);

  const fogNear = sceneState === 'hall' ? 14 : doorProgress > 0.55 ? 14 : 20;
  const fogFar = sceneState === 'hall' ? 40 : 50;

  if (threeScene.fog) {
    threeScene.fog.near = fogNear;
    threeScene.fog.far = fogFar;
  }

  return null;
}

export default function Experience() {
  const scene = useMuseumStore(s => s.scene);
  const doorProgress = useMuseumStore(s => s.doorProgress);
  const isMobile = useMuseumStore(s => s.isMobile);

  return (
    <Canvas
      camera={{ fov: isMobile ? 75 : 60, near: 0.1, far: 100, position: [0, 2.5, 12.6] }}
      gl={{
        antialias: !isMobile,
        toneMapping: 2,
        toneMappingExposure: 1.7,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        // Prevent the default (which permanently kills the context) and force a
        // re-render once the browser restores it, so the scene recovers instead of freezing.
        canvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
        });
        canvas.addEventListener('webglcontextrestored', () => {
          gl.setSize(canvas.clientWidth, canvas.clientHeight, false);
          gl.resetState?.();
        });
      }}
    >
      <SceneSetup />
      <FogController />
      <CameraController />
      <DoorScene />
      <MuseumHall visible={scene === 'hall' || doorProgress > 0.55} />
    </Canvas>
  );
}
