import { PlayerData, SHIPS, Team } from "../interfaces/player.js";
import { Player } from "../player-manager/Player.js";
import { ProjectileManager } from "../projectile-manager/ProjectileManager.js";
import { MatchResult, PlayerMatchReward } from "../interfaces/match.js";

export class GameManager {
  private players: Map<string, Player> = new Map();
  private projectileManager: ProjectileManager;
  private lobbyStartTimes: Map<string, number> = new Map();
  private finishedLobbies: Set<string> = new Set();

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
    const shipType = player.shipType || "pirate";
    player.health = SHIPS[shipType]?.health || 600;
    player.isAlive = true;
    return player;
  }

  getPlayer(id: string): Player | undefined {
  return this.players.get(id);
}

 addPlayer(data: Partial<PlayerData> & { userId?: string }): Player {
  const shipType = data.shipType || "pirate";
  const player = new Player(
    data.id!,
    data.username || "Jugador",
    data.team || "red",
    shipType,
    data.position || { x: 0, y: 0, z: 0 },
    data.rotation || { y: 0 },
    data.userId,
  );
  if (typeof data.health === "number") {
    player.health = data.health;
  }
  this.players.set(player.id, player);
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
    lobbyId: string,
    ownerTeam: string
  ) {
    this.projectileManager.addProjectile(position, direction, ownerId, damage,projectileId,lobbyId,ownerTeam);
  }


  getLobbyScoreboard(lobbyId: string) {
    return Array.from(this.players.values())
      .filter(p => p.lobbyId === lobbyId)
      .map(p => p.getScoreboardData());
  }

  startLobbyMatch(lobbyId: string) {
    if (!this.lobbyStartTimes.has(lobbyId)) {
      this.lobbyStartTimes.set(lobbyId, Date.now());
      this.finishedLobbies.delete(lobbyId);
    }
  }

  resetLobbyMatch(lobbyId: string) {
    this.lobbyStartTimes.delete(lobbyId);
    this.finishedLobbies.delete(lobbyId);
  }

  checkMatchEnd(lobbyId: string, lobbyName: string, targetKills: number = 2): MatchResult | null {
    if (!lobbyId || this.finishedLobbies.has(lobbyId)) return null;

    const lobbyPlayers = Array.from(this.players.values()).filter(p => p.lobbyId === lobbyId);
    if (lobbyPlayers.length === 0) return null;

    const blueKills = lobbyPlayers
      .filter(p => p.team === "blue")
      .reduce((acc, p) => acc + (p.kills || 0), 0);

    const redKills = lobbyPlayers
      .filter(p => p.team === "red")
      .reduce((acc, p) => acc + (p.kills || 0), 0);

    if (blueKills < targetKills && redKills < targetKills) {
      return null;
    }

    const winnerTeam: Team = blueKills >= targetKills ? "blue" : "red";
    this.finishedLobbies.add(lobbyId);

    const startTime = this.lobbyStartTimes.get(lobbyId) || Date.now();
    const durationSec = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

    // MVPs
    let mvpKiller: Player | null = null;
    let mvpDamage: Player | null = null;

    for (const p of lobbyPlayers) {
      if (!mvpKiller || p.kills > mvpKiller.kills) {
        mvpKiller = p;
      }
      if (!mvpDamage || p.damageDealt > mvpDamage.damageDealt) {
        mvpDamage = p;
      }
    }

    const playerRewards: PlayerMatchReward[] = lobbyPlayers.map(p => {
      const isWinner = p.team === winnerTeam;
      const baseGold = isWinner ? 200 : 80;
      const baseXP = isWinner ? 400 : 150;
      const killGold = p.kills * 25;
      const killXP = p.kills * 50;
      const damageGold = Math.floor(p.damageDealt / 50);
      const damageXP = Math.floor(p.damageDealt / 25);
      const totalGold = baseGold + killGold + damageGold + (p.goldInHold || 0);
      const totalXP = baseXP + killXP + damageXP;

      return {
        id: p.id,
        userId: p.userId,
        username: p.username,
        team: p.team,
        shipType: p.shipType,
        kills: p.kills,
        deaths: p.deaths,
        damageDealt: p.damageDealt,
        isWinner,
        goldEarned: totalGold,
        xpEarned: totalXP,
      };
    });

    return {
      id: crypto.randomUUID(),
      lobbyId,
      lobbyName: lobbyName || "Batalla Naval",
      winnerTeam,
      blueKills,
      redKills,
      targetKills,
      durationSec,
      mvpKiller: mvpKiller && mvpKiller.kills > 0 ? {
        id: mvpKiller.id,
        username: mvpKiller.username,
        team: mvpKiller.team,
        value: mvpKiller.kills,
        title: "Rey del Cañón 👑",
      } : null,
      mvpDamage: mvpDamage && mvpDamage.damageDealt > 0 ? {
        id: mvpDamage.id,
        username: mvpDamage.username,
        team: mvpDamage.team,
        value: mvpDamage.damageDealt,
        title: "Terror del Mar 💥",
      } : null,
      players: playerRewards,
      timestamp: Date.now(),
    };
  }

  update(delta: number): { id: string; damage: number; health: number; projectileId: string; kill?: any }[] {
    return this.projectileManager.update(delta);
  }
}