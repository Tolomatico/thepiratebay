import { WeaponSystem } from "./WeaponSystem";
import * as THREE from "three";

export class SideCanon extends WeaponSystem {
  private leftOrRight: "left" | "right";
  private delayBetweenShots: number = 150;

  

  constructor(scene: THREE.Scene, origin: THREE.Object3D,  onShoot: (type: "left" | "right" | "front", direction: THREE.Vector3) => void, leftOrRight: "left" | "right",quantity?:number) {
        super(scene, origin, onShoot);
        this.fireRate = 2000;
        this.leftOrRight = leftOrRight;
         this.damage = 25;
        if(quantity)this.quantity = quantity;
    }


    update(delta: number): void {
    super.update(delta);

    if (this.shotQueue > 0) {
      this.shotTimer -= delta;

      if (this.shotTimer <= 0) {
        const dir=new THREE.Vector3();
        const success = this.fireOne();
        if (success) this.onShoot(this.leftOrRight,dir);
        this.shotQueue--;
        this.shotTimer = this.delayBetweenShots;
      }
    }
  }


     private fireOne():THREE.Vector3 | null {
    const shotIndex = this.quantity - this.shotQueue;
    const pos = new THREE.Vector3();
    this.origin.getWorldPosition(pos);
    pos.y += 0.7;

    const forward = new THREE.Vector3();
    forward.setFromMatrixColumn(this.origin.matrixWorld, 2);

    const spread = (shotIndex - (this.quantity - 1) / 2);
    pos.addScaledVector(forward, spread * 0.5);

    const dir = new THREE.Vector3();
    if (this.leftOrRight === "left") {
      dir.setFromMatrixColumn(this.origin.matrixWorld, 0);
    } else {
      dir.setFromMatrixColumn(this.origin.matrixWorld, 0).negate();
    }

    const projectile = this.createProjectile(pos, dir);
  if (!projectile) return null;
  return dir;;


  }
  shoot(): void {
  if (!this.canShoot()) return;
  this.shotQueue = this.quantity;  // carga la cola
  this.shotTimer = 0;              // dispara el primero inmediatamente
  this.resetCooldown();
}

    }
