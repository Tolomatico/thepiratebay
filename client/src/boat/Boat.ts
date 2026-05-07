import * as THREE from 'three'
import  { InputManager } from '../input/InputManager'
import { ModelManager } from "../model/ModelManager";
import { Ocean } from "../ocean/Ocean";
import { FrontCanon } from '../weapon/FrontCanon';
import{ SideCanon } from '../weapon/SideCanon';
import type { Projectile } from '../weapon/Projectile';
import { Explosion } from '../explosion/Explosion';
import { SoundManager } from '../soundmanager/SoundManager';

export class Boat {
  private modelManager: ModelManager;
  private ocean: Ocean;
  private container: THREE.Group;
  private visualBox: THREE.Group;
  private scene: THREE.Scene
  private speed = 0;
  private acceleration = 0.0005;
  private maxSpeed = 0.05;
  private maxReverseSpeed = 0.005;
  private rotationSpeed = 0.003;
  private model!: THREE.Object3D;
  private frontCanon: FrontCanon;
  private leftCanon!: SideCanon;
  private rightCanon!: SideCanon;
  private boatHealth = 500;
  private maxBoatHealth = 500;
  private dimensions!: THREE.Vector3;
  private explosions: Explosion[] = [];
  private hitbox: THREE.Box3 = new THREE.Box3();
  private soundManager: SoundManager;
  private onDeath: () => void
 
  private onShoot: (type: "front" | "left" | "right", direction: THREE.Vector3,id:string) => void
   
  
  constructor(
      scene: THREE.Scene,
      modelManager: ModelManager,
      ocean: Ocean,
      onShoot: (type: "front" | "left" | "right", direction: THREE.Vector3,id:string) => void,
      onDeath: () => void,
      registry?: Map<string, Projectile>,
    
    ) {
       this.onDeath = onDeath
        this.soundManager = new SoundManager();
        this.model=null as unknown as THREE.Object3D;
        this.scene=scene
        this.modelManager=modelManager
        this.ocean = ocean
        this.container = new THREE.Group();
        this.onShoot=onShoot;
        this.visualBox = new THREE.Group();
        this.container.add(this.visualBox)

        // // Hitbox visualizer
        // const hitboxGeom = new THREE.BoxGeometry(10, 10, 10);
        // const hitboxMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: true });
        // const hitboxMesh = new THREE.Mesh(hitboxGeom, hitboxMat);
        // // El modelo está centrado de tal forma que box.min.y es 0 en el visualBox
        // // targetHeight es 10, así que el centro de la caja debe estar en y = 5
        // hitboxMesh.position.y = 5;
        // this.container.add(hitboxMesh);

        this.scene.add(this.container)

this.frontCanon = new FrontCanon(
  this.scene, 
  this.container,
  (type,direction,id) => this.onShoot(type,direction,id),
  registry
);
this.leftCanon = new SideCanon(
  this.scene, 
  this.container,
  (type,direction,id) => this.onShoot(type,direction,id),
  "left",
  undefined,
  registry
);
this.rightCanon = new SideCanon(
  this.scene, 
  this.container,
  (type,direction,id) => this.onShoot(type,direction,id),
  "right",
  undefined,
  registry
);
       
       this.loadModel().then(() => {
        });
    }

    takeDamage(amount: number) {
      this.boatHealth -= amount;
      if (this.boatHealth <= 0) {
        this.boatHealth = 0;
        this.explode()
      }
    }

    

    explode(){
   this.soundManager.playDestroySound();
      this.explosions.push(new Explosion(this.scene, this.container.position));
      this.scene.remove(this.container)
      this.onDeath()
    }

    get size(): THREE.Vector3 {
      
  return this.dimensions || new THREE.Vector3(0,0,0);
}

    get maxHealth(): number {
      return this.maxBoatHealth;
    }

    get health(): number {
      return this.boatHealth;
    }

    get velocity(): THREE.Vector3 {
        return new THREE.Vector3(
          Math.sin(this.container.rotation.y) * this.speed,
          0,
          Math.cos(this.container.rotation.y) * this.speed
        );
      }


    getActiveProjectiles(): Projectile[] {
        return [
            ...this.frontCanon.getProjectiles(),
            ...this.leftCanon.getProjectiles(),
            ...this.rightCanon.getProjectiles(),
        ];
}
async loadModel( ) {
  this.model = await this.modelManager.load("/models/english.glb");

  // 1️⃣ bounding inicial
  let box = new THREE.Box3().setFromObject(this.model);
  const size = new THREE.Vector3();
  box.getSize(size);

  // 2️⃣ definir tamaño objetivo (como tu caja roja)
  const targetWidth =15;
  const targetHeight = 15;
  const targetDepth =15;

  const scaleX = targetWidth / size.x;
  const scaleY = targetHeight / size.y;
  const scaleZ = targetDepth / size.z;

  const scale = Math.min(scaleX, scaleY, scaleZ);
  this.dimensions =   new THREE.Vector3(size.x*scale,size.y*scale,size.z*scale)
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
  const angle = Math.random() * Math.PI * 2;
  const radius = 50 + Math.random() * 50;
  this.container.position.set(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  );

  this.visualBox.add(this.model);
  this.visualBox.rotation.y = Math.PI + Math.PI  ;
}

getHitbox(): THREE.Box3 {
  return this.hitbox.setFromObject(this.container);
}
getObject3D(): THREE.Object3D {
  return this.container;
}

get position(): THREE.Vector3 {
  return this.container.position;
}

public respawn(position: THREE.Vector3) {
  this.container.position.copy(position);
  this.boatHealth = this.maxBoatHealth;
  this.container.visible = true;
  if (!this.scene.getObjectById(this.container.id)) {
    this.scene.add(this.container);
  }
}


  private normalizeAngle(angle: number) {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
}


    public update(input:InputManager, time: number,delta:number){
    this.explosions = this.explosions.filter(exp => {
      exp.update(delta);
      return exp.isAlive();
    });
       this.frontCanon.update(delta)
       this.leftCanon.update(delta)
       this.rightCanon.update(delta)

const currentMaxSpeed = this.speed >= 0 ? this.maxSpeed : this.maxReverseSpeed;
const baseTurn = 0.1;
const speedFactor = Math.abs(this.speed) / currentMaxSpeed;

const turnFactor = baseTurn + speedFactor * 0.7;

if (input.keysPressed.includes("space")) {
     this.frontCanon.shoot()
}
if(input.keysPressed.includes("q")){
    this.leftCanon.shoot()
}
if(input.keysPressed.includes("e")){
    this.rightCanon.shoot()
}

if (input.keysPressed.includes("w")) {
  if (this.speed < 0) {
    this.speed += this.acceleration * 2;
  } else {
    this.speed += this.acceleration;
  }
}

if (input.keysPressed.includes("s")) {
  if (this.speed > 0) {
    this.speed -= this.acceleration * 2;
  } else {
    this.speed -= this.acceleration * 1.5;
  }
}

if (input.keysPressed.includes("a")) {
  this.container.rotation.y += this.rotationSpeed * turnFactor;
}

if (input.keysPressed.includes("d")) {
  this.container.rotation.y -= this.rotationSpeed * turnFactor;
}
this.container.rotation.y = this.normalizeAngle(this.container.rotation.y);

this.speed = Math.max(
  -this.maxReverseSpeed,
  Math.min(this.speed, this.maxSpeed)
);


this.container.position.x += Math.sin(this.container.rotation.y) * this.speed;
this.container.position.z += Math.cos(this.container.rotation.y) * this.speed;
this.speed *= 0.99;  

const waveY = this.ocean.getWaveHeight(this.container.position.x, this.container.position.z, time);
this.container.position.y = waveY - this.size?.y/10; 

// puntos adelante y atrás para calcular inclinación
const front = this.ocean.getWaveHeight(
  this.container.position.x + Math.sin(this.container.rotation.y) * 2,
  this.container.position.z + Math.cos(this.container.rotation.y) * 2,
  time
);
const back = this.ocean.getWaveHeight(
  this.container.position.x - Math.sin(this.container.rotation.y) * 2,
  this.container.position.z - Math.cos(this.container.rotation.y) * 2,
  time
);

// inclinación suavizada con lerp
const targetPitch = (front - back) * 0.1;
this.container.rotation.x += (targetPitch - this.container.rotation.x) * 0.1;

   

    }
}