import * as THREE from "three";
import Experience from "../experience.js";

export default class Floor {
  constructor() {
    this.experience = Experience.instance;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.setFloor();
  }

  setFloor() {
    // Create a simple plane for the floor
    this.geometry = new THREE.PlaneGeometry(70, 20);

    // Create material with a subtle color
    this.material = new THREE.MeshStandardMaterial({
      color: 0xDCDCD1,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    // Create mesh
    this.plane = new THREE.Mesh(this.geometry, this.material);

    // Position and rotate
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.y = 0;

    // Enable shadows
    this.plane.receiveShadow = true;

    // Add to scene
    this.scene.add(this.plane);


  }

  resize() {
    // Handle resize if needed
  }

  update() {
    // Update floor animation if needed
  }
}
