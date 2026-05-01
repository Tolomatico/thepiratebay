import * as THREE from "three";
import { WeaponSystem } from "./WeaponSystem";

import { Projectile } from "./Projectile";

export class FrontCanon extends WeaponSystem {
  constructor(scene: THREE.Scene, origin: THREE.Object3D,onShoot: (type:"front" | "left" | "right",direction:THREE.Vector3,id:string  ) => void, registry?: Map<string, Projectile>) {
    super(scene, origin,onShoot, registry);
    this.damage = 50;
    this.fireRate = 2000;
  }

  shoot() {
   if (!this.canShoot()) return;
  
  const pos = new THREE.Vector3();
  this.origin.getWorldPosition(pos);
  pos.y += 3;

  const dir = new THREE.Vector3();
  this.origin.getWorldDirection(dir);

  const result = this.createProjectile(pos, dir);
  if (!result) return;

  this.onShoot("front", dir, result.id);
  this.resetCooldown();
}

  forceShoot() {
    this.origin.updateWorldMatrix(true, true);
    const pos = new THREE.Vector3();
    this.origin.getWorldPosition(pos);
    pos.y +=3;

    const dir = new THREE.Vector3();
    this.origin.getWorldDirection(dir);

    this.createProjectile(pos, dir);
  }

  shootSingle(id?: string) {
    const pos = new THREE.Vector3();
    this.origin.getWorldPosition(pos);
    pos.y += 3;

    const dir = new THREE.Vector3();
    this.origin.getWorldDirection(dir);

    this.createProjectile(pos, dir, id);
  }
}