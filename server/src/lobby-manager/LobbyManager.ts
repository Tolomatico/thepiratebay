import { Lobby } from "../Lobby/Lobby.js";

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
      if (lobby.players.includes(socketId)) return null;   
      
      lobby.players.push(socketId);
      return lobby;
   }

   onDisconnect(socketId: string): Lobby | null {
  // buscar en qué lobby está el jugador
  for (const lobby of this.lobbies.values()) {
    if (lobby.players.includes(socketId)) {
      lobby.players = lobby.players.filter(id => id !== socketId);
      
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
         lobby.players = lobby.players.filter(id => id !== socketId);
      // si quedó vacío, eliminarlo
        if (lobby.players.length === 0) {
          this.lobbies.delete(lobbyId);
          return null;
        }

    return lobby;
   }

  getLobbies(): Lobby[] {
  return Array.from(this.lobbies.values());
}

}