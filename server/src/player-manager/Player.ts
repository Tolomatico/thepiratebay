import { SHIPS, ShipType, Team } from "../interfaces/player.js";

export class Player {
  id: string;
  userId?: string;
  username: string;
  team: Team;
  shipType: ShipType;
  position: { x: number; y: number; z: number };
  rotation: { y: number };
  lobbyId: string | null = null;
  health: number;
  isAlive: boolean = true;
  kills: number = 0;
  deaths: number = 0;
  damageDealt: number = 0;
  goldInHold: number = 0;
  constructor(id: string,username:string,team:Team,shipType:ShipType,position:{x:number,y:number,z:number},rotation:{y:number}, userId?: string) {
    this.id = id;
    this.userId = userId;
    this.position = position;
    this.rotation = rotation;
    this.username = username;
    this.team = team;
    this.shipType = shipType;
    this.isAlive=true;
    this.kills = 0;
    this.deaths = 0;
    this.damageDealt = 0;
    this.goldInHold = 0;
    if (shipType && SHIPS[shipType]) {
      this.health = SHIPS[shipType].health;
    } else {
      this.health = 600; // default
    }
  }

  setShipType(shipType: ShipType) {
    this.shipType = shipType;
    if (SHIPS[shipType]) {
      this.health = SHIPS[shipType].health;
    }
  }

  resetHealth() {
    const type = this.shipType || "pirate";
    this.health = SHIPS[type]?.health || 600;
    this.isAlive = true;
  }

  move(position: { x: number; y: number; z: number }, rotation: { y: number }) {
    this.position = position;
    this.rotation = rotation;
  }
   takeDamage(amount: number) {
    if(!this.isAlive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }
  die(){
    this.health = 0;
    this.isAlive = false;
    const lost = Math.floor(this.goldInHold * 0.5);
    this.goldInHold = Math.max(0, this.goldInHold - lost);
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

  getScoreboardData() {
    return {
      id: this.id,
      username: this.username,
      team: this.team,
      shipType: this.shipType,
      kills: this.kills,
      deaths: this.deaths,
      damageDealt: this.damageDealt,
      health: this.health,
      isAlive: this.isAlive,
      goldInHold: this.goldInHold,
    };
  }
}