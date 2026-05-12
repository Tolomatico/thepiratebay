import * as THREE from 'three';

export class WakeEffect {
  private particles: THREE.Points;
  private positions: Float32Array;
  private velocities: Float32Array;
  private ages: Float32Array;
  private lifetimes: Float32Array;

  private readonly count = 80;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.ages = new Float32Array(this.count);
    this.lifetimes = new Float32Array(this.count);

    // ocultar partículas inicialmente
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
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3.0,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);

    scene.add(this.particles);
  }

  update(
    boatPosition: THREE.Vector3,
    boatRotationY: number,
    boatSpeed: number,
    delta: number
  ) {
    // emitir solo si se mueve
    if (boatSpeed > 0.01) {
      this.emit(boatPosition, boatRotationY, boatSpeed);
    }

    for (let i = 0; i < this.count; i++) {
      if (this.lifetimes[i] <= 0) continue;

      this.ages[i] += delta;

      const lifePercent = this.ages[i] / this.lifetimes[i];

      if (lifePercent >= 1) {
        this.kill(i);
        continue;
      }

      const idx = i * 3;

      // mover partícula
      this.positions[idx] += this.velocities[idx] * delta;
      this.positions[idx + 1] = Math.sin(lifePercent * Math.PI) * 0.3;
      this.positions[idx + 2] += this.velocities[idx + 2] * delta;

      // desaceleración suave
      this.velocities[idx] *= 0.995;
      this.velocities[idx + 2] *= 0.995;
    }

    (
      this.particles.geometry.attributes.position as THREE.BufferAttribute
    ).needsUpdate = true;
  }

  private emit(
    boatPosition: THREE.Vector3,
    rotationY: number,
    speed: number
  ) {
    for (let i = 0; i < 2; i++) {
      const particleIndex = this.findDeadParticle();

      if (particleIndex === -1) return;

      const idx = particleIndex * 3;

      // dirección del barco
      const dirX = Math.sin(rotationY);
      const dirZ = Math.cos(rotationY);

      // spawn detrás del barco
      const backOffset = -7;

      const spawnX = boatPosition.x + dirX * backOffset;
      const spawnZ = boatPosition.z + dirZ * backOffset;

      this.positions[idx] = spawnX;
      this.positions[idx + 1] = 1.5;
      this.positions[idx + 2] = spawnZ;

      // apertura en V
      const spread = (Math.random() - 0.5) * 0.08;

      this.velocities[idx] =
        (-dirX * (0.03 + speed * 0.02)) + spread;

      this.velocities[idx + 1] = 0;

      this.velocities[idx + 2] =
        (-dirZ * (0.03 + speed * 0.02)) + spread;

      this.ages[particleIndex] = 0;
      this.lifetimes[particleIndex] =
        800 + Math.random() * 600;
    }
  }

  private findDeadParticle() {
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

    (
      this.particles.material as THREE.PointsMaterial
    ).dispose();
  }
}