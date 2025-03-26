import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import mapboxgl from "mapbox-gl";

// Interface for the model options
export interface ModelLayerOptions {
  modelPath: string;
  position: [number, number]; // [longitude, latitude]
  altitude?: number;
  rotation?: [number, number, number]; // [rotateX, rotateY, rotateZ] in radians
  scale?: number;
  layerId?: string;
  beforeLayerId?: string;
}

/**
 * Creates a custom 3D model layer for Mapbox
 * @param map - The Mapbox map instance
 * @param options - Configuration options for the 3D model
 * @returns Object with methods to control the model layer
 */
export const createThreeModelLayer = (
  map: mapboxgl.Map,
  options: ModelLayerOptions
) => {
  const {
    modelPath,
    position,
    altitude = 0,
    rotation = [Math.PI / 2, 0, 0],
    scale = 1,
    layerId = "3d-model",
    beforeLayerId
  } = options;

  // References for THREE.js objects
  let scene: THREE.Scene | null = null;
  let camera: THREE.Camera | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let modelScene: THREE.Group | null = null;

  // Calculate model transform from geographic coordinates to Mercator
  const modelOrigin = position;
  const modelAltitude = altitude;
  const modelRotate = rotation;

  const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
  );

  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * scale,
  };

  // Create custom layer for THREE.js
  const customLayer: mapboxgl.CustomLayerInterface = {
    id: layerId,
    type: "custom",
    renderingMode: "3d",

    onAdd: (map, gl) => {
      // Initialize THREE scene
      camera = new THREE.Camera();
      scene = new THREE.Scene();

      // Add lights
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight1.position.set(0, -70, 100).normalize();
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight2.position.set(0, 70, 100).normalize();
      scene.add(directionalLight2);

      // Add ambient light for better visibility
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Create renderer
      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      renderer.autoClear = false;

      // Load the 3D model
      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          modelScene = gltf.scene;
          scene?.add(modelScene);
          map.triggerRepaint(); // Refresh map to show model
        },
        (progress) => {
          const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
          console.log(`Loading model: ${percent}%`);
        },
        (error) => {
          console.error("Error loading model:", error);
        }
      );
    },

    render: (gl, matrix) => {
      if (!renderer || !camera || !scene) return;

      const rotationX = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0),
        modelTransform.rotateX
      );
      const rotationY = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0),
        modelTransform.rotateY
      );
      const rotationZ = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1),
        modelTransform.rotateZ
      );

      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
        .makeTranslation(
          modelTransform.translateX,
          modelTransform.translateY,
          modelTransform.translateZ
        )
        .scale(
          new THREE.Vector3(
            modelTransform.scale,
            -modelTransform.scale,
            modelTransform.scale
          )
        )
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(rotationZ);

      camera.projectionMatrix = m.multiply(l);
      renderer.resetState();

      try {
        renderer.render(scene, camera);
      } catch (e) {
        console.error("Render error:", e);
      }

      map.triggerRepaint();
    },

    onRemove: () => {
      // Clean up THREE.js resources
      if (modelScene) {
        scene?.remove(modelScene);
        modelScene = null;
      }
      
      if (renderer) {
        renderer.dispose();
        renderer = null;
      }
      
      if (scene) {
        scene.clear();
        scene = null;
      }
      
      camera = null;
    },
  };

  // Functions to control the model layer
  const addToMap = () => {
    try {
      if (beforeLayerId) {
        map.addLayer(customLayer, beforeLayerId);
      } else {
        map.addLayer(customLayer);
      }
      console.log(`Added 3D model layer: ${layerId}`);
      return true;
    } catch (e) {
      console.error(`Error adding model layer ${layerId}:`, e);
      return false;
    }
  };

  const removeFromMap = () => {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
      console.log(`Removed 3D model layer: ${layerId}`);
      return true;
    }
    return false;
  };

  // Return control methods
  return {
    layer: customLayer,
    addToMap,
    removeFromMap,
  };
};