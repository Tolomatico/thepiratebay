import * as THREE from 'three'
import { InputManager } from './input/InputManager'
import { ModelManager } from "./model/ModelManager";
import { Ocean } from './ocean/Ocean';
import { Boat } from './boat/Boat';
import { Controlls } from "./controlls/Controlls"
import  { EnemyManager } from './bots/EnemyManager';
import { HUD } from './hud/Hud';
import  { SoundManager } from './soundmanager/SoundManager';
import  { NetworkManager } from './network/NetworkManager';
import  { PlayerManager } from './player-manager/PlayerManager';
import { Projectile } from './weapon/Projectile';

class Game {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private boat!: Boat
  private inputManager!: InputManager
  private modelManager: ModelManager;
  private ocean!: Ocean
  private controls: Controlls
  private timer = new THREE.Timer();
  private lastNetworkUpdate = 0;
  private hud!: HUD
  public enemyManager!: EnemyManager;
  private soundManager!: SoundManager;
   
  // Multiplayer
  private networkManager: NetworkManager;
  private playerManager: PlayerManager;
  private projectileRegistry = new Map<string, Projectile>();

  constructor() {
    this.soundManager=new SoundManager()
    this.modelManager = new ModelManager();
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87CEEB);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 5, 5)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)
    
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(10, 20, 10);
    this.scene.add(light);
   
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);
    
    const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 0.7);
    this.scene.add(hemi);

    // Multiplayer
    this.networkManager = new NetworkManager();
    this.playerManager = new PlayerManager(this.scene, this.modelManager, this.projectileRegistry);

    this.hud = new HUD(this.camera);
    // this.soundManager.playMusic();
   this.controls = new Controlls(this.camera, this.renderer.domElement, null as any)
    this.ocean = new Ocean(this.scene)
    this.enemyManager=new EnemyManager(this.scene,this.ocean,()=>this.soundManager.playShootSound())
    this.enemyManager.spawnEnemies(0)
    this.init()
    this.animate()
    window.addEventListener("resize", () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
});
  }
 

  public async init (){

    // Inicializar los inputs 
       this.inputManager = new InputManager()

    // Inicializar el barco 
    this.boat = new Boat(
      this.scene, 
      this.modelManager, 
      this.ocean,
      (type:"front" | "left" | "right", direction: THREE.Vector3,id:string) => {
        this.soundManager.playShootSound();
        this.networkManager.emitShoot({ 
          type, 
          position: { x: this.boat.position.x, y: this.boat.position.y, z: this.boat.position.z }, 
          direction: { x: direction.x, y: direction.y, z: direction.z }, 
          damage: 50 ,
          projectileId: id
        });
      },
      this.projectileRegistry
    );
      // Controles del jugador
    this.controls.setTarget(this.boat.getObject3D())


    // Manejo de los jugadores remotos
    this.networkManager.onPlayerMoved((data) => {
       if (data.id === this.networkManager.socket.id) return;
       this.playerManager.addPlayer(data.id);
       this.playerManager.updatePlayer(data);
    });
    this.networkManager.onPlayerDamaged((data) => {
      console.log("Impacto recibido. Proyectil ID:", data.projectileId);
      
      // Destrucción O(1) usando el registro global
      this.projectileRegistry.get(data.projectileId)?.kill();
      
      if (data.id === this.networkManager.socket.id) {
        this.boat.takeDamage(data.damage);
      } else {
        const player = this.playerManager.getPlayer(data.id);
        if (player) player.takeDamage(data.damage);
      }
    });
    
    this.networkManager.onPlayerDisconnected((data) => {
      this.playerManager.removePlayer(data.id);
    });

    this.networkManager.onPlayerShoot((data) => {
      const player = this.playerManager.getPlayer(data.id);
      if (player) player.shoot(data.type, data.projectileId);
    });

    this.networkManager.onCurrentPlayers((players) => {
  players.forEach(p => {
    this.playerManager.addPlayer(p.id);
    this.playerManager.updatePlayer(p); 
  });
});

this.networkManager.onPlayerJoined((data) => {
  if (data.id !== this.networkManager.socket.id) {  
    this.playerManager.addPlayer(data.id);
  }
});
  }


  animate =()=>{
    // Actualizar el tiempo
    this.timer.update();
    const time = this.timer.getElapsed() * 1000;
    const delta = this.timer.getDelta() * 1000;

    // Emitir la posición del jugador solo cada 50ms (20Hz) para optimizar la red
    if (time - this.lastNetworkUpdate > 30) {
      this.networkManager.emitMove({
        position: {
          x: this.boat.position.x,
          y: this.boat.position.y,
          z: this.boat.position.z,
        },
        rotation: { y: this.boat.getObject3D().rotation.y }
      });
      this.lastNetworkUpdate = time;
    }

    this.boat.update(this.inputManager, time,delta)
    this.ocean.update(time)
    this.playerManager.update(delta);
    this.controls.update()
  //   this.enemyManager.update( time,
  // this.boat.getActiveProjectiles(),
  // delta,
  // this.boat.position,
  // this.boat.velocity,
  // this.boat.getHitbox(),
  // (damage) => this.boat.takeDamage(damage))
    this.hud.update({ player: {playerHealth:this.boat.health, maxPlayerHealth:this.boat.maxHealth}, enemyCount: this.enemyManager.enemies.length,enemies:this.enemyManager.getEnemies()});
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.animate)
  }
}

new Game()