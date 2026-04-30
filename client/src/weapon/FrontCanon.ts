import { Projectile } from "./Projectile";
import * as THREE from "three";
import { WeaponSystem } from "./WeaponSystem";

export class FrontCanon extends WeaponSystem {
    private damage:number
  constructor(scene: THREE.Scene, origin: THREE.Object3D,onShoot: () => void,damage:number) {
    super(scene, origin,onShoot);
    this.fireRate = 1000; 
    this.damage = damage;
  }

  shoot() {
     console.log("disparo front canon", this.origin);
    if (!this.canShoot()) return;
      const pos = new THREE.Vector3();
this.origin.getWorldPosition(pos);
pos.y += 5;

    const dir = new THREE.Vector3();
    this.origin.getWorldDirection(dir);

    this.projectiles.push(new Projectile(this.scene, pos, dir, this.damage));
    this.onShoot();
    this.resetCooldown();
  }

  forceShoot() {
  this.origin.updateWorldMatrix(true, true);
  const pos = new THREE.Vector3();
  this.origin.getWorldPosition(pos);
  pos.y += 5;

  const dir = new THREE.Vector3();
  this.origin.getWorldDirection(dir);

  this.projectiles.push(new Projectile(this.scene, pos, dir, this.damage));
}
}