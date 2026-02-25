import * as THREE from "three";
import Experience from "../experience.js";

export default class Floor {
  constructor() {
    // ========== DEPENDENCIES ==========
    this.experience = Experience.instance;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // ========== INITIALIZATION ==========
    this.setFloor();
  }

  // ========== FLOOR CREATION ==========
  setFloor() {
    this.createMainFloor();
    this.createFirstRing();
    this.createSecondRing();
  }

  createMainFloor() {
    // Main floor circle
    this.geometry = new THREE.CircleGeometry(7, 32);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xdcdcd1,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    this.mainFloor = new THREE.Mesh(this.geometry, this.material);
    this.mainFloor.rotation.x = -Math.PI / 2;
    this.mainFloor.position.y = 0.01; // Slightly raised to avoid z-fighting
    this.mainFloor.receiveShadow = true;
    this.scene.add(this.mainFloor);
  }

  createFirstRing() {
    // First ring - slightly bigger and darker
    this.ring1Geo = new THREE.CircleGeometry(9, 32);
    this.ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xacacac, // Darker than main
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    this.ring1 = new THREE.Mesh(this.ring1Geo, this.ring1Mat);
    this.ring1.rotation.x = -Math.PI / 2;
    this.ring1.position.y = 0; // Slightly below main floor
    this.ring1.receiveShadow = true;
    this.scene.add(this.ring1);
  }

  createSecondRing() {
    // Second ring - even bigger and darker
    this.ring2Geo = new THREE.CircleGeometry(9.5, 32);
    this.ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x818181, // Darker than first ring
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    this.ring2 = new THREE.Mesh(this.ring2Geo, this.ring2Mat);
    this.ring2.rotation.x = -Math.PI / 2;
    this.ring2.position.y = -0.01; // Slightly below first ring
    this.ring2.receiveShadow = true;
    this.scene.add(this.ring2);
  }

  // ========== RESIZE HANDLING ==========
  resize() {
    // Handle resize if needed
  }

  // ========== UPDATE LOOP ==========
  update() {
    // Update floor animation if needed
  }
}
