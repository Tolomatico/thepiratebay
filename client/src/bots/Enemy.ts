import * as THREE from "three";
import type { Ocean } from "../ocean/Ocean";
import { ModelManager } from "../model/ModelManager";
import { SideCanon } from "../weapon/SideCanon";
import type { Projectile } from "../weapon/Projectile";

export class Enemy{
    private ocean:Ocean
    private container: THREE.Group;
    private health:number=500;
    private maxHealth:number=500;
    private model!: THREE.Object3D;
    private visualBox: THREE.Group;
    private modelManager: ModelManager;
    private leftCanon: SideCanon;
    private rightCanon: SideCanon;
   private onShoot: () => void;
    constructor(scene:THREE.Scene,ocean:Ocean,position:THREE.Vector3, onShoot: () => void){

      this.onShoot=onShoot
      this.ocean=ocean
      this.container = new THREE.Group();
      this.container.position.copy(position);
      this.modelManager = new ModelManager();
      this.visualBox = new THREE.Group();
      this.container.add(this.visualBox);
      this.leftCanon = new SideCanon(scene, this.container,this.onShoot, "left", 20);
      this.rightCanon = new SideCanon(scene, this.container,this.onShoot, "right", 20);
      this.loadModel().then(() => {
    console.log("Barco cargado");
  });
      scene.add(this.container); 
      
    }

    getHealth(): number {
  return this.health;
}

getHealthRatio(): number {
  return Math.max(0, this.health / this.maxHealth);
}

    async loadModel() {
      this.model = await this.modelManager.load("/models/boat.glb");
    
      // 1️⃣ bounding inicial
      let box = new THREE.Box3().setFromObject(this.model);
      const size = new THREE.Vector3();
      box.getSize(size);
    
      // 2️⃣ definir tamaño objetivo (como tu caja roja)
      const targetWidth = 15;
      const targetHeight = 15;
      const targetDepth = 15;
    
      const scaleX = targetWidth / size.x;
      const scaleY = targetHeight / size.y;
      const scaleZ = targetDepth / size.z;
    
      const scale = Math.min(scaleX, scaleY, scaleZ);
    
      this.model.scale.set(scale, scale, scale);
    
      // 3️⃣ recalcular box DESPUÉS de escalar
      box = new THREE.Box3().setFromObject(this.model);
    
      const center = new THREE.Vector3();
      box.getCenter(center);
    
      // 4️⃣ centrar correctamente
      this.model.position.set(
        -center.x,
        -box.min.y,
        -center.z
      );
    
      this.visualBox.add(this.model);
      this.visualBox.rotation.y = Math.PI - Math.PI/24 ;
    }

    getActiveProjectiles(): Projectile[] {
  return [
    ...this.leftCanon.getProjectiles(),
    ...this.rightCanon.getProjectiles(),
  ];
}
    getHitbox(): THREE.Box3 {
  return new THREE.Box3().setFromObject(this.container);
}
    update(time: number, delta: number, playerPosition: THREE.Vector3, playerVelocity: THREE.Vector3) {
        this.leftCanon.update(delta);
  this.rightCanon.update(delta);

  const waveY = this.ocean.getWaveHeight(this.container.position.x, this.container.position.z, time);
  this.container.position.y = waveY;

  const projectileSpeed = 0.05; // tiene que coincidir con la velocidad en Projectile
  const distanceToPlayer = this.container.position.distanceTo(playerPosition);
  
  // tiempo que tarda el proyectil en llegar
  const flightTime = distanceToPlayer / projectileSpeed;
  
  // posición futura del jugador
  const predictedPosition = playerPosition.clone().addScaledVector(playerVelocity, flightTime);
  predictedPosition.y = this.container.position.y;

  const directionToPlayer = new THREE.Vector3().subVectors(predictedPosition, this.container.position);

  if (distanceToPlayer < 100 && distanceToPlayer > 50) {
  // fase 1: acercarse
  const targetDir = directionToPlayer.normalize();
  const currentForward = new THREE.Vector3();
  this.container.getWorldDirection(currentForward);
  const angle = Math.atan2(
    targetDir.x - currentForward.x,
    targetDir.z - currentForward.z
  );
  this.container.rotateY(angle * 0.05);
  this.container.translateZ(0.01);

} else if (distanceToPlayer <= 60) {
 const targetDir = directionToPlayer.normalize();
  const currentForward = new THREE.Vector3();
  this.container.getWorldDirection(currentForward);

  const targetAngle = Math.atan2(targetDir.x, targetDir.z) - Math.PI / 2;
  const currentAngle = Math.atan2(currentForward.x, currentForward.z);
  
  let diff = targetAngle - currentAngle;
  
  // normalizar entre -PI y PI
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  // solo rotar si la diferencia es mayor a 5°
  if (Math.abs(diff) > 0.08) {
    this.container.rotateY(diff * 0.05);
  }

  this.leftCanon.shoot();
  this.rightCanon.shoot();
}
}

    getPosition(): THREE.Vector3 {
  return this.container.position.clone();
}


  destroy() {
  this.container.removeFromParent();
  }


public takeDamage(amount: number) {
  this.health -= amount;
}

public isDead(): boolean {
  return this.health <= 0;
}
}