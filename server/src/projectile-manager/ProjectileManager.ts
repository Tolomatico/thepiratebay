

import { GameManager } from "../game-manager/GameManager.js";
import { ServerProjectile } from "./ServerProjectile.js";


export class ProjectileManager {
  private projectiles: ServerProjectile[] = [];

  constructor(private gameManager: GameManager) {}

  addProjectile(
    position: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    ownerId: string,
    damage: number
  ) {
    this.projectiles.push(new ServerProjectile(position, direction, ownerId, damage));
  }

  update(delta: number): { id: string; damage: number; health: number }[] {
    const hits: { id: string; damage: number; health: number }[] = [];

    for (const projectile of this.projectiles) {
      projectile.update(delta);
    }

    this.checkCollisions(hits);

    this.projectiles = this.projectiles.filter(p => p.isAlive());

    return hits; // ← devuelve los impactos para que GameManager los emita
  }

  private checkCollisions(hits: { id: string; damage: number; health: number }[]) {
    const players = this.gameManager.getState();

    for (const projectile of this.projectiles) {
      for (const player of players) {
        if (player.id === projectile.ownerId) continue; // no te dañás a vos mismo

        const dx = projectile.position.x - player.position.x;
        const dy = projectile.position.y - player.position.y;
        const dz = projectile.position.z - player.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 2.5) { // hitRadius
         // player.takeDamage(projectile.damage);
          projectile.age = projectile.lifetime + 1; // matar proyectil
          hits.push({ id: player.id, damage: projectile.damage, health: player.health });
        }
      }
    }
  }
}