import { ShipType, Team } from "../interfaces/player.js";

interface LobbyPlayer {
  id: string;
  username: string;
  team: Team;
  shipType: ShipType;
}

export class Lobby{

  id: string;
  hostId: string;
  name: string;
  lobbyName: string;
  maxPlayers: number;
  players: LobbyPlayer[] = [];
  status: "waiting" | "playing" = "waiting";

  constructor(hostId: string, name: string,lobbyName: string, maxPlayers: number ){

    this.id = crypto.randomUUID();
    this.hostId = hostId;
    this.name = name;
    this.lobbyName = lobbyName;
    this.maxPlayers = maxPlayers;
    this.players.push({ id: hostId, username: "Host", team: "red", shipType: "pirate" });
  }

  updatePlayerInfo(playerId: string, username: string, team: Team, shipType: ShipType) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.username = username;
      player.team = team;
      player.shipType = shipType;
    }
  }

}