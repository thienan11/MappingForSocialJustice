import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"; // Import CSS
import { CoordinateZoomControl } from "./CoordinateZoomControl";
import { motion } from 'framer-motion';

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

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/areyeslo/clwzf7thv01c101ppegim3y6g",
      center: [lng, lat],
      zoom: zoom,
    });

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
  }, [lng, lat, zoom]);

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
