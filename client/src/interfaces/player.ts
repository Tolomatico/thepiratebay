
export type ShipType = "fragate" | "pirate";
export type Team = "red" | "blue";
export interface PlayerData {
  id: string;
  username: string;
  team: Team;
  shipType: ShipType;
  position: { x: number; y: number; z: number };
  rotation: { y: number };
  health: number;
}

export interface ScoreboardPlayer {
  id: string;
  username: string;
  team: Team;
  shipType: ShipType;
  kills: number;
  deaths: number;
  damageDealt: number;
  health: number;
  isAlive: boolean;
  goldInHold?: number;
  ping?: number;
}

export interface ShipStats {
  health: number;
  speed: number;
  damage: number;
  hitbox: { x: number; y: number; z: number };
  model: string;
  cannons: {
      front: { damage: number; fireRate: number; quantity: number; speed: number };
      left:  { damage: number; fireRate: number; quantity: number; speed: number };
      right: { damage: number; fireRate: number; quantity: number; speed: number };
  }
}

export const SHIPS: Record<ShipType, ShipStats> = {
  pirate: {
    health: 600,
    speed: 0.06,
    damage: 30,
    hitbox: { x: 3, y: 8, z: 12 },
    model: "/models/pirate.glb",
     cannons: {
      front: { damage: 50, fireRate: 1000, quantity: 1, speed: 0.15 },
      left:  { damage: 50, fireRate: 1500,  quantity: 3, speed: 0.20 },
      right: { damage: 50, fireRate: 1500,  quantity: 3, speed: 0.20 },
    }
  },
  fragate: {
    health: 800,
    speed: 0.03,
    damage: 50,
    hitbox: { x: 8, y: 10, z: 16 },
    model: "/models/fragate.glb",
     cannons: {
      front: { damage: 50, fireRate: 1000, quantity: 1, speed: 0.15 },
      left:  { damage: 50, fireRate: 2500,  quantity: 5, speed: 0.20 },
      right: { damage: 50, fireRate: 2500,  quantity: 5, speed: 0.20 },
    }
  }
}