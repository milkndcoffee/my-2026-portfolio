import Experience from "./experience.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera {
  constructor() {
    this.experience = Experience.instance;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.createPerspectiveCamera();
    // this.createOrthographicCamera();
    this.setOrbitControls();
  }

  createPerspectiveCamera() {
    this.perspectiveCamera = new THREE.PerspectiveCamera(
      35,
      this.sizes.aspect,
      0.1,
      1000,
    );
    this.scene.add(this.perspectiveCamera);
    this.perspectiveCamera.position.set(0, 1, 15);
    // this.perspectiveCamera.rotation.x = -Math.PI / 118;
    this.scene.add(this.perspectiveCamera);
  }

  // Adjust these values based on your model size

//   createOrthographicCamera() {
//     const frustrumSize = 10;
//     const aspect = this.sizes.aspect;

//     this.orthographicCamera = new THREE.OrthographicCamera(
//       (-frustrumSize * aspect) / 2,
//       (frustrumSize * aspect) / 2,
//       frustrumSize / 2,
//       -frustrumSize / 2,
//       0.1, // Fixed: positive near plane
//       100, // Fixed: positive far plane
//     );

//     this.orthographicCamera.position.set(0, 0, 10); // Look from front
//     this.orthographicCamera.lookAt(0, 0, 0);
//     this.scene.add(this.orthographicCamera);
//   }

  setOrbitControls() {
    this.controls = new OrbitControls(this.perspectiveCamera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.maxPolarAngle = Math.PI / 2; // Limit to avoid flipping
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;
  }

  resize() {
    // Update perspective camera
    this.perspectiveCamera.aspect = this.sizes.aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    // // Update orthographic camera
    // const frustrumSize = 10;
    // const aspect = this.sizes.aspect;

    // this.orthographicCamera.left = (-frustrumSize * aspect) / 2;
    // this.orthographicCamera.right = (frustrumSize * aspect) / 2;
    // this.orthographicCamera.top = frustrumSize / 2;
    // this.orthographicCamera.bottom = -frustrumSize / 2;
    // this.orthographicCamera.updateProjectionMatrix();
  }

  update() {
    if (this.controls) {
      this.controls.update();
    }

    // Update orthographic camera helper if exists
    // if (this.helper) {
    //     this.helper.update();
    // }
  }
}
