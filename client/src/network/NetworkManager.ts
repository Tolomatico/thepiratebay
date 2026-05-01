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
        this.socket = io(`https://thepiratebay.onrender.com`);
        //this.socket = io(`http://localhost:3001`);
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

 emitShoot(data: {
  type: "front" | "left" | "right";
  position: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  damage: number;
}) {
  this.socket.emit("playerShoot", data);
}

onPlayerDamaged(callback: (data: { id: string; damage: number; health: number }) => void) {
  this.socket.on("playerDamaged", callback);
}

onPlayerShoot(callback: (data: { id: string; type: "front" | "left" | "right" }) => void) {
  this.socket.on("playerShoot", (data) => {
  callback(data);
});
}
}