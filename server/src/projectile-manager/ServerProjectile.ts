export class ServerProjectile {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  ownerId: string;
  damage: number;
  age = 0;
  lifetime = 5000;
  id!: string;

  constructor(
    position: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    ownerId: string,
    damage: number,
    projectileId: string
  ) {
    this.position = { ...position };
    this.ownerId = ownerId;
    this.damage = damage;
    this.id = projectileId;
const speed = 0.05 * 16.67; // velocidad por tick (16.67ms = 1 tick a 60 TPS)
    this.velocity = {
      x: direction.x * speed,
      y: direction.y * speed,
      z: direction.z * speed,
    };
  }

  kill() {
    this.age = this.lifetime + 1;
  }

  update(delta: number) {
    // La velocidad ya está por tick, usar delta directamente
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;
    this.age += delta;
  }

  isAlive(): boolean {
    return this.age <= this.lifetime;
  }
}