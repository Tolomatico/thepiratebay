
export type ShipType = "english" | "pirate";
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

export interface ShipStats {
  health: number;
  speed: number;
  damage: number;
  hitbox: { x: number; y: number; z: number };
  model: string;
}

export const SHIPS: Record<ShipType, ShipStats> = {
  pirate: {
    health: 500,
    speed: 0.05,
    damage: 30,
    hitbox: { x: 8, y: 8, z: 8 },
    model: "/models/pirate.glb"
  },
  english: {
    health: 800,
    speed: 0.03,
    damage: 50,
    hitbox: { x: 12, y: 12, z: 12 },
    model: "/models/english.glb"
  }
}