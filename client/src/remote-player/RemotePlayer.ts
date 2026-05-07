import * as THREE from "three";
import type { ModelManager } from "../model/ModelManager";
import  { SideCanon } from "../weapon/SideCanon";
import { FrontCanon } from "../weapon/FrontCanon";
import type { Projectile } from "../weapon/Projectile";
import { Explosion } from "../explosion/Explosion";
import { SoundManager } from "../soundmanager/SoundManager";

export class RemotePlayer {
  private visualBox: THREE.Group;
  private container: THREE.Group;
  private model!: THREE.Object3D;
  private scene: THREE.Scene
  private modelManager: ModelManager
  private explosions: Explosion[] = [];
  private soundManager: SoundManager;
  private id:string
    private hitboxSize = { x: 10, y: 10, z: 10 }; // mismo tamaño que el modelo
    private hitbox: THREE.Box3 = new THREE.Box3();
  
  // Health
  public health: number = 500;
  public maxHealth: number = 500;

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
    this.soundManager=new SoundManager();
    this.modelManager=modelManager
    this.scene=scene
    this.visualBox = new THREE.Group();
    this.container = new THREE.Group();
    this.container.add(this.visualBox);


    // // Hitbox visualizer
    // const hitboxGeom = new THREE.BoxGeometry(10, 10, 10);
    // const hitboxMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, visible: true });
    // const hitboxMesh = new THREE.Mesh(hitboxGeom, hitboxMat);
    // hitboxMesh.position.y = 5;
    // this.container.add(hitboxMesh);

    scene.add(this.container);

    this.loadModel();
    this.frontCanon = new FrontCanon(this.scene, this.container,() => this.onShoot("front"), registry);
    this.leftCanon = new SideCanon(this.scene, this.container,() => this.onShoot("left"), "left", undefined, registry);
    this.rightCanon = new SideCanon(this.scene, this.container,() => this.onShoot("right"), "right", undefined, registry);
  }

  private onShoot(type: "left" | "right" | "front") {

  // no hacemos nada, no hay sonido ni emisión
}

respawn(position: THREE.Vector3) {
  this.health = this.maxHealth;
  this.container.position.copy(position);
  this.scene.add(this.container);
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

getHitbox(): THREE.Box3 {
  return this.hitbox.setFromObject(this.container);
}

shoot(type: "front" | "left" | "right", projectileId: string) {
  this.container.updateMatrixWorld(true);
  
  if (type === "front") this.frontCanon.shootSingle(projectileId);
  if (type === "left") this.leftCanon.shootSingle(projectileId);
  if (type === "right") this.rightCanon.shootSingle(projectileId);
}


 async loadModel( ) {


    this.model = await this.modelManager.load("/models/pirate.glb");
 
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
    this.health -= damage;
    if (this.health <= 0) {
        this.health = 0;
        this.explode()
      }
  }
  explode(){
    this.soundManager.playDestroySound();
    this.explosions.push(new Explosion(this.scene, this.container.position));
    this.scene.remove(this.container)
  }

  getPosition(): THREE.Vector3 {
    return this.container.position.clone();
  }

  getHealthRatio(): number {
    return Math.max(0, this.health / this.maxHealth);
  }

  update(delta: number) {
    this.frontCanon.update(delta);
    this.leftCanon.update(delta);
    this.rightCanon.update(delta);
    this.explosions = this.explosions.filter(exp => {
    exp.update(delta);
    return exp.isAlive();
  });
  }
}