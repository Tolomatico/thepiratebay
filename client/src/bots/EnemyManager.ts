import * as THREE from "three";
import type { Ocean } from "../ocean/Ocean";
import { Enemy } from "./Enemy";
import type { Projectile } from "../weapon/Projectile";
import { Explosion } from "../explosion/Explosion";


export class EnemyManager{
  public enemies: Enemy[] = [];
  private scene:THREE.Scene
  private ocean:Ocean
  private explosions: Explosion[] = [];
  private onShoot: () => void;
    constructor(scene:THREE.Scene,ocean:Ocean,onShoot: () => void){
      this.scene=scene
      this.ocean=ocean
      this.onShoot=onShoot

    }
    spawnEnemies(count:number){
        for (let i = 0; i < count; i++) {
          const position = this.randomPosition();
          const enemy = new Enemy(this.scene, this.ocean, position,()=>this.onShoot());
          this.enemies.push(enemy);
        }
      
    }
    getEnemies(): Enemy[] {
  return this.enemies;
}
    private randomPosition(spreadRadius = 100): THREE.Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const radius = spreadRadius * 0.5 + Math.random() * spreadRadius * 0.5;

  return new THREE.Vector3(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  );
}

private checkCollisions(
  projectiles: Projectile[],
  enemyProjectiles: Projectile[],
  playerHitbox: THREE.Box3,
  playerTakeDamage: (damage: number) => void
) {
  // proyectiles del jugador vs enemigos
  for (const projectile of projectiles) {
    for (const enemy of this.enemies) {
      const enemyBox = enemy.getHitbox();
      if (enemyBox.containsPoint(projectile.getPosition())) {
        enemy.takeDamage(projectile.damage);
        //projectile.destroy();
        break;
      }
    }
  }

  // proyectiles enemigos vs jugador
  for (const projectile of enemyProjectiles) {
    if (playerHitbox.containsPoint(projectile.getPosition())) {
      playerTakeDamage(projectile.damage);
     // projectile.destroy();
    }
  }
}

private getActiveEnemyProjectiles(): Projectile[] {
  return this.enemies.flatMap(enemy => enemy.getActiveProjectiles());
}



    update(time:number,projectiles: Projectile[],delta:number,playerPosition:THREE.Vector3, velocity: THREE.Vector3,playerHitbox:THREE.Box3,playerTakeDamage: (damage: number) => void,){
       const enemyProjectiles = this.getActiveEnemyProjectiles();
       
       for (const enemy of this.enemies) {
    enemy.update(time,delta,playerPosition,velocity);
  }
  this.checkCollisions(projectiles,enemyProjectiles,playerHitbox,playerTakeDamage); 
  this.removeEnemy();
this.explosions = this.explosions.filter(exp => {
  exp.update(delta);
  return exp.isAlive();
});
    }


    removeEnemy(){
      this.enemies
      .filter(e => e.isDead())
     .forEach(e => {
    const pos = e.getPosition();     
    this.explosions.push(new Explosion(this.scene, pos));
    e.destroy();
  });

      this.enemies = this.enemies.filter(e => !e.isDead());
    }

    
}