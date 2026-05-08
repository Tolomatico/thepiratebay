import { ShipType, Team } from "../interfaces/player.js";

export class Player {
  id: string;
  username: string;
  team: Team;
  shipType: ShipType;
  position: { x: number; y: number; z: number };
  rotation: { y: number };
  maxHealth: number = 500;
  health: number = 500;
  lobbyId: string | null = null;
  constructor(id: string,username:string,team:Team,shipType:ShipType,position:{x:number,y:number,z:number},rotation:{y:number},health:number) {
    this.id = id;
    this.position = position;
    this.rotation = rotation;
    this.health = health;
    this.username = username;
    this.team = team;
    this.shipType = shipType;
  }

  move(position: { x: number; y: number; z: number }, rotation: { y: number }) {
    this.position = position;
    this.rotation = rotation;
  }
   takeDamage(amount: number) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }

  getPlayerData() {
    return {
      id: this.id,
      username: this.username,
      team: this.team,
      shipType: this.shipType,
      position: this.position,
      rotation: this.rotation,
      health: this.health
    };
  }
}