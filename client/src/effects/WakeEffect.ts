import * as THREE from 'three';

// Textura circular suave compartida
let sharedWakeTexture: THREE.Texture | null = null;

function getWakeTexture(): THREE.Texture {
  if (sharedWakeTexture) return sharedWakeTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.7)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  sharedWakeTexture = new THREE.CanvasTexture(canvas);
  return sharedWakeTexture;
}

export class WakeEffect {
  private particles: THREE.Points;
  private positions: Float32Array;
  private velocities: Float32Array;
  private ages: Float32Array;
  private lifetimes: Float32Array;

  private readonly count = 120;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.ages = new Float32Array(this.count);
    this.lifetimes = new Float32Array(this.count);

    // Ocultar partículas inicialmente
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx] = 0;
      this.positions[idx + 1] = -999;
      this.positions[idx + 2] = 0;

      this.velocities[idx] = 0;
      this.velocities[idx + 1] = 0;
      this.velocities[idx + 2] = 0;

      this.ages[i] = 0;
      this.lifetimes[i] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Material circular pequeño, plano y suave (sin brillo aditivo cegador)
    const material = new THREE.PointsMaterial({
      color: 0xe8f4f8,
      size: 0.22,
      map: getWakeTexture(),
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.frustumCulled = false;

    this.scene.add(this.particles);
  }

  update(
    boatPosition: THREE.Vector3,
    boatRotationY: number,
    boatSpeed: number,
    delta: number,
    backOffset: number = -5.5
  ) {
    const normDelta = delta / 16.67;

    // Emitir pequeñas motas de espuma solo si el barco avanza
    if (Math.abs(boatSpeed) > 0.005) {
      this.emit(boatPosition, boatRotationY, backOffset);
    }

    const posAttr = this.particles.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < this.count; i++) {
      if (this.lifetimes[i] <= 0) continue;

      this.ages[i] += delta;

      if (this.ages[i] >= this.lifetimes[i]) {
        this.kill(i);
        continue;
      }

      const idx = i * 3;

      // Dispersión sutil puramente horizontal en el agua (sin saltar en Y)
      this.positions[idx] += this.velocities[idx] * normDelta;
      this.positions[idx + 1] = 0.04; // plano a flor de agua
      this.positions[idx + 2] += this.velocities[idx + 2] * normDelta;

      this.velocities[idx] *= 0.97;
      this.velocities[idx + 2] *= 0.97;
    }

    posAttr.needsUpdate = true;
  }

  private emit(boatPosition: THREE.Vector3, rotationY: number, backOffset: number = -5.5) {
    // Emitir 2 motas suaves de espuma por ciclo
    for (let i = 0; i < 2; i++) {
      const particleIndex = this.findDeadParticle();
      if (particleIndex === -1) return;

      const idx = particleIndex * 3;

      // Dirección del barco
      const dirX = Math.sin(rotationY);
      const dirZ = Math.cos(rotationY);

      // Vector perpendicular para apertura lateral suave
      const perpX = -dirZ;
      const perpZ = dirX;

      // Spawn justo detrás del timón según el tamaño del barco
      const lateralSide = (Math.random() - 0.5) * 1.2;

      this.positions[idx] = boatPosition.x + dirX * backOffset + perpX * lateralSide;
      this.positions[idx + 1] = 0.04;
      this.positions[idx + 2] = boatPosition.z + dirZ * backOffset + perpZ * lateralSide;

      // Suave apertura lateral hacia afuera
      const driftSpeed = (Math.random() - 0.5) * 0.015;
      this.velocities[idx] = perpX * driftSpeed;
      this.velocities[idx + 1] = 0; // nada de salto vertical
      this.velocities[idx + 2] = perpZ * driftSpeed;

      this.ages[particleIndex] = 0;
      this.lifetimes[particleIndex] = 700 + Math.random() * 500; // dura ~1 segundo
    }
  }

  private findDeadParticle(): number {
    for (let i = 0; i < this.count; i++) {
      if (this.lifetimes[i] <= 0) {
        return i;
      }
    }
    return -1;
  }

  private kill(index: number) {
    const idx = index * 3;
    this.positions[idx] = 0;
    this.positions[idx + 1] = -999;
    this.positions[idx + 2] = 0;

    this.lifetimes[index] = 0;
    this.ages[index] = 0;
  }

  dispose() {
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.PointsMaterial).dispose();
  }
}