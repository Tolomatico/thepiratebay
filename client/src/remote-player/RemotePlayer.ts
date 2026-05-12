import * as THREE from "three";
import type { ModelManager } from "../model/ModelManager";
import  { SideCanon } from "../weapon/SideCanon";
import { FrontCanon } from "../weapon/FrontCanon";
import type { Projectile } from "../weapon/Projectile";
import { Explosion } from "../explosion/Explosion";
import { SoundManager } from "../soundmanager/SoundManager";
import { SHIPS, type PlayerData, type ShipStats } from "../interfaces/player";
import { PlayerModels } from "../constants";

export class RemotePlayer {
  private visualBox: THREE.Group;
  private container: THREE.Group;
  private model!: THREE.Object3D;
  private scene: THREE.Scene
  private modelManager: ModelManager
  private explosions: Explosion[] = [];
  private soundManager: SoundManager;
  readonly id:string
  private hitbox: THREE.Box3 = new THREE.Box3();
  private hitboxHelper: THREE.BoxHelper | null = null;
  private playerData: PlayerData;
  private stats: ShipStats;
  
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
    playerData: PlayerData,
    registry?: Map<string, Projectile>
  ) {
    this.id=playerData.id
    this.soundManager=new SoundManager();
    this.modelManager=modelManager
    this.scene=scene
    this.playerData = playerData;
    this.stats = SHIPS[playerData.shipType];
    this.health = this.stats.health || 1000;
    this.maxHealth = this.stats.health || 1000;
    this.visualBox = new THREE.Group();
    this.container = new THREE.Group();
    this.container.add(this.visualBox);
    

    // Hitbox visualizer
    const hitboxGeom = new THREE.BoxGeometry(10, 10, 10);
    const hitboxMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, visible: true });
    const hitboxMesh = new THREE.Mesh(hitboxGeom, hitboxMat);
    this.container.add(hitboxMesh);

    scene.add(this.container);
    
    this.loadModel();
    const { front, left, right } = this.stats.cannons

    this.frontCanon = new FrontCanon(this.scene, this.container,() => this.onShoot("front"), front.damage,front.quantity,front.fireRate, registry);
    this.leftCanon = new SideCanon(this.scene, this.container,() => this.onShoot("left"), "left", left.damage,left.quantity,left.fireRate, registry);
    this.rightCanon = new SideCanon(this.scene, this.container,() => this.onShoot("right"), "right", right.damage,right.quantity,right.fireRate, registry);
  }

  private onShoot(type: "left" | "right" | "front") {
  console.log(type)
  // no hacemos nada, no hay sonido ni emisión
}

  getId() { return this.playerData.id; }
  getUsername() { return this.playerData.username; }
  getTeam() { return this.playerData.team; }

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
    point.x >= pos.x - this.stats.hitbox.x / 2 &&
    point.x <= pos.x + this.stats.hitbox.x / 2 &&
    point.y >= pos.y - this.stats.hitbox.y / 2 &&
    point.y <= pos.y + this.stats.hitbox.y / 2 &&
    point.z >= pos.z - this.stats.hitbox.z / 2 &&
    point.z <= pos.z + this.stats.hitbox.z / 2
  );
}

getHitbox(): THREE.Box3 {
  const pos = this.container.position;
  const stats = this.stats;
  const hitbox = stats.hitbox;
  const halfX = hitbox.x / 2;
  const halfZ = hitbox.z / 2;
  
  this.hitbox.min.set(pos.x - halfX, pos.y, pos.z - halfZ);
  this.hitbox.max.set(pos.x + halfX, pos.y + hitbox.y, pos.z + halfZ);
  
  if (!this.hitboxHelper) {
    const boxGeom = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const boxMesh = new THREE.Mesh(boxGeom, boxMat);
    this.scene.add(boxMesh);
    this.hitboxHelper = new THREE.BoxHelper(boxMesh, 0xff0000);
    this.scene.add(this.hitboxHelper);
  }
  
  const center = new THREE.Vector3(
    (this.hitbox.min.x + this.hitbox.max.x) / 2,
    (this.hitbox.min.y + this.hitbox.max.y) / 2,
    (this.hitbox.min.z + this.hitbox.max.z) / 2
  );
  this.hitboxHelper.position.copy(center);
  this.hitboxHelper.scale.set(hitbox.x, hitbox.y, hitbox.z);
  this.hitboxHelper.update();
  
  return this.hitbox;
}

shoot(type: "front" | "left" | "right", projectileId: string) {
  this.container.updateMatrixWorld(true);
  
  if (type === "front") this.frontCanon.shootSingle(projectileId);
  if (type === "left") this.leftCanon.shootSingle(projectileId);
  if (type === "right") this.rightCanon.shootSingle(projectileId);
}


 async loadModel( ) {


    this.model = await this.modelManager.load(PlayerModels[this.playerData.shipType]);
 
   // 1️⃣ bounding inicial
   let box = new THREE.Box3().setFromObject(this.model);
   const size = new THREE.Vector3();
   box.getSize(size);
 
   // 2️⃣ definir tamaño objetivo (como tu caja roja)
   const targetWidth =this.stats.hitbox.x;
   const targetHeight =this.stats.hitbox.y;
   const targetDepth =this.stats.hitbox.z;
 
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
   this.visualBox.rotation.y = Math.PI + Math.PI
   this.container.add(this.visualBox);
  
 }

  updatePosition(position: { x: number; y: number; z: number }, rotation: { y: number }) {
    this.container.position.set(position.x, position.y, position.z);
    this.container.rotation.y = rotation.y
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