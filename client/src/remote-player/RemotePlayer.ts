import * as THREE from "three";
import type { ModelManager } from "../model/ModelManager";
import  { SideCanon } from "../weapon/SideCanon";
import { FrontCanon } from "../weapon/FrontCanon";

export class RemotePlayer {
  private visualBox: THREE.Group;
  private container: THREE.Group;
  private model!: THREE.Object3D;
  private scene: THREE.Scene
  private modelManager: ModelManager
  private id:string


  // Weapons
     private leftCanon: SideCanon;
      private rightCanon: SideCanon;
      private frontCanon: FrontCanon;

  constructor(
    scene: THREE.Scene,
    modelManager: ModelManager,
    id:string
  ) {
    this.id=id
    this.modelManager=modelManager
    this.scene=scene
    this.visualBox = new THREE.Group();
    this.container = new THREE.Group();
    this.container.add(this.visualBox);
    scene.add(this.container);

    this.loadModel();
    this.frontCanon = new FrontCanon(this.scene, this.container,() => this.onShoot("front"),0);
    this.leftCanon = new SideCanon(this.scene, this.container,() => this.onShoot("left"), "left", 0);
    this.rightCanon = new SideCanon(this.scene, this.container,() => this.onShoot("right"), "right", 0);
  }

  private onShoot(type: string) {
  // no hacemos nada, no hay sonido ni emisión
}

shoot(type: "front" | "left" | "right") {
  this.container.updateMatrixWorld(true);
  
  if (type === "front") this.frontCanon.forceShoot();
  if (type === "left") this.leftCanon.forceShoot();
  if (type === "right") this.rightCanon.forceShoot();
}


 async loadModel( ) {


    this.model = await this.modelManager.load("/models/holandes.glb");
 
   // 1️⃣ bounding inicial
   let box = new THREE.Box3().setFromObject(this.model);
   const size = new THREE.Vector3();
   box.getSize(size);
 
   // 2️⃣ definir tamaño objetivo (como tu caja roja)
   const targetWidth =50;
   const targetHeight = 50;
   const targetDepth =50;
 
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

  update(delta: number) {
    this.frontCanon.update(delta);
    this.leftCanon.update(delta);
    this.rightCanon.update(delta);
  }
}