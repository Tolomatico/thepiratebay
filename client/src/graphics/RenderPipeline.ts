import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { FXAAPass } from "three/examples/jsm/postprocessing/FXAAPass.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

export class RenderPipeline {
  public renderer: THREE.WebGLRenderer;
  public composer: EffectComposer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Iluminación
  public sunLight: THREE.DirectionalLight;
  private sunTarget: THREE.Object3D;
  private sunOffset = new THREE.Vector3(60, 35, 45);
  public hemiLight: THREE.HemisphereLight;
  public ambientLight: THREE.AmbientLight;

  // Postprocesado
  private renderPass: RenderPass;
  private bloomPass: UnrealBloomPass;
  private outputPass: OutputPass;
  private fxaaPass: FXAAPass;

  // Cielo
  public sky: Sky;

  constructor(container: HTMLElement, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Habilitar la capa 1 en la cámara principal para que vea el cielo
    this.camera.layers.enable(1);

    // 1. WebGL Renderer con sombras suaves y ToneMapping fílmico
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;

    // Habilitar sombras suaves
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Exponer el renderer y utilidades de rendimiento en la consola de Chrome
    (window as any).__renderer = this.renderer;
    (window as any).renderer = this.renderer;
    (window as any).__renderPipeline = this;
    (window as any).getDrawCalls = () => {
      const stats = this.lastFrameStats;
      console.table({
        "Draw Calls (Calls)": stats.totalCalls,
        "Triángulos": stats.triangles.toLocaleString(),
        "Líneas": stats.lines,
        "Puntos": stats.points,
        "Geometrías (VRAM)": stats.geometries,
        "Texturas (VRAM)": stats.textures,
        "Frame": stats.frame
      });
      return stats;
    };

    // 2. Sistema de Iluminación
    this.sunTarget = new THREE.Object3D();
    this.scene.add(this.sunTarget);

    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    this.sunLight.position.copy(this.sunOffset);
    this.sunLight.target = this.sunTarget;
    this.sunLight.castShadow = true;

    // Optimización de la cámara de sombras para que cubra la zona alrededor del barco
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 220;
    const d = 50;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.03;

    this.scene.add(this.sunLight);

    // Luz ambiental y hemisférica (cielo azul / reflejo del mar)
    this.hemiLight = new THREE.HemisphereLight(0x9bd4f5, 0x0a2d38, 0.9);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambientLight);

    // 3. Fondo de soporte y Cielo Procedural aislado en Capa 1
    // (La cámara de reflejo del agua solo renderiza capa 0, por lo que nunca refleja el HDR cegador del Sky)
    this.scene.background = new THREE.Color(0x7daec4);
    this.scene.fog = new THREE.FogExp2(0x7daec4, 0.0018);

    this.sky = new Sky();
    this.sky.scale.setScalar(10000);
    this.sky.layers.set(1);

    // Clampear la salida del fragment shader del Sky a [0.0, 1.0]
    // Esto evita que la radiación solar astronómica supere el umbral de Bloom y ciegue la pantalla
    this.sky.material.fragmentShader = this.sky.material.fragmentShader.replace(
      "gl_FragColor = vec4( texColor, 1.0 );",
      "gl_FragColor = vec4( clamp( texColor, 0.0, 1.0 ), 1.0 );"
    );
    this.sky.material.needsUpdate = true;

    this.scene.add(this.sky);

    const skyUniforms = this.sky.material.uniforms;
    skyUniforms["turbidity"].value = 6;
    skyUniforms["rayleigh"].value = 0.8;
    skyUniforms["mieCoefficient"].value = 0.001;
    skyUniforms["mieDirectionalG"].value = 0.95;
    skyUniforms["sunPosition"].value.copy(this.sunOffset.clone().normalize().multiplyScalar(10000));

    // 4. Post-processing Composer
    this.composer = new EffectComposer(this.renderer);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // Bloom selectivo: umbral alto para que NO brille el agua reflejada, solo proyectiles y fuego
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.35,  // Intensidad
      0.2,   // Radio
      1.15   // Umbral: solo brillan elementos emisivos (balas con intensidad > 1.15)
    );
    this.composer.addPass(this.bloomPass);

    // OutputPass aplica el tone mapping y el espacio de color sRGB
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    // FXAA para antialiasing de bordes en postprocesado
    this.fxaaPass = new FXAAPass();
    this.fxaaPass.setSize(width, height);
    this.composer.addPass(this.fxaaPass);
  }

  public lastFrameStats = {
    totalCalls: 0,
    triangles: 0,
    lines: 0,
    points: 0,
    geometries: 0,
    textures: 0,
    frame: 0
  };

  public render(targetPosition?: THREE.Vector3) {
    // Mantener el domo del cielo siempre centrado en la cámara
    this.sky.position.copy(this.camera.position);

    // Si tenemos la posición del barco, movemos la luz del sol y el target
    // para mantener sombras de alta resolución centradas en el jugador
    if (targetPosition) {
      this.sunTarget.position.copy(targetPosition);
      this.sunLight.position.set(
        targetPosition.x + this.sunOffset.x,
        targetPosition.y + this.sunOffset.y,
        targetPosition.z + this.sunOffset.z
      );
    }

    // Desactivamos autoReset para que Three.js no borre los stats en cada pase del EffectComposer
    this.renderer.info.autoReset = false;
    this.renderer.info.reset();

    // Renderizar todos los pases del composer (Escena 3D + Bloom + Output + FXAA)
    this.composer.render();

    // Guardar métricas reales acumuladas del cuadro completo
    this.lastFrameStats.totalCalls = this.renderer.info.render.calls;
    this.lastFrameStats.triangles = this.renderer.info.render.triangles;
    this.lastFrameStats.lines = this.renderer.info.render.lines;
    this.lastFrameStats.points = this.renderer.info.render.points;
    this.lastFrameStats.geometries = this.renderer.info.memory.geometries;
    this.lastFrameStats.textures = this.renderer.info.memory.textures;
    this.lastFrameStats.frame = this.renderer.info.render.frame;
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.fxaaPass.setSize(width, height);
  }

  public dispose() {
    this.composer.dispose();
    this.renderer.dispose();
  }
}
