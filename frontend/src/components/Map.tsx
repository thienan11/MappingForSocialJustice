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

const Map: React.FC<MapProps> = ({ onMapDoubleClick, onMarkerClick, setClearPreviewMarker, selectedMarkerId, selectedMarkerIds, hoveredItemId, onMarkerHover }) => {
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

      // Create a wrapper div
      const wrapper = document.createElement('div');
      wrapper.className = 'hidden sm:block'; // hide on mobile
      wrapper.appendChild(control.onAdd(map.current));

      // Add the wrapper manually
      map.current.getContainer().appendChild(wrapper);
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

      // Get marker number if it's selected
      const isSelected = selectedMarkerIds.includes(_id);
      const isActive = _id === selectedMarkerId;
      const isHovered = _id === hoveredItemId;
      const markerNumber = isSelected ? selectedMarkerIds.indexOf(_id) + 1 : null;

      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.fontSize = isSelected ? '50px' : '50px';

      // Determine marker color based on state (hovered takes precedence)
      const markerColor = isHovered ? '#ff0000' : isActive ? '#ef4444' : isSelected ? '#f87171' : '#dc2626';
      markerElement.style.color = markerColor;
      markerElement.style.cursor = 'pointer';
      
      // Apply transform scale for hover effect
      // markerElement.style.transition = 'transform 0.2s ease, filter 0.2s ease';
      // markerElement.style.transform = isHovered ? 'scale(1.4)' : 'scale(1)';
      markerElement.style.filter = isHovered ? 'drop-shadow(0 0 8px rgba(255,0,0,0.8))' : 'none';

      // If selected, show the number, otherwise show a circle
      if (isSelected) {
        const bgColor = isHovered ? '#ff0000' : isActive ? '#ef4444' : '#f87171';
        markerElement.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background-color: ${bgColor};
            color: white;
            border-radius: 50%;
            border: 2px solid white;
            font-size: 14px;
            ${isHovered ? 'box-shadow: 0 0 10px rgba(255,0,0,0.8);' : ''}
          ">${markerNumber}</div>
        `;
      } else {
        markerElement.innerHTML = '◦';
      }

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.fontSize = '70px';
        if (!isSelected) {
          markerElement.innerHTML = '•';
        }
        onMarkerHover(_id);
      });
  
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.fontSize = '50px';
        if (!isSelected) {
          markerElement.innerHTML = '◦';
        }
        onMarkerHover(null);
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
  }, [mapLoaded, mediaItems, onMarkerClick, selectedMarkerId, selectedMarkerIds, hoveredItemId, onMarkerHover]);

  return (
    // add min-h-screen ?
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="map-container"
    >
      <div className="flex justify-center items-center p-2 sm:p-6 bg-white">
        <div className="w-full max-w-screen-lg h-[80vh] bg-white p-2 rounded-lg relative">
          {/* Geocoder Searchbox */}
          <div
            ref={geocoderContainer}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-[90%] max-w-xs sm:left-4 sm:translate-x-0 sm:max-w-sm md:max-w-md"
          />

          {/* Map Container */}
          <div
            ref={mapContainer}
            className="h-full w-full rounded-lg overflow-hidden"
          />

          {/* Selection counter badge */}
          {selectedMarkerIds.length > 0 && (
            <div className="absolute bottom-10 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
              {selectedMarkerIds.length} selected
            </div>
          )}
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
