export class ServerProjectile {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  ownerId: string;
  damage: number;
  age = 0;
  lifetime = 5000;

  constructor(
    position: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    ownerId: string,
    damage: number
  ) {
    this.position = { ...position };
    this.ownerId = ownerId;
    this.damage = damage;
    const speed = 0.2;
    this.velocity = {
      x: direction.x * speed,
      y: direction.y * speed,
      z: direction.z * speed,
    };
  }

  update(delta: number) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;
    this.age += delta;
  }

  isAlive(): boolean {
    return this.age <= this.lifetime;
  }
}