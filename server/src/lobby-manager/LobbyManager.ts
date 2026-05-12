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

   onJoin(socketId: string, lobbyId: string):Lobby | null{
     
    const lobby = this.lobbies.get(lobbyId);

      if (!lobby) return null;
      if (lobby.players.length >= lobby.maxPlayers) return null; 
      if (lobby.players.some(p => p.id === socketId)) return null;   
      
      lobby.players.push({ id: socketId, username: "Jugador", team: "red" as Team, shipType: "pirate" as ShipType });
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

  updatePlayerInfo(socketId: string, lobbyId: string, username: string, team: Team, shipType: ShipType): Lobby | null {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;
    lobby.updatePlayerInfo(socketId, username, team, shipType);
    return lobby;
  }

}