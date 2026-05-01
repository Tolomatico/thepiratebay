import * as THREE from "three";

interface HealthTarget {
    getPosition(): THREE.Vector3;
    getHealthRatio(): number;
}

export class HUD {
  private healthEl: HTMLElement;
  private enemyCountEl: HTMLElement;
  private camera: THREE.PerspectiveCamera
  private targetBars: Map<any, { container: HTMLElement, fill: HTMLElement }> = new Map()
  private playerBarFillEl: HTMLElement;
  private playerBarTextEl: HTMLElement;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera
  
    const container = document.createElement("div");
    container.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      color: white;
      font-family: monospace;
      font-size: 16px;
      pointer-events: none;
    `;

    // barra de vida del jugador
    const playerBarContainer = document.createElement("div");
    playerBarContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 20px;
      background: rgba(0,0,0,0.5);
      border: 1px solid white;
      border-radius: 6px;
      overflow: hidden;
    `;

    this.playerBarFillEl = document.createElement("div");
    this.playerBarFillEl.style.cssText = `
      position: absolute;
      height: 100%;
      width: 100%;
      background: rgba(0,255,0,0.8);
      transition: width 0.2s;
    `;

    this.playerBarTextEl = document.createElement("div"); 
    this.playerBarTextEl.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: monospace;
      font-size: 11px;
      text-shadow: 1px 1px 2px black;
    `;

    playerBarContainer.appendChild(this.playerBarFillEl);
    playerBarContainer.appendChild(this.playerBarTextEl);
    document.body.appendChild(playerBarContainer);

    this.healthEl = document.createElement("div");
    this.enemyCountEl = document.createElement("div");

    container.appendChild(this.healthEl);
    container.appendChild(this.enemyCountEl);
    document.body.appendChild(container);
  }

  updateBars(targets: HealthTarget[]) {
    // Limpiar barras de objetivos que ya no están
    for (const [target, bar] of this.targetBars) {
      if (!targets.includes(target)) {
        bar.container.remove();
        this.targetBars.delete(target);
      }
    }

    for (const target of targets) {
      let bar = this.targetBars.get(target);
      if (!bar) {
        const container = document.createElement("div");
        container.style.cssText = `
          position: absolute;
          width: 60px;
          height: 6px;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 3px;
          overflow: hidden;
        `;
        
        const fill = document.createElement("div");
        fill.style.cssText = `
          height: 100%;
          width: 100%;
          background: #00ff00;
          transition: width 0.1s;
        `;
        
        container.appendChild(fill);
        document.body.appendChild(container);
        bar = { container, fill };
        this.targetBars.set(target, bar);
      }

      const pos = target.getPosition().clone();
      pos.y += 11; // Altura sobre el barco (por encima del mástil)
      pos.project(this.camera);

      if (pos.z > 1 || pos.x < -1 || pos.x > 1 || pos.y < -1 || pos.y > 1) {
        bar.container.style.display = 'none';
        continue;
      }

      bar.container.style.display = 'block';
      const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;

      bar.container.style.left = `${x - 30}px`;
      bar.container.style.top = `${y}px`;

      const ratio = target.getHealthRatio();
      bar.fill.style.width = `${ratio * 100}%`;
      
      // Color dinámico
      if (ratio < 0.3) bar.fill.style.background = "#ff0000";
      else if (ratio < 0.6) bar.fill.style.background = "#ffff00";
      else bar.fill.style.background = "#00ff00";
    }
  }

  update(data: { 
    player: { playerHealth: number, maxPlayerHealth: number }, 
    enemyCount: number, 
    enemies: HealthTarget[] 
  }) {
    this.healthEl.textContent = `Vida: ${data.player.playerHealth}`;
    this.enemyCountEl.textContent = `Enemigos: ${data.enemyCount}`;

    this.updateBars(data.enemies);

    const ratio = Math.max(0, data.player.playerHealth / data.player.maxPlayerHealth);
    this.playerBarFillEl.style.width = `${ratio * 100}%`;
    this.playerBarTextEl.textContent = `${data.player.playerHealth} / ${data.player.maxPlayerHealth} (${Math.round(ratio * 100)}%)`;

    this.playerBarFillEl.style.background = ratio > 0.3 ? 'rgba(0,255,0,0.8)' : 'rgba(255,0,0,0.8)';
  }
}