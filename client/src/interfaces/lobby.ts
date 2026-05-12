import type { ShipType, Team } from "./player";

export interface ILobbyPlayer {
  id: string;
  username: string;
  team: Team;
  shipType: ShipType;
}

export interface ILobby{
   id?: string;
   hostId?: string;
   name?: string;
   lobbyName: string;
   maxPlayers: number;
   players: ILobbyPlayer[];
   status?: "waiting" | "playing";
}
