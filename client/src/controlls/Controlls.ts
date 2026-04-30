import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Controlls{
    private controls: OrbitControls;
    private target: THREE.Object3D;
    private camera: THREE.PerspectiveCamera;
    private offset: THREE.Vector3 = new THREE.Vector3(0, 8, 15);
    private lastTargetPos: THREE.Vector3;

    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement, target: THREE.Object3D) {
        this.camera = camera;
        this.target = target;
        this.lastTargetPos = target ? target.position.clone() : new THREE.Vector3();
        
        this.controls = new OrbitControls(camera, domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2.1;
        this.controls.minPolarAngle = Math.PI / 6;
    }

    update() {
        if (!this.target) return;
        
        const targetPos = this.target.position.clone();
        const deltaMove = targetPos.clone().sub(this.lastTargetPos);
        
        this.camera.position.add(deltaMove);
        this.controls.target.copy(targetPos);
        this.controls.update();
        
        this.lastTargetPos.copy(targetPos);
    }
    
    setTarget(target: THREE.Object3D) {
        this.target = target;
        this.lastTargetPos = target.position.clone();
    }
    
    setOffset(offset: THREE.Vector3) {
        this.offset.copy(offset);
    }
    
    getOffset(): THREE.Vector3 {
        return this.offset.clone();
    }
    
}