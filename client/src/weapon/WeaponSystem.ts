import * as THREE from "three";
import type { Projectile } from "./Projectile";

export abstract class WeaponSystem {
  protected scene: THREE.Scene;
  protected origin: THREE.Object3D;
  protected cooldown = 4;
  protected fireRate =500; 
  protected projectiles: Projectile[] = [];
  protected onShoot: () => void;
  protected quantity: number = 1;  
  protected shotQueue: number = 0;    
  protected shotTimer: number = 0;



  constructor(scene: THREE.Scene, origin: THREE.Object3D,onShoot: () => void) {
    this.scene = scene;
    this.origin = origin;
    this.onShoot=onShoot;
  }

  update(delta: number) {
    this.cooldown -= delta;
  
this.projectiles = this.projectiles.filter(p => {
  p.update(delta);
  return p.isAlive();
});
  }
 forceShoot() {
  this.shotQueue = this.quantity ?? 1;
  this.shotTimer = 0;
}
  
  getProjectiles(): Projectile[] {
  return this.projectiles;
}

  protected canShoot() {
    return this.cooldown <= 0;
  }

  protected resetCooldown() {
    this.cooldown = this.fireRate;
  }

  abstract shoot( ): void;
}