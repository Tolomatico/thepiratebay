import { Player } from "../player-manager/Player.js";

export class GameManager {
  private players: Map<string, Player> = new Map();

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
}