import { Server } from "socket.io";
import { GameManager } from "../game-manager/GameManager.js";
import { LobbyManager } from "../lobby-manager/LobbyManager.js";

interface MoveData {
  position: { x: number; y: number; z: number };
  rotation: { y: number };
}


export class SocketManager {
    private io: Server;
    public gameManager: GameManager;
    public lobbyManager:LobbyManager
    constructor(io: Server,gameManager:GameManager,lobbyManager:LobbyManager) {
        this.io = io;
        this.gameManager = gameManager;
        this.lobbyManager=lobbyManager
        this.setupEvents()
    }

        emitHits(hits: { id: string; damage: number; health: number, projectileId: string }[]) {
        for (const hit of hits) {
            const player = this.gameManager.getPlayer(hit.id);
            if (player?.lobbyId) {
            this.io.to(player.lobbyId).emit("playerDamaged", hit);
            }
        }
        }

    

    private setupEvents() {
        this.io.on("connection", (socket: any) => {

         // Lobby 

         // Obtener lobbies
           socket.on("getLobbies",()=>{
            socket.emit("lobbies",this.lobbyManager.getLobbies())
           })
           
         // Crear lobby
           socket.on("createLobby",(data:{name:string,lobbyName:string,maxPlayers:number})=>{
                  const {name,maxPlayers,lobbyName}=data
                  const lobby= this.lobbyManager.onCreate(socket.id,name,lobbyName,maxPlayers)
                  socket.join(lobby.id)
                  socket.emit("lobbyCreated",lobby)
                  this.io.emit("lobbiesUpdated",this.lobbyManager.getLobbies())
           })

// Cliente se une al lobby
             socket.on("joinLobby",(data:{ lobbyId:string })=>{
                 const { lobbyId }=data
                 const lobby=this.lobbyManager.onJoin(socket.id,lobbyId)
                if (!lobby) {
                     socket.emit("lobbyError", "Lobby lleno o no existe");
                     return;
                }
                socket.join(lobbyId)
                socket.emit("lobbyJoined",lobby)
                
                // Añadir jugador al GameManager cuando entra en un lobby
                if (!this.gameManager.getPlayer(socket.id)) {
                    this.gameManager.addPlayer(socket.id);
                    // Enviarle los jugadores existentes
                    socket.emit("currentPlayers", this.gameManager.getState());
                }
                
                // Notificar a los del lobby que llegó un nuevo jugador (con posición inicial por defecto)
                socket.to(lobbyId).emit("playerJoined", { id: socket.id, position: { x: 0, y: 0, z: 0 }, rotation: { y: 0 } });
                this.io.to(lobbyId).emit("lobbyUpdated", lobby)
                this.io.emit("lobbiesUpdated", this.lobbyManager.getLobbies());
             })

         // Cliente abandona el lobby
            socket.on("leaveLobby", (data: { lobbyId: string }) => {
            const { lobbyId }=data
            const lobby = this.lobbyManager.onLeave(socket.id,lobbyId);
            socket.leave(lobbyId);
            this.io.emit("lobbiesUpdated", this.lobbyManager.getLobbies());
            });

        // Un jugador está listo
socket.on("playerReady", () => {
  const lobbyId = [...socket.rooms].find(r => r !== socket.id);
  if (lobbyId) {
    const others = this.gameManager.getState().filter(p => p.id !== socket.id);
    socket.emit("currentPlayers", others);
    socket.to(lobbyId).emit("playerJoined", { id: socket.id });
  }
});

     

socket.on("playerMove", (data: {position: { x: number; y: number; z: number }; rotation: { y: number }; lobbyId: string }) => {
const isNewPlayer = !this.gameManager.getPlayer(socket.id);
  if (isNewPlayer) {
    this.gameManager.addPlayer(socket.id);
  }

  // siempre asegurar que está en la room y tiene lobbyId
  if (!socket.rooms.has(data.lobbyId)) {
    socket.join(data.lobbyId);
  }
  
  // siempre actualizar lobbyId
  const player = this.gameManager.getPlayer(socket.id);
  if (player) player.lobbyId = data.lobbyId; // ← fuera del if

  this.gameManager.movePlayer(socket.id, data.position, data.rotation);

  const lobbyId = [...socket.rooms].find(r => r !== socket.id);
  
  if (lobbyId) {
    // Notificar a los demás del lobby
    socket.to(lobbyId).emit("playerMoved", { id: socket.id, ...data });
  } else {
    // Fallback: emitir a todos si no hay lobby (backwards compatibility)
    socket.broadcast.emit("playerMoved", { id: socket.id, ...data });
  }
});
            

socket.on("playerShoot", (data: { 
             type: string;
             position: { x: number; y: number; z: number };
             direction: { x: number; y: number; z: number };
             damage: number;
             projectileId: string;
             }) => {
                  
          this.gameManager.addProjectile(data.position, data.direction, socket.id, data.damage,data.projectileId)
          const lobbyId = [...socket.rooms].find(r => r !== socket.id);
             
             if (lobbyId) {
             socket.to(lobbyId).emit("playerShoot", {
                 id: socket.id,
                 type: data.type,
                 projectileId: data.projectileId
             });
             } else {
               // Fallback: emitir a todos si no hay lobby
               socket.broadcast.emit("playerShoot", {
                 id: socket.id,
                 type: data.type,
                 projectileId: data.projectileId
               });
             }
             });
            // jugador se desconecta
            socket.on("disconnect", () => {
                const lobbyId = [...socket.rooms].find(r => r !== socket.id);
                
                this.gameManager.removePlayer(socket.id);
                this.lobbyManager.onDisconnect(socket.id);
                
                // Notificar a todos los demás (backwards compatibility)
                this.io.emit("playerDisconnected", { id: socket.id });
                this.io.emit("lobbiesUpdated", this.lobbyManager.getLobbies());
            });
        });
}
}