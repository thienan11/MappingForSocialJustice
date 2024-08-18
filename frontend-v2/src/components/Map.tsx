import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"; // Import CSS
import { CoordinateZoomControl } from "../utils/CoordinateZoomControl";
import { motion } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MediaItem } from "../models/MediaItem";

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken;

const MapComponent: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  // const mapRef = useRef<mapboxgl.Map | null>(null);
  const geocoderContainer = useRef<HTMLDivElement | null>(null);

  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState<number>(51.35140956290013);
  const [lat, setLat] = useState<number>(35.70152639644212);
  const [zoom, setZoom] = useState<number>(12);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/areyeslo/clwzf7thv01c101ppegim3y6g",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('load', () => {
      console.log("Map loaded event fired");
      setMapLoaded(true);
    });

    // Cleanup function to remove the map when the component unmounts
    return () => {
      console.log("Cleanup function called");
      if (map.current) {
        map.current.remove();
        map.current = null; // Ensure map is fully destroyed
      }
    };

  });

  useEffect(() => {
    if (!mapLoaded) return;
  
    // Define type for mapboxgl instance
    // type MapboxGL = typeof mapboxgl;

    // Initialize the geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      // mapboxgl: mapboxgl as MapboxGL,
      marker: false, // Do not add a marker automatically
      placeholder: "Search for places", // Placeholder text for the search input
    });

    // Add geocoder to the map
    geocoder.addTo(geocoderContainer.current!);

    // Update map center when a result is selected
    geocoder.on("result", (e) => {
      console.log("Full result:", e.result); // Check the structure of e.result
      const { geometry } = e.result;

      if (geometry && geometry.coordinates) {
        const [lng, lat] = geometry.coordinates;
        console.log("Coordinates:", { lng, lat });

        map.current?.flyTo({
          center: [lng, lat],
          zoom: 14,
        });
      } else {
        console.error("No coordinates found in the result.");
      }
    });

    // Add the custom control to the map
    if (map.current) {
      const control = new CoordinateZoomControl();
      map.current.addControl(control, "top-right");
      console.log("Custom control added");
    }
    
    const fetchMediaItems = async () => {
      try {
        const response = await fetch('http://localhost:4000/media');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const mediaItems: MediaItem[] = await response.json();
        mediaItems.forEach((item: MediaItem) => {
          const { lat, lng, title, description, url } = item;

          const lngLat: [number, number] = [parseFloat(lng.toString()), parseFloat(lat.toString())];

          // Create a custom marker element
          const markerElement = document.createElement('div');
          markerElement.className = 'custom-marker';
          markerElement.style.fontSize = '100px';
          markerElement.style.color = 'red';
          markerElement.innerHTML = '◦'; // Marker content
          
          // Create a popup with the content info
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${title}</h3><p>${description}</p>`);

          // Create and add the marker
          new mapboxgl.Marker({ element: markerElement })
            .setLngLat(lngLat)
            .setPopup(popup)
            .addTo(map.current!);
        });
      } catch (error) {
        console.error('Error fetching media items:', error);
      }
    };

    fetchMediaItems();
  }, [mapLoaded]);

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
    </motion.div>
  );
};

export default MapComponent;
