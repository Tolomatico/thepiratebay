export type Vector3Tuple = [number, number, number];

export type ObjectCategory = "island" | "rock" | "prop" | "ship" | "building" | "other";

export interface MapObject {
  id: string;
  name: string;
  modelUrl: string;
  modelName: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple; // in radians
  scale: Vector3Tuple;
  hasCollision: boolean;
  category: ObjectCategory;
  isCustomBlob?: boolean;
}

export interface MapSpawnPoint {
  id: string;
  team: "blue" | "red" | "neutral";
  position: Vector3Tuple;
  rotation: Vector3Tuple;
}

export interface MapData {
  version: number;
  name: string;
  worldSize: number;
  author?: string;
  createdAt: string;
  spawnPoints: {
    blue: MapSpawnPoint[];
    red: MapSpawnPoint[];
  };
  objects: MapObject[];
}

export type TransformMode = "translate" | "rotate" | "scale";
export type TransformSpace = "world" | "local";

export interface CatalogModel {
  id: string;
  name: string;
  url: string;
  category: ObjectCategory;
  isCustom?: boolean;
}
