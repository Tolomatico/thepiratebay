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
import type { EnemyHealthBar, RemotePlayerHUD } from './context/HudContext';
import  { SoundManager } from './soundmanager/SoundManager';
import type { ShipType, Team } from './interfaces/player';
import { RenderPipeline } from './graphics/RenderPipeline';
import { CombatEffectsManager } from './effects/CombatEffects';

export class GameEngine {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private renderPipeline: RenderPipeline
  public combatEffects: CombatEffectsManager;
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
  private remotePlayers: Map<string, RemotePlayerHUD>;

  // Recibe el contenedor donde montar el canvas
  private container: HTMLDivElement;

  // Funciones para actualizar el hud
  private setPlayerHealth: (health: number) => void;
  private setPlayerRotation: (rotation: number) => void;
  private setPlayerPosition: (position: { x: number; y: number; z: number }) => void;
  private setRespawnCountdown: (countdown: number | null) => void;
  private setEnemyCount: (count: number) => void;
  private setEnemyHealthBars: (bars: EnemyHealthBar[]) => void;
  private healthBarRefs: Map<string, HTMLDivElement>;

  private username:string
  private team:string
  private shipType:string
  constructor(
    container: HTMLDivElement,
    networkManager: NetworkManager,
    username:string,
    team:Team,
    shipType:ShipType,
    setPlayerHealth: (health: number) => void,
    setPlayerMaxHealth: (maxHealth: number) => void,
    setPlayerRotation: (rotation: number) => void,
    setPlayerPosition: (position: { x: number; y: number; z: number }) => void,
    setRespawnCountdown: (countdown: number | null) => void,
    setEnemyCount: (count: number) => void,
    setEnemyHealthBars: (bars: EnemyHealthBar[]) => void,
    healthBarRefs: Map<string, HTMLDivElement>,
    remotePlayers: Map<string, RemotePlayerHUD>
  ) {
    this.remotePlayers = remotePlayers;
    this.username=username
    this.team=team
    this.shipType=shipType
    this.container = container;
    this.networkManager = networkManager;
    this.setPlayerHealth = setPlayerHealth;
    this.setPlayerRotation = setPlayerRotation;
    this.setPlayerPosition = setPlayerPosition;
    setPlayerMaxHealth(this.shipType === "fragate" ? 800 : 600);
    this.setRespawnCountdown = setRespawnCountdown;
    this.setEnemyCount = setEnemyCount;
    this.setEnemyHealthBars = setEnemyHealthBars;
    this.healthBarRefs = healthBarRefs;
    this.soundManager=new SoundManager()
    this.modelManager = new ModelManager();
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.name = "mainCamera";
    this.camera.position.set(0, 5, 5)
    this.camera.lookAt(0, 0, 0)

    // Inicializar el pipeline gráfico avanzado (Sombras, Luces, Cielo y Postprocesado)
    this.renderPipeline = new RenderPipeline(this.container, this.scene, this.camera);
    this.renderer = this.renderPipeline.renderer;

    // Efectos de combate (fogonazos, humo, salpicaduras, astillas)
    this.combatEffects = new CombatEffectsManager(this.scene);

    // Multiplayer
    this.playerManager = new PlayerManager(
      this.scene, 
      this.modelManager, 
      this.projectileRegistry,
      (waterPos) => this.combatEffects.triggerWaterSplash(waterPos)
    );

    // this.soundManager.playMusic();
    this.controls = new Controlls(this.camera, this.renderer.domElement, null as any)
    this.ocean = new Ocean(this.scene)
    this.enemyManager=new EnemyManager(this.scene,this.ocean,()=>this.soundManager.playShootSound())
    this.enemyManager.spawnEnemies(0)
    this.init()
    this.animate()
    window.addEventListener("resize", () => {
      this.renderPipeline.resize(window.innerWidth, window.innerHeight);
    });
  }

  private respawnInterval: any = null;

private startRespawnCountdown() {
  if (this.respawnInterval) {
    clearInterval(this.respawnInterval);
    this.respawnInterval = null;
  }

  let seconds = 10;
  this.setRespawnCountdown(seconds);
  this.inputManager.disable();
  
  this.respawnInterval = setInterval(() => {
    seconds--;
    this.setRespawnCountdown(seconds);
    
    if (seconds <= 0) {
      if (this.respawnInterval) {
        clearInterval(this.respawnInterval);
        this.respawnInterval = null;
      }
      this.respawn();
      this.inputManager.enable(); 
    }
  }, 1000);
}

private updateRemotePlayersHUD() {
  this.remotePlayers.clear();
  this.playerManager.getPlayers().forEach(p => {
    this.remotePlayers.set(p.getId(), {
      id: p.getId(),
      username: p.getUsername(),
      health: p.health,
      maxHealth: p.maxHealth,
      position: {
        x: p.getPosition().x,
        y: p.getPosition().y,
        z: p.getPosition().z,
      }
    });
  });
}

private respawn() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 40 + Math.random() * 40;
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
        const flashPos = this.boat.position.clone().add(new THREE.Vector3(0, 3, 0));
        this.combatEffects.triggerMuzzleFlash(flashPos, direction);
        this.networkManager.emitShoot({ 
          type, 
          position: { x: this.boat.position.x, y: this.boat.position.y + 3, z: this.boat.position.z }, 
          direction: { x: direction.x, y: direction.y, z: direction.z }, 
          damage: 50 ,
          projectileId: id,
          ownerTeam: this.team,
        });
      }, 
      () => this.startRespawnCountdown(),
      this.shipType as ShipType,
      this.projectileRegistry,
      (waterPos) => this.combatEffects.triggerWaterSplash(waterPos)
    );
      // Controles del jugador
    this.controls.setTarget(this.boat.getObject3D())


    // Manejo de los jugadores remotos
    this.networkManager.onPlayerMoved((data) => {
       if (data.id === this.networkManager.socket.id) return;
       this.playerManager.addPlayer({
        id:data.id,
        username:data.username,
        team:data.team ?? "red",
        shipType:data.shipType,
        position:data.position,
        rotation:data.rotation,
        health:data.health
       });
       this.updateRemotePlayersHUD();
       this.playerManager.updatePlayer(data);
    });
    this.networkManager.onPlayerDamaged((data) => {
      const proj = this.projectileRegistry.get(data.projectileId);
      const hitPos = proj ? proj.getPosition() : (data.id === this.networkManager.socket.id ? this.boat.position.clone().add(new THREE.Vector3(0, 2, 0)) : this.playerManager.getPlayer(data.id)?.getPosition().clone().add(new THREE.Vector3(0, 2, 0)));
      if (hitPos) {
        this.combatEffects.triggerWoodHit(hitPos);
      }
      proj?.kill();
      
      if (data.id === this.networkManager.socket.id) {
        this.soundManager.playHitSound();
        this.boat.takeDamage(data.damage);
      } else {
        const remotePlayer = this.playerManager.getPlayer(data.id);
        if (remotePlayer) {
          remotePlayer.takeDamage(data.damage);
        }
      }
      this.updateRemotePlayersHUD();
    });
    
    this.networkManager.onPlayerDisconnected((data) => {
      this.playerManager.removePlayer(data.id);
      this.updateRemotePlayersHUD();
    });

    this.networkManager.onPlayerShoot((data) => {
      const player = this.playerManager.getPlayer(data.id);
      if (player) {
        player.shoot(data.type, data.projectileId);
        const flashPos = player.getPosition().add(new THREE.Vector3(0, 3, 0));
        this.combatEffects.triggerMuzzleFlash(flashPos, new THREE.Vector3(0, 0, 1));
      }
    });



    this.networkManager.onCurrentPlayers((players) => {
  players.forEach(p => {
    this.playerManager.addPlayer(p);
    this.playerManager.updatePlayer(p); 
  });
});

this.networkManager.onPlayerJoined((data) => {
  if (data.id !== this.networkManager.socket.id) {  
    this.playerManager.addPlayer(data);
  }
});
this.networkManager.onPlayerRespawn((data) => {
  const player = this.playerManager.getPlayer(data.id);
  if (player) {
    player.respawn(new THREE.Vector3(data.position.x, data.position.y, data.position.z));
    this.updateRemotePlayersHUD();
  }
});
  }



  dispose() {
    this.renderPipeline.dispose();
  }


  animate =()=>{
    // Actualizar el tiempo
    this.timer.update();
    const time = this.timer.getElapsed() * 1000;
    const delta = this.timer.getDelta() * 1000;

    // Emitir la posición del jugador solo cada 50ms (20Hz) para optimizar la red
    if (time - this.lastNetworkUpdate > 30) {
     this.networkManager.emitMove({
  id: this.networkManager.socket.id as string,
  username: this.username,        
  team: this.team as Team,               
  shipType: this.shipType as ShipType,     
  health: this.boat.health,
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
    this.combatEffects.update(delta);

    this.enemyManager.update(
      time, 
      this.boat.getActiveProjectiles(), 
      delta, 
      this.boat.position, 
      new THREE.Vector3(), 
      this.boat.getHitbox(), 
      (dmg) => this.boat.takeDamage(dmg)
    );

    this.controls.update()
    
    // Actualizar el HUD en React
    this.camera.updateMatrixWorld(); // Asegurar que la cámara tiene la posición actual
    this.camera.updateProjectionMatrix();

    this.setPlayerHealth(this.boat.health);
    this.setPlayerRotation(this.boat.getObject3D().rotation.y);
    const pos = this.boat.getObject3D().position;
    this.setPlayerPosition({ x: pos.x, y: pos.y, z: pos.z });
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
        visible: isVisible && ratio > 0,
        username: typeof (enemy as any).getUsername === 'function' ? (enemy as any).getUsername() : undefined
      };
    });
    
    this.setEnemyHealthBars(healthBars);

    const playerPos = this.boat ? this.boat.position : undefined;
    this.renderPipeline.render(playerPos);
    requestAnimationFrame(this.animate);
  }
}
