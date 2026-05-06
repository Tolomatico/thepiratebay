

import { GameManager } from "../game-manager/GameManager.js";
import { ServerProjectile } from "./ServerProjectile.js";


export class ProjectileManager {
  private projectiles: ServerProjectile[] = [];

  constructor(private gameManager: GameManager) {}

  addProjectile(
    position: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    ownerId: string,
    damage: number,
    projectileId: string,
    lobbyId:string
  ) {
    this.projectiles.push(new ServerProjectile(position, direction, ownerId, damage,projectileId,lobbyId));
  }

  update(delta: number): { id: string; damage: number; health: number, projectileId: string }[] {
    const hits: { id: string; damage: number; health: number,projectileId:string }[] = [];

    for (const projectile of this.projectiles) {
      projectile.update(delta);
    }

    this.checkCollisions(hits);

    this.projectiles = this.projectiles.filter(p => p.isAlive());

    return hits; // ← devuelve los impactos para que GameManager los emita
  }

private checkCollisions(hits: { id: string; damage: number; health: number,projectileId:string }[]) {
    const players = this.gameManager.getState();
    
    for (const projectile of this.projectiles) {
      if (projectile.age > projectile.lifetime || projectile.isDead) continue;

      for (const player of players) {
        if (player.id === projectile.ownerId) continue; 
        if (player.lobbyId !== projectile.lobbyId){     
            continue; 
        }
          if (player.lobbyId !== projectile.lobbyId) {
        continue;
      }
        const hitboxSize = { x: 10, y: 10, z: 10 };
        
        const dx = Math.abs(projectile.position.x - player.position.x);
        const dy = Math.abs(projectile.position.y - (player.position.y + 3));
        const dz = Math.abs(projectile.position.z - player.position.z);
        
        const isHit = dx < hitboxSize.x / 2 && dy < hitboxSize.y / 2 && dz < hitboxSize.z / 2;
        
        if (isHit) { 
          player.takeDamage(projectile.damage);
          projectile.isDead = true;
          projectile.age = projectile.lifetime + 5;
          hits.push({ 
            id: player.id, 
            damage: projectile.damage, 
            health: player.health,
            projectileId: projectile.id  
          });
        }
      }
    }
  }
}