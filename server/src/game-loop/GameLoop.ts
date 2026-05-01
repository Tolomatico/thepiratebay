// server/src/game/GameLoop.ts
import { performance } from "node:perf_hooks";
import { GameManager } from "../game-manager/GameManager.js";

type GameLoopMode = "fixed" | "variable";

export class GameLoop {
   private gameManager:GameManager
  private intervalId: NodeJS.Timeout | null = null;
  private mode: GameLoopMode;
  private lastTickTime: number = 0;
  private accumulatedTime: number = 0;
  private readonly fixedDelta = 1000 / 60; // ~16.67ms por tick
  private readonly tickInterval = this.fixedDelta;

  constructor(mode: GameLoopMode = "variable",gameManager:GameManager) {
    this.mode = mode;
    this.gameManager = gameManager;
  }

  start(): void {
    if (this.intervalId) return;
    this.lastTickTime = performance.now();
    this.intervalId = setInterval(() => this.tick(performance.now()), this.tickInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(currentTime: number): void {
    if (this.mode === "variable") {
      const delta = currentTime - this.lastTickTime;
      this.lastTickTime = currentTime;
      this.runLogic(delta);
    } else {
      const delta = currentTime - this.lastTickTime;
      this.lastTickTime = currentTime;
      this.accumulatedTime += delta;

      while (this.accumulatedTime >= this.fixedDelta) {
        this.runLogic(this.fixedDelta);
        this.accumulatedTime -= this.fixedDelta;
      }
    }
  }

  private runLogic(delta: number): void {
    this.gameManager.update(delta)
  }
}