import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { SocketManager } from "./socket-manager/SocketManager.js";
import { GameLoop } from "./game-loop/GameLoop.js";
import { GameManager } from "./game-manager/GameManager.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const gameManager = new GameManager();
new SocketManager(io as any,gameManager);
const gameLoop = new GameLoop("fixed",gameManager);
gameLoop.start();



server.listen(3001, () => {
    console.log("server running on port 3001");
});
