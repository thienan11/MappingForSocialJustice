import { useEffect, useRef } from "react";
import { createThreeModelLayer, ModelLayerOptions } from "../utils/ThreeModelLayer";

/**
 * Hook to add and manage 3D models in a Mapbox map
 * @param map - Reference to the Mapbox map instance
 * @param options - Configuration options for the 3D model
 * @param dependencies - Array of dependencies to re-initialize the model
 */
export const useThreeModel = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  options: ModelLayerOptions,
  dependencies: any[] = []
) => {
  const modelLayerRef = useRef<ReturnType<typeof createThreeModelLayer> | null>(null);
  const isInitialized = useRef(false);

  // Function to add the model to the map
  const addModel = () => {
    if (!map.current || isInitialized.current) return;
    
    modelLayerRef.current = createThreeModelLayer(map.current, options);
    modelLayerRef.current.addToMap();
    isInitialized.current = true;
  };

  // Function to remove the model from the map
  const removeModel = () => {
    if (!map.current || !isInitialized.current || !modelLayerRef.current) return;
    
    modelLayerRef.current.removeFromMap();
    modelLayerRef.current = null;
    isInitialized.current = false;
  };

  // Initialize model on map load
  useEffect(() => {
    if (!map.current) return;

    // Function to handle map load event
    const handleMapLoad = () => {
      addModel();
    };

    // Check if map is already loaded
    if (map.current.loaded()) {
      addModel();
    } else {
      // If not, add event listener for when map loads
      map.current.on('load', handleMapLoad);
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.off('load', handleMapLoad);
      }
      removeModel();
    };
  }, [map.current, ...dependencies]);

  return {
    addModel,
    removeModel,
  };
};