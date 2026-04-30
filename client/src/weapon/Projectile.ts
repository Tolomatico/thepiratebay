import * as THREE from "three";

export class Projectile {
  private mesh: THREE.Mesh;
  private velocity: THREE.Vector3;
  private lifetime = 5000; // ms
  private age = 0;
  private alive = true;
  public damage: number;
  constructor(
    scene: THREE.Scene,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    damage: number
  ) {
    this.damage = damage;
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: "black" });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);

    // velocidad del proyectil
    this.velocity = direction.clone().normalize().multiplyScalar(0.2);

    scene.add(this.mesh);
  }

  getPosition(): THREE.Vector3 {
  return this.mesh.position.clone();
}

  update(delta: number) {
    this.mesh.position.add(this.velocity);

    this.age += delta;

    // destruir después de un tiempo
    if (this.age > this.lifetime) { 
      this.destroy();
    }
  }
public isAlive(): boolean {
  return this.alive && this.age <= this.lifetime;
}
public destroy() {
  this.alive = false;
  this.mesh.removeFromParent();
  }
}