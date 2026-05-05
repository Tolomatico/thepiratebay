export class Lobby{

  id: string;
  hostId: string;
  name: string;
  lobbyName: string;
  maxPlayers: number;
  players: string[] = [];
  status: "waiting" | "playing" = "waiting";

  constructor(hostId: string, name: string,lobbyName: string, maxPlayers: number ){

    this.id = crypto.randomUUID();
    this.hostId = hostId;
    this.name = name;
    this.lobbyName = lobbyName;
    this.maxPlayers = maxPlayers;
    this.players.push(hostId);
  }

  

}