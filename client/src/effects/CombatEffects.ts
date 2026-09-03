import * as THREE from "three";

interface ActiveEffect {
  update(delta: number): boolean; // retorna false cuando termina para removerse
  destroy(): void;
}

// Textura circular suave generada proceduralmente para eliminar los cuadrados pixelados
let sharedParticleTexture: THREE.Texture | null = null;

function getParticleTexture(): THREE.Texture {
  if (sharedParticleTexture) return sharedParticleTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.7)");
  gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.15)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  sharedParticleTexture = new THREE.CanvasTexture(canvas);
  return sharedParticleTexture;
}

// 1. Destello de boca de cañón (Luz puntual breve)
class MuzzleFlash implements ActiveEffect {
  private light: THREE.PointLight;
  private age = 0;
  private lifetime = 90; // ms
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.scene = scene;
    this.light = new THREE.PointLight(0xff8822, 5, 15, 2);
    this.light.position.copy(position);
    this.scene.add(this.light);
  }

  update(delta: number): boolean {
    this.age += delta;
    const progress = this.age / this.lifetime;
    this.light.intensity = Math.max(0, 5 * (1 - progress));
    return this.age < this.lifetime;
  }

  destroy() {
    this.scene.remove(this.light);
    this.light.dispose();
  }
}

// 2. Nube de humo de disparo (suave, circular y compacta)
class SmokePuff implements ActiveEffect {
  private particles: THREE.Points;
  private velocities: THREE.Vector3[] = [];
  private age = 0;
  private lifetime = 600; // ms
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, position: THREE.Vector3, direction: THREE.Vector3) {
    this.scene = scene;
    const count = 10;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.25;
      positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.25;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.25;

      const spread = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        Math.random() * 0.03 + 0.015,
        (Math.random() - 0.5) * 0.05
      );
      spread.addScaledVector(direction, 0.04 + Math.random() * 0.04);
      this.velocities.push(spread);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.35,
      map: getParticleTexture(),
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.frustumCulled = false;
    this.scene.add(this.particles);
  }

  update(delta: number): boolean {
    this.age += delta;
    const progress = this.age / this.lifetime;

    const posAttr = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < this.velocities.length; i++) {
      array[i * 3] += this.velocities[i].x * (delta / 16.67);
      array[i * 3 + 1] += this.velocities[i].y * (delta / 16.67);
      array[i * 3 + 2] += this.velocities[i].z * (delta / 16.67);
      this.velocities[i].multiplyScalar(0.96);
    }
    posAttr.needsUpdate = true;

    const mat = this.particles.material as THREE.PointsMaterial;
    mat.opacity = 0.65 * (1 - progress);
    mat.size = 0.35 + progress * 0.35;

    return this.age < this.lifetime;
  }

  destroy() {
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
  }
}

// 3. Salpicadura de agua (partículas circulares pequeñas y finas)
class WaterSplash implements ActiveEffect {
  private particles: THREE.Points;
  private velocities: THREE.Vector3[] = [];
  private age = 0;
  private lifetime = 700; // ms
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.scene = scene;
    const count = 18;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = 0.05;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.3;

      // Apertura ascendente fina
      const angle = Math.random() * Math.PI * 2;
      const horizontalSpeed = 0.02 + Math.random() * 0.035;
      this.velocities.push(new THREE.Vector3(
        Math.cos(angle) * horizontalSpeed,
        0.12 + Math.random() * 0.1, // altura de salpicadura moderada
        Math.sin(angle) * horizontalSpeed
      ));
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.22,
      map: getParticleTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.frustumCulled = false;
    this.scene.add(this.particles);
  }

  update(delta: number): boolean {
    this.age += delta;
    const progress = this.age / this.lifetime;
    const normDelta = delta / 16.67;

    const posAttr = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < this.velocities.length; i++) {
      this.velocities[i].y -= 0.011 * normDelta; // gravedad

      array[i * 3] += this.velocities[i].x * normDelta;
      array[i * 3 + 1] = Math.max(0.02, array[i * 3 + 1] + this.velocities[i].y * normDelta);
      array[i * 3 + 2] += this.velocities[i].z * normDelta;
    }
    posAttr.needsUpdate = true;

    const mat = this.particles.material as THREE.PointsMaterial;
    mat.opacity = 0.85 * (1 - progress);

    return this.age < this.lifetime;
  }

  destroy() {
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
  }
}

// 4. Impacto en barco de madera (astillas y chispas circulares pequeñas)
class WoodHit implements ActiveEffect {
  private particles: THREE.Points;
  private velocities: THREE.Vector3[] = [];
  private age = 0;
  private lifetime = 500; // ms
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.scene = scene;
    const count = 16;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      this.velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.14,
        Math.random() * 0.12 + 0.03,
        (Math.random() - 0.5) * 0.14
      ));
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffaa44,
      size: 0.18,
      map: getParticleTexture(),
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.frustumCulled = false;
    this.scene.add(this.particles);
  }

  update(delta: number): boolean {
    this.age += delta;
    const progress = this.age / this.lifetime;
    const normDelta = delta / 16.67;

    const posAttr = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < this.velocities.length; i++) {
      this.velocities[i].y -= 0.008 * normDelta;
      array[i * 3] += this.velocities[i].x * normDelta;
      array[i * 3 + 1] += this.velocities[i].y * normDelta;
      array[i * 3 + 2] += this.velocities[i].z * normDelta;
    }
    posAttr.needsUpdate = true;

    const mat = this.particles.material as THREE.PointsMaterial;
    mat.opacity = 1.0 - progress;

    return this.age < this.lifetime;
  }

  destroy() {
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
  }
}

// Manager central de efectos de combate
export class CombatEffectsManager {
  private effects: ActiveEffect[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Disparo de cañón: flash de luz y humo suave
  public triggerMuzzleFlash(position: THREE.Vector3, direction: THREE.Vector3) {
    this.effects.push(new MuzzleFlash(this.scene, position));
    this.effects.push(new SmokePuff(this.scene, position, direction));
  }

  // Proyectil que cae al agua (salpicadura chica)
  public triggerWaterSplash(position: THREE.Vector3) {
    this.effects.push(new WaterSplash(this.scene, position));
  }

  // Proyectil que impacta en el casco de un barco
  public triggerWoodHit(position: THREE.Vector3) {
    this.effects.push(new WoodHit(this.scene, position));
  }

  public update(delta: number) {
    this.effects = this.effects.filter((effect) => {
      const isAlive = effect.update(delta);
      if (!isAlive) {
        effect.destroy();
      }
      return isAlive;
    });
  }

  public clear() {
    for (const effect of this.effects) {
      effect.destroy();
    }
    this.effects = [];
  }
}
