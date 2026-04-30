import * as THREE from "three";

export class Explosion {
  private points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private velocities: THREE.Vector3[] = [];
  private age = 0;
  private lifetime = 1000; 

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    const count = 30; 
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // velocidad aleatoria hacia afuera
      this.velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.1,
        (Math.random() - 0.5) * 0.2
      ));
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.3,
    });

    this.points = new THREE.Points(this.geometry, material);
    scene.add(this.points);
  }

  update(delta: number) {
    this.age += delta;

    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.velocities.length; i++) {
      positions[i * 3] += this.velocities[i].x;
      positions[i * 3 + 1] += this.velocities[i].y;
      positions[i * 3 + 2] += this.velocities[i].z;
    }

    this.geometry.attributes.position.needsUpdate = true;

    const progress = this.age / this.lifetime;
    const mat = this.points.material as THREE.PointsMaterial;
    mat.color.lerpColors(new THREE.Color(0xff6600), new THREE.Color(0x444444), progress);

    if (!this.isAlive()) this.destroy();
  }

  isAlive(): boolean {
    return this.age <= this.lifetime;
  }

  destroy() {
    this.points.removeFromParent();
    this.geometry.dispose();
  }
}