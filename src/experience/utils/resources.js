import * as THREE from "three";
import { EventEmitter } from "events";
import Experience from "../experience.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { TextureLoader } from "three";

export default class Resources extends EventEmitter {
  constructor(assets) {
    super();

    // ========== INITIALIZATION ==========
    this.emit("progress", 0);

    Resources.instanceCount++;
    console.log(`Resources instance #${Resources.instanceCount} created`);

    this.experience = Experience.instance;
    this.assets = assets;

    this.items = {};
    this.queue = this.assets.length;
    this.loaded = 0;

    console.log(`Resources constructor - ${this.queue} assets to load`);
    console.log("Assets:", this.assets);

    // ========== SETUP LOADERS ==========
    this.setLoaders();

    // ========== START LOADING ==========
    this.startLoading();
  }

  // ========== LOADER CONFIGURATION ==========
  setLoaders() {
    this.loaders = {};

    // GLTF/GLB loader
    this.loaders.gltfLoader = new GLTFLoader();

    // Draco compression loader
    this.loaders.dracoLoader = new DRACOLoader();
    this.loaders.dracoLoader.setDecoderPath("draco/");
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);

    // FBX loader
    this.loaders.fbxLoader = new FBXLoader();

    // Texture loader
    this.loaders.textureLoader = new TextureLoader();

    // Cube texture loader
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  // ========== LOADING CONTROLLER ==========
  startLoading() {
    console.log(`Loading ${this.queue} assets...`);

    // Debug: Log each asset being loaded
    for (const asset of this.assets) {
      console.log(`Will load: ${asset.name} from ${asset.path}`);

      switch (asset.type) {
        case "glbModel":
        case "gltfModel":
          this.loadGLTF(asset);
          break;

        case "fbxModel":
          this.loadFBX(asset);
          break;

        case "texture":
          this.loadTexture(asset);
          break;

        case "cubeTexture":
          this.loadCubeTexture(asset);
          break;

        case "videoTexture":
          this.loadVideoTexture(asset);
          break;

        default:
          console.warn(`Unknown asset type: ${asset.type}`);
          this.loaded++;
          break;
      }
    }
  }

  // ========== GLTF LOADING ==========
  loadGLTF(asset) {
    console.log(`Starting loadGLTF for ${asset.name}...`);

    this.loaders.gltfLoader.load(
      asset.path,
      (file) => {
        console.log(`✅ Successfully loaded ${asset.name}`);
        this.debugGLTFStructure(file);
        this.ensureSceneProperty(file);
        this.singleAssetLoaded(asset, file);
      },
      (progress) => {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
        console.log(`⏳ Loading ${asset.name}: ${percent}%`);
      },
      (error) => {
        console.error(`❌ Error loading ${asset.name}:`, error);
        console.error(`Error details:`, error.message);
        console.error(`Stack:`, error.stack);

        // Create an error object instead of null
        const errorObj = {
          _error: true,
          message: error.message,
          name: asset.name,
        };
        this.singleAssetLoaded(asset, errorObj);
      },
    );
  }

  debugGLTFStructure(file) {
    // DEBUG: Log the ENTIRE structure
    console.log("=== GLTF FILE STRUCTURE ===");
    console.log("File object:", file);
    console.log("File keys:", Object.keys(file));
    console.log("File.scene:", file.scene);
    console.log("File.parser:", file.parser);
    console.log("File.animations:", file.animations);
    console.log("File.cameras:", file.cameras);
    console.log("File.scenes:", file.scenes);
    console.log("File.asset:", file.asset);
    console.log("File.userData:", file.userData);
    console.log("=== END STRUCTURE ===");
  }

  ensureSceneProperty(file) {
    // Check if it has scenes array
    if (file.scenes && file.scenes.length > 0) {
      console.log(`Found ${file.scenes.length} scenes, using first one`);
      // Some GLTF loaders return scenes array instead of .scene
      file.scene = file.scenes[0];
    }
  }

  // ========== FBX LOADING ==========
  loadFBX(asset) {
    this.loaders.fbxLoader.load(
      asset.path,
      (file) => {
        console.log(`Loaded FBX: ${asset.name}`);
        this.singleAssetLoaded(asset, file);
      },
      (progress) => {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
        console.log(`Loading ${asset.name}: ${percent}%`);
      },
      (error) => {
        console.error(`Error loading ${asset.name}:`, error);
        this.singleAssetLoaded(asset, null);
      },
    );
  }

  // ========== TEXTURE LOADING ==========
  loadTexture(asset) {
    this.loaders.textureLoader.load(
      asset.path,
      (texture) => {
        console.log(`Loaded texture: ${asset.name}`);
        this.configureTexture(texture);
        this.singleAssetLoaded(asset, texture);
      },
      undefined,
      (error) => {
        console.error(`Error loading texture ${asset.name}:`, error);
        this.singleAssetLoaded(asset, null);
      },
    );
  }

  configureTexture(texture) {
    texture.flipY = false;
    texture.encoding = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }

  // ========== CUBE TEXTURE LOADING ==========
  loadCubeTexture(asset) {
    this.loaders.cubeTextureLoader.load(
      asset.path,
      (texture) => {
        console.log(`Loaded cube texture: ${asset.name}`);
        this.singleAssetLoaded(asset, texture);
      },
      undefined,
      (error) => {
        console.error(`Error loading cube texture ${asset.name}:`, error);
        this.singleAssetLoaded(asset, null);
      },
    );
  }

  // ========== VIDEO TEXTURE LOADING ==========
  loadVideoTexture(asset) {
    const video = this.createVideoElement(asset);
    const videoTexture = this.createVideoTexture(video);
    this.singleAssetLoaded(asset, videoTexture);
  }

  createVideoElement(asset) {
    const video = document.createElement("video");
    video.src = asset.path;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.play();
    return video;
  }

  createVideoTexture(video) {
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.flipY = false;
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    return videoTexture;
  }

  // ========== ASSET TRACKING ==========
  singleAssetLoaded(asset, file) {
    this.items[asset.name] = file;
    this.loaded++;

    // Calculate and emit progress
    const progress = (this.loaded / this.queue) * 100;
    this.emit("progress", progress);

    console.log(`Asset loaded: ${asset.name} (${this.loaded}/${this.queue})`);

    if (this.loaded === this.queue) {
      console.log("All assets loaded!");
      this.emit("ready");
    }
  }
}
