import { Server } from "http";
import { GameManager } from "../game-manager/GameManager";

interface MoveData {
  position: { x: number; y: number; z: number };
  rotation: { y: number };
}


export class SocketManager {
    private io: Server;
    private gameManager: GameManager;
    constructor(io: Server) {
        this.io = io;
        this.gameManager = new GameManager();
        this.setupEvents()
    }

    private setupEvents() {
        this.io.on("connection", (socket: any) => {
            this.gameManager.addPlayer(socket.id);

             // mandar al nuevo jugador todos los que ya están
            socket.emit("currentPlayers", this.gameManager.getState().filter(p => p.id !== socket.id));
            // ← acá van los eventos
            socket.on("playerMove", (data: MoveData) => {
                this.gameManager.movePlayer(socket.id, data.position, data.rotation);
      
                // broadcast a todos menos al emisor
                this.io.emit("playerMoved", {
                    id: socket.id,
                    ...data
                });
            }); 

            socket.on("playerShoot", (data:{type:string}) => {
                console.log("disparo",data.type)
  socket.broadcast.emit("playerShoot", {
    id: socket.id,
    type: data.type
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