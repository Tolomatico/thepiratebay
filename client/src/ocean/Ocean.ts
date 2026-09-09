import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

export class Ocean {
  private water: Water;

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    

    this.water = new Water(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        '/textures/waternormals.jpg',
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      sunDirection: new THREE.Vector3(60, 35, 45).normalize(),
      sunColor: 0x665544,
      waterColor: 0x0a2d3d,
      distortionScale: 3.5,
      fog: true
    });
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.y = 0;
    scene.add(this.water);
  }

  getWaveHeight(_x: number, _z: number, _time: number): number {
    return 0;
  }

  update(time: number) {
    this.water.material.uniforms['time'].value = time * 0.001;
  }
}