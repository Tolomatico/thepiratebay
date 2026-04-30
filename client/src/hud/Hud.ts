import * as THREE from "three";
import type { Enemy } from "../bots/Enemy";

export class HUD {
  private healthEl: HTMLElement;
  private enemyCountEl: HTMLElement;
  private camera: THREE.PerspectiveCamera
  private enemyBars: Map<Enemy, HTMLElement> = new Map()
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

this.playerBarTextEl = document.createElement("div"); // ← nueva propiedad
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

  createEnemyBar(  enemies: Enemy[] ) {
   for (const [enemy, bar] of this.enemyBars) {
  if (!enemies.includes(enemy)) {
    bar.remove();
    this.enemyBars.delete(enemy);
  }
}
    for (const enemy of enemies) {
  let bar = this.enemyBars.get(enemy);
  if (!bar) {
    bar = document.createElement("div");
    bar.style.cssText = `
      position: absolute;
      width: 60px;
      height: 8px;
      background: rgba(255,0,0,0.8);
      border: 1px solid white;
      border-radius: 4px;
    `;
    document.body.appendChild(bar);
    this.enemyBars.set(enemy, bar);
  }

 const enemyPos = enemy.getPosition().clone();
enemyPos.y += 3; 
enemyPos.project(this.camera);

if (enemyPos.z > 1) {
  bar.style.display = 'none';
  continue;
}
bar.style.display = 'block';

const x = (enemyPos.x * 0.5 + 0.5) * window.innerWidth;
const y = (-enemyPos.y * 0.5 + 0.5) * window.innerHeight; 

bar.style.left = `${x - 30}px`;
bar.style.top = `${y - 12}px`;


  const ratio = Math.max(0, enemy.getHealthRatio());  
  bar.style.width = `${60 * ratio}px`;
}
  }

  update(data: { player: {playerHealth:number,maxPlayerHealth:number}; enemyCount: number,enemies: Enemy[]}) {
     this.healthEl.textContent = `Vida: ${data.player.playerHealth}`;
  this.enemyCountEl.textContent = `Enemigos: ${data.enemyCount}`

  this.createEnemyBar(data.enemies);
  const ratio = Math.max(0, data.player.playerHealth / data.player.maxPlayerHealth);
this.playerBarFillEl.style.width = `${ratio * 100}%`;
this.playerBarTextEl.textContent = `${data.player.playerHealth} / ${data.player.maxPlayerHealth} (${Math.round(ratio * 100)}%)`;

this.playerBarFillEl.style.background = ratio > 0.3
  ? 'rgba(0,255,0,0.8)'
  : 'rgba(255,0,0,0.8)';
    



  }
}