import { Lobby } from "../Lobby/Lobby.js";
import { ShipType, Team } from "../interfaces/player.js";

export class LobbyManager{
private lobbies: Map<string, Lobby> = new Map();
constructor(){

}

  onCreate(hostId: string, name: string,lobbyName: string, maxPlayers: number): Lobby{
     const newLobby= new Lobby(hostId,name,lobbyName,maxPlayers)
     this.lobbies.set(newLobby.id,newLobby)
     return newLobby
   }

   onJoin(socketId: string, lobbyId: string, username?: string): Lobby | null {
     const lobby = this.lobbies.get(lobbyId);
     if (!lobby) return null;

     // Si el jugador ya está en la sala (por ejemplo es el creador/host), no duplicar
     const existingPlayer = lobby.players.find(p => p.id === socketId);
     if (existingPlayer) {
       if (username && (existingPlayer.username === "Host" || existingPlayer.username === "Jugador")) {
         existingPlayer.username = username;
       }
       return lobby;
     }

     if (lobby.players.length >= lobby.maxPlayers) return null; 
     const redCount = lobby.players.filter(p => p.team === "red").length;
     const blueCount = lobby.players.filter(p => p.team === "blue").length;
     const assignedTeam: Team = blueCount < redCount ? "blue" : "red";
     lobby.players.push({ 
       id: socketId, 
       username: username?.trim() || "Jugador", 
       team: assignedTeam, 
       shipType: "pirate" as ShipType 
     });
     return lobby;
   }

   onDisconnect(socketId: string): Lobby | null {
  for (const lobby of this.lobbies.values()) {
    if (lobby.players.some(p => p.id === socketId)) {
      lobby.players = lobby.players.filter(p => p.id !== socketId);
      
      if (lobby.players.length === 0) {
        this.lobbies.delete(lobby.id);
        return null;
      }
      
      return lobby;
    }
  }
  return null;
}

   onLeave(socketId:string,lobbyId: string){
        const lobby=this.lobbies.get(lobbyId)

        if(!lobby) return null
         lobby.players = lobby.players.filter(p => p.id !== socketId);
        if (lobby.players.length === 0) {
          this.lobbies.delete(lobbyId);
          return null;
        }

    return lobby;
   }

  getLobbies(): Lobby[] {
    return Array.from(this.lobbies.values());
  }

  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  updatePlayerInfo(socketId: string, lobbyId: string, username: string, team: Team, shipType: ShipType): Lobby | null {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;
    lobby.updatePlayerInfo(socketId, username, team, shipType);
    return lobby;
  }

}