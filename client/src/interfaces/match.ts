import type { ShipType, Team } from "./player";

export interface PlayerMatchReward {
  id: string;
  userId?: string;
  username: string;
  team: Team;
  shipType: ShipType;
  kills: number;
  deaths: number;
  damageDealt: number;
  isWinner: boolean;
  goldEarned: number;
  xpEarned: number;
}

export interface MatchMVP {
  id: string;
  username: string;
  team: Team;
  value: number;
  title: string;
}

export interface MatchResult {
  id: string;
  lobbyId: string;
  lobbyName: string;
  winnerTeam: Team | "draw";
  blueKills: number;
  redKills: number;
  targetKills: number;
  durationSec: number;
  mvpKiller: MatchMVP | null;
  mvpDamage: MatchMVP | null;
  players: PlayerMatchReward[];
  timestamp: number;
}
