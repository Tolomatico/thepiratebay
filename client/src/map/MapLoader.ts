import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { MapData, MapObject, MapSpawnPoint } from "../editor/types";

export class MapLoader {
  private scene: THREE.Scene;
  private gltfLoader = new GLTFLoader();
  private loadedObjects: THREE.Group[] = [];
  private collisionBoxes: THREE.Box3[] = [];
  private mapData: MapData | null = null;
  private blueSpawnIndex = 0;
  private redSpawnIndex = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public async loadMap(mapUrl: string = "/maps/default_map.json"): Promise<MapData | null> {
    try {
      const response = await fetch(mapUrl);
      if (!response.ok) {
        console.warn(`[MapLoader] No se pudo cargar el mapa desde ${mapUrl} (status: ${response.status}).`);
        return null;
      }

      const data: MapData = await response.json();
      this.mapData = data;
      console.log(`[MapLoader] Mapa cargado: "${data.name}" con ${data.objects?.length || 0} objetos.`);

      // Instanciar objetos del mapa
      if (Array.isArray(data.objects)) {
        for (const obj of data.objects) {
          await this.instantiateObject(obj);
        }
      }

      return data;
    } catch (err) {
      console.warn(`[MapLoader] Error al cargar o parsear el mapa desde ${mapUrl}:`, err);
      return null;
    }
  }

  private async instantiateObject(obj: MapObject): Promise<THREE.Group | null> {
    return new Promise((resolve) => {
      this.gltfLoader.load(
        obj.modelUrl,
        (gltf) => {
          const group = gltf.scene;
          group.name = obj.name;
          group.position.set(...obj.position);
          group.rotation.set(...obj.rotation);
          group.scale.set(...obj.scale);

          group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.scene.add(group);
          this.loadedObjects.push(group);

          if (obj.hasCollision) {
            const box = new THREE.Box3().setFromObject(group);
            this.collisionBoxes.push(box);
          }

          resolve(group);
        },
        undefined,
        (err) => {
          console.warn(`[MapLoader] Error al cargar modelo "${obj.modelUrl}" para objeto "${obj.name}":`, err);
          resolve(null);
        }
      );
    });
  }

  public getSpawnPoint(team: "blue" | "red"): { position: THREE.Vector3; rotationY: number } {
    const list: MapSpawnPoint[] = this.mapData?.spawnPoints?.[team] || [];

    if (list.length === 0) {
      // Fallback por defecto si no hay spawns en el mapa
      const fallbackX = team === "blue" ? -300 : 300;
      const fallbackRot = team === "blue" ? 0 : Math.PI;
      return {
        position: new THREE.Vector3(fallbackX, 0, 0),
        rotationY: fallbackRot,
      };
    }

    // Elegir secuencialmente o con ligera variación para no encimar barcos en el mismo spawn exacto
    const idx = team === "blue" ? this.blueSpawnIndex++ % list.length : this.redSpawnIndex++ % list.length;
    const selected = list[idx];

    // Pequeño offset aleatorio de 5 metros para dispersión de flota
    const jitterX = (Math.random() - 0.5) * 10;
    const jitterZ = (Math.random() - 0.5) * 10;

    return {
      position: new THREE.Vector3(selected.position[0] + jitterX, 0, selected.position[2] + jitterZ),
      rotationY: selected.rotation[1] || 0,
    };
  }

  public getCollisionBoxes(): THREE.Box3[] {
    return this.collisionBoxes;
  }

  public getMapData(): MapData | null {
    return this.mapData;
  }

  public dispose() {
    this.loadedObjects.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      this.scene.remove(group);
    });
    this.loadedObjects = [];
    this.collisionBoxes = [];
  }
}
