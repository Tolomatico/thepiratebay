import * as THREE from "three";
import { Boat } from "../boat/Boat";

export class DirectionHelper {
  private frontArrow: THREE.ArrowHelper;
  private leftArrow: THREE.ArrowHelper;
  private rightArrow: THREE.ArrowHelper;

  constructor(scene: THREE.Scene, origin: THREE.Object3D | Boat) {
    const direction = new THREE.Vector3(0, 0, 1);
    const length = 2;
    const color = 0xffff00;

    const leftDirection = new THREE.Vector3(-1, 0, 0);
    const rightDirection = new THREE.Vector3(1, 0, 0);
    this.frontArrow=new THREE.ArrowHelper(direction,origin.position,length,color)
    this.leftArrow=new THREE.ArrowHelper(leftDirection,origin.position,length,0xff0000)
    this.rightArrow=new THREE.ArrowHelper(rightDirection,origin.position,length,0x00ff00)

    scene.add(this.frontArrow);
    scene.add(this.leftArrow);
    scene.add(this.rightArrow);
  }

  update(origin: THREE.Object3D) {
    const dir = new THREE.Vector3(0, 0, 1);
    dir.applyQuaternion(origin.quaternion);
    const leftDir = new THREE.Vector3(-1, 0, 0);
    leftDir.applyQuaternion(origin.quaternion);
    const rightDir = new THREE.Vector3(1, 0, 0);
    rightDir.applyQuaternion(origin.quaternion);
    this.frontArrow.setDirection(dir);
    this.leftArrow.setDirection(leftDir)
    this.rightArrow.setDirection(rightDir)
    this.frontArrow.position.copy(origin.position);
    this.leftArrow.position.copy(origin.position);
    this.rightArrow.position.copy(origin.position);
  }
}