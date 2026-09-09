import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapEditorEngine } from "./MapEditorEngine";
import { modelCatalog } from "./ModelCatalog";
import type {
  CatalogModel,
  MapData,
  MapObject,
  MapSpawnPoint,
  ObjectCategory,
  TransformMode,
  Vector3Tuple,
} from "./types";

interface MapEditorViewProps {
  onExit: () => void;
}

const STORAGE_KEY = "pirate_map_editor_autosave_v1";

const loadInitialDraft = (): {
  mapName: string;
  worldSize: number;
  objects: MapObject[];
  spawnPoints: { blue: MapSpawnPoint[]; red: MapSpawnPoint[] };
} => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: MapData = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.objects)) {
        return {
          mapName: parsed.name || "Archipiélago Pirata",
          worldSize: parsed.worldSize || 2000,
          objects: parsed.objects,
          spawnPoints: parsed.spawnPoints || {
            blue: [
              { id: "sp_blue_1", team: "blue", position: [-500, 0, 0], rotation: [0, 0, 0] },
            ],
            red: [
              { id: "sp_red_1", team: "red", position: [500, 0, 0], rotation: [0, Math.PI, 0] },
            ],
          },
        };
      }
    }
  } catch (e) {
    console.error("Error loading autosave map:", e);
  }
  return {
    mapName: "Archipiélago Pirata",
    worldSize: 2000,
    objects: [],
    spawnPoints: {
      blue: [
        { id: "sp_blue_1", team: "blue", position: [-500, 0, 0], rotation: [0, 0, 0] },
      ],
      red: [
        { id: "sp_red_1", team: "red", position: [500, 0, 0], rotation: [0, Math.PI, 0] },
      ],
    },
  };
};

export const MapEditorView: React.FC<MapEditorViewProps> = ({ onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MapEditorEngine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Lazy initialize state from storage
  const [initialDraft] = useState(loadInitialDraft);
  const [mapName, setMapName] = useState(initialDraft.mapName);
  const [worldSize, setWorldSize] = useState(initialDraft.worldSize);
  const [objects, setObjects] = useState<MapObject[]>(initialDraft.objects);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [spawnPoints, setSpawnPoints] = useState(initialDraft.spawnPoints);
  const [selectedSpawnId, setSelectedSpawnId] = useState<string | null>(null);

  // UI State
  const [catalog, setCatalog] = useState<CatalogModel[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [transformMode, setTransformMode] = useState<TransformMode>("translate");
  const [snapGrid, setSnapGrid] = useState<number | null>(null);
  const [snapRotate, setSnapRotate] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<"objects" | "spawns">("objects");

  // Selection shortcuts
  const selectedObject = objects.find((o) => o.id === selectedId) || null;
  const allSpawns = [...spawnPoints.blue, ...spawnPoints.red];
  const selectedSpawn = allSpawns.find((sp) => sp.id === selectedSpawnId) || null;

  // Flash notice helper
  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Sync with engine
  const handleObjectTransformed = useCallback(
    (id: string, position: Vector3Tuple, rotation: Vector3Tuple, scale: Vector3Tuple) => {
      setObjects((prev) =>
        prev.map((obj) => (obj.id === id ? { ...obj, position, rotation, scale } : obj))
      );
    },
    []
  );

  const handleObjectSelected = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      setSelectedSpawnId(null);
      setActiveRightTab("objects");
    }
  }, []);

  const handleSpawnPointTransformed = useCallback(
    (id: string, position: Vector3Tuple, rotation: Vector3Tuple) => {
      setSpawnPoints((prev) => {
        const updateList = (list: MapSpawnPoint[]) =>
          list.map((sp) => (sp.id === id ? { ...sp, position, rotation } : sp));
        return {
          blue: updateList(prev.blue),
          red: updateList(prev.red),
        };
      });
    },
    []
  );

  const handleSpawnPointSelected = useCallback((id: string | null) => {
    setSelectedSpawnId(id);
    if (id) {
      setSelectedId(null);
      setActiveRightTab("spawns");
    }
  }, []);

  // Initialize Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new MapEditorEngine(containerRef.current, {
      onObjectSelected: handleObjectSelected,
      onObjectTransformed: handleObjectTransformed,
      onSpawnPointSelected: handleSpawnPointSelected,
      onSpawnPointTransformed: handleSpawnPointTransformed,
    });
    engineRef.current = engine;
    setCatalog(modelCatalog.getAllModels());

    // Load initial objects into 3D engine
    initialDraft.objects.forEach((obj) => {
      engine.addObject(obj);
    });
    engine.setSpawnMarkers(initialDraft.spawnPoints);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [handleObjectSelected, handleObjectTransformed, handleSpawnPointSelected, handleSpawnPointTransformed, initialDraft]);

  // Auto-save to localStorage
  useEffect(() => {
    const mapData: MapData = {
      version: 1,
      name: mapName,
      worldSize,
      createdAt: new Date().toISOString(),
      spawnPoints,
      objects,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapData));
    } catch {
      // Ignore quota errors
    }
  }, [mapName, worldSize, spawnPoints, objects]);

  // Update world size on engine
  useEffect(() => {
    engineRef.current?.setWorldSize(worldSize);
  }, [worldSize]);

  // Sync transform mode
  const changeTransformMode = (mode: TransformMode) => {
    setTransformMode(mode);
    engineRef.current?.setTransformMode(mode);
  };

  // Sync snapping
  useEffect(() => {
    engineRef.current?.setSnapping(snapGrid, snapRotate, null);
  }, [snapGrid, snapRotate]);

  // Sync grid & water
  useEffect(() => {
    engineRef.current?.toggleGrid(showGrid);
  }, [showGrid]);

  useEffect(() => {
    engineRef.current?.toggleWater(showWater);
  }, [showWater]);

  // --- OBJECT ACTIONS ---

  const handleAddObject = async (model: CatalogModel) => {
    const id = "obj_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const offset = (objects.length % 5) * 40 - 80;
    const newObj: MapObject = {
      id,
      name: `${model.name} #${objects.length + 1}`,
      modelUrl: model.url,
      modelName: model.name,
      position: [offset, 0, offset],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      hasCollision: true,
      category: model.category,
      isCustomBlob: model.isCustom,
    };

    setObjects((prev) => [...prev, newObj]);
    await engineRef.current?.addObject(newObj);
    engineRef.current?.selectObject(id);
    setSelectedId(id);
    setSelectedSpawnId(null);
    setActiveRightTab("objects");
    showNotice(`Añadido: ${newObj.name}`);
  };

  const handleDeleteObject = (id: string) => {
    engineRef.current?.removeObject(id);
    setObjects((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
    showNotice("Objeto eliminado");
  };

  const handleDuplicateObject = async (id: string) => {
    const src = objects.find((o) => o.id === id);
    if (!src) return;

    const newId = "obj_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const newObj: MapObject = {
      ...src,
      id: newId,
      name: `${src.name} (Copia)`,
      position: [src.position[0] + 30, src.position[1], src.position[2] + 30],
    };

    setObjects((prev) => [...prev, newObj]);
    await engineRef.current?.addObject(newObj);
    engineRef.current?.selectObject(newId);
    setSelectedId(newId);
    setSelectedSpawnId(null);
    showNotice(`Duplicado: ${newObj.name}`);
  };

  const handleFocusObject = (id: string) => {
    engineRef.current?.focusObject(id);
  };

  // --- SPAWN POINT ACTIONS ---

  const handleAddSpawnPoint = (team: "blue" | "red") => {
    const id = `sp_${team}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const teamList = spawnPoints[team];
    const offsetX = team === "blue" ? -350 - teamList.length * 60 : 350 + teamList.length * 60;
    const offsetZ = (teamList.length % 4) * 80 - 120;
    const newSp: MapSpawnPoint = {
      id,
      team,
      position: [offsetX, 0, offsetZ],
      rotation: [0, team === "blue" ? 0 : Math.PI, 0],
    };

    setSpawnPoints((prev) => ({
      ...prev,
      [team]: [...prev[team], newSp],
    }));

    engineRef.current?.addSpawnMarker(newSp);
    engineRef.current?.selectSpawnPoint(id);
    setSelectedSpawnId(id);
    setSelectedId(null);
    setActiveRightTab("spawns");
    showNotice(`Añadido punto de respawn: ${team === "blue" ? "Armada Azul 🔵" : "Imperio Rojo 🔴"}`);
  };

  const handleDeleteSpawnPoint = (id: string) => {
    engineRef.current?.removeSpawnMarker(id);
    setSpawnPoints((prev) => ({
      blue: prev.blue.filter((sp) => sp.id !== id),
      red: prev.red.filter((sp) => sp.id !== id),
    }));
    if (selectedSpawnId === id) setSelectedSpawnId(null);
    showNotice("Punto de respawn eliminado");
  };

  const handleDuplicateSpawnPoint = (id: string) => {
    const src = allSpawns.find((sp) => sp.id === id);
    if (!src) return;

    const newId = `sp_${src.team}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newSp: MapSpawnPoint = {
      ...src,
      id: newId,
      position: [src.position[0] + 40, 0, src.position[2] + 40],
    };

    const targetTeam = src.team === "red" ? "red" : "blue";
    setSpawnPoints((prev) => ({
      ...prev,
      [targetTeam]: [...prev[targetTeam], newSp],
    }));

    engineRef.current?.addSpawnMarker(newSp);
    engineRef.current?.selectSpawnPoint(newId);
    setSelectedSpawnId(newId);
    setSelectedId(null);
    showNotice("Punto de respawn duplicado");
  };

  const handleFocusSpawnPoint = (id: string) => {
    engineRef.current?.focusSpawnPoint(id);
  };

  const handleChangeSpawnTeam = (id: string, newTeam: "blue" | "red") => {
    const src = allSpawns.find((sp) => sp.id === id);
    if (!src || src.team === newTeam) return;

    const updated: MapSpawnPoint = {
      ...src,
      team: newTeam,
      rotation: [0, newTeam === "blue" ? 0 : Math.PI, 0],
    };

    setSpawnPoints((prev) => ({
      blue: newTeam === "blue" ? [...prev.blue, updated] : prev.blue.filter((sp) => sp.id !== id),
      red: newTeam === "red" ? [...prev.red, updated] : prev.red.filter((sp) => sp.id !== id),
    }));

    engineRef.current?.addSpawnMarker(updated);
    engineRef.current?.selectSpawnPoint(id);
    showNotice(`Equipo cambiado a ${newTeam === "blue" ? "Armada Azul 🔵" : "Imperio Rojo 🔴"}`);
  };

  // --- LOCAL GLB UPLOAD & DRAG/DROP ---

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".glb") && !file.name.toLowerCase().endsWith(".gltf")) {
      alert("Por favor selecciona un archivo .glb o .gltf válido.");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    const registered = modelCatalog.registerCustomModel(cleanName, blobUrl, "prop");
    setCatalog(modelCatalog.getAllModels());
    handleAddObject(registered);
    showNotice(`Modelo cargado: ${file.name}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // --- MAP EXPORT & IMPORT ---

  const handleClearMap = () => {
    if (objects.length > 0 && !confirm("¿Seguro que deseas vaciar el mapa? Perderás los cambios no exportados.")) {
      return;
    }
    engineRef.current?.clearScene();
    setObjects([]);
    setSelectedId(null);
    setSelectedSpawnId(null);
    localStorage.removeItem(STORAGE_KEY);
    showNotice("Mapa reiniciado.");
  };

  const handleExportJSON = (filenameParam?: string) => {
    const mapData: MapData = {
      version: 1,
      name: mapName,
      worldSize,
      createdAt: new Date().toISOString(),
      spawnPoints,
      objects,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const filename = filenameParam || "default_map.json";
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotice(`Mapa descargado como: ${filename}`);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed: MapData = JSON.parse(event.target?.result as string);
        if (!parsed.objects) throw new Error("Formato inválido");

        engineRef.current?.clearScene();
        setMapName(parsed.name || "Mapa Importado");
        setWorldSize(parsed.worldSize || 2000);
        setSpawnPoints(parsed.spawnPoints || { blue: [], red: [] });
        setObjects(parsed.objects);

        for (const obj of parsed.objects) {
          await engineRef.current?.addObject(obj);
        }
        if (parsed.spawnPoints) {
          engineRef.current?.setSpawnMarkers(parsed.spawnPoints);
        }
        showNotice("Mapa cargado con éxito.");
      } catch (err) {
        alert("Error al cargar el archivo JSON del mapa.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // --- KEYBOARD SHORTCUTS ---

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const selectedSpawnIdRef = useRef(selectedSpawnId);
  selectedSpawnIdRef.current = selectedSpawnId;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const currObjId = selectedIdRef.current;
      const currSpId = selectedSpawnIdRef.current;

      if (e.key === "w" || e.key === "W") changeTransformMode("translate");
      if (e.key === "e" || e.key === "E") changeTransformMode("rotate");
      if (e.key === "r" || e.key === "R") changeTransformMode("scale");

      if (e.key === "Escape") {
        engineRef.current?.selectObject(null);
        engineRef.current?.selectSpawnPoint(null);
        setSelectedId(null);
        setSelectedSpawnId(null);
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (currObjId) handleDeleteObject(currObjId);
        else if (currSpId) handleDeleteSpawnPoint(currSpId);
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        if (currObjId) handleDuplicateObject(currObjId);
        else if (currSpId) handleDuplicateSpawnPoint(currSpId);
      }

      if (e.key === "f" || e.key === "F") {
        if (currObjId) handleFocusObject(currObjId);
        else if (currSpId) handleFocusSpawnPoint(currSpId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter catalog
  const filteredCatalog = catalog.filter((m) => {
    const matchCat = selectedCategory === "all" || m.category === selectedCategory;
    const matchSearch = m.name.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none flex flex-col font-sans"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".glb,.gltf"
        onChange={(e) => handleFileUpload(e.target.files)}
      />
      <input
        type="file"
        ref={jsonInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportJSON}
      />

      {/* DRAG OVERLAY */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-amber-500/20 border-4 border-dashed border-amber-400 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
          <span className="text-6xl animate-bounce">📦</span>
          <p className="text-2xl font-pirate font-bold text-amber-300 mt-4 drop-shadow">
            ¡Suelta tu archivo .GLB aquí para agregarlo al mapa!
          </p>
        </div>
      )}

      {/* TOP BAR */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0">
        {/* Left: Brand & Map Name */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-amber-400 font-pirate">
                Editor de Mapas 3D
              </h1>
              <span className="text-[10px] text-emerald-400 font-mono">MODO ADMIN</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Name input */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Mapa:</label>
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>

          {/* World Radius */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Radio:</label>
            <input
              type="number"
              value={worldSize}
              step={200}
              min={600}
              max={10000}
              onChange={(e) => setWorldSize(Math.max(400, Number(e.target.value)))}
              className="bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500 w-20"
            />
            <span className="text-[11px] text-slate-500">m</span>
          </div>
        </div>

        {/* Center: Transform Tools & Quick Spawns */}
        <div className="flex items-center gap-2">
          {/* Quick Spawn Buttons */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 gap-1">
            <button
              onClick={() => handleAddSpawnPoint("blue")}
              className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Añadir punto de respawn para Armada Azul"
            >
              <span>🚩</span> + Spawn Azul
            </button>
            <button
              onClick={() => handleAddSpawnPoint("red")}
              className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Añadir punto de respawn para Imperio Rojo"
            >
              <span>🚩</span> + Spawn Rojo
            </button>
          </div>

          {/* Gizmo Tools */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 gap-1">
            <button
              onClick={() => changeTransformMode("translate")}
              title="Mover (W)"
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                transformMode === "translate"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span>↔️</span> Mover <kbd className="text-[10px] opacity-75 font-mono">W</kbd>
            </button>
            <button
              onClick={() => changeTransformMode("rotate")}
              title="Rotar (E)"
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                transformMode === "rotate"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span>🔄</span> Rotar <kbd className="text-[10px] opacity-75 font-mono">E</kbd>
            </button>
            <button
              onClick={() => changeTransformMode("scale")}
              title="Escalar (R)"
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                transformMode === "scale"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span>📐</span> Escalar <kbd className="text-[10px] opacity-75 font-mono">R</kbd>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <select
              value={snapGrid ?? "off"}
              onChange={(e) => setSnapGrid(e.target.value === "off" ? null : Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-[11px] rounded px-1.5 py-1 text-slate-300 focus:outline-none"
              title="Ajuste a Grilla (Snapping)"
            >
              <option value="off">Grid: Libre</option>
              <option value="5">Grid: 5m</option>
              <option value="10">Grid: 10m</option>
              <option value="25">Grid: 25m</option>
              <option value="50">Grid: 50m</option>
            </select>

            <select
              value={snapRotate ?? "off"}
              onChange={(e) => setSnapRotate(e.target.value === "off" ? null : Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-[11px] rounded px-1.5 py-1 text-slate-300 focus:outline-none"
              title="Ajuste de Rotación"
            >
              <option value="off">Rot: Libre</option>
              <option value="15">Rot: 15°</option>
              <option value="45">Rot: 45°</option>
              <option value="90">Rot: 90°</option>
            </select>
          </div>
        </div>

        {/* Right: Actions & Exit */}
        <div className="flex items-center gap-2">
          {/* Toggles */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-xs border ${
              showGrid ? "border-sky-500/50 bg-sky-950/40 text-sky-300" : "border-slate-800 text-slate-500"
            }`}
            title="Alternar visibilidad de la grilla"
          >
            Grilla
          </button>
          <button
            onClick={() => setShowWater(!showWater)}
            className={`px-2 py-1 rounded text-xs border ${
              showWater ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300" : "border-slate-800 text-slate-500"
            }`}
            title="Alternar agua de referencia"
          >
            Agua
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* Import JSON */}
          <button
            onClick={() => jsonInputRef.current?.click()}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            title="Cargar mapa guardado (.json)"
          >
            <span>📂</span> Cargar
          </button>

          {/* Export JSON */}
          <button
            onClick={() => handleExportJSON("default_map.json")}
            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
            title="Descargar como default_map.json (guárdalo en client/public/maps/)"
          >
            <span>💾</span> Exportar default_map.json
          </button>

          {/* Clear */}
          <button
            onClick={handleClearMap}
            className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-xs text-red-200 transition-colors cursor-pointer"
            title="Borrar todo"
          >
            Limpiar
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* Exit */}
          <button
            onClick={onExit}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>🚪</span> Salir
          </button>
        </div>
      </header>

      {/* NOTICE BANNER */}
      {statusNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-amber-500/60 text-amber-300 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <span>✨</span> {statusNotice}
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* LEFT PANEL: MODEL PALETTE */}
        <aside className="w-72 bg-slate-900/80 backdrop-blur-lg border-r border-slate-800/80 flex flex-col z-10 shrink-0">
          <div className="p-3 border-b border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>📦</span> Catálogo de Modelos
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {filteredCatalog.length} disponibles
              </span>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>➕</span> Cargar .GLB Local
            </button>

            <input
              type="text"
              placeholder="Buscar modelo..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
              {["all", "ship", "island", "rock", "prop", "other"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded capitalize whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat === "all" ? "Todos" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCatalog.map((model) => (
              <div
                key={model.id}
                className="group bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-lg p-2.5 transition-all flex items-center justify-between"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300">
                    {model.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1 rounded bg-slate-900/60 text-slate-400 font-mono">
                      {model.category}
                    </span>
                    {model.isCustom && (
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-semibold">
                        LOCAL
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddObject(model)}
                  className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 hover:border-amber-500 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  title="Agregar este objeto a la escena"
                >
                  + Añadir
                </button>
              </div>
            ))}

            {filteredCatalog.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No se encontraron modelos.
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 bg-slate-950/40">
            💡 <strong className="text-slate-400">Arrastra archivos .glb</strong> desde tu PC directo a la ventana para verlos en 3D.
          </div>
        </aside>

        {/* 3D CANVAS VIEWPORT */}
        <div className="flex-1 relative h-full w-full bg-slate-950">
          <div ref={containerRef} className="w-full h-full cursor-crosshair" />

          {/* Viewport Bottom Overlay Controls Helper */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-lg px-3 py-2 text-[11px] text-slate-400 flex items-center gap-4 pointer-events-none">
            <div>
              <strong className="text-slate-200">Cámara:</strong> Clic izquierdo + Arrastrar para rotar | Clic derecho para paneo | Rueda para zoom
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <strong className="text-slate-200">Atajos:</strong> <kbd className="text-amber-400">W</kbd> Mover | <kbd className="text-amber-400">E</kbd> Rotar | <kbd className="text-amber-400">R</kbd> Escalar | <kbd className="text-amber-400">Ctrl+D</kbd> Clonar | <kbd className="text-amber-400">F</kbd> Enfocar | <kbd className="text-amber-400">Supr</kbd> Borrar
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: OUTLINER & INSPECTOR */}
        <aside className="w-80 bg-slate-900/80 backdrop-blur-lg border-l border-slate-800/80 flex flex-col z-10 shrink-0">
          {/* Section 1: Jerarquía con Selector de Pestañas */}
          <div className="h-64 border-b border-slate-800 flex flex-col">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800/80 bg-slate-950/50">
              <button
                onClick={() => setActiveRightTab("objects")}
                className={`flex-1 py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeRightTab === "objects"
                    ? "text-amber-300 border-b-2 border-amber-500 bg-slate-900/80"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🌴</span> Objetos ({objects.length})
              </button>
              <button
                onClick={() => setActiveRightTab("spawns")}
                className={`flex-1 py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeRightTab === "spawns"
                    ? "text-amber-300 border-b-2 border-amber-500 bg-slate-900/80"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🚩</span> Respawns ({allSpawns.length})
              </button>
            </div>

            {/* TAB CONTENT: OBJECTS LIST */}
            {activeRightTab === "objects" && (
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {objects.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => {
                      setSelectedId(obj.id);
                      setSelectedSpawnId(null);
                      engineRef.current?.selectObject(obj.id);
                    }}
                    className={`group px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                      selectedId === obj.id
                        ? "bg-amber-500/20 border border-amber-500/60 text-amber-300 font-semibold"
                        : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                    }`}
                  >
                    <span className="truncate pr-2">{obj.name}</span>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFocusObject(obj.id);
                        }}
                        className="p-1 hover:text-amber-400"
                        title="Enfocar cámara (F)"
                      >
                        🎯
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateObject(obj.id);
                        }}
                        className="p-1 hover:text-emerald-400"
                        title="Duplicar (Ctrl+D)"
                      >
                        📋
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteObject(obj.id);
                        }}
                        className="p-1 hover:text-red-400"
                        title="Eliminar (Supr)"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}

                {objects.length === 0 && (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No hay objetos en el mapa.<br />Añade uno desde el catálogo izquierdo.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SPAWN POINTS LIST */}
            {activeRightTab === "spawns" && (
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {/* BLUE TEAM SPAWNS */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    <span>🔵 Armada Azul ({spawnPoints.blue.length})</span>
                    <button
                      onClick={() => handleAddSpawnPoint("blue")}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/40 text-blue-300"
                    >
                      + Añadir
                    </button>
                  </div>
                  {spawnPoints.blue.map((sp, idx) => (
                    <div
                      key={sp.id}
                      onClick={() => {
                        setSelectedSpawnId(sp.id);
                        setSelectedId(null);
                        engineRef.current?.selectSpawnPoint(sp.id);
                      }}
                      className={`group px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                        selectedSpawnId === sp.id
                          ? "bg-blue-500/30 border border-blue-500 text-blue-200 font-semibold"
                          : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                      }`}
                    >
                      <span className="truncate pr-2">🚩 Respawn Azul #{idx + 1}</span>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFocusSpawnPoint(sp.id);
                          }}
                          className="p-1 hover:text-blue-300"
                          title="Enfocar (F)"
                        >
                          🎯
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateSpawnPoint(sp.id);
                          }}
                          className="p-1 hover:text-emerald-400"
                          title="Duplicar (Ctrl+D)"
                        >
                          📋
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSpawnPoint(sp.id);
                          }}
                          className="p-1 hover:text-red-400"
                          title="Eliminar (Supr)"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {spawnPoints.blue.length === 0 && (
                    <div className="text-[11px] text-slate-500 px-2 py-1 italic">
                      Sin puntos de respawn azul.
                    </div>
                  )}
                </div>

                {/* RED TEAM SPAWNS */}
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center justify-between px-1 text-[11px] font-bold text-red-400 uppercase tracking-wider">
                    <span>🔴 Imperio Rojo ({spawnPoints.red.length})</span>
                    <button
                      onClick={() => handleAddSpawnPoint("red")}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300"
                    >
                      + Añadir
                    </button>
                  </div>
                  {spawnPoints.red.map((sp, idx) => (
                    <div
                      key={sp.id}
                      onClick={() => {
                        setSelectedSpawnId(sp.id);
                        setSelectedId(null);
                        engineRef.current?.selectSpawnPoint(sp.id);
                      }}
                      className={`group px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                        selectedSpawnId === sp.id
                          ? "bg-red-500/30 border border-red-500 text-red-200 font-semibold"
                          : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                      }`}
                    >
                      <span className="truncate pr-2">🚩 Respawn Rojo #{idx + 1}</span>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFocusSpawnPoint(sp.id);
                          }}
                          className="p-1 hover:text-red-300"
                          title="Enfocar (F)"
                        >
                          🎯
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateSpawnPoint(sp.id);
                          }}
                          className="p-1 hover:text-emerald-400"
                          title="Duplicar (Ctrl+D)"
                        >
                          📋
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSpawnPoint(sp.id);
                          }}
                          className="p-1 hover:text-red-400"
                          title="Eliminar (Supr)"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {spawnPoints.red.length === 0 && (
                    <div className="text-[11px] text-slate-500 px-2 py-1 italic">
                      Sin puntos de respawn rojo.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Inspector (Switches between Object and Spawn Point) */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* --- SPAWN POINT INSPECTOR --- */}
            {selectedSpawn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>🚩</span> Respawn ({selectedSpawn.team === "blue" ? "Armada Azul" : "Imperio Rojo"})
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedSpawn.team === "blue" ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"
                  }`}>
                    {selectedSpawn.team === "blue" ? "Azul" : "Rojo"}
                  </span>
                </div>

                {/* Team Switcher */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400">Equipo Asignado:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleChangeSpawnTeam(selectedSpawn.id, "blue")}
                      className={`py-1.5 rounded text-xs font-bold border transition-all ${
                        selectedSpawn.team === "blue"
                          ? "bg-blue-600 border-blue-400 text-white shadow-md"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Armada Azul 🔵
                    </button>
                    <button
                      onClick={() => handleChangeSpawnTeam(selectedSpawn.id, "red")}
                      className={`py-1.5 rounded text-xs font-bold border transition-all ${
                        selectedSpawn.team === "red"
                          ? "bg-red-600 border-red-400 text-white shadow-md"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Imperio Rojo 🔴
                    </button>
                  </div>
                </div>

                {/* Position (X, Z) */}
                <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Posición en el Mar</span>
                    <span className="text-[10px] text-slate-500">Y = 0m (Fijo)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["X", "Z"] as const).map((axis) => {
                      const idx = axis === "X" ? 0 : 2;
                      return (
                        <div key={axis} className="flex items-center bg-slate-900 border border-slate-700/80 rounded px-2 py-1">
                          <span className="text-[10px] font-bold text-slate-500 mr-2">{axis}</span>
                          <input
                            type="number"
                            step={1}
                            value={selectedSpawn.position[idx]}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const newPos: Vector3Tuple = [...selectedSpawn.position];
                              newPos[idx] = val;
                              newPos[1] = 0; // Lock to water
                              setSpawnPoints((prev) => {
                                const updateList = (list: MapSpawnPoint[]) =>
                                  list.map((sp) => (sp.id === selectedSpawn.id ? { ...sp, position: newPos } : sp));
                                return { blue: updateList(prev.blue), red: updateList(prev.red) };
                              });
                              engineRef.current?.updateSpawnPointTransform(selectedSpawn.id, newPos);
                            }}
                            className="w-full bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Heading / Direction */}
                <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Orientación al Nacer</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {Math.round((selectedSpawn.rotation[1] * 180) / Math.PI)}°
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={Math.round(((selectedSpawn.rotation[1] * 180) / Math.PI + 360) % 360)}
                    onChange={(e) => {
                      const deg = parseFloat(e.target.value) || 0;
                      const rad = (deg * Math.PI) / 180;
                      const newRot: Vector3Tuple = [0, parseFloat(rad.toFixed(3)), 0];
                      setSpawnPoints((prev) => {
                        const updateList = (list: MapSpawnPoint[]) =>
                          list.map((sp) => (sp.id === selectedSpawn.id ? { ...sp, rotation: newRot } : sp));
                        return { blue: updateList(prev.blue), red: updateList(prev.red) };
                      });
                      engineRef.current?.updateSpawnPointTransform(selectedSpawn.id, undefined, newRot);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  {/* Cardinal presets */}
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[
                      { label: "N (0°)", deg: 0 },
                      { label: "E (90°)", deg: 90 },
                      { label: "S (180°)", deg: 180 },
                      { label: "O (270°)", deg: 270 },
                    ].map((card) => (
                      <button
                        key={card.label}
                        onClick={() => {
                          const rad = (card.deg * Math.PI) / 180;
                          const newRot: Vector3Tuple = [0, parseFloat(rad.toFixed(3)), 0];
                          setSpawnPoints((prev) => {
                            const updateList = (list: MapSpawnPoint[]) =>
                              list.map((sp) => (sp.id === selectedSpawn.id ? { ...sp, rotation: newRot } : sp));
                            return { blue: updateList(prev.blue), red: updateList(prev.red) };
                          });
                          engineRef.current?.updateSpawnPointTransform(selectedSpawn.id, undefined, newRot);
                        }}
                        className="py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-300"
                      >
                        {card.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spawn Actions */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleDuplicateSpawnPoint(selectedSpawn.id)}
                    className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
                  >
                    Clonar (Ctrl+D)
                  </button>
                  <button
                    onClick={() => handleDeleteSpawnPoint(selectedSpawn.id)}
                    className="py-1.5 px-3 rounded bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-xs font-bold text-red-300 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ) : selectedObject ? (
              /* --- SCENE OBJECT INSPECTOR --- */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span>⚙️</span> Inspector de Propiedades
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400">Nombre del Objeto:</label>
                  <input
                    type="text"
                    value={selectedObject.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setObjects((prev) =>
                        prev.map((o) => (o.id === selectedObject.id ? { ...o, name: newName } : o))
                      );
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Categoría:</label>
                    <select
                      value={selectedObject.category}
                      onChange={(e) => {
                        const cat = e.target.value as ObjectCategory;
                        setObjects((prev) =>
                          prev.map((o) => (o.id === selectedObject.id ? { ...o, category: cat } : o))
                        );
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 capitalize focus:outline-none"
                    >
                      <option value="island">Isla</option>
                      <option value="rock">Roca</option>
                      <option value="prop">Prop / Ruina</option>
                      <option value="ship">Barco</option>
                      <option value="building">Fuerte / Base</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Colisión Física:</label>
                    <button
                      onClick={() => {
                        const nextVal = !selectedObject.hasCollision;
                        setObjects((prev) =>
                          prev.map((o) =>
                            o.id === selectedObject.id ? { ...o, hasCollision: nextVal } : o
                          )
                        );
                      }}
                      className={`w-full py-1 rounded text-xs font-bold border transition-colors ${
                        selectedObject.hasCollision
                          ? "bg-emerald-950/60 border-emerald-600/60 text-emerald-300"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      {selectedObject.hasCollision ? "ACTIVADA ✅" : "DESACTIVADA ❌"}
                    </button>
                  </div>
                </div>

                {/* Transform: Position */}
                <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Posición (X, Y, Z)</span>
                    <button
                      onClick={() => {
                        const newPos: Vector3Tuple = [selectedObject.position[0], 0, selectedObject.position[2]];
                        setObjects((prev) =>
                          prev.map((o) => (o.id === selectedObject.id ? { ...o, position: newPos } : o))
                        );
                        engineRef.current?.updateObjectTransform(selectedObject.id, newPos);
                      }}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      title="Fijar altura a nivel del agua (Y=0)"
                    >
                      Nivel Mar (Y=0)
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["X", "Y", "Z"] as const).map((axis, i) => (
                      <div key={axis} className="flex items-center bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5">
                        <span className="text-[10px] font-bold text-slate-500 mr-1">{axis}</span>
                        <input
                          type="number"
                          step={1}
                          value={selectedObject.position[i]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newPos = [...selectedObject.position] as Vector3Tuple;
                            newPos[i] = val;
                            setObjects((prev) =>
                              prev.map((o) => (o.id === selectedObject.id ? { ...o, position: newPos } : o))
                            );
                            engineRef.current?.updateObjectTransform(selectedObject.id, newPos);
                          }}
                          className="w-full bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transform: Rotation (Degrees) */}
                <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-300">Rotación (Grados)</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["X", "Y", "Z"] as const).map((axis, i) => {
                      const degVal = Math.round((selectedObject.rotation[i] * 180) / Math.PI);
                      return (
                        <div key={axis} className="flex items-center bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5">
                          <span className="text-[10px] font-bold text-slate-500 mr-1">{axis}</span>
                          <input
                            type="number"
                            step={15}
                            value={degVal}
                            onChange={(e) => {
                              const deg = parseFloat(e.target.value) || 0;
                              const rad = (deg * Math.PI) / 180;
                              const newRot = [...selectedObject.rotation] as Vector3Tuple;
                              newRot[i] = parseFloat(rad.toFixed(3));
                              setObjects((prev) =>
                                prev.map((o) => (o.id === selectedObject.id ? { ...o, rotation: newRot } : o))
                              );
                              engineRef.current?.updateObjectTransform(selectedObject.id, undefined, newRot);
                            }}
                            className="w-full bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transform: Scale */}
                <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Escala</span>
                    <button
                      onClick={() => {
                        const newScale: Vector3Tuple = [1, 1, 1];
                        setObjects((prev) =>
                          prev.map((o) => (o.id === selectedObject.id ? { ...o, scale: newScale } : o))
                        );
                        engineRef.current?.updateObjectTransform(selectedObject.id, undefined, undefined, newScale);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-200"
                    >
                      Reset (1x)
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["X", "Y", "Z"] as const).map((axis, i) => (
                      <div key={axis} className="flex items-center bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5">
                        <span className="text-[10px] font-bold text-slate-500 mr-1">{axis}</span>
                        <input
                          type="number"
                          step={0.1}
                          min={0.01}
                          value={selectedObject.scale[i]}
                          onChange={(e) => {
                            const val = Math.max(0.01, parseFloat(e.target.value) || 1);
                            const newScale = [...selectedObject.scale] as Vector3Tuple;
                            newScale[i] = parseFloat(val.toFixed(3));
                            setObjects((prev) =>
                              prev.map((o) => (o.id === selectedObject.id ? { ...o, scale: newScale } : o))
                            );
                            engineRef.current?.updateObjectTransform(
                              selectedObject.id,
                              undefined,
                              undefined,
                              newScale
                            );
                          }}
                          className="w-full bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions for selected */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleDuplicateObject(selectedObject.id)}
                    className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
                  >
                    Clonar (Ctrl+D)
                  </button>
                  <button
                    onClick={() => handleDeleteObject(selectedObject.id)}
                    className="py-1.5 px-3 rounded bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-xs font-bold text-red-300 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-slate-500">
                Selecciona un objeto o una bandera de respawn para inspeccionar y ajustar sus propiedades.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
export default MapEditorView;
