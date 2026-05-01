import * as THREE from "three";
import type { ModelManager } from "../model/ModelManager";
import  { SideCanon } from "../weapon/SideCanon";
import { FrontCanon } from "../weapon/FrontCanon";
import type { Projectile } from "../weapon/Projectile";

export class RemotePlayer {
  private visualBox: THREE.Group;
  private container: THREE.Group;
  private model!: THREE.Object3D;
  private scene: THREE.Scene
  private modelManager: ModelManager
  private id:string
   private hitboxSize = { x: 10, y: 10, z: 10 }; // mismo tamaño que el modelo
  

  // Weapons
     private leftCanon: SideCanon;
      private rightCanon: SideCanon;
      private frontCanon: FrontCanon;

  constructor(
    scene: THREE.Scene,
    modelManager: ModelManager,
    id:string,
    registry?: Map<string, Projectile>
  ) {
    this.id=id
    this.modelManager=modelManager
    this.scene=scene
    this.visualBox = new THREE.Group();
    this.container = new THREE.Group();
    this.container.add(this.visualBox);
    scene.add(this.container);

    this.loadModel();
    this.frontCanon = new FrontCanon(this.scene, this.container,() => this.onShoot("front"), registry);
    this.leftCanon = new SideCanon(this.scene, this.container,() => this.onShoot("left"), "left", undefined, registry);
    this.rightCanon = new SideCanon(this.scene, this.container,() => this.onShoot("right"), "right", undefined, registry);
  }

  private onShoot(type: "left" | "right" | "front") {
    console.log("disparo del jugador remoto",type)
  // no hacemos nada, no hay sonido ni emisión
}



containsPoint(point: { x: number; y: number; z: number }): boolean {
  this.container.updateWorldMatrix(true,true);
  const pos = new THREE.Vector3();
  this.container.getWorldPosition(pos);
  return (
    point.x >= pos.x - this.hitboxSize.x / 2 &&
    point.x <= pos.x + this.hitboxSize.x / 2 &&
    point.y >= pos.y - this.hitboxSize.y / 2 &&
    point.y <= pos.y + this.hitboxSize.y / 2 &&
    point.z >= pos.z - this.hitboxSize.z / 2 &&
    point.z <= pos.z + this.hitboxSize.z / 2
  );
}

shoot(type: "front" | "left" | "right", projectileId: string) {
  this.container.updateMatrixWorld(true);
  
  if (type === "front") this.frontCanon.shootSingle(projectileId);
  if (type === "left") this.leftCanon.shootSingle(projectileId);
  if (type === "right") this.rightCanon.shootSingle(projectileId);
}


 async loadModel( ) {


    this.model = await this.modelManager.load("/models/holandes.glb");
 
   // 1️⃣ bounding inicial
   let box = new THREE.Box3().setFromObject(this.model);
   const size = new THREE.Vector3();
   box.getSize(size);
 
   // 2️⃣ definir tamaño objetivo (como tu caja roja)
   const targetWidth =10;
   const targetHeight = 10;
   const targetDepth =10;
 
   const scaleX = targetWidth / size.x;
   const scaleY = targetHeight / size.y;
   const scaleZ = targetDepth / size.z;
 
   const scale = Math.min(scaleX, scaleY, scaleZ);
   this.model.scale.set(scale, scale, scale);
 
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
   this.visualBox.rotation.y = -Math.PI/2  ;
   this.container.add(this.visualBox);
  
 }

  updatePosition(position: { x: number; y: number; z: number }, rotation: { y: number }) {
    this.container.position.set(position.x, position.y, position.z);
    this.visualBox.rotation.y = -Math.PI/2;
    this.container.rotation.y = rotation.y
  }

  getId(): string {
    return this.id;
  }

  destroy() {
    this.container.removeFromParent();
  }
  takeDamage(damage: number) {
  console.log(`RemotePlayer ${this.id} recibió ${damage} daño`);
}

  update(delta: number) {
    this.frontCanon.update(delta);
    this.leftCanon.update(delta);
    this.rightCanon.update(delta);
  }
}