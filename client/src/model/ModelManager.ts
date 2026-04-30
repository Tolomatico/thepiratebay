import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class ModelManager {
  private loader = new GLTFLoader();
  private cache: Map<string, THREE.Object3D> = new Map();

  async load(path: string): Promise<THREE.Object3D> {
    if (this.cache.has(path)) {
      return this.cache.get(path)!.clone(true);
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          this.cache.set(path, model);
          resolve(model.clone(true));
        },
        undefined,
        reject
      );
    });
  }
}