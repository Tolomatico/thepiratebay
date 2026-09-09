import type { CatalogModel } from "./types";

export const DEFAULT_CATALOG: CatalogModel[] = [
  { id: "boat", name: "Balandra Clásica", url: "/models/boat.glb", category: "ship" },
  { id: "galeon", name: "Galeón Real", url: "/models/galeon.glb", category: "ship" },
  { id: "fragate", name: "Fragata de Guerra", url: "/models/fragate.glb", category: "ship" },
  { id: "buque", name: "Buque de Línea", url: "/models/buque.glb", category: "ship" },
  { id: "holandes", name: "Holandés Errante", url: "/models/holandes.glb", category: "ship" },
  { id: "english", name: "Navío Inglés", url: "/models/english.glb", category: "ship" },
  { id: "ghost", name: "Navío Fantasma", url: "/models/ghost.glb", category: "ship" },
  { id: "pirate", name: "Balandra Pirata", url: "/models/pirate.glb", category: "ship" },
  { id: "salazar", name: "La Silenciosa María", url: "/models/salazar.glb", category: "ship" },
  { id: "asd", name: "Modelo Prueba (ASD)", url: "/models/asd.glb", category: "other" },
];

export class ModelCatalogManager {
  private customModels: CatalogModel[] = [];

  constructor() {
    this.loadCustomFromStorage();
  }

  public getAllModels(): CatalogModel[] {
    return [...DEFAULT_CATALOG, ...this.customModels];
  }

  public registerCustomModel(name: string, blobUrl: string, category: CatalogModel["category"] = "prop"): CatalogModel {
    const id = "custom_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const newModel: CatalogModel = {
      id,
      name,
      url: blobUrl,
      category,
      isCustom: true,
    };
    this.customModels.push(newModel);
    return newModel;
  }

  private loadCustomFromStorage(): void {
    // Custom uploaded models are in-memory blob URLs per session.
  }
}

export const modelCatalog = new ModelCatalogManager();
