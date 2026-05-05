import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { SocketManager } from "./socket-manager/SocketManager.js";
import { GameLoop } from "./game-loop/GameLoop.js";
import { GameManager } from "./game-manager/GameManager.js";
import { LobbyManager } from "./lobby-manager/LobbyManager.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    pingTimeout: 5000,   // ← tiempo sin respuesta antes de desconectar
    pingInterval: 2000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const gameManager = new GameManager();
const lobbyManager= new LobbyManager()
const socketManager = new SocketManager(io,gameManager,lobbyManager);
const gameLoop = new GameLoop("fixed",gameManager,(hits) => {
  socketManager.emitHits(hits);
});
gameLoop.start();



server.listen(3001, () => {
    console.log("server running on port 3001");
});
