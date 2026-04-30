export class Player {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { y: number };
  health: number;

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
}