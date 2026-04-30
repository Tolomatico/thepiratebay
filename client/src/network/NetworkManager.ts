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

    constructor() {
        this.socket = io(`${import.meta.env.VITE_BACK_URL || 'http://localhost:3001'} `);
        this.setupEvents();
    }

    private setupEvents() {
        this.socket.on("connect", () => {
            console.log(`conectado al servidor: ${this.socket.id}`);
        });
  }


onCurrentPlayers(callback: (data: PlayerMovedData[]) => void) {
  this.socket.on("currentPlayers", callback);
}

onPlayerJoined(callback: (data: { id: string }) => void) {
  this.socket.on("playerJoined", callback);
}

  emitMove(data: MoveData) {
    this.socket.emit("playerMove", data);
  }

  onPlayerMoved(callback: (data: PlayerMovedData) => void) {
    this.socket.on("playerMoved", callback);
  }

  onPlayerDisconnected(callback: (data: PlayerDisconnectedData) => void) {
    this.socket.on("playerDisconnected", callback);
  }

 emitShoot(data: { type: "front" | "left" | "right" }) {
  this.socket.emit("playerShoot", data);
}

onPlayerShoot(callback: (data: { id: string; type: "front" | "left" | "right" }) => void) {
  this.socket.on("playerShoot", (data) => {
  console.log("disparo recibido en networkmanager", data);
  callback(data);
});
}
}