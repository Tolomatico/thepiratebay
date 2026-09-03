import * as THREE from "three";

export class Projectile {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age = 0;
  id: string;
  lifetime = 5000;
  alive = true;
  damage: number;
  instanceIndex: number | null = null;
  public onWaterHit?: (pos: THREE.Vector3) => void;

  constructor(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    damage: number,
    instanceIndex: number,
    id: string,
    onWaterHit?: (pos: THREE.Vector3) => void
  ) {
    this.position = position.clone();
    // Velocidad unificada con el servidor (0.60 unidades por frame)
    this.velocity = direction.clone().normalize().multiplyScalar(0.60);
    // Ligero ángulo de elevación de boca de cañón para dar mayor alcance parabólico
    this.velocity.y += 0.035;
    this.damage = damage;
    this.instanceIndex = instanceIndex;
    this.id = id;
    this.onWaterHit = onWaterHit;
  }

  updatePosition(delta: number) {
    const normDelta = delta / 16.67;

    this.position.x += this.velocity.x * normDelta;
    this.position.y += this.velocity.y * normDelta;
    this.position.z += this.velocity.z * normDelta;

    // Gravedad suave calibrada para alcanzar ~130 unidades de distancia antes de tocar el agua
    this.velocity.y -= 0.00075 * normDelta;

    this.age += delta;

    // Si el proyectil cae al agua
    if (this.position.y <= 0 && this.alive) {
      this.alive = false;
      if (this.onWaterHit) {
        this.onWaterHit(new THREE.Vector3(this.position.x, 0, this.position.z));
      }
    }
  }

  isAlive(): boolean {
    return this.alive && this.age <= this.lifetime;
  }

  kill() {
    this.alive = false;
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
}