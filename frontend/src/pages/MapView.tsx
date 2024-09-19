import React, { useState } from 'react';
import Map from '../components/Map';
import AddEventForm from '../components/AddEventForm';
import MediaViewer from '../components/MediaViewer';
import Modal from '../components/Modal';
import { FaQuestionCircle } from "react-icons/fa";

const MapView: React.FC = () => {
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mediaContent, setMediaContent] = useState<{ title: string; description: string; contentUrl: string } | null>(null);
  const [clearPreviewMarker, setClearPreviewMarker] = useState<() => void>(() => { });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const handleDoubleClick = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    setShowAddEventForm(true);
    setShowMediaViewer(false); // Close media viewer when opening AddEventForm
    setSelectedMarkerId(null);
  };

  const handleMarkerClick = (id: string, content: { title: string; description: string; contentUrl: string }) => {
    if (id === selectedMarkerId) {
      setSelectedMarkerId(null);
      setShowMediaViewer(false);
    } else {
      setMediaContent(content);
      setShowMediaViewer(true);
      setShowAddEventForm(false); // Close AddEventForm when opening media viewer (reduntant)
      setSelectedMarkerId(id);
    }
    // Clear selected location and preview marker when opening media viewer
    setShowAddEventForm(false);
    setSelectedLocation(null);
    if (clearPreviewMarker) clearPreviewMarker();
  };

  const handleCloseMediaViewer = () => {
    setShowMediaViewer(false);
    setSelectedMarkerId(null);
  };

  const handleCloseAddEventForm = () => {
    setShowAddEventForm(false);
    setSelectedLocation(null);
    if (clearPreviewMarker) clearPreviewMarker();
    setSelectedMarkerId(null);
  };

  return (
    // removed h-screen so no access space at the bottom
    <div className="grid grid-cols-1 grid-rows-1">
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

      <div
        className={`grid ${
          showAddEventForm || showMediaViewer
            ? 'grid-cols-2 gap-4' // gap-4 so for gap between the two components
            : 'grid-cols-1'
        } h-full w-full p-4`}
      >
        <div className={`col-span-1 row-span-1 ${
            showAddEventForm || showMediaViewer ? 'border border-gray-200' : ''
          }`}
        >
          <Map
            onMapDoubleClick={handleDoubleClick}
            onMarkerClick={handleMarkerClick}
            setClearPreviewMarker={setClearPreviewMarker}
            selectedMarkerId={selectedMarkerId}
          />
        </div>

        {showAddEventForm && selectedLocation && (
          <div className="col-span-1 row-span-1 border border-gray-200">
            <AddEventForm
              location={selectedLocation}
              onClose={handleCloseAddEventForm}
            />
          </div>
        )}

        {showMediaViewer && mediaContent && (
          <div className="col-span-1 row-span-1 border border-gray-200">
            <MediaViewer
              key={mediaContent.contentUrl} // key prop to re-render MediaViewer when contentUrl changes
              title={mediaContent.title}
              description={mediaContent.description}
              contentUrl={mediaContent.contentUrl}
              onClose={handleCloseMediaViewer}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
