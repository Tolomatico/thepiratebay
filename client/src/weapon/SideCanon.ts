import { WeaponSystem } from "./WeaponSystem";
import * as THREE from "three";

import { Projectile } from "./Projectile";

export class SideCanon extends WeaponSystem {
  private leftOrRight: "left" | "right";
  private delayBetweenShots: number = 150;

  

  constructor(scene: THREE.Scene, origin: THREE.Object3D,  onShoot: (type: "left" | "right" | "front", direction: THREE.Vector3,id:string) => void, leftOrRight: "left" | "right",quantity?:number, registry?: Map<string, Projectile>) {
        super(scene, origin, onShoot, registry);
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
        const shotData = this.fireOne(); 
        if (shotData) this.onShoot(this.leftOrRight, shotData.direction, shotData.id)
        this.shotQueue--;
        this.shotTimer = this.delayBetweenShots;
      }
    }
  }


  private fireOne(): { direction: THREE.Vector3, id: string } | null {
    const shotIndex = this.quantity - this.shotQueue;
    const pos = new THREE.Vector3();
    this.origin.getWorldPosition(pos);
    pos.y += 3;

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

    const result = this.createProjectile(pos, dir);
    if (!result) return null;
    return { direction: dir, id: result.id };
  }


  shoot(): void {
    if (!this.canShoot()) return;
    this.shotQueue = this.quantity;
    this.shotTimer = 0;
    this.resetCooldown();
  }

  shootSingle(id?: string): void {
    const pos = new THREE.Vector3();
    this.origin.getWorldPosition(pos);
    pos.y += 3;

    const dir = new THREE.Vector3();
    if (this.leftOrRight === "left") {
      dir.setFromMatrixColumn(this.origin.matrixWorld, 0);
    } else {
      dir.setFromMatrixColumn(this.origin.matrixWorld, 0).negate();
    }

    this.createProjectile(pos, dir, id);
  }
}
