import type { ModelManager } from "../model/ModelManager";
import { RemotePlayer } from "../remote-player/RemotePlayer";
import * as THREE from "three";
import type { Projectile } from "../weapon/Projectile";
import type { PlayerData } from "../interfaces/player";


export class PlayerManager {
    private scene: THREE.Scene;
    private modelManager: ModelManager;
    private players:Map<string,RemotePlayer> = new Map();
    private projectileRegistry: Map<string, Projectile>;

    constructor(scene: THREE.Scene, modelManager: ModelManager, projectileRegistry: Map<string, Projectile>) {
        this.scene = scene;
        this.modelManager = modelManager;
        this.projectileRegistry = projectileRegistry;
    }

    addPlayer(playerData: PlayerData) {
        if (!this.players.has(playerData.id)) {
            const remotePlayer = new RemotePlayer(this.scene, this.modelManager, playerData, this.projectileRegistry);
            this.players.set(playerData.id, remotePlayer);
        }
    }

    removePlayer(id: string) {
        const player = this.players.get(id);
        if (player) {
            player.destroy();
            this.players.delete(id);
        }
    }

updatePlayer(data: PlayerData) {
        const player = this.players.get(data.id);
        if (!player) {
            this.addPlayer(data);
        }
        const existingPlayer = this.players.get(data.id);
        if (existingPlayer && data.position) {
            existingPlayer.updatePosition(data.position, data.rotation || { y: 0 });
        }
    }
    update(delta: number) {
  for (const player of this.players.values()) {
    player.update(delta);
  }
}

    getPlayer(id: string) {
        return this.players.get(id);
    }

    getPlayers(): RemotePlayer[] {
        return Array.from(this.players.values());
    }
}