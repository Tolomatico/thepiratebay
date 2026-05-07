import * as THREE from 'three'
import { InputManager } from './input/InputManager'
import { ModelManager } from "./model/ModelManager";
import { Ocean } from './ocean/Ocean';
import { Boat } from './boat/Boat';
import { Controlls } from "./controlls/Controlls"
import  { EnemyManager } from './bots/EnemyManager';
import  { PlayerManager } from './player-manager/PlayerManager';
import { Projectile } from './weapon/Projectile';
import type { NetworkManager } from './network/NetworkManager';
import type { EnemyHealthBar } from './context/HudContext';
import  { SoundManager } from './soundmanager/SoundManager';

export class GameEngine {
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
  public enemyManager!: EnemyManager;
  private soundManager!: SoundManager;
   
  // Multiplayer
  private networkManager: NetworkManager;
  private playerManager: PlayerManager;
  private projectileRegistry = new Map<string, Projectile>();

  // Recibe el contenedor donde montar el canvas
  private container: HTMLDivElement;

  // Funciones para actualizar el hud
  private setPlayerHealth: (health: number) => void;
  private setRespawnCountdown: (countdown: number | null) => void;
  private setEnemyCount: (count: number) => void;
  private setEnemyHealthBars: (bars: EnemyHealthBar[]) => void;
  private healthBarRefs: Map<string, HTMLDivElement>;

  constructor(
    container: HTMLDivElement,
    networkManager: NetworkManager,
    setPlayerHealth: (health: number) => void,
    setRespawnCountdown: (countdown: number | null) => void,
    setEnemyCount: (count: number) => void,
    setEnemyHealthBars: (bars: EnemyHealthBar[]) => void,
    healthBarRefs: Map<string, HTMLDivElement>
  ) {
    this.container = container;
    this.networkManager = networkManager;
    this.setPlayerHealth = setPlayerHealth;
    this.setRespawnCountdown = setRespawnCountdown;
    this.setEnemyCount = setEnemyCount;
    this.setEnemyHealthBars = setEnemyHealthBars;
    this.healthBarRefs = healthBarRefs;
    this.soundManager=new SoundManager()
    this.modelManager = new ModelManager();
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87CEEB);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.name = "mainCamera";
    this.camera.position.set(0, 5, 5)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)
    
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(10, 20, 10);
    this.scene.add(light);
   
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);
    
    const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 0.7);
    this.scene.add(hemi);

    // Multiplayer
    this.playerManager = new PlayerManager(this.scene, this.modelManager, this.projectileRegistry);

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

private startRespawnCountdown() {
  let seconds = 10;
  this.setRespawnCountdown(seconds);
  this.inputManager.disable();
  
  const interval = setInterval(() => {
    seconds--;
    this.setRespawnCountdown(seconds);
    
    if (seconds <= 0) {
      clearInterval(interval);
      this.respawn();
      this.inputManager.enable(); 
    }
  }, 1000);
}

private respawn() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 20 + Math.random() * 20;
  const position = new THREE.Vector3(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  );
  
  this.boat.respawn(position);
 // this.inputManager.disabled = false; 
  this.setRespawnCountdown(null);
   this.networkManager.emitRespawn(position); 
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
      () => this.startRespawnCountdown(),
       this.projectileRegistry,
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
      this.projectileRegistry.get(data.projectileId)?.kill();
      
      if (data.id === this.networkManager.socket.id) {
        this.soundManager.playHitSound();
        this.boat.takeDamage(data.damage);
      } else {
        const remotePlayer = this.playerManager.getPlayer(data.id);
        if (remotePlayer) {
          remotePlayer.takeDamage(data.damage);
        }
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
this.networkManager.onPlayerRespawn((data) => {
  const player = this.playerManager.getPlayer(data.id);
  if (player) player.respawn(new THREE.Vector3(data.position.x, data.position.y, data.position.z));
});
  }



  dispose() {
  this.renderer.dispose()
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
    
    // IMPORTANTE: Actualizar enemigos para que sus posiciones no sean stale
    this.enemyManager.update(
      time, 
      this.boat.getActiveProjectiles(), 
      delta, 
      this.boat.position, 
      new THREE.Vector3(), // Simplificado: velocidad del jugador
      this.boat.getHitbox(), 
      (dmg) => this.boat.takeDamage(dmg)
    );

    this.controls.update()
    
    // Actualizar el HUD en React
    this.camera.updateMatrixWorld(); // Asegurar que la cámara tiene la posición actual
    this.camera.updateProjectionMatrix();

    this.setPlayerHealth(this.boat.health);
    const enemies = [
      ...this.enemyManager.getEnemies(),
      ...this.playerManager.getPlayers()
    ];
    this.setEnemyCount(enemies.length);

    // Calcular barras de vida para los enemigos
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;

    const healthBars: EnemyHealthBar[] = enemies.map((enemy) => {
      const id = (enemy as any).getId();
      const pos = enemy.getPosition().clone();
      pos.y += 12; // Altura ajustada
      pos.project(this.camera);

      const isVisible = pos.z < 1 && pos.x >= -1 && pos.x <= 1 && pos.y >= -1 && pos.y <= 1;
      const ratio = enemy.getHealthRatio();

      // ACTUALIZACIÓN DIRECTA DEL DOM (Cero Lag)
      const el = this.healthBarRefs.get(id);
      if (el) {
          if (isVisible && ratio > 0) {
              const x = (pos.x * 0.5 + 0.5) * width;
              const y = (-pos.y * 0.5 + 0.5) * height;
              el.style.display = 'block';
              el.style.left = `${x}px`;
              el.style.top = `${y}px`;
          } else {
              el.style.display = 'none';
          }
      }
      
      return {
        id,
        healthRatio: ratio,
        visible: isVisible && ratio > 0
      };
    });
    
    this.setEnemyHealthBars(healthBars);

    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.animate)
  }
}
