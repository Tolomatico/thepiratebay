import { Server } from "socket.io";
import { GameManager } from "../game-manager/GameManager.js";
import { LobbyManager } from "../lobby-manager/LobbyManager.js";
import { SHIPS } from "../interfaces/player.js";
import { ChatMessage, KillEvent } from "../interfaces/chat.js";
import { MatchResult } from "../interfaces/match.js";
import { matchRepository } from "../repositories/MatchRepository.js";
import { userRepository } from "../repositories/UserRepository.js";


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

    broadcastScoreboard(lobbyId: string) {
        if (!lobbyId) return;
        const scoreboard = this.gameManager.getLobbyScoreboard(lobbyId);
        this.io.to(lobbyId).emit("scoreboardUpdated", scoreboard);
    }

    async handleMatchEnded(matchResult: MatchResult) {
        console.log(`🏆 [FIN DE COMBATE] Escuadra ganadora: ${matchResult.winnerTeam.toUpperCase()} en "${matchResult.lobbyName}" (${matchResult.blueKills} - ${matchResult.redKills})`);

        // Notificar inmediatamente a toda la sala
        this.io.to(matchResult.lobbyId).emit("matchEnded", matchResult);

        // 1. Guardar historial en PostgreSQL
        await matchRepository.recordMatch(matchResult);

        // 2. Acreditar recompensas a cada jugador en PostgreSQL
        for (const p of matchResult.players) {
            const identifier = p.userId || p.username;
            await userRepository.addMatchRewards(identifier, {
                goldEarned: p.goldEarned,
                xpEarned: p.xpEarned,
                kills: p.kills,
                deaths: p.deaths,
                damageDealt: p.damageDealt,
                isWinner: p.isWinner
            });
        }
    }

    emitHits(hits: { id: string; damage: number; health: number; projectileId: string; kill?: KillEvent }[]) {
        if (hits.length === 0) return;
        const affectedLobbies = new Set<string>();
        for (const hit of hits) {
            const player = this.gameManager.getPlayer(hit.id);
            const targetLobby = player?.lobbyId || (hit.kill as any)?.lobbyId;
            if (targetLobby) {
                this.io.to(targetLobby).emit("playerDamaged", hit);
                if (hit.kill) {
                    this.io.to(targetLobby).emit("playerKilled", hit.kill);
                }
                affectedLobbies.add(targetLobby);
            } else {
                this.io.emit("playerDamaged", hit);
                if (hit.kill) {
                    this.io.emit("playerKilled", hit.kill);
                }
            }
        }
        for (const lobbyId of affectedLobbies) {
            this.broadcastScoreboard(lobbyId);

            // Verificar si el combate alcanzó la condición de victoria (2 bajas para test rápido)
            const lobby = this.lobbyManager.getLobby(lobbyId);
            const matchResult = this.gameManager.checkMatchEnd(lobbyId, lobby?.lobbyName || "Batalla Naval", 2);
            if (matchResult) {
                this.handleMatchEnded(matchResult);
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
           socket.on("createLobby",(data:{name:string,lobbyName:string,maxPlayers:number,userId?:string})=>{
                  const {name,maxPlayers,lobbyName,userId} = data;
                  const lobby= this.lobbyManager.onCreate(socket.id,name,lobbyName,maxPlayers)
                  socket.join(lobby.id)
                  socket.emit("lobbyCreated",lobby)
                  this.io.emit("lobbiesUpdated",this.lobbyManager.getLobbies())

                  const hostPlayer = lobby.players.find(p => p.id === socket.id);
                  const shipType = hostPlayer?.shipType || "pirate";
                  let existingGamePlayer = this.gameManager.getPlayer(socket.id);
                  if (!existingGamePlayer) {
                      existingGamePlayer = this.gameManager.addPlayer({
                          id: socket.id,
                          userId: userId,
                          username: name || "Host",
                          team: "red",
                          shipType: shipType,
                          position: { x: 0, y: 0, z: 0 },
                          rotation: { y: 0 },
                      });
                  } else {
                      if (userId) existingGamePlayer.userId = userId;
                      existingGamePlayer.username = name || "Host";
                      existingGamePlayer.team = "red";
                      existingGamePlayer.setShipType(shipType);
                      existingGamePlayer.resetHealth();
                  }
                  if (existingGamePlayer) existingGamePlayer.lobbyId = lobby.id;
           })

// Cliente se une al lobby
             socket.on("joinLobby",(data:{ lobbyId:string, username?: string, userId?: string })=>{
                 const { lobbyId, username, userId } = data;
                 const isAlreadyInLobby = this.lobbyManager.getLobby(lobbyId)?.players.some(p => p.id === socket.id);
                 const lobby = this.lobbyManager.onJoin(socket.id, lobbyId, username);
                if (!lobby) {
                     socket.emit("lobbyError", "Lobby lleno o no existe");
                     return;
                }
                socket.join(lobbyId)
                socket.emit("lobbyJoined",lobby)
                
                const lobbyPlayer = lobby.players.find(p => p.id === socket.id);
                const shipType = lobbyPlayer?.shipType || "pirate";
                let existingGamePlayer = this.gameManager.getPlayer(socket.id);
                if (!existingGamePlayer) {
                    existingGamePlayer = this.gameManager.addPlayer({
                        id: socket.id,
                        userId: userId,
                        username: lobbyPlayer?.username || username || "Jugador",
                        team: lobbyPlayer?.team || "blue",
                        shipType: shipType,
                        position: { x: 0, y: 0, z: 0 },
                        rotation: { y: 0 },
                    });
                } else if (lobbyPlayer) {
                    if (userId) existingGamePlayer.userId = userId;
                    existingGamePlayer.team = lobbyPlayer.team;
                    existingGamePlayer.setShipType(shipType);
                    existingGamePlayer.resetHealth();
                    existingGamePlayer.username = lobbyPlayer.username;
                }
                if (existingGamePlayer) existingGamePlayer.lobbyId = lobbyId;

                // Enviarle los jugadores existentes
                socket.emit("currentPlayers", this.gameManager.getState());
                
                // Notificar a los del lobby que llegó un nuevo jugador solo si no estaba previamente
                if (!isAlreadyInLobby) {
                    socket.to(lobbyId).emit("playerJoined", { id: socket.id, position: { x: 0, y: 0, z: 0 }, rotation: { y: 0 } });
                }
                this.io.to(lobbyId).emit("lobbyUpdated", lobby)
                this.io.emit("lobbiesUpdated", this.lobbyManager.getLobbies());
             })

         // Cliente abandona el lobby
            socket.on("leaveLobby", (data: { lobbyId: string }) => {
            const { lobbyId } = data;
            if (!lobbyId) return;
            const remainingLobby = this.lobbyManager.onLeave(socket.id, lobbyId);
            socket.leave(lobbyId);
            if (remainingLobby) {
                this.io.to(lobbyId).emit("lobbyUpdated", remainingLobby);
                this.broadcastScoreboard(lobbyId);
            }
            this.io.emit("lobbiesUpdated", this.lobbyManager.getLobbies());
            });

// Pedir marcador actual de la sala
socket.on("getScoreboard", () => {
  const lobbyId = [...socket.rooms].find(r => r !== socket.id);
  if (lobbyId) {
    socket.emit("scoreboardUpdated", this.gameManager.getLobbyScoreboard(lobbyId));
  }
});

// Un jugador está listo
socket.on("playerReady", () => {
  const lobbyId = [...socket.rooms].find(r => r !== socket.id);
  if (lobbyId) {
    const lobby = this.lobbyManager.getLobby(lobbyId);
    const lobbyPlayer = lobby?.players.find(p => p.id === socket.id);
    let gamePlayer = this.gameManager.getPlayer(socket.id);
    const shipType = lobbyPlayer?.shipType || "pirate";
    if (!gamePlayer && lobbyPlayer) {
      gamePlayer = this.gameManager.addPlayer({
        id: socket.id,
        username: lobbyPlayer.username,
        team: lobbyPlayer.team,
        shipType: shipType,
        position: { x: 0, y: 0, z: 0 },
        rotation: { y: 0 },
      });
    } else if (gamePlayer && lobbyPlayer) {
      gamePlayer.team = lobbyPlayer.team;
      gamePlayer.setShipType(shipType);
      gamePlayer.resetHealth();
      gamePlayer.username = lobbyPlayer.username;
      gamePlayer.lobbyId = lobbyId;
    }
    const others = this.gameManager.getState().filter(p => p.id !== socket.id);
    socket.emit("currentPlayers", others);
    socket.to(lobbyId).emit("playerJoined", { id: socket.id });
    this.gameManager.startLobbyMatch(lobbyId);
    this.broadcastScoreboard(lobbyId);
  }
});

// Actualizar info del jugador en el lobby (username, team, shipType)
socket.on("updatePlayerInfo", (data: { username: string; team: string; shipType: string; userId?: string }) => {
  const lobbyId = [...socket.rooms].find(r => r !== socket.id);
  if (lobbyId) {
    const lobby = this.lobbyManager.updatePlayerInfo(
      socket.id, 
      lobbyId, 
      data.username, 
      data.team as any, 
      data.shipType as any
    );
    if (lobby) {
      this.io.to(lobbyId).emit("lobbyUpdated", lobby);
    }
  }

  // Sincronizar también en GameManager
  let player = this.gameManager.getPlayer(socket.id);
  if (!player) {
    player = this.gameManager.addPlayer({
      id: socket.id,
      userId: data.userId,
      username: data.username,
      team: data.team as any,
      shipType: (data.shipType as any) || "pirate",
      position: { x: 0, y: 0, z: 0 },
      rotation: { y: 0 },
    });
  } else {
    if (data.userId) player.userId = data.userId;
    if (data.username) player.username = data.username;
    if (data.team) player.team = data.team as any;
    if (data.shipType) {
      player.setShipType(data.shipType as any);
      player.resetHealth();
    }
  }
  if (player && lobbyId) {
    player.lobbyId = lobbyId;
    this.broadcastScoreboard(lobbyId);
  }
});

      

socket.on("playerMove", (data:any) => {
  let player = this.gameManager.getPlayer(socket.id);
  if (!player) {
    player = this.gameManager.addPlayer({
      id: socket.id,
      username: data.username,
      team: data.team,
      shipType: data.shipType || "pirate",
      position: data.position,
      rotation: data.rotation,
      health: data.health
    });
    if (data.lobbyId) {
      this.broadcastScoreboard(data.lobbyId);
    }
  } else {
    if (data.username) player.username = data.username;
    if (data.team) player.team = data.team;
    if (data.shipType && player.shipType !== data.shipType) {
      player.setShipType(data.shipType);
      player.resetHealth();
    }
  }

  // siempre asegurar que está en la room y tiene lobbyId
  if (!socket.rooms.has(data.lobbyId)) {
    socket.join(data.lobbyId);
  }
  
  if (player) player.lobbyId = data.lobbyId;

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

socket.on("playerRespawn", (data: { position: { x: number; y: number; z: number } }) => {
  const lobbyId = [...socket.rooms].find(r => r !== socket.id);
  if (lobbyId) {
    socket.to(lobbyId).emit("playerRespawn", { id: socket.id, position: data.position });
    // llamar a respawn para resetear vida y estado
    this.gameManager.respawnPlayer(socket.id, data.position, lobbyId);
    this.broadcastScoreboard(lobbyId);
  } else {
    this.gameManager.respawnPlayer(socket.id, data.position, "");
  }
});      

socket.on("playerShoot", (data: { 
             type: string;
             position: { x: number; y: number; z: number };
             direction: { x: number; y: number; z: number };
             damage: number;
             projectileId: string;
             ownerTeam: string;
             }) => {
                    const lobbyId = [...socket.rooms].find(r => r !== socket.id);
                    if (!lobbyId) return;
                    const player = this.gameManager.getPlayer(socket.id);
                    if (!player || !player.isAlive) return;
                    const shipStats = SHIPS[player.shipType];
                    const canonStats = shipStats.cannons[data.type as "front" | "left" | "right"];
                    this.gameManager.addProjectile(
                      data.position, 
                      data.direction, 
                      socket.id, 
                      canonStats.damage,
                      data.projectileId, 
                      lobbyId,
                      data.ownerTeam);
                   
                    // Notificar a los del lobby que alguien disparó
                    socket.to(lobbyId).emit("playerShoot", {
                       id: socket.id,
                       type: data.type,
                       projectileId: data.projectileId
                   });
             });

            // Chat de texto en el lobby o partida
            socket.on("sendChatMessage", (data: { message: string; channel?: "all" | "team" }) => {
                const lobbyId = [...socket.rooms].find(r => r !== socket.id);
                if (!lobbyId || !data.message?.trim()) return;

                const player = this.gameManager.getPlayer(socket.id);
                const lobby = this.lobbyManager.getLobby(lobbyId);
                const lobbyPlayer = lobby?.players.find(p => p.id === socket.id);

                const username = player?.username || lobbyPlayer?.username || "Marinero";
                const team = player?.team || lobbyPlayer?.team || "blue";

                const chatPayload: ChatMessage = {
                    id: crypto.randomUUID(),
                    senderId: socket.id,
                    senderName: username,
                    senderTeam: team,
                    message: data.message.trim().slice(0, 150),
                    channel: data.channel || "all",
                    timestamp: Date.now(),
                };

                if (data.channel === "team") {
                    const teamPlayers = (lobby?.players || []).filter(p => p.team === team);
                    for (const p of teamPlayers) {
                        this.io.to(p.id).emit("chatMessage", chatPayload);
                    }
                } else {
                    this.io.to(lobbyId).emit("chatMessage", chatPayload);
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
                if (lobbyId) {
                    this.broadcastScoreboard(lobbyId);
                }
            });
        });
}
}