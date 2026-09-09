import { io, Socket } from "socket.io-client";
import type { PlayerData, ScoreboardPlayer } from "../interfaces/player";
import type { ChatMessage, KillEvent } from "../interfaces/chat";
import type { MatchResult } from "../interfaces/match";



interface PlayerDisconnectedData {
  id: string;
}
export class NetworkManager {
  socket: Socket;
  private currentLobbyId: string | null = null;

  constructor() {
    const serverUrl = import.meta.env.VITE_BACK_URL || "https://thepiratebay.onrender.com";
    this.socket = io(serverUrl);
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
  createLobby(name: string, lobbyName: string, maxPlayers: number, callback: (lobby: any) => void) {
    const userId = localStorage.getItem("pirate_user_id") || undefined;
    this.socket.emit("createLobby", { name, lobbyName, maxPlayers, userId });
    this.socket.once("lobbyCreated", callback);
  }

  // unirse a lobby
  joinLobby(lobbyId: string, usernameOrCallback: string | ((lobby: any) => void), maybeCallback?: (lobby: any) => void) {
    let username: string | undefined;
    let callback: (lobby: any) => void;
    if (typeof usernameOrCallback === "function") {
      callback = usernameOrCallback;
    } else {
      username = usernameOrCallback;
      callback = maybeCallback || (() => {});
    }
    this.socket.once("lobbyJoined", callback);
    this.socket.once("lobbyError", (msg) => {
      if (msg.includes("error")) {
        this.socket.off("lobbyJoined", callback);
      }
    });
    const userId = localStorage.getItem("pirate_user_id") || undefined;
    this.socket.emit("joinLobby", { lobbyId, username, userId });
  }

  emitReady() {
    this.socket.emit("playerReady");
  }

  emitPlayerInfo(username: string, team: string, shipType: string) {
    const userId = localStorage.getItem("pirate_user_id") || undefined;
    this.socket.emit("updatePlayerInfo", { username, team, shipType, userId });
  }

  // salir del lobby
  leaveLobby(lobbyId?: string) {
    const id = lobbyId || this.currentLobbyId;
    if (id) {
      this.socket.emit("leaveLobby", { lobbyId: id });
    }
    this.currentLobbyId = null;
  }

  // escuchar actualizaciones
  onLobbiesUpdated(callback: (lobbies: any[]) => void) {
    this.socket.on("lobbiesUpdated", callback);
  }

  onLobbyUpdated(callback: (lobby: any) => void) {
    this.socket.on("lobbyUpdated", callback);
  }


  onCurrentPlayers(callback: (data: PlayerData[]) => void) {
    this.socket.on("currentPlayers", callback);
  }

  onPlayerJoined(callback: (data: PlayerData) => void) {
    this.socket.on("playerJoined", callback);
  }

  emitMove(data: PlayerData) {
    if (!this.currentLobbyId) {
      this.socket.emit("playerMove", { ...data, lobbyId: "" });
      return;
    }
    this.socket.emit("playerMove", { ...data, lobbyId: this.currentLobbyId });
  }

  setLobbyId(id: string) {
    this.currentLobbyId = id;
  }

  getCurrentLobbyId(): string | null {
    return this.currentLobbyId;
  }

  onPlayerMoved(callback: (data: PlayerData) => void) {
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
    ownerTeam: string;
  }) {
    this.socket.emit("playerShoot", { ...data, lobbyId: this.currentLobbyId || "" });
  }

  onPlayerDamaged(callback: (data: { id: string; damage: number; health: number, projectileId: string }) => void) {
    this.socket.on("playerDamaged", callback);

  }

  onPlayerShoot(callback: (data: { id: string; type: "front" | "left" | "right", projectileId: string }) => void) {
    this.socket.on("playerShoot", (data) => {
      callback(data);
    });
  }

  getScoreboard() {
    this.socket.emit("getScoreboard");
  }

  onScoreboardUpdated(callback: (players: ScoreboardPlayer[]) => void) {
    this.socket.on("scoreboardUpdated", callback);
  }

  sendChatMessage(message: string, channel: "all" | "team" = "all") {
    this.socket.emit("sendChatMessage", { message, channel });
  }

  onChatMessage(callback: (message: ChatMessage) => void) {
    this.socket.on("chatMessage", callback);
  }

  offChatMessage(callback?: (message: ChatMessage) => void) {
    if (callback) {
      this.socket.off("chatMessage", callback);
    } else {
      this.socket.off("chatMessage");
    }
  }

  onPlayerKilled(callback: (kill: KillEvent) => void) {
    this.socket.on("playerKilled", callback);
  }

  offPlayerKilled(callback?: (kill: KillEvent) => void) {
    if (callback) {
      this.socket.off("playerKilled", callback);
    } else {
      this.socket.off("playerKilled");
    }
  }

  onMatchEnded(callback: (result: MatchResult) => void) {
    this.socket.on("matchEnded", callback);
  }

  offMatchEnded(callback?: (result: MatchResult) => void) {
    if (callback) {
      this.socket.off("matchEnded", callback);
    } else {
      this.socket.off("matchEnded");
    }
  }
}