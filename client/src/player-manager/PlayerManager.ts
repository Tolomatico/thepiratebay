import type { ModelManager } from "../model/ModelManager";
import { RemotePlayer } from "../remote-player/RemotePlayer";
import * as THREE from "three";

interface PlayerData {
    id: string;
    position: { x: number; y: number; z: number };
    rotation: { y: number };
}

export class PlayerManager {
    private scene: THREE.Scene;
    private modelManager: ModelManager;
    private players:Map<string,RemotePlayer> = new Map();

    constructor(scene: THREE.Scene, modelManager: ModelManager) {
        this.scene = scene;
        this.modelManager = modelManager;
    }

    addPlayer(id: string) {
        if (!this.players.has(id)) {
            const remotePlayer = new RemotePlayer(this.scene, this.modelManager, id);
            this.players.set(id, remotePlayer);
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
        if (player) {
            player.updatePosition(data.position, data.rotation);
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
    
}