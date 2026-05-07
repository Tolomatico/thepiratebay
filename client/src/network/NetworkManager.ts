import { io, Socket } from "socket.io-client";

interface MoveData {
    position: { x: number; y: number; z: number };
    rotation: { y: number };
}

interface PlayerMovedData extends MoveData {
    id: string;
}

interface PlayerDisconnectedData {
    id: string;
}
export class NetworkManager {
    socket: Socket;
    private currentLobbyId: string | null = null;

    constructor() {
       //this.socket = io(`https://thepiratebay.onrender.com`);
       this.socket = io(`http://localhost:3000`);
        this.setupEvents();
    }

    private setupEvents() {
        this.socket.on("connect", () => {
            console.log(`conectado al servidor: ${this.socket.id}`);
        });
    }

    onLobbyError(callback: (message: string) => void) {
        this.socket.on("lobbyError", (data) => {
    callback(data);
  });
    }

    emitRespawn(position: { x: number; y: number; z: number }) {
  this.socket.emit("playerRespawn", { position, lobbyId: this.currentLobbyId });
}

   onPlayerRespawn(callback: (data: { id: string; position: { x: number; y: number; z: number }, lobbyId: string }) => void) {
    this.socket.on("playerRespawn", callback);
   }


    // pedir lista de lobbys
    getLobbies(callback: (lobbies: any[]) => void) {
  this.socket.emit("getLobbies");
  this.socket.once("lobbies", callback);
}

// crear lobby
createLobby(name: string,lobbyName: string, maxPlayers: number, callback: (lobby: any) => void) {
  this.socket.emit("createLobby", { name,lobbyName, maxPlayers });
  this.socket.once("lobbyCreated", callback);
}

// unirse a lobby
joinLobby(lobbyId: string, callback: (lobby: any) => void) {
  this.socket.once("lobbyJoined", callback);
   this.socket.once("lobbyError", (msg) => {
    if(msg.includes("error")){
      this.socket.off("lobbyJoined", callback);
    }
  });
  this.socket.emit("joinLobby", { lobbyId });
}

emitReady() {
  this.socket.emit("playerReady");
}

// salir del lobby
leaveLobby(lobbyId: string) {
  this.socket.emit("leaveLobby", { lobbyId });
}

// escuchar actualizaciones
onLobbiesUpdated(callback: (lobbies: any[]) => void) {
  this.socket.on("lobbiesUpdated", callback);
}

onLobbyUpdated(callback: (lobby: any) => void) {
  this.socket.on("lobbyUpdated", callback);
}


onCurrentPlayers(callback: (data: PlayerMovedData[]) => void) {
  this.socket.on("currentPlayers", callback);
}

onPlayerJoined(callback: (data: { id: string; position?: { x: number; y: number; z: number }; rotation?: { y: number } }) => void) {
  this.socket.on("playerJoined", callback);
}

  emitMove(data: MoveData) {
    if (!this.currentLobbyId) {
      // Emitir sin lobbyId si no hay
      this.socket.emit("playerMove", {...data, lobbyId: ""});
      return;
    }
    this.socket.emit("playerMove", {...data,lobbyId:this.currentLobbyId});
  }

  setLobbyId(id: string) {
  this.currentLobbyId = id;
}

  onPlayerMoved(callback: (data: PlayerMovedData) => void) {
    this.socket.on("playerMoved", callback);
  }

  onPlayerDisconnected(callback: (data: PlayerDisconnectedData) => void) {
    this.socket.on("playerDisconnected", callback);
  }

emitShoot(data: {
   type: "front" | "left" | "right";
   position: { x: number; y: number; z: number };
   direction: { x: number; y: number; z: number };
   damage: number;
   projectileId: string;
 }) {
   this.socket.emit("playerShoot", {...data, lobbyId: this.currentLobbyId || ""});
 }

onPlayerDamaged(callback: (data: { id: string; damage: number; health: number,projectileId:string }) => void) {
  this.socket.on("playerDamaged", callback);
  
}

onPlayerShoot(callback: (data: { id: string; type: "front" | "left" | "right", projectileId: string }) => void) {
  this.socket.on("playerShoot", (data) => {
  callback(data);
});
}
}