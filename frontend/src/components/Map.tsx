import React, { useEffect, useRef, useState } from "react";
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

const Map: React.FC<MapProps> = ({ onMapDoubleClick, onMarkerClick, setClearPreviewMarker, selectedMarkerId }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  // const mapRef = useRef<mapboxgl.Map | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geocoderContainer = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  // const [lng, setLng] = useState<number>(51.35140956290013);
  // const [lat, setLat] = useState<number>(35.70152639644212);
  // const [zoom, setZoom] = useState<number>(12);

  const initialLng = useRef(51.35140956290013);
  const initialLat = useRef(35.70152639644212);
  const initialZoom = useRef(12);
  
  const [mapLoaded, setMapLoaded] = useState(false);

  const previewMarker = useRef<mapboxgl.Marker | null>(null);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const markers = useRef<{ [id: string]: mapboxgl.Marker }>({});
  // // State for modal
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalContent, setModalContent] = useState<{ title: string; description: string; contentUrl: string; }>({
  //   title: "",
  //   description: "",
  //   contentUrl: "",
  // });

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
      } catch (error) {
        console.error('Error fetching media items:', error);
      }
    };

    if (mapLoaded) {
      fetchMediaItems();
    }
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
