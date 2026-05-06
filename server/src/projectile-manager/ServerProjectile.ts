export class ServerProjectile {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  ownerId: string;
  damage: number;
  age = 0;
  lifetime = 5000;
  id!: string;
  lobbyId: string | null = null;
  isDead = false;

  constructor(
    position: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    ownerId: string,
    damage: number,
    projectileId: string,
    lobbyId: string | null
  ) {
    this.position = { ...position };
    this.ownerId = ownerId;
    this.damage = damage;
    this.id = projectileId;
    this.lobbyId = lobbyId;
    
    // Normalizar la dirección
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    const normalized = length > 0 ? {
      x: direction.x / length,
      y: direction.y / length,
      z: direction.z / length
    } : { x: 0, y: 0, z: 0 };
    
    // Velocidad: 0.83 unidades/tick (~50 unidades/segundo)
    const speed = 0.24
    this.velocity = {
      x: normalized.x * speed,
      y: normalized.y * speed,
      z: normalized.z * speed,
    };
  }

  kill() {
    this.age = this.lifetime + 1;
  }

  update(delta: number) {
  const normalizedDelta = delta / 16.67; // ← normalizar a 60fpsw
  this.position.x += this.velocity.x * normalizedDelta;
  this.position.y += this.velocity.y * normalizedDelta;
  this.position.z += this.velocity.z * normalizedDelta;
  this.age += delta;
}

  isAlive(): boolean {
    return this.age <= this.lifetime && !this.isDead;
  }
}