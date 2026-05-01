export class Player {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { y: number };
  maxHealth: number = 500;
  health: number = 500;
  
  constructor(id: string) {
    this.id = id;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { y: 0 };
    this.health = 500;
  }

  move(position: { x: number; y: number; z: number }, rotation: { y: number }) {
    this.position = position;
    this.rotation = rotation;
  }
   takeDamage(amount: number) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
    console.log(`Player ${this.id} health: ${this.health}`);
  }
}