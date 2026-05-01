import * as THREE from "three";
import { WeaponSystem } from "./WeaponSystem";

export class FrontCanon extends WeaponSystem {
  constructor(scene: THREE.Scene, origin: THREE.Object3D,onShoot: (type:"left" | "right",direction:THREE.Vector3) => void) {
    super(scene, origin,onShoot);
    this.damage = 50;
    this.fireRate = 2000;
  }

  shoot() {
  if (!this.canShoot()) return;
  
  const pos = new THREE.Vector3();
  this.origin.getWorldPosition(pos);
  pos.y += 0.5;

  const dir = new THREE.Vector3();
  this.origin.getWorldDirection(dir);

  const projectile = this.createProjectile(pos, dir);
  if (!projectile) return; // ← pool lleno, no hacer nada

 this.onShoot("front",dir); 
  this.resetCooldown();
}

  forceShoot() {
  this.origin.updateWorldMatrix(true, true);
  const pos = new THREE.Vector3();
  this.origin.getWorldPosition(pos);
  pos.y += 5;

  const dir = new THREE.Vector3();
  this.origin.getWorldDirection(dir);

   this.createProjectile(pos, dir);
}
}