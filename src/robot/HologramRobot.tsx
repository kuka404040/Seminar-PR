import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { KazakhSpeechEngine, VisemeState } from './KazakhSpeechEngine';
import { Volume2, RotateCcw, VolumeX, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { api } from '../services/api';

interface HologramRobotProps {
  language: Language;
}

export const HologramRobot: React.FC<HologramRobotProps> = ({ language }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const speechEngineRef = useRef<KazakhSpeechEngine | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const t = translations[language];

  // Animation & joint refs
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const jawMeshRef = useRef<THREE.Mesh | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const leftPupilRef = useRef<THREE.Mesh | null>(null);
  const rightPupilRef = useRef<THREE.Mesh | null>(null);
  const rightShoulderRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const rightHandRef = useRef<THREE.Group | null>(null);
  const leftShoulderRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const chestCoreRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Motion state
  const motionStateRef = useRef({
    state: 'idle' as 'idle' | 'greeting' | 'speaking',
    stateTime: 0,
    blinkTimer: 0,
    isBlinking: false,
    blinkProgress: 0,
    mouseTarget: new THREE.Vector2(0, 0),
    mouthOpen: 0,
    mouthWide: 0,
    jawDrop: 0
  });

  // Viseme update callback
  const handleVisemeUpdate = useCallback((viseme: VisemeState) => {
    motionStateRef.current.mouthOpen = viseme.mouthOpen;
    motionStateRef.current.mouthWide = viseme.mouthWide;
    motionStateRef.current.jawDrop = viseme.jawDrop;
  }, []);

  // Initialize Speech Engine
  useEffect(() => {
    const engine = new KazakhSpeechEngine();
    engine.setCallbacks({
      onStart: () => {
        setIsSpeaking(true);
        setHasPlayedOnce(true);
        motionStateRef.current.state = 'speaking';
      },
      onEnd: () => {
        setIsSpeaking(false);
        motionStateRef.current.state = 'idle';
      },
      onViseme: handleVisemeUpdate
    });
    speechEngineRef.current = engine;

    api.getSettings().then((s: any) => {
      if (s?.audio_url) {
        engine.setAudioUrl(s.audio_url);
      }
    }).catch(() => {});

    return () => {
      engine.stop();
    };
  }, [handleVisemeUpdate]);

  // Viewport Intersection Trigger (Auto-activation and welcoming gesture)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isActivated) {
            setIsActivated(true);
            motionStateRef.current.state = 'greeting';
            motionStateRef.current.stateTime = 0;
            // Welcome wave lasts ~3.5 seconds, then transitions to idle
            setTimeout(() => {
              if (motionStateRef.current.state === 'greeting') {
                motionStateRef.current.state = 'idle';
              }
            }, 3800);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (mountRef.current) {
      observer.observe(mountRef.current);
    }

    return () => observer.disconnect();
  }, [isActivated]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 360;
    const height = Math.min(520, window.innerHeight * 0.55);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.25, 4.4);
    camera.lookAt(0, 0.9, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f2b48, 1.8);
    scene.add(ambientLight);

    const cyanKeyLight = new THREE.DirectionalLight(0x00f0ff, 3.2);
    cyanKeyLight.position.set(3, 4, 3);
    scene.add(cyanKeyLight);

    const purpleFillLight = new THREE.DirectionalLight(0x9d4edd, 2.8);
    purpleFillLight.position.set(-3, 2, -2);
    scene.add(purpleFillLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 4, 8);
    rimLight.position.set(0, 3, -1.5);
    scene.add(rimLight);

    // Holographic Materials
    const cyanHoloMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.65,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.88,
      wireframe: false
    });

    const darkCeramicMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b132b,
      metalness: 0.9,
      roughness: 0.25,
      clearcoat: 0.8
    });

    const glowVisorMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95
    });

    const pupilMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    const eyelidMat = new THREE.MeshBasicMaterial({
      color: 0x07111e
    });

    const coreLightMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });

    // Robot Root Group
    const robot = new THREE.Group();
    robot.position.y = -0.15;
    scene.add(robot);
    robotGroupRef.current = robot;

    // --- 1. TORSO ---
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.5;
    robot.add(torsoGroup);

    // Main chest plate (tapered)
    const chestGeo = new THREE.CylinderGeometry(0.55, 0.42, 0.95, 8);
    const chestMesh = new THREE.Mesh(chestGeo, cyanHoloMat);
    chestMesh.scale.set(1.1, 1, 0.65);
    torsoGroup.add(chestMesh);

    // Abdomen connector
    const spineGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.45, 12);
    const spineMesh = new THREE.Mesh(spineGeo, darkCeramicMat);
    spineMesh.position.y = -0.55;
    torsoGroup.add(spineMesh);

    // Glowing Chest Core (Holographic Reactor)
    const coreGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const coreMesh = new THREE.Mesh(coreGeo, coreLightMat);
    coreMesh.position.set(0, 0.12, 0.35);
    torsoGroup.add(coreMesh);
    chestCoreRef.current = coreMesh;

    // Chest Collar Trim
    const collarGeo = new THREE.TorusGeometry(0.26, 0.03, 8, 24);
    const collarMesh = new THREE.Mesh(collarGeo, cyanHoloMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.48, 0);
    torsoGroup.add(collarMesh);

    // --- 2. NECK & HEAD ---
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.28, 12);
    const neckMesh = new THREE.Mesh(neckGeo, darkCeramicMat);
    neckMesh.position.y = 1.05;
    robot.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.35, 0);
    robot.add(headGroup);
    headGroupRef.current = headGroup;

    // Cranium
    const headGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, cyanHoloMat);
    headMesh.scale.set(0.9, 1.1, 0.95);
    headGroup.add(headMesh);

    // Face Shield / Visor
    const faceShieldGeo = new THREE.CylinderGeometry(0.3, 0.28, 0.38, 16, 1, false, -Math.PI / 2.5, Math.PI * 0.8);
    const faceShieldMesh = new THREE.Mesh(faceShieldGeo, darkCeramicMat);
    faceShieldMesh.position.set(0, 0.02, 0.12);
    headGroup.add(faceShieldMesh);

    // Eyes (Dual cybernetic optical receptors)
    const eyeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    
    // Left eye & pupil
    const leftEye = new THREE.Mesh(eyeGeo, glowVisorMat);
    leftEye.position.set(-0.13, 0.07, 0.32);
    headGroup.add(leftEye);

    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pupilMat);
    leftPupil.position.set(-0.13, 0.07, 0.37);
    headGroup.add(leftPupil);
    leftPupilRef.current = leftPupil;

    // Right eye & pupil
    const rightEye = new THREE.Mesh(eyeGeo, glowVisorMat);
    rightEye.position.set(0.13, 0.07, 0.32);
    headGroup.add(rightEye);

    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pupilMat);
    rightPupil.position.set(0.13, 0.07, 0.37);
    headGroup.add(rightPupil);
    rightPupilRef.current = rightPupil;

    // Eyelids for natural blinking
    const eyelidGeo = new THREE.BoxGeometry(0.14, 0.08, 0.06);
    const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    leftEyelid.position.set(-0.13, 0.13, 0.36);
    headGroup.add(leftEyelid);
    leftEyelidRef.current = leftEyelid;

    const rightEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    rightEyelid.position.set(0.13, 0.13, 0.36);
    headGroup.add(rightEyelid);
    rightEyelidRef.current = rightEyelid;

    // Articulated Mouth / Viseme Jaw
    const mouthGeo = new THREE.BoxGeometry(0.18, 0.04, 0.04);
    const mouthMesh = new THREE.Mesh(mouthGeo, glowVisorMat);
    mouthMesh.position.set(0, -0.15, 0.33);
    headGroup.add(mouthMesh);
    jawMeshRef.current = mouthMesh;

    // Head Antenna / Sensor Fins
    const finGeo = new THREE.BoxGeometry(0.03, 0.22, 0.1);
    const leftFin = new THREE.Mesh(finGeo, cyanHoloMat);
    leftFin.position.set(-0.38, 0.18, 0);
    leftFin.rotation.z = -0.2;
    headGroup.add(leftFin);

    const rightFin = new THREE.Mesh(finGeo, cyanHoloMat);
    rightFin.position.set(0.38, 0.18, 0);
    rightFin.rotation.z = 0.2;
    headGroup.add(rightFin);

    // --- 3. RIGHT ARM (Greeting & gesturing) ---
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.68, 0.85, 0);
    robot.add(rightShoulder);
    rightShoulderRef.current = rightShoulder;

    const shoulderJointGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const rightShoulderMesh = new THREE.Mesh(shoulderJointGeo, darkCeramicMat);
    rightShoulder.add(rightShoulderMesh);

    // Upper arm
    const upperArmGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.45, 12);
    const rightUpperArm = new THREE.Mesh(upperArmGeo, cyanHoloMat);
    rightUpperArm.position.y = -0.25;
    rightShoulder.add(rightUpperArm);

    // Forearm & Elbow
    const rightArm = new THREE.Group();
    rightArm.position.set(0, -0.48, 0);
    rightShoulder.add(rightArm);
    rightArmRef.current = rightArm;

    const elbowGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const rightElbow = new THREE.Mesh(elbowGeo, darkCeramicMat);
    rightArm.add(rightElbow);

    const forearmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.42, 12);
    const rightForearm = new THREE.Mesh(forearmGeo, cyanHoloMat);
    rightForearm.position.y = -0.23;
    rightArm.add(rightForearm);

    // Right Hand & Articulated fingers
    const rightHand = new THREE.Group();
    rightHand.position.set(0, -0.45, 0);
    rightArm.add(rightHand);
    rightHandRef.current = rightHand;

    const palmGeo = new THREE.BoxGeometry(0.12, 0.14, 0.05);
    const rightPalm = new THREE.Mesh(palmGeo, darkCeramicMat);
    rightHand.add(rightPalm);

    // 4 Fingers
    for (let f = 0; f < 4; f++) {
      const fingerGeo = new THREE.BoxGeometry(0.022, 0.1, 0.022);
      const finger = new THREE.Mesh(fingerGeo, cyanHoloMat);
      finger.position.set(-0.045 + f * 0.03, -0.11, 0);
      rightHand.add(finger);
    }

    // --- 4. LEFT ARM ---
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.68, 0.85, 0);
    robot.add(leftShoulder);
    leftShoulderRef.current = leftShoulder;

    const leftShoulderMesh = new THREE.Mesh(shoulderJointGeo, darkCeramicMat);
    leftShoulder.add(leftShoulderMesh);

    const leftUpperArm = new THREE.Mesh(upperArmGeo, cyanHoloMat);
    leftUpperArm.position.y = -0.25;
    leftShoulder.add(leftUpperArm);

    const leftArm = new THREE.Group();
    leftArm.position.set(0, -0.48, 0);
    leftShoulder.add(leftArm);
    leftArmRef.current = leftArm;

    const leftElbow = new THREE.Mesh(elbowGeo, darkCeramicMat);
    leftArm.add(leftElbow);

    const leftForearm = new THREE.Mesh(forearmGeo, cyanHoloMat);
    leftForearm.position.y = -0.23;
    leftArm.add(leftForearm);

    const leftHand = new THREE.Group();
    leftHand.position.set(0, -0.45, 0);
    leftArm.add(leftHand);

    const leftPalm = new THREE.Mesh(palmGeo, darkCeramicMat);
    leftHand.add(leftPalm);

    for (let f = 0; f < 4; f++) {
      const fingerGeo = new THREE.BoxGeometry(0.022, 0.1, 0.022);
      const finger = new THREE.Mesh(fingerGeo, cyanHoloMat);
      finger.position.set(-0.045 + f * 0.03, -0.11, 0);
      leftHand.add(finger);
    }

    // --- 5. HOLOGRAPHIC AMBIENT PARTICLES ---
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 5;
      particlePositions[i + 1] = Math.random() * 3.5 - 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Contact Glow Disk (Grounded holographic pedestal)
    const diskGeo = new THREE.RingGeometry(0.35, 1.4, 32);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.rotation.x = Math.PI / 2;
    disk.position.y = -0.7;
    scene.add(disk);

    // Pointer move listener for subtle gaze tracking
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      motionStateRef.current.mouseTarget.set(
        Math.max(-0.6, Math.min(0.6, x)),
        Math.max(-0.4, Math.min(0.4, y))
      );
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 360;
      const newH = Math.min(520, window.innerHeight * 0.55);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const state = motionStateRef.current;

      state.stateTime += delta;

      // 1. Natural Breathing & Floating motion
      const breath = Math.sin(elapsed * 1.8) * 0.025;
      robot.position.y = -0.15 + breath;
      robot.rotation.y = Math.sin(elapsed * 0.6) * 0.04;

      // Pulse core reactor
      if (chestCoreRef.current) {
        const pulse = 1 + Math.sin(elapsed * 3.5) * 0.18;
        chestCoreRef.current.scale.set(pulse, pulse, pulse);
      }

      // Rotate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsed * 0.05;
      }

      // 2. Natural Eye Blinking & Pupil Tracking
      state.blinkTimer += delta;
      if (state.blinkTimer > 3.8 + Math.random() * 2) {
        state.isBlinking = true;
        state.blinkProgress = 0;
        state.blinkTimer = 0;
      }

      if (state.isBlinking) {
        state.blinkProgress += delta * 12;
        const blinkAmount = Math.sin(Math.min(state.blinkProgress, Math.PI));
        const eyelidY = 0.13 - blinkAmount * 0.065;
        if (leftEyelidRef.current && rightEyelidRef.current) {
          leftEyelidRef.current.position.y = eyelidY;
          rightEyelidRef.current.position.y = eyelidY;
        }
        if (state.blinkProgress >= Math.PI) {
          state.isBlinking = false;
        }
      }

      // Pupil shifts
      const pupilX = state.mouseTarget.x * 0.02;
      const pupilY = state.mouseTarget.y * 0.015;
      if (leftPupilRef.current && rightPupilRef.current) {
        leftPupilRef.current.position.x = -0.13 + pupilX;
        leftPupilRef.current.position.y = 0.07 + pupilY;
        rightPupilRef.current.position.x = 0.13 + pupilX;
        rightPupilRef.current.position.y = 0.07 + pupilY;
      }

      // 3. Head Turning & Tilting
      if (headGroupRef.current) {
        const targetHeadX = -state.mouseTarget.y * 0.25;
        const targetHeadY = state.mouseTarget.x * 0.45;
        headGroupRef.current.rotation.x = THREE.MathUtils.damp(headGroupRef.current.rotation.x, targetHeadX, 4, delta);
        headGroupRef.current.rotation.y = THREE.MathUtils.damp(headGroupRef.current.rotation.y, targetHeadY, 4, delta);
        headGroupRef.current.rotation.z = Math.sin(elapsed * 1.2) * 0.02;
      }

      // 4. Lip / Viseme Mouth Animation
      if (jawMeshRef.current) {
        const targetScaleY = 1 + state.mouthOpen * 3.5;
        const targetScaleX = 1 + state.mouthWide * 0.6;
        const targetJawY = -0.15 - state.jawDrop * 0.035;

        jawMeshRef.current.scale.y = THREE.MathUtils.damp(jawMeshRef.current.scale.y, targetScaleY, 15, delta);
        jawMeshRef.current.scale.x = THREE.MathUtils.damp(jawMeshRef.current.scale.x, targetScaleX, 15, delta);
        jawMeshRef.current.position.y = THREE.MathUtils.damp(jawMeshRef.current.position.y, targetJawY, 15, delta);
      }

      // 5. Kinematic Arm & Body State Machine
      if (state.state === 'greeting') {
        // Welcoming arm wave sequence automatically
        const waveProgress = state.stateTime * 4;
        const waveSwing = Math.sin(waveProgress * 2) * 0.45;

        if (rightShoulderRef.current) {
          rightShoulderRef.current.rotation.x = THREE.MathUtils.damp(rightShoulderRef.current.rotation.x, -0.6, 6, delta);
          rightShoulderRef.current.rotation.z = THREE.MathUtils.damp(rightShoulderRef.current.rotation.z, 1.35, 6, delta);
          rightShoulderRef.current.rotation.y = THREE.MathUtils.damp(rightShoulderRef.current.rotation.y, -0.4, 6, delta);
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = THREE.MathUtils.damp(rightArmRef.current.rotation.z, 1.4 + waveSwing, 12, delta);
          rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, 0.3, 6, delta);
        }
        if (rightHandRef.current) {
          rightHandRef.current.rotation.z = waveSwing * 0.6;
        }

        // Left arm relaxed at side
        if (leftShoulderRef.current) {
          leftShoulderRef.current.rotation.z = THREE.MathUtils.damp(leftShoulderRef.current.rotation.z, -0.2, 4, delta);
          leftShoulderRef.current.rotation.x = THREE.MathUtils.damp(leftShoulderRef.current.rotation.x, 0.1, 4, delta);
        }
      } else if (state.state === 'speaking') {
        // Natural orator gestures during speech
        const speechCadence = Math.sin(elapsed * 2.8);
        const speechAccent = Math.cos(elapsed * 1.9);

        if (rightShoulderRef.current) {
          const targetRotZ = 0.55 + speechCadence * 0.15;
          const targetRotX = -0.45 + speechAccent * 0.2;
          rightShoulderRef.current.rotation.z = THREE.MathUtils.damp(rightShoulderRef.current.rotation.z, targetRotZ, 5, delta);
          rightShoulderRef.current.rotation.x = THREE.MathUtils.damp(rightShoulderRef.current.rotation.x, targetRotX, 5, delta);
        }
        if (rightArmRef.current) {
          const targetElbowZ = 0.8 + speechCadence * 0.25;
          rightArmRef.current.rotation.z = THREE.MathUtils.damp(rightArmRef.current.rotation.z, targetElbowZ, 6, delta);
          rightArmRef.current.rotation.y = THREE.MathUtils.damp(rightArmRef.current.rotation.y, speechAccent * 0.3, 6, delta);
        }
        if (rightHandRef.current) {
          rightHandRef.current.rotation.y = speechCadence * 0.4;
        }

        if (leftShoulderRef.current) {
          const targetLeftZ = -0.45 - speechAccent * 0.15;
          const targetLeftX = -0.3 + speechCadence * 0.15;
          leftShoulderRef.current.rotation.z = THREE.MathUtils.damp(leftShoulderRef.current.rotation.z, targetLeftZ, 5, delta);
          leftShoulderRef.current.rotation.x = THREE.MathUtils.damp(leftShoulderRef.current.rotation.x, targetLeftX, 5, delta);
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = THREE.MathUtils.damp(leftArmRef.current.rotation.z, -0.65 - speechAccent * 0.2, 6, delta);
        }

        // Head nods gently to speech
        if (headGroupRef.current) {
          headGroupRef.current.rotation.x += Math.sin(elapsed * 4.5) * 0.008;
        }
      } else {
        // Idle resting pose with gentle arm sway
        const idleSway = Math.sin(elapsed * 1.4) * 0.05;

        if (rightShoulderRef.current) {
          rightShoulderRef.current.rotation.z = THREE.MathUtils.damp(rightShoulderRef.current.rotation.z, 0.18 + idleSway, 4, delta);
          rightShoulderRef.current.rotation.x = THREE.MathUtils.damp(rightShoulderRef.current.rotation.x, 0.05, 4, delta);
          rightShoulderRef.current.rotation.y = THREE.MathUtils.damp(rightShoulderRef.current.rotation.y, 0, 4, delta);
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = THREE.MathUtils.damp(rightArmRef.current.rotation.z, 0.25, 4, delta);
          rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, 0.1, 4, delta);
        }
        if (leftShoulderRef.current) {
          leftShoulderRef.current.rotation.z = THREE.MathUtils.damp(leftShoulderRef.current.rotation.z, -0.18 - idleSway, 4, delta);
          leftShoulderRef.current.rotation.x = THREE.MathUtils.damp(leftShoulderRef.current.rotation.x, 0.05, 4, delta);
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = THREE.MathUtils.damp(leftArmRef.current.rotation.z, -0.25, 4, delta);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Controls
  const handlePlay = () => {
    speechEngineRef.current?.play();
  };

  const handleStop = () => {
    speechEngineRef.current?.stop();
    setIsSpeaking(false);
    motionStateRef.current.state = 'idle';
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Holographic Canvas Mount */}
      <div className="relative w-full max-w-xl h-[400px] sm:h-[480px] flex items-center justify-center overflow-hidden rounded-3xl glass-panel glow-cyan">
        {/* Futuristic Grid & Glow Overlay */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isSpeaking ? t.robotSpeakingStatus : t.robotIdleStatus}</span>
        </div>

        {/* Status Tag on top right */}
        <div className="absolute top-4 right-4 z-10 text-xs font-mono-numbers text-slate-400 bg-slate-900/70 px-2.5 py-1 rounded-md border border-slate-700">
          AI-QAYNAR v2026
        </div>

        {/* Canvas */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* Official 3-sentence Speech Transcript Box */}
      <div className="mt-6 w-full max-w-2xl px-5 py-4 rounded-2xl glass-panel-subtle border border-cyan-500/20 text-center">
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
          «{t.robotTranscript}»
        </p>
      </div>

      {/* AUDIO PLAYBACK CONTROLS (STRICTLY: ТЫҢДАУ, ҚАЙТАЛАП ТЫҢДАУ, ДЫБЫСТЫ ӨШІРУ - NO «ҚОЛ БҰЛҒАУ» BUTTON!) */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
        {!isSpeaking && !hasPlayedOnce && (
          <button
            onClick={handlePlay}
            className="flex-1 min-w-[140px] px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.robotListenBtn}</span>
          </button>
        )}

        {hasPlayedOnce && !isSpeaking && (
          <button
            onClick={handlePlay}
            className="flex-1 min-w-[140px] px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.robotReplayBtn}</span>
          </button>
        )}

        {isSpeaking && (
          <button
            onClick={handleStop}
            className="flex-1 min-w-[140px] px-6 py-3 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <VolumeX className="w-4 h-4" />
            <span>{t.robotMuteBtn}</span>
          </button>
        )}
      </div>
    </div>
  );
};
