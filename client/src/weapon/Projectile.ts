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

  constructor(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    damage: number,
    instanceIndex: number,
    id: string
  ) {
    this.position = position.clone();
    this.velocity = direction.clone().normalize().multiplyScalar(0.12);
    this.damage = damage;
    this.instanceIndex = instanceIndex;
    this.id = id;
  }

  updatePosition(delta: number) {
  this.position.add(this.velocity);
  this.age += delta;
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