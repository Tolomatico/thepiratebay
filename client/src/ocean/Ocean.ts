import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

export class Ocean {
  private water: Water;
  private waveHeight = 0.05;
  private waveSpeed = 0.0005;
  private waveLength = 0.03;

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.PlaneGeometry(500, 500, 500, 500);

    this.water = new Water(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        '/textures/waternormals.jpg',
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      sunDirection: new THREE.Vector3(1, 1, 0).normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
    });

    this.water.rotation.x = -Math.PI / 2;
    scene.add(this.water);
  }

  getWaveHeight(x: number, z: number, time: number): number {
    return (
      Math.sin(x * this.waveLength + time * this.waveSpeed) * this.waveHeight +
      Math.sin(z * (this.waveLength * 1.5) + time * (this.waveSpeed * 0.2)) * this.waveHeight
    );
  }

  update(time: number) {
    this.water.material.uniforms['time'].value = time * 0.001;
  }
}