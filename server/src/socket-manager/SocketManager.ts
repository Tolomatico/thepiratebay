import { Server } from "http";
import { GameManager } from "../game-manager/GameManager.js";

interface MoveData {
  position: { x: number; y: number; z: number };
  rotation: { y: number };
}


export class SocketManager {
    private io: Server;
    public gameManager: GameManager;
    constructor(io: Server,gameManager:GameManager) {
        this.io = io;
        this.gameManager = gameManager;
        this.setupEvents()
    }

    emitHits(hits: { id: string; damage: number; health: number, projectileId: string }[]) {
        for (const hit of hits) {
            this.io.emit("playerDamaged", hit);
        }
    }

    private setupEvents() {
        this.io.on("connection", (socket: any) => {
            this.gameManager.addPlayer(socket.id);

             // mandar al nuevo jugador todos los que ya están
            socket.emit("currentPlayers", this.gameManager.getState().filter((p: any) => p.id !== socket.id));
            // ← acá van los eventos
            socket.on("playerMove", (data: MoveData) => {
                this.gameManager.movePlayer(socket.id, data.position, data.rotation);
      
                // broadcast a todos menos al emisor
                this.io.emit("playerMoved", {
                    id: socket.id,
                    ...data
                });
            }); 
            

            socket.on("playerShoot", (data: { 
  type: string;
  position: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  damage: number;
  projectileId: string;
}) => {
    
this.gameManager.addProjectile(data.position, data.direction, socket.id, data.damage,data.projectileId)
  socket.broadcast.emit("playerShoot", {
    id: socket.id,
    type: data.type,
    projectileId: data.projectileId
  });
});
            // jugador se desconecta
            socket.on("disconnect", () => {
                this.gameManager.removePlayer(socket.id);
      
                // avisar a todos que se fue
                this.io.emit("playerDisconnected", { id: socket.id });
            });
        });
}
}