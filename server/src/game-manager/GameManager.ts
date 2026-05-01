import { Player } from "../player-manager/Player.js";
import { ProjectileManager } from "../projectile-manager/ProjectileManager.js";

export class GameManager {
  private players: Map<string, Player> = new Map();
  private projectileManager: ProjectileManager;


  constructor(){
    this.projectileManager = new ProjectileManager(this);
  }

  addPlayer(id: string): Player {
    const player = new Player(id);
    this.players.set(id, player);
    return player;
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }

  movePlayer(id: string, position: { x: number; y: number; z: number }, rotation: { y: number }) {
    const player = this.players.get(id);
    if (player) player.move(position, rotation);
  }

  getState(): Player[] {
    return Array.from(this.players.values());
  }

  addProjectile(
    position: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    ownerId: string,
    damage: number
  ) {
    console.log(position,direction,ownerId,damage)
    this.projectileManager.addProjectile(position, direction, ownerId, damage);
  }


  update(delta: number): { id: string; damage: number; health: number }[] {
  return this.projectileManager.update(delta);
}
}