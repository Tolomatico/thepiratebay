export interface ILobby{
   id?: string;
   hostId?: string;
   name?: string;
   lobbyName: string;
   maxPlayers: number;
   players: string[];
   status?: "waiting" | "playing";
}