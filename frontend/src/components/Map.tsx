import React, { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"; // Import CSS
import { CoordinateZoomControl } from "../utils/CoordinateZoomControl";
import { motion } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MediaItem } from "../models/MediaItem";
import { MapProps } from "../models/MapProps";

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:4000' : import.meta.env.VITE_API_PROD_URL;

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken;


//Human models- from Github pages
const HUMAN_MODELS: string[] = [
  'https://malimba.github.io/Human3D-Models/models/StandingIdle.glb'
];

const Map: React.FC<MapProps> = ({ onMapDoubleClick, onMarkerClick, setClearPreviewMarker, selectedMarkerId }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  // const mapRef = useRef<mapboxgl.Map | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geocoderContainer = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  // const [lng, setLng] = useState<number>(51.35140956290013);
  // const [lat, setLat] = useState<number>(35.70152639644212);
  // const [zoom, setZoom] = useState<number>(12);

    //Three.js references
  const threeRenderer = useRef<THREE.WebGLRenderer | null>(null);
  const threeScene = useRef<THREE.Scene | null>(null);
  const threeCamera = useRef<THREE.PerspectiveCamera | null>(null);

  const initialLng = useRef(51.35140956290013);
  const initialLat = useRef(35.70152639644212);
  const initialZoom = useRef(12);
  
  const [mapLoaded, setMapLoaded] = useState(false);

  const previewMarker = useRef<mapboxgl.Marker | null>(null);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const markers = useRef<{ [id: string]: mapboxgl.Marker }>({});
  models directly on GitHub Pages. The models will be publicly accessible via direct URLs, which you can then use in your React application.

Would you like me to elaborate on any part of this process?




Retry
M
I want to use it in the map.tsx files

Edit
I'll modify the previous Map.tsx code to integrate the 3D models from GitHub Pages:


Map Component with GitHub Pages 3D Models
Click to open code
Key changes:

Updated HUMAN_MODELS to use GitHub Pages URLs
Replaced local model loading with GitHub Pages model URLs
Kept the same Three.js integration logic
Important notes:

Replace yourusername with your actual GitHub username
Replace 3d-models-repo with your actual repository name
Ensure the model file paths match exactly
To use this:

Create a separate GitHub repository for 3D models
Host the models on GitHub Pages
Update the URLs in the HUMAN_MODELS array
Ensure CORS is configured if needed
Would you like me to elaborate on any part of the implementation?




Retry
M
elaborate on the steps in the To use this section. Walk methrough creating the model and hosting on github pages

Edit
I'll provide a comprehensive, step-by-step guide to creating, preparing, and hosting 3D models on GitHub Pages:


Comprehensive Guide to Creating and Hosting 3D Models on GitHub Pages
Click to open document
I'll also provide a quick guide for finding and downloading free 3D models:


Free 3D Model Sources
Click to open document
Would you like me to elaborate on any specific part of the process? I can provide more detailed guidance on:

3D modeling in Blender
Finding and preparing 3D models
GitHub Pages configuration
Model optimization techniques



Retry
M
the formats on Mixamo are FBx, what should I do

Edit
Great question! I'll provide a step-by-step guide to convert FBX models from Mixamo to GLB format using Blender:


Converting Mixamo FBX to GLB for Web
Click to open document

Blender Python Script for Batch FBX to GLB Conversion
Click to open code
Here are your options for converting Mixamo FBX files:

Manual Conversion in Blender
Open each FBX
Export as GLB
Adjust scale (usually 0.01)
Batch Conversion Script (Recommended)
Use the Python script I provided
Automates conversion of multiple files
Applies consistent settings
Online Converters
https://glb-transform.donmccurdy.com/
https://products.aspose.app/3d/conversion/fbx-to-glb
Recommended Workflow:

Download FBX from Mixamo
Use Blender script to batch convert
Verify models in browser
Optimize if needed
Would you like me to elaborate on any of these conversion methods?




Retry

Claude can make mistakes. Please double-check responses.



No file chosen

3.5 Haiku

Choose style

Map Component with GitHub Pages 3D Models

import React, { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { CoordinateZoomControl } from "../utils/CoordinateZoomControl";
import { motion } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MediaItem } from "../models/MediaItem";
import { MapProps } from "../models/MapProps";

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:4000' : import.meta.env.VITE_API_PROD_URL;

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken;

// 3D Model configuration - using GitHub Pages hosted models
const HUMAN_MODELS: string[] = [
  'https://yourusername.github.io/3d-models-repo/models/person1.glb',
  'https://yourusername.github.io/3d-models-repo/models/person2.glb',
  'https://yourusername.github.io/3d-models-repo/models/person3.glb'
];

const Map: React.FC<MapProps> = ({ onMapDoubleClick, onMarkerClick, setClearPreviewMarker, selectedMarkerId }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geocoderContainer = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  // Three.js references
  const threeRenderer = useRef<THREE.WebGLRenderer | null>(null);
  const threeScene = useRef<THREE.Scene | null>(null);
  const threeCamera = useRef<THREE.PerspectiveCamera | null>(null);

  const initialLng = useRef(51.35140956290013);
  const initialLat = useRef(35.70152639644212);
  const initialZoom = useRef(12);

  const [mapLoaded, setMapLoaded] = useState(false);
  const previewMarker = useRef<mapboxgl.Marker | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const markers = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const threeDModels = useRef<THREE.Group[]>([]);

  // // State for modal
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalContent, setModalContent] = useState<{ title: string; description: string; contentUrl: string; }>({
  //   title: "",
  //   description: "",
  //   contentUrl: "",
  // });
  // Initialize Three.js scene and renderer
  const initThreeScene = () => {
    // Create a container for Three.js renderer
    const threeContainer = document.createElement('div');
    threeContainer.style.position = 'absolute';
    threeContainer.style.top = '0';
    threeContainer.style.left = '0';
    threeContainer.style.width = '100%';
    threeContainer.style.height = '100%';
    threeContainer.style.pointerEvents = 'none';
    mapContainer.current?.appendChild(threeContainer);

    // Initialize renderer
    threeRenderer.current = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    threeRenderer.current.setSize(
      mapContainer.current?.clientWidth || window.innerWidth,
      mapContainer.current?.clientHeight || window.innerHeight
    );
    threeContainer.appendChild(threeRenderer.current.domElement);

    // Create scene and camera
    threeScene.current = new THREE.Scene();
    threeCamera.current = new THREE.PerspectiveCamera(
      75,
      (mapContainer.current?.clientWidth || window.innerWidth) / (mapContainer.current?.clientHeight || window.innerHeight),
      0.1,
      1000
    );

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    threeScene.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    threeScene.current.add(directionalLight);
  };

  // Load 3D models at random locations
  const loadRandomModels = async (mediaItems: MediaItem[]) => {
    if (!threeScene.current) return;

    const loader = new GLTFLoader();

    // Clear existing models
    threeDModels.current.forEach(model => {
      threeScene.current?.remove(model);
    });
    threeDModels.current = [];

    // Randomly select some media items to place models
    const modelsToPlace = mediaItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(5, mediaItems.length));

    for (const item of modelsToPlace) {
      // Randomly select a model URL
      const modelUrl = HUMAN_MODELS[Math.floor(Math.random() * HUMAN_MODELS.length)];

      try {
        const gltf = await new Promise<THREE.Group>((resolve, reject) => {
          loader.load(modelUrl, resolve, undefined, reject);
        });

        // Scale and position the model
        const model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);

        // Convert geographic coordinates to 3D scene coordinates
        const lngLat = [parseFloat(item.lng.toString()), parseFloat(item.lat.toString())];
        const point = map.current?.project(lngLat as [number, number]);

        if (point) {
          model.position.set(point.x, point.y, 0);
          threeScene.current.add(model);
          threeDModels.current.push(model);
        }
      } catch (error) {
        console.error('Error loading 3D model:', error);
      }
    }
  };
    //map initialization
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/areyeslo/clwzf7thv01c101ppegim3y6g",
      // center: [lng, lat],
      // zoom: zoom,
      center: [initialLng.current, initialLat.current],
      zoom: initialZoom.current,
    });

    map.current.on('load', () => {
      console.log("Map loaded event fired");
      setMapLoaded(true);

      //intialize Three.js scene after map loads
      initThreeScene();
    });

    map.current.on('dblclick', (e) => {
      e.preventDefault(); // prevent default mapbox double click zoom
      const { lng, lat } = e.lngLat;

      // Remove previous preview marker if any
      if (previewMarker.current) {
        previewMarker.current.remove();
      }
      // Add new preview marker
      previewMarker.current = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(e.lngLat)
        .addTo(map.current!);

      onMapDoubleClick({ lat, lng });
      // onDoubleClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    // Cleanup function to remove the map when the component unmounts
    return () => {
      console.log("Cleanup function called");
      if (map.current) {
        map.current.remove();
        map.current = null; // Ensure map is fully destroyed
      }
    };

  }, []); // Empty dependency array ensures this runs only once

  // Use to clear the preview marker when the map is loaded (when canceling form)
  useEffect(() => {
    if (mapLoaded) {
      setClearPreviewMarker(() => {
        return () => {
          if (previewMarker.current) {
            previewMarker.current.remove();
            previewMarker.current = null;
          }
        };
      });
    }
  }, [mapLoaded, setClearPreviewMarker]);

  useEffect(() => {
    if (!mapLoaded) return;
  
    // Define type for mapboxgl instance
    // type MapboxGL = typeof mapboxgl;

    // Initialize the geocoder only if it hasn't been initialized yet
    if (!geocoderRef.current) {
      geocoderRef.current = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        // mapboxgl: mapboxgl as MapboxGL,
        marker: false, // Do not add a marker automatically
        placeholder: "Search for places", // Placeholder text for the search input
      });

      // Add geocoder to the map
      if (geocoderContainer.current) {
        geocoderRef.current.addTo(geocoderContainer.current!);

        // Update map center when a result is selected
        geocoderRef.current.on("result", (e) => {
          console.log("Full result:", e.result); // Check the structure of e.result
          const { geometry } = e.result;

          if (geometry && geometry.coordinates) {
            const [lng, lat] = geometry.coordinates;
            console.log("Coordinates:", { lng, lat });

            map.current?.jumpTo({
              center: [lng, lat],
              zoom: 14,
            });
          } else {
            console.error("No coordinates found in the result.");
          }
        });
      }
    }

    // Add the custom control to the map
    if (map.current) {
      const control = new CoordinateZoomControl();
      map.current.addControl(control, "top-right");
      console.log("Custom control added");
    }

    // Cleanup geocoder on component unmount
    return () => {
      if (geocoderRef.current) {
        geocoderRef.current.onRemove();
        geocoderRef.current = null;
      }
    };
  }, [mapLoaded]); // Dependency array ensures this runs when mapLoaded changes

  // Fetch media items
  useEffect(() => {
    const fetchMediaItems = async () => {
      console.log("Fetching media items...");
      try {
        const response = await fetch(`${API_URL}/media`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const items: MediaItem[] = await response.json();
        setMediaItems(items);

        //Loading 3D models
        if (mapLoaded) {
          loadRandomModels(items);
        }
      } catch (error) {
        console.error('Error fetching media items:', error);
      }
    };

    if (mapLoaded) {
      fetchMediaItems();
    }
  }, [mapLoaded]);

  // Render Three.js scene
  useEffect(() => {
    const animate = () => {
      if (threeRenderer.current && threeScene.current && threeCamera.current) {
        threeRenderer.current.render(threeScene.current, threeCamera.current);
      }
      requestAnimationFrame(animate);
    };

    if (mapLoaded) {
      animate();
    }

    return () => {
      // Cleanup Three.js resources
      threeRenderer.current?.dispose();
    };
  }, [mapLoaded]);

  // Create markers and attach click listeners
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    mediaItems.forEach((item: MediaItem) => {
      const { _id, lat, lng, title, description, url } = item;
      const lngLat: [number, number] = [parseFloat(lng.toString()), parseFloat(lat.toString())];

      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.fontSize = '50px';
      markerElement.style.color = 'red';
      markerElement.style.cursor = 'pointer';
      markerElement.innerHTML = _id === selectedMarkerId ? '•' : '◦';

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.fontSize = '70px';
        markerElement.innerHTML = '•'
      });
  
      markerElement.addEventListener('mouseleave', () => {
        if (_id === selectedMarkerId) {
          markerElement.style.fontSize = '50px';
        } else {
          markerElement.style.fontSize = '50px';
          markerElement.innerHTML = '◦'
        }
      });

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(lngLat)
        .addTo(map.current!);
      
      marker.getElement().addEventListener('click', () => {
        onMarkerClick(_id, { title, description, contentUrl: url });
        console.log("Item ID:", _id)
      });

      markers.current[_id] = marker;
    });
  }, [mapLoaded, mediaItems, onMarkerClick, selectedMarkerId]);

  // Update marker appearance when selectedMarkerId changes
  useEffect(() => {
    Object.entries(markers.current).forEach(([id, marker]) => {
      const element = marker.getElement().querySelector('.custom-marker') as HTMLElement;
      if (element) {
        element.innerHTML = id === selectedMarkerId ? '•' : '◦';
      }
    });
  }, [selectedMarkerId]);

  return (
    // add min-h-screen ?
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="map-container"
    >
      <div className="flex justify-center items-center p-6 bg-white">
        <div className="w-full max-w-screen-lg h-[80vh] bg-white p-2 rounded-lg relative">
          {/* Geocoder Searchbox */}
          <div
            ref={geocoderContainer}
            className="absolute top-4 left-4 z-10 w-80"
          />

          {/* Map Container */}
          <div
            ref={mapContainer}
            className="h-full w-full rounded-lg overflow-hidden"
          />
        </div>
      </div>

      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        description={modalContent.description}
        contentUrl={modalContent.contentUrl}
      /> */}
    </motion.div>
  );
};

export default Map;
