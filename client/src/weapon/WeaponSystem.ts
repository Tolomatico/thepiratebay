import * as THREE from "three";
import { Projectile } from "./Projectile";

export abstract class WeaponSystem {
  protected scene: THREE.Scene;
  protected origin: THREE.Object3D;
  protected cooldown = 4;
  protected fireRate =500; 
  protected damage: number = 0;
  protected projectiles: Projectile[] = [];
  protected onShoot: (type:"left" | "right" | "front",direction:THREE.Vector3,id:string) => void;
  protected quantity: number = 2;  
  protected shotQueue: number = 0;    
  protected shotTimer: number = 0;
  protected instancedMesh: THREE.InstancedMesh;
  protected instanceCount = 100;
  protected freeIndices: number[] = [];
  protected id:string = crypto.randomUUID();
  protected registry?: Map<string, Projectile>;


  constructor(scene: THREE.Scene, origin: THREE.Object3D,onShoot: (type: "left" | "right" | "front", direction: THREE.Vector3,id:string) => void, registry?: Map<string, Projectile>) {
    this.scene = scene;
    this.origin = origin;
    this.onShoot=onShoot;
    this.registry = registry;
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: "black" });
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, this.instanceCount);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.instancedMesh);
      for (let i = 0; i < this.instanceCount; i++) {
    this.freeIndices.push(i);
  }
   const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < this.instanceCount; i++) {
    this.instancedMesh.setMatrixAt(i, hiddenMatrix);
  }
   this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

protected createProjectile(position: THREE.Vector3, direction: THREE.Vector3, specificId?: string): { projectile: Projectile, id: string } | null {
  if (this.freeIndices.length === 0) return null;
  const index = this.freeIndices.pop()!;
  const projectileId = specificId || crypto.randomUUID();
  const projectile = new Projectile(position, direction, this.damage, index, projectileId);
  this.projectiles.push(projectile);
  if (this.registry) this.registry.set(projectileId, projectile);
  return { projectile, id: projectileId }; 
}

update(delta: number) {
  this.cooldown -= delta;

  const matrix = new THREE.Matrix4();
  
  this.projectiles = this.projectiles.filter(p => {
    p.updatePosition(delta);
    
    if (p.isAlive()) {
      // actualizar posición de la instancia
      matrix.makeTranslation(p.position.x, p.position.y, p.position.z);
      this.instancedMesh.setMatrixAt(p.instanceIndex!, matrix);
      return true;
    } else {
      // liberar la instancia y ocultarla
      this.freeIndices.push(p.instanceIndex!);
      const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
      this.instancedMesh.setMatrixAt(p.instanceIndex!, hidden);
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      if (this.registry) this.registry.delete(p.id);
      return false;
    }
  });

  this.instancedMesh.instanceMatrix.needsUpdate = true;
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
  abstract shootSingle(id?: string): void;
}