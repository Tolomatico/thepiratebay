import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import type { MapObject, TransformMode, Vector3Tuple, MapSpawnPoint } from "./types";

export interface EngineCallbacks {
  onObjectSelected?: (id: string | null) => void;
  onObjectTransformed?: (id: string, position: Vector3Tuple, rotation: Vector3Tuple, scale: Vector3Tuple) => void;
  onSpawnPointSelected?: (id: string | null) => void;
  onSpawnPointTransformed?: (id: string, position: Vector3Tuple, rotation: Vector3Tuple) => void;
}

export class MapEditorEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbitControls: OrbitControls;
  private transformControls: TransformControls;
  private water: Water | null = null;
  private gridHelper: THREE.GridHelper;
  private worldBoundary: THREE.LineSegments | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private pointerDownPos = new THREE.Vector2();

  private gltfLoader = new GLTFLoader();
  private modelCache = new Map<string, GLTF>();

  // Map of object ID -> THREE.Group
  private sceneObjects = new Map<string, THREE.Group>();
  // Inverse lookup: mesh/group uuid -> object ID
  private uuidToObjectId = new Map<string, string>();

  // Spawn point markers: id -> THREE.Group
  private spawnMarkers = new Map<string, THREE.Group>();
  // Inverse lookup: mesh/group uuid -> spawn point ID
  private uuidToSpawnId = new Map<string, string>();

  private selectedObjectId: string | null = null;
  private selectedSpawnId: string | null = null;
  private selectionBoxHelper: THREE.BoxHelper | null = null;

  private callbacks: EngineCallbacks = {};
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();
  private isDestroyed = false;

  constructor(container: HTMLElement, callbacks: EngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // slate-900 sky
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.0003);

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(55, width / height, 1, 20000);
    this.camera.position.set(0, 250, 450);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.2);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x064e3b, 0.8);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    dirLight.position.set(500, 800, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 3000;
    const d = 1000;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // 5. Controls
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.maxDistance = 6000;
    this.orbitControls.minDistance = 10;
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep camera above water
    this.orbitControls.target.set(0, 0, 0);

    // 6. TransformControls
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.size = 0.85;
    this.transformControls.addEventListener("dragging-changed", (event) => {
      this.orbitControls.enabled = !event.value;
    });

    this.transformControls.addEventListener("objectChange", () => {
      // If a regular object is transformed
      if (this.selectedObjectId) {
        const targetGroup = this.sceneObjects.get(this.selectedObjectId);
        if (!targetGroup) return;

        if (this.selectionBoxHelper) {
          this.selectionBoxHelper.update();
        }

        const pos: Vector3Tuple = [
          parseFloat(targetGroup.position.x.toFixed(2)),
          parseFloat(targetGroup.position.y.toFixed(2)),
          parseFloat(targetGroup.position.z.toFixed(2)),
        ];
        const rot: Vector3Tuple = [
          parseFloat(targetGroup.rotation.x.toFixed(3)),
          parseFloat(targetGroup.rotation.y.toFixed(3)),
          parseFloat(targetGroup.rotation.z.toFixed(3)),
        ];
        const scale: Vector3Tuple = [
          parseFloat(targetGroup.scale.x.toFixed(3)),
          parseFloat(targetGroup.scale.y.toFixed(3)),
          parseFloat(targetGroup.scale.z.toFixed(3)),
        ];

        this.callbacks.onObjectTransformed?.(this.selectedObjectId, pos, rot, scale);
        return;
      }

      // If a spawn point marker is transformed
      if (this.selectedSpawnId) {
        const spawnGroup = this.spawnMarkers.get(this.selectedSpawnId);
        if (!spawnGroup) return;

        // Keep spawn points at water level Y = 0
        spawnGroup.position.y = 0;

        if (this.selectionBoxHelper) {
          this.selectionBoxHelper.update();
        }

        const pos: Vector3Tuple = [
          parseFloat(spawnGroup.position.x.toFixed(2)),
          0,
          parseFloat(spawnGroup.position.z.toFixed(2)),
        ];
        const rot: Vector3Tuple = [
          0,
          parseFloat(spawnGroup.rotation.y.toFixed(3)),
          0,
        ];

        this.callbacks.onSpawnPointTransformed?.(this.selectedSpawnId, pos, rot);
      }
    });

    const gizmo = this.transformControls.getHelper();
    this.scene.add(gizmo);

    // 7. Water / Ocean
    this.initWater();

    // 8. Grid Helper
    this.gridHelper = new THREE.GridHelper(3000, 60, 0x38bdf8, 0x1e293b);
    this.gridHelper.position.y = 0.1;
    this.scene.add(this.gridHelper);

    // 9. World boundary circle
    this.setWorldSize(2000);

    // 10. Selection Box Helper
    this.selectionBoxHelper = new THREE.BoxHelper(new THREE.Mesh(), 0xf59e0b);
    this.selectionBoxHelper.visible = false;
    this.scene.add(this.selectionBoxHelper);

    // 11. Event Listeners
    window.addEventListener("resize", this.handleResize);
    this.renderer.domElement.addEventListener("pointerdown", this.handlePointerDown);
    this.renderer.domElement.addEventListener("pointerup", this.handlePointerUp);

    // 12. Start Loop
    this.animate();
  }

  private initWater() {
    try {
      const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
      this.water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
          "/textures/waternormals.jpg",
          (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }
        ),
        sunDirection: new THREE.Vector3(500, 800, 300).normalize(),
        sunColor: 0xfff7ed,
        waterColor: 0x03445e,
        distortionScale: 3.5,
        fog: true,
      });
      this.water.rotation.x = -Math.PI / 2;
      this.water.position.y = 0;
      this.scene.add(this.water);
    } catch (e) {
      console.warn("Could not load Three.js Water texture in editor, using fallback ocean plane", e);
      const fallbackGeo = new THREE.PlaneGeometry(10000, 10000);
      const fallbackMat = new THREE.MeshStandardMaterial({
        color: 0x082f49,
        roughness: 0.1,
        metalness: 0.2,
      });
      const fallbackWater = new THREE.Mesh(fallbackGeo, fallbackMat);
      fallbackWater.rotation.x = -Math.PI / 2;
      this.scene.add(fallbackWater);
    }
  }

  public setWorldSize(radius: number) {
    if (this.worldBoundary) {
      this.scene.remove(this.worldBoundary);
      this.worldBoundary.geometry.dispose();
    }
    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0.5, Math.sin(theta) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
    this.worldBoundary = new THREE.LineSegments(geometry, material);
    this.scene.add(this.worldBoundary);
  }

  public setTransformMode(mode: TransformMode) {
    this.transformControls.setMode(mode);
  }

  public setSnapping(snapTranslation: number | null, snapRotationDeg: number | null, snapScale: number | null) {
    this.transformControls.setTranslationSnap(snapTranslation);
    this.transformControls.setRotationSnap(snapRotationDeg ? THREE.MathUtils.degToRad(snapRotationDeg) : null);
    this.transformControls.setScaleSnap(snapScale);
  }

  public toggleGrid(visible: boolean) {
    this.gridHelper.visible = visible;
  }

  public toggleWater(visible: boolean) {
    if (this.water) this.water.visible = visible;
  }

  // --- OBJECT MANAGEMENT ---

  public async loadModel(url: string): Promise<THREE.Group> {
    if (this.modelCache.has(url)) {
      const cached = this.modelCache.get(url)!;
      return cached.scene.clone(true);
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.modelCache.set(url, gltf);
          resolve(gltf.scene.clone(true));
        },
        undefined,
        (err) => {
          console.error(`Error loading model at ${url}:`, err);
          reject(err);
        }
      );
    });
  }

  public async addObject(objData: MapObject): Promise<THREE.Group> {
    let modelGroup: THREE.Group;
    try {
      modelGroup = await this.loadModel(objData.modelUrl);
    } catch {
      // Fallback placeholder box
      const geo = new THREE.BoxGeometry(20, 20, 20);
      const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 10;
      modelGroup = new THREE.Group();
      modelGroup.add(mesh);
    }

    modelGroup.position.set(...objData.position);
    modelGroup.rotation.set(...objData.rotation);
    modelGroup.scale.set(...objData.scale);
    modelGroup.name = objData.name;

    // Enable shadows for child meshes
    modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        this.uuidToObjectId.set(child.uuid, objData.id);
      }
    });

    this.uuidToObjectId.set(modelGroup.uuid, objData.id);
    this.sceneObjects.set(objData.id, modelGroup);
    this.scene.add(modelGroup);

    return modelGroup;
  }

  public removeObject(id: string) {
    const group = this.sceneObjects.get(id);
    if (!group) return;

    if (this.selectedObjectId === id) {
      this.selectObject(null);
    }

    group.traverse((child) => {
      this.uuidToObjectId.delete(child.uuid);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });

    this.uuidToObjectId.delete(group.uuid);
    this.scene.remove(group);
    this.sceneObjects.delete(id);
  }

  public updateObjectTransform(id: string, pos?: Vector3Tuple, rot?: Vector3Tuple, scale?: Vector3Tuple) {
    const group = this.sceneObjects.get(id);
    if (!group) return;

    if (pos) group.position.set(...pos);
    if (rot) group.rotation.set(...rot);
    if (scale) group.scale.set(...scale);

    if (this.selectedObjectId === id && this.selectionBoxHelper) {
      this.selectionBoxHelper.update();
    }
  }

  public selectObject(id: string | null) {
    if (id && this.selectedSpawnId) {
      this.selectSpawnPoint(null);
    }

    this.selectedObjectId = id;

    if (!id) {
      if (!this.selectedSpawnId) {
        this.transformControls.detach();
        if (this.selectionBoxHelper) this.selectionBoxHelper.visible = false;
      }
      this.callbacks.onObjectSelected?.(null);
      return;
    }

    const group = this.sceneObjects.get(id);
    if (group) {
      this.transformControls.attach(group);
      if (this.selectionBoxHelper) {
        this.selectionBoxHelper.setFromObject(group);
        this.selectionBoxHelper.visible = true;
      }
      this.callbacks.onObjectSelected?.(id);
    }
  }

  public focusObject(id: string) {
    const group = this.sceneObjects.get(id);
    if (!group) return;

    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 20);

    this.orbitControls.target.copy(center);
    this.camera.position.set(center.x + maxDim * 1.5, center.y + maxDim * 1.2, center.z + maxDim * 1.8);
    this.orbitControls.update();
  }

  // --- SPAWN POINT MANAGEMENT ---

  public createSpawnMarkerGroup(sp: MapSpawnPoint): THREE.Group {
    const group = new THREE.Group();
    group.position.set(...sp.position);
    group.rotation.set(...sp.rotation);
    group.name = `Spawn_${sp.team}_${sp.id}`;

    const colorHex = sp.team === "blue" ? 0x3b82f6 : 0xef4444;
    const accentHex = sp.team === "blue" ? 0x93c5fd : 0xfca5a5;

    // 1. Water Ring Base
    const ringGeo = new THREE.RingGeometry(18, 22, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.3;
    group.add(ring);

    // 2. Heading Arrow pointing in direction (-Z forward)
    const arrowGeo = new THREE.ConeGeometry(5, 14, 16);
    const arrowMat = new THREE.MeshStandardMaterial({
      color: accentHex,
      emissive: colorHex,
      emissiveIntensity: 0.4,
    });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.rotation.x = -Math.PI / 2;
    arrow.position.set(0, 0.4, -26);
    group.add(arrow);

    // 3. Floating Buoy Base
    const buoyGeo = new THREE.CylinderGeometry(4, 5, 4, 16);
    const buoyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
    });
    const buoy = new THREE.Mesh(buoyGeo, buoyMat);
    buoy.position.y = 2;
    group.add(buoy);

    // 4. Pole
    const poleGeo = new THREE.CylinderGeometry(0.8, 0.8, 42, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 21;
    group.add(pole);

    // 5. Team Banner / Flag
    const flagGeo = new THREE.BoxGeometry(22, 13, 0.8);
    const flagMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.3,
      metalness: 0.1,
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(11, 34, 0);
    group.add(flag);

    // Register all meshes to spawn ID
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        this.uuidToSpawnId.set(child.uuid, sp.id);
      }
    });
    this.uuidToSpawnId.set(group.uuid, sp.id);

    return group;
  }

  public addSpawnMarker(sp: MapSpawnPoint) {
    if (this.spawnMarkers.has(sp.id)) {
      this.removeSpawnMarker(sp.id);
    }
    const group = this.createSpawnMarkerGroup(sp);
    this.scene.add(group);
    this.spawnMarkers.set(sp.id, group);
  }

  public removeSpawnMarker(id: string) {
    const group = this.spawnMarkers.get(id);
    if (!group) return;

    if (this.selectedSpawnId === id) {
      this.selectSpawnPoint(null);
    }

    group.traverse((child) => {
      this.uuidToSpawnId.delete(child.uuid);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });

    this.uuidToSpawnId.delete(group.uuid);
    this.scene.remove(group);
    this.spawnMarkers.delete(id);
  }

  public updateSpawnPointTransform(id: string, pos?: Vector3Tuple, rot?: Vector3Tuple) {
    const group = this.spawnMarkers.get(id);
    if (!group) return;

    if (pos) group.position.set(pos[0], 0, pos[2]);
    if (rot) group.rotation.set(0, rot[1], 0);

    if (this.selectedSpawnId === id && this.selectionBoxHelper) {
      this.selectionBoxHelper.update();
    }
  }

  public selectSpawnPoint(id: string | null) {
    if (id && this.selectedObjectId) {
      this.selectObject(null);
    }

    this.selectedSpawnId = id;

    if (!id) {
      if (!this.selectedObjectId) {
        this.transformControls.detach();
        if (this.selectionBoxHelper) this.selectionBoxHelper.visible = false;
      }
      this.callbacks.onSpawnPointSelected?.(null);
      return;
    }

    const group = this.spawnMarkers.get(id);
    if (group) {
      this.transformControls.attach(group);
      if (this.selectionBoxHelper) {
        this.selectionBoxHelper.setFromObject(group);
        this.selectionBoxHelper.visible = true;
      }
      this.callbacks.onSpawnPointSelected?.(id);
    }
  }

  public focusSpawnPoint(id: string) {
    const group = this.spawnMarkers.get(id);
    if (!group) return;

    const center = group.position;
    this.orbitControls.target.set(center.x, 10, center.z);
    this.camera.position.set(center.x + 80, 70, center.z + 100);
    this.orbitControls.update();
  }

  public setSpawnMarkers(spawnPoints: { blue: MapSpawnPoint[]; red: MapSpawnPoint[] }) {
    // Clear old markers
    this.spawnMarkers.forEach((_, id) => this.removeSpawnMarker(id));
    this.spawnMarkers.clear();

    spawnPoints.blue.forEach((sp) => this.addSpawnMarker(sp));
    spawnPoints.red.forEach((sp) => this.addSpawnMarker(sp));
  }

  public clearScene() {
    this.selectObject(null);
    this.selectSpawnPoint(null);
    this.sceneObjects.forEach((_, id) => this.removeObject(id));
    this.spawnMarkers.forEach((_, id) => this.removeSpawnMarker(id));
  }

  // --- RAYCASTING & INTERACTION ---

  private handlePointerDown = (event: MouseEvent) => {
    this.pointerDownPos.set(event.clientX, event.clientY);
  };

  private handlePointerUp = (event: MouseEvent) => {
    // Only raycast if it was a click, not a camera drag
    const dist = this.pointerDownPos.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
    if (dist > 5) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Collect all selectable meshes: scene objects + spawn markers
    const candidates: THREE.Object3D[] = [];
    this.sceneObjects.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) candidates.push(child);
      });
    });

    this.spawnMarkers.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) candidates.push(child);
      });
    });

    const intersects = this.raycaster.intersectObjects(candidates, true);
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;

      // Check if it's a spawn point
      const spawnId = this.uuidToSpawnId.get(hitMesh.uuid);
      if (spawnId) {
        this.selectSpawnPoint(spawnId);
        return;
      }

      // Check if it's a regular scene object
      const objectId = this.uuidToObjectId.get(hitMesh.uuid);
      if (objectId) {
        this.selectObject(objectId);
        return;
      }
    }

    // Clicked empty space
    this.selectObject(null);
    this.selectSpawnPoint(null);
  };

  private handleResize = () => {
    if (this.isDestroyed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    if (this.isDestroyed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    if (this.water) {
      this.water.material.uniforms["time"].value += delta * 0.5;
    }

    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.isDestroyed = true;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    window.removeEventListener("resize", this.handleResize);
    this.renderer.domElement.removeEventListener("pointerdown", this.handlePointerDown);
    this.renderer.domElement.removeEventListener("pointerup", this.handlePointerUp);

    this.clearScene();
    this.transformControls.dispose();
    this.orbitControls.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
