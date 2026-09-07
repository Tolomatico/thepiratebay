

import { GameManager } from "../game-manager/GameManager.js";
import { SHIPS } from "../interfaces/player.js";
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
    lobbyId:string,
    ownerTeam: string
  ) {
    this.projectiles.push(new ServerProjectile(position, direction, ownerId, damage,projectileId,lobbyId,ownerTeam));
  }

  update(delta: number): { id: string; damage: number; health: number, projectileId: string, }[] {
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
        
        const hitboxSize = { x: SHIPS[player.shipType].hitbox.x, y: SHIPS[player.shipType].hitbox.y, z: SHIPS[player.shipType].hitbox.z };
        
        // Coordenadas relativas al barco rotado (Oriented Bounding Box)
        const relX = projectile.position.x - player.position.x;
        const relZ = projectile.position.z - player.position.z;
        const rotY = player.rotation?.y || 0;
        const cosA = Math.cos(-rotY);
        const sinA = Math.sin(-rotY);

        // Proyectar al sistema de coordenadas local del barco
        const localX = Math.abs(relX * cosA - relZ * sinA);
        const localZ = Math.abs(relX * sinA + relZ * cosA);
        const localY = Math.abs(projectile.position.y - (player.position.y + 3));
        
        // Tolerancia de red de +1 unidad
        const isHit = localX < (hitboxSize.x / 2 + 1.0) && localY < (hitboxSize.y / 2 + 1.5) && localZ < (hitboxSize.z / 2 + 1.0);

        
        if (isHit) { 
          if(!player.isAlive || player.health <= 0) continue;
          if(player.team === projectile.ownerTeam){
          projectile.isDead = true;
          projectile.age = projectile.lifetime + 5;
          continue
        }
          const wasAlive = player.isAlive;
          player.takeDamage(projectile.damage);
          projectile.isDead = true;
          projectile.age = projectile.lifetime + 5;

          const attacker = this.gameManager.getPlayer(projectile.ownerId);
          if (attacker) {
            attacker.damageDealt += projectile.damage;
            if (wasAlive && !player.isAlive) {
              attacker.kills++;
              player.deaths++;
            }
          } else if (wasAlive && !player.isAlive) {
            player.deaths++;
          }

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