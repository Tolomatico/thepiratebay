

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
    projectileId: string
  ) {
    this.projectiles.push(new ServerProjectile(position, direction, ownerId, damage,projectileId));
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
      if (projectile.age > projectile.lifetime) continue; // Si ya murió, ignorar

      for (const player of players) {
        if (player.id === projectile.ownerId) continue; 

        const dx = projectile.position.x - player.position.x;
        const dy = projectile.position.y - player.position.y;
        const dz = projectile.position.z - player.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
 
        if (distance < 2.5) { // hitRadius
         player.takeDamage(projectile.damage);
           projectile.kill();
          projectile.age = projectile.lifetime + 5; // matar proyectil
         hits.push({ 
    id: player.id, 
    damage: projectile.damage, 
    health: player.health,
    projectileId: projectile.id  
  });
  projectile.age = projectile.lifetime + 5;
        }
      }
    }
  }
}