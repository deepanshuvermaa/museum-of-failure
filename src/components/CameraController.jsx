import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useMuseumStore from '../store/useMuseumStore';

// Room: W=16, H=6, D=10
const VIEWS = {
  panoramic: {
    pos: new THREE.Vector3(0, 2.2, 4.2),
    lookAt: new THREE.Vector3(0, 2.2, -1),
  },
  left: {
    pos: new THREE.Vector3(-2, 2.2, 1),
    lookAt: new THREE.Vector3(-8, 2.5, 0),
  },
  center: {
    pos: new THREE.Vector3(0, 2.2, 1),
    lookAt: new THREE.Vector3(0, 2.8, -5),
  },
  right: {
    pos: new THREE.Vector3(2, 2.2, 1),
    lookAt: new THREE.Vector3(8, 2.5, 0),
  },
  bench: {
    pos: new THREE.Vector3(0, 1.0, 1.5),
    lookAt: new THREE.Vector3(0, 2.5, -3),
  },
};

// Mobile views — pulled back further, slightly lower to see more
const MOBILE_VIEWS = {
  panoramic: {
    pos: new THREE.Vector3(0, 2.0, 4.8),
    lookAt: new THREE.Vector3(0, 2.5, -1),
  },
  left: {
    pos: new THREE.Vector3(-1, 2.0, 1.5),
    lookAt: new THREE.Vector3(-8, 2.5, 0),
  },
  center: {
    pos: new THREE.Vector3(0, 2.0, 2),
    lookAt: new THREE.Vector3(0, 2.8, -5),
  },
  right: {
    pos: new THREE.Vector3(1, 2.0, 1.5),
    lookAt: new THREE.Vector3(8, 2.5, 0),
  },
  bench: {
    pos: new THREE.Vector3(0, 1.2, 2),
    lookAt: new THREE.Vector3(0, 2.5, -3),
  },
};

const HERO_Z = 12.6;

export default function CameraController() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 2.5, HERO_Z));
  const targetLookAt = useRef(new THREE.Vector3(0, 2.5, 7));
  const currentLookAt = useRef(new THREE.Vector3(0, 2.5, 7));

  useFrame(() => {
    const { scene, doorProgress, hallView, benchActive, activeExhibit, isMobile } = useMuseumStore.getState();
    let speed = 0.03;
    const views = isMobile ? MOBILE_VIEWS : VIEWS;

    // Adjust FOV for mobile
    const targetFov = isMobile ? 75 : 60;
    camera.fov += (targetFov - camera.fov) * 0.05;
    camera.updateProjectionMatrix();

    if (scene === 'hero') {
      targetPos.current.set(0, 2.5, HERO_Z);
      targetLookAt.current.set(0, 2.5, 7);
      speed = 0.02;
    } else if (scene === 'entering') {
      const endZ = isMobile ? 4.8 : 4.2;
      const z = THREE.MathUtils.lerp(HERO_Z, endZ, doorProgress);
      targetPos.current.set(0, 2.2, z);
      targetLookAt.current.set(0, 2.2, -1);
      speed = 0.04;
    } else if (scene === 'hall') {
      if (benchActive) {
        targetPos.current.copy(views.bench.pos);
        targetLookAt.current.copy(views.bench.lookAt);
        speed = 0.025;
      } else if (activeExhibit) {
        speed = 0.03;
      } else {
        const view = views[hallView] || views.panoramic;
        targetPos.current.copy(view.pos);
        targetLookAt.current.copy(view.lookAt);
        speed = 0.03;
      }
    }

    camera.position.lerp(targetPos.current, speed);
    currentLookAt.current.lerp(targetLookAt.current, speed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
