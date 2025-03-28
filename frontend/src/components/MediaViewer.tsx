import React from 'react';
import { MediaViewerProps } from '../models/MediaViewerProps';
import { ChevronLeft, ChevronRight, X, MapPin } from "lucide-react";

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  selectedMediaItems,
  mediaItems,
  activeMediaItem,
  setActiveMediaItem,
  toggleItemSelection,
  clearSelections,
  onClose,
  hoveredItemId,
  onItemHover
}) => {

  // Get active media item
  const getActiveMediaItem = () => {
    if (!activeMediaItem) return null;
    return mediaItems[activeMediaItem];
  };
  
  // Determine if the content is a video or an image
  const activeItem = getActiveMediaItem();
  const isVideo = activeItem ? /\.(mp4|mov)$/i.test(activeItem.contentUrl) : false; // i flag for case-insensitive

  // Determine MIME type for video
  const mimeType = activeItem && isVideo
    ? activeItem.contentUrl.endsWith('.mp4') 
      ? 'video/mp4' 
      : activeItem.contentUrl.endsWith('.mov')
        ? 'video/quicktime'
        : ''
    : '';
    
  // Log for debugging
  if (activeItem) {
    console.log('contentUrl:', activeItem.contentUrl);
    console.log('isVideo:', isVideo);
    console.log('mimeType:', mimeType);
  }

  const getThumbnail = (id: string) => {
    const item = mediaItems[id];
    if (!item) return "https://placehold.co/600x400/222222/FFFFFF?text=No+Image";
    
    // Check if it's a video
    const isVideoItem = /\.(mp4|mov)$/i.test(item.contentUrl);
    
    if (isVideoItem) {
      // Video placeholder with film icon and title
      // const encodedTitle = encodeURIComponent(item.title || "Video");
      return `https://placehold.co/400x400/?text=video`;
    }
    
    // If it's an image, use the actual content URL
    return item.contentUrl;
  };

  return (
    // <div className="w-1/2 h-full bg-white overflow-hidden flex flex-col border-l border-gray-200">
    <div>
      {/* Media preview header */}
      {/* border-b */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <button 
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Collapse</span>
          </button>
          <h2 className="font-semibold">Media Preview</h2> */}
        </div>

        {selectedMediaItems.length > 0 && (
          <button 
            onClick={clearSelections}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected items strip */}
      {selectedMediaItems.length > 0 && (
        <div>
          <div className="h-20 overflow-x-auto">
            <div className="flex p-2 gap-3">
              {selectedMediaItems.map((id, index) => {
                const isHovered = id === hoveredItemId;
                const isActive = activeMediaItem === id;

                return (
                  <div
                    key={id}
                    className="relative flex-shrink-0 h-16 w-16 rounded-md overflow-hidden cursor-pointer transition-all duration-200"
                    style={{
                      // transform: isHovered ? 'scale(0.9)' : 'scale(1)',
                      zIndex: isHovered ? 10 : isActive ? 5 : 1,
                      outline: isActive
                        ? isHovered
                          ? '4px solid #ef4444' // Thicker border when both active and hovered
                          : '2px solid #ef4444' // Normal border when just active
                        : isHovered
                          ? '3px solid #ef4444' // Border when just hovered (not active)
                          : 'none', // No border when neither active nor hovered
                      outlineOffset: '2px',
                    }}
                    onClick={() => setActiveMediaItem(id)}
                    onMouseEnter={() => onItemHover(id)}
                    onMouseLeave={() => onItemHover(null)}
                  >
                    <img
                      src={getThumbnail(id)}
                      alt={mediaItems[id]?.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-red-500 text-white px-1 py-0.5 text-xs">
                      {index + 1}
                    </div>
                    <button
                      className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center bg-white/80 hover:bg-red-500 hover:text-white rounded-bl-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(id);
                      }}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active item preview */}
      {activeItem ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            {isVideo ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <video
                  key={activeItem.contentUrl} // key that changes with the content URL
                  controls
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                >
                  <source src={activeItem.contentUrl} type={mimeType} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <img
                src={activeItem.contentUrl}
                alt={activeItem.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{activeItem.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                  {isVideo ? 'Video' : 'Image'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-700">{activeItem.description}</p>
            </div>

            {/* Navigation between items */}
            {selectedMediaItems.length > 1 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    className="px-3 py-1 flex items-center gap-1 border border-gray-300 rounded-md hover:bg-gray-100"
                    onClick={() => {
                      const currentIndex = selectedMediaItems.indexOf(activeMediaItem!);
                      const prevIndex = (currentIndex - 1 + selectedMediaItems.length) % selectedMediaItems.length;
                      setActiveMediaItem(selectedMediaItems[prevIndex]);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedMediaItems.indexOf(activeMediaItem!) + 1} of {selectedMediaItems.length}
                  </span>
                  <button
                    className="px-3 py-1 flex items-center gap-1 border border-gray-300 rounded-md hover:bg-gray-100"
                    onClick={() => {
                      const currentIndex = selectedMediaItems.indexOf(activeMediaItem!);
                      const nextIndex = (currentIndex + 1) % selectedMediaItems.length;
                      setActiveMediaItem(selectedMediaItems[nextIndex]);
                    }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-medium">No Media Selected</h3>
            <p className="text-gray-500">Select items from the map</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaViewer;
