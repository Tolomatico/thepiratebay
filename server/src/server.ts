import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { SocketManager } from "./socket-manager/SocketManager.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

new SocketManager(io as any);

server.listen(3001, () => {
    console.log("server running on port 3001");
});