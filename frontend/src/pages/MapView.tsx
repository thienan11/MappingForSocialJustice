import React, { useState } from 'react';
import Map from '../components/Map';
import AddEventForm from '../components/AddEventForm';
import MediaViewer from '../components/MediaViewer';
import Modal from '../components/Modal';
import { FaQuestionCircle } from "react-icons/fa";

const MapView: React.FC = () => {
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  // const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  // const [mediaContent, setMediaContent] = useState<{ title: string; description: string; contentUrl: string } | null>(null);
  const [clearPreviewMarker, setClearPreviewMarker] = useState<() => void>(() => { });
  const [showHelpModal, setShowHelpModal] = useState(false);
  // const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // Multi-selection states
  const [selectedMediaItems, setSelectedMediaItems] = useState<string[]>([]);
  const [activeMediaItem, setActiveMediaItem] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<{ [id: string]: { title: string; description: string; contentUrl: string } }>({});
  const [viewMode, setViewMode] = useState<"full" | "split">("full");

  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const handleDoubleClick = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    setShowAddEventForm(true);
    // setShowMediaViewer(false); // Close media viewer when opening AddEventForm
    // setSelectedMarkerId(null);

    // Close media viewer if open when opening AddEventForm
    if (viewMode === "split") {
      setViewMode("full");
    }
    // Clear selected markers if any
    setSelectedMediaItems([]);
    setActiveMediaItem(null);
  };

  const handleMarkerClick = (id: string, content: { title: string; description: string; contentUrl: string }) => {
    // if (id === selectedMarkerId) {
    //   setSelectedMarkerId(null);
    //   setShowMediaViewer(false);
    // } else {
    //   setMediaContent(content);
    //   setShowMediaViewer(true);
    //   setShowAddEventForm(false); // Close AddEventForm when opening media viewer (reduntant)
    //   setSelectedMarkerId(id);
    // }
    // // Clear selected location and preview marker when opening media viewer
    // setShowAddEventForm(false);
    // setSelectedLocation(null);
    // if (clearPreviewMarker) clearPreviewMarker();

    // Store the media item data first (regardless of selection state)
    setMediaItems(items => ({
      ...items,
      [id]: content
    }));

    // Check if we're deselecting an item
    if (selectedMediaItems.includes(id)) {
      // Deselecting an item
      const newSelectedItems = selectedMediaItems.filter(itemId => itemId !== id);
      
      // If we're deselecting the active item, pick a new active item
      if (activeMediaItem === id) {
        if (newSelectedItems.length > 0) {
          // Set the first item in the remaining selection as active
          setActiveMediaItem(null); // Reset first
          setActiveMediaItem(newSelectedItems[0]); // Then set new active
        } else {
          // No items left
          setActiveMediaItem(null);
        }
      }
      // If we're deselecting a non-active item, keep the current active item
      // (no need to change activeMediaItem)
      
      setSelectedMediaItems(newSelectedItems);
      return;
    }
    
    // We're selecting a new item
    const newSelectedItems = [...selectedMediaItems, id];
    setSelectedMediaItems(newSelectedItems);
    
    // If this is the first item being selected, make it active
    if (selectedMediaItems.length === 0) {
      setActiveMediaItem(null); // Reset first
      setActiveMediaItem(id);
      if (viewMode === "full") {
        setViewMode("split");
      }
    }

    // If we are in the process of adding a new event, cancel it
    if (showAddEventForm) {
      handleCloseAddEventForm();
    }
  };

  const handleSetActiveItem = (id: string | null) => {
    setActiveMediaItem(id);
    if (id && viewMode === "full") {
      setViewMode("split");
    }
  };

  const clearSelections = () => {
    setSelectedMediaItems([]);
    setActiveMediaItem(null);
  };

  const handleCloseMediaViewer = () => {
    // setShowMediaViewer(false);
    // setSelectedMarkerId(null);

    setViewMode("full");
    setSelectedMediaItems([]);
    setActiveMediaItem(null);
  };

  const handleCloseAddEventForm = () => {
    setShowAddEventForm(false);
    setSelectedLocation(null);
    if (clearPreviewMarker) clearPreviewMarker();
    // setSelectedMarkerId(null);
  };

  const handleItemHover = (id: string | null) => {
    setHoveredItemId(id);
  };

  // Effect to handle map resize when selections change
  React.useEffect(() => {
    if (selectedMediaItems.length === 0) {
      setViewMode("full");
      setActiveMediaItem(null);
    }
  }, [selectedMediaItems]);

  return (
    // removed h-screen so no access space at the bottom
    // <div className="grid grid-cols-1 grid-rows-1">
    <div className="flex p-4">
      {/* Help Button */}
      <div
        className="fixed bottom-4 right-4 text-black-500 p-3 rounded-full hover:text-gray-600 cursor-pointer z-50"
        onClick={() => setShowHelpModal(true)}
        aria-label="Help"
        role="button" // To make it accessible as a clickable element?
      >
        <FaQuestionCircle size={24} />
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <Modal
          title="How to Use"
          content={
            <div>
              <p>Here's how you can interact with the map:</p>
              <ul className="list-disc ml-5 my-2">
                <li>Double-click on the map to add a new event at the selected location.</li>
                <li>Click on a marker to view media associated with that location.</li>
              </ul>
            </div>
          }
          onClose={() => setShowHelpModal(false)}
        />
      )}

      {/* <div className="flex h-full w-full overflow-hidden"> */}
      <div className="flex w-full gap-4">
        {/* Map Container */}
        <div 
          className={`relative h-full ${viewMode === "split" || showAddEventForm ? "w-1/2" : "w-full"} transition-all duration-300 ease-in-out`} // transition-all duration-300
        >
          <div className={`h-full flex flex-col ${(viewMode === "split" || showAddEventForm) ? "rounded-lg shadow-lg overflow-hidden border border-gray-300" : ""}`}>
            <Map
              onMapDoubleClick={handleDoubleClick}
              onMarkerClick={handleMarkerClick}
              setClearPreviewMarker={setClearPreviewMarker}
              selectedMarkerId={activeMediaItem}
              selectedMarkerIds={selectedMediaItems}
              hoveredItemId={hoveredItemId}
              onMarkerHover={handleItemHover}
            />
          </div>
        </div>

        {/* AddEventForm Panel */}
        {showAddEventForm && selectedLocation && (
          // <div className="w-1/2 h-full bg-white overflow-hidden flex flex-col border-l border-gray-200">
          <div className="w-1/2">
            <div className="rounded-lg shadow-lg overflow-hidden border border-gray-300 h-full flex flex-col">
              <AddEventForm
                location={selectedLocation}
                onClose={handleCloseAddEventForm}
              />
            </div>
          </div>
        )}

        {/* Media Viewer Panel */}
        {viewMode === "split" && !showAddEventForm && (
          <div className="w-1/2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300 h-[calc(91vh-25px)] flex flex-col">
              <MediaViewer
                selectedMediaItems={selectedMediaItems}
                mediaItems={mediaItems}
                activeMediaItem={activeMediaItem}
                setActiveMediaItem={handleSetActiveItem}
                toggleItemSelection={(id) => handleMarkerClick(id, mediaItems[id])}
                clearSelections={clearSelections}
                onClose={handleCloseMediaViewer}
                hoveredItemId={hoveredItemId}
                onItemHover={handleItemHover}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
