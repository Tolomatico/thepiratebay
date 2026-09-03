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
  ownerTeam: string;

  constructor(
    position: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    ownerId: string,
    damage: number,
    projectileId: string,
    lobbyId: string | null,
    ownerTeam: string
  ) {
    const spawnY = position.y <= 1 ? 3 : position.y;
    this.position = { x: position.x, y: spawnY, z: position.z };
    this.ownerId = ownerId;
    this.damage = damage;
    this.id = projectileId;
    this.lobbyId = lobbyId;
    this.ownerTeam = ownerTeam;
    
    
    // Normalizar la dirección
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    const normalized = length > 0 ? {
      x: direction.x / length,
      y: direction.y / length,
      z: direction.z / length
    } : { x: 0, y: 0, z: 0 };
    
    // Velocidad: 0.60 unidades/tick sincronizado con cliente
    const speed = 0.6;
    this.velocity = {
      x: normalized.x * speed,
      y: normalized.y * speed + 0.035, // misma elevación que cliente
      z: normalized.z * speed,
    };
  }

  kill() {
    this.isDead = true;
    this.age = this.lifetime + 1;
  }

  update(delta: number) {
    const normalizedDelta = delta / 16.67; // normalizar a 60fps
    this.position.x += this.velocity.x * normalizedDelta;
    this.position.y += this.velocity.y * normalizedDelta;
    this.position.z += this.velocity.z * normalizedDelta;

    // Misma gravedad que cliente (0.00075)
    this.velocity.y -= 0.00075 * normalizedDelta;

    this.age += delta;

    // Si cae al agua, muere inmediatamente y no puede registrar impacto
    if (this.position.y <= 0) {
      this.isDead = true;
    }
  }

  isAlive(): boolean {
    return this.age <= this.lifetime && !this.isDead;
  }
}