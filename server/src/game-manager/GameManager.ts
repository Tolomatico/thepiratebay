import { Player } from "../player-manager/Player.js";
import { ProjectileManager } from "../projectile-manager/ProjectileManager.js";

export class GameManager {
  private players: Map<string, Player> = new Map();
  private projectileManager: ProjectileManager;


  constructor(){
    this.projectileManager = new ProjectileManager(this);
  }

respawnPlayer(id: string, position: { x: number; y: number; z: number }, lobbyId: string) {
    const player = this.players.get(id);
    if (!player) {
      return null;
    }
    player.lobbyId = lobbyId;
    player.position = position;
    player.health = player.maxHealth;
    return player;
  }

  getPlayer(id: string): Player | undefined {
  return this.players.get(id);
}

  addPlayer(id: string, lobbyId?: string): Player {
  const player = new Player(id);
  if (lobbyId) player.lobbyId = lobbyId;
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
    damage: number,
    projectileId: string,
    lobbyId: string
  ) {
    this.projectileManager.addProjectile(position, direction, ownerId, damage,projectileId,lobbyId);
  }


  update(delta: number): { id: string; damage: number; health: number, projectileId: string }[] {
  return this.projectileManager.update(delta);
}
}