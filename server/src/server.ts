import { createServer } from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { SocketManager } from "./socket-manager/SocketManager.js";
import { GameLoop } from "./game-loop/GameLoop.js";
import { GameManager } from "./game-manager/GameManager.js";
import { LobbyManager } from "./lobby-manager/LobbyManager.js";
import authRoutes from "./routes/authRoutes.js";
import { initDb } from "./db/initDb.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Middlewares globales de Express
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Rutas de API REST
app.use("/api/auth", authRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "The Pirate Bay API", timestamp: new Date() });
});

const io = new Server(server, {
    pingTimeout: 5000,   // ← tiempo sin respuesta antes de desconectar
    pingInterval: 2000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const gameManager = new GameManager();
const lobbyManager = new LobbyManager();
const socketManager = new SocketManager(io, gameManager, lobbyManager);
const gameLoop = new GameLoop("fixed", gameManager, (hits) => {
    socketManager.emitHits(hits);
});
gameLoop.start();

const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
    console.log(`⚓ [SERVER] The Pirate Bay corriendo en puerto ${PORT}`);
    // Inicializar o verificar tablas en PostgreSQL
    await initDb();
});

