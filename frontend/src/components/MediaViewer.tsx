import React, { useState } from 'react';
import { MediaViewerProps } from '../models/MediaViewerProps';
import { ChevronLeft, ChevronRight, X, MapPin, Maximize2, LayoutList, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "single" | "list";

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  selectedMediaItems,
  mediaItems,
  activeMediaItem,
  setActiveMediaItem,
  toggleItemSelection,
  clearSelections,
  // onClose,
  hoveredItemId,
  onItemHover
}) => {
  // view mode state
  const [viewMode, setViewMode] = useState<ViewMode>("single");

  // Track which videos are playing in list view
  const [playingVideos, setPlayingVideos] = useState<{[id: string]: boolean}>({});

  // Get active media item
  const getActiveMediaItem = () => {
    if (!activeMediaItem) return null;
    return mediaItems[activeMediaItem];
  };
  
  // Determine if the content is a video or an image
  const activeItem = getActiveMediaItem();
  const isVideo = activeItem ? /\.(mp4|mov)$/i.test(activeItem.contentUrl) : false; // i flag for case-insensitive

  // Determine MIME type for video
  // const mimeType = activeItem && isVideo
  //   ? activeItem.contentUrl.endsWith('.mp4')
  //     ? 'video/mp4'
  //     : activeItem.contentUrl.endsWith('.mov')
  //       ? 'video/quicktime'
  //       : ''
  //   : '';
  const getMimeType = (url: string) => {
    if (url.endsWith('.mp4')) return 'video/mp4';
    if (url.endsWith('.mov')) return 'video/quicktime';
    return '';
  };
    
  // Log for debugging
  if (activeItem) {
    console.log('contentUrl:', activeItem.contentUrl);
    console.log('isVideo:', isVideo);
    console.log('mimeType:', getMimeType(activeItem.contentUrl));
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

  const getSelectedItems = () => {
    return selectedMediaItems.map(id => ({
      id,
      ...mediaItems[id]
    }));
  };

  // Toggle video playback in list view
  const toggleVideoPlayback = (id: string) => {
    setPlayingVideos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    // <div className="w-1/2 h-full bg-white overflow-hidden flex flex-col border-l border-gray-200">
    // Make the container take the full height of its parent
    <div className="flex flex-col h-full">
      {/* Media preview header */}
      <div className="p-2 sm:p-3 flex items-center justify-end">
        {/* <div className="flex items-center gap-2"> */}
          {/* <button 
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Collapse</span>
          </button>
          <h2 className="font-semibold">Media Preview</h2> */}
        {/* </div> */}

        {selectedMediaItems.length > 0 && (
          <div className="flex gap-2">
            <div className="flex bg-muted rounded-md">
              <Button
                variant={viewMode === "single" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode("single")}
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Single view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearSelections}
              className="text-xs sm:text-sm"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Selected items strip - only on single mode */}
      {selectedMediaItems.length > 0 && viewMode === "single" && (
        <div className="flex-shrink-0">
          <div className="h-20 sm:h-24">
            <div className="flex p-2 gap-3 sm:gap-4 mx-2 sm:mx-3 overflow-x-auto">
              {selectedMediaItems.map((id, index) => {
                const isHovered = id === hoveredItemId;
                const isActive = activeMediaItem === id;

                return (
                  <div
                    key={id}
                    className="relative flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden cursor-pointer transition-all duration-200"
                    style={{
                      transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                      zIndex: isHovered ? 10 : isActive ? 5 : 1,
                      outline: isActive
                        ? isHovered
                          ? '3px solid #ef4444' // Thicker border when both active and hovered
                          : '2px solid #ef4444' // Normal border when just active
                        : isHovered
                          ? '2px solid #ef4444' // Border when just hovered (not active)
                          : 'none', // No border when neither active nor hovered
                      outlineOffset: '2px',
                    }}
                    onClick={() => setActiveMediaItem(id)}
                    onMouseEnter={() => onItemHover(id)}
                    onMouseLeave={() => onItemHover(null)}
                  >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <img
                        src={getThumbnail(id)}
                        alt={mediaItems[id]?.title}
                        className="min-w-full min-h-full object-cover"
                      />
                    </div>
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

      {/* Main content area */}
      <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-full w-full">
          {selectedMediaItems.length > 0 ? (
            <>
              {/* Single item view */}
              {viewMode === "single" && activeItem && (
                <div className="p-2 sm:p-4">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2 sm:mb-4">
                    {isVideo ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <video
                          key={activeItem.contentUrl}
                          controls
                          className="max-w-full max-h-full"
                        >
                          <source src={activeItem.contentUrl} type={getMimeType(activeItem.contentUrl)} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <img
                          src={activeItem.contentUrl}
                          alt={activeItem.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold">{activeItem.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isVideo ? "secondary" : "outline"}>
                          {isVideo ? 'Video' : 'Image'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm sm:text-base text-gray-700">{activeItem.description}</p>
                    </div>

                    {/* Navigation between items */}
                    {selectedMediaItems.length > 1 && (
                      <div className="pt-3 mt-2 sm:pt-4 sm:mt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            className="py-1 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm"
                            onClick={() => {
                              const currentIndex = selectedMediaItems.indexOf(activeMediaItem!);
                              const prevIndex = (currentIndex - 1 + selectedMediaItems.length) % selectedMediaItems.length;
                              setActiveMediaItem(selectedMediaItems[prevIndex]);
                            }}
                          >
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="ml-1">Prev</span>
                          </Button>
                          <span className="text-sm text-gray-500">
                            {selectedMediaItems.indexOf(activeMediaItem!) + 1} of {selectedMediaItems.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="py-1 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm"
                            onClick={() => {
                              const currentIndex = selectedMediaItems.indexOf(activeMediaItem!);
                              const nextIndex = (currentIndex + 1) % selectedMediaItems.length;
                              setActiveMediaItem(selectedMediaItems[nextIndex]);
                            }}
                          >
                            <span className="mr-1">Next</span>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
                  {getSelectedItems().map((item, index) => {
                    const isHovered = item.id === hoveredItemId;
                    const isVideo = /\.(mp4|mov)$/i.test(item.contentUrl);
                    const isPlaying = playingVideos[item.id] || false;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "border rounded-lg overflow-hidden transition-all",
                          isHovered ? "ring-2 ring-red-500" : ""
                        )}
                        onMouseEnter={() => onItemHover(item.id)}
                        onMouseLeave={() => onItemHover(null)}
                      >
                        <div className="p-2 sm:p-3 border-b flex items-center justify-between">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Badge className="bg-red-500 text-white h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full p-0">
                              {index + 1}
                            </Badge>
                            <h3 className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-[250px] lg:max-w-[400px]">
                              {item.title}
                            </h3>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-gray-100"
                              onClick={() => {
                                setActiveMediaItem(item.id);
                                setViewMode("single");
                              }}
                            >
                              <Maximize2 className="h-4 w-4" />
                              <span className="sr-only">View full</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-red-100"
                              onClick={() => toggleItemSelection(item.id)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:max-h-[320px]">
                          <div className="md:w-1/2 flex-shrink-0 relative">
                            <div className="aspect-video w-full h-full bg-gray-100">
                              {isVideo ? (
                                <>
                                  {isPlaying ? (
                                    <div className="flex items-center justify-center w-full h-full">
                                      <video
                                        key={`playing-${item.contentUrl}`}
                                        controls
                                        className="max-w-full max-h-full"
                                      >
                                        <source src={item.contentUrl} type={getMimeType(item.contentUrl)} />
                                        Your browser does not support the video tag.
                                      </video>
                                    </div>
                                  ) : (
                                    <div className="relative w-full h-full">
                                      <div className="flex items-center justify-center w-full h-full overflow-hidden">
                                        <img
                                          src={getThumbnail(item.id)}
                                          alt={item.title}
                                          className="min-w-full min-h-full object-cover"
                                        />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 hover:bg-black/40 text-white rounded-none"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleVideoPlayback(item.id);
                                        }}
                                      >
                                        <Play className="h-12 w-12" />
                                        <span className="sr-only">Play video</span>
                                      </Button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center justify-center w-full h-full overflow-hidden">
                                  <img
                                    src={item.contentUrl}
                                    alt={item.title}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-2 sm:p-4 md:w-1/2 md:max-h-[320px] overflow-auto">
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={isVideo ? "secondary" : "outline"}>
                                  {isVideo ? 'Video' : 'Image'}
                                </Badge>
                                {isVideo && isPlaying && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs py-0 px-2"
                                    onClick={() => toggleVideoPlayback(item.id)}
                                  >
                                    Stop Playing
                                  </Button>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-700">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
                <h3 className="text-base sm:text-lg font-medium">No Media Selected</h3>
                <p className="text-xs sm:text-sm text-gray-500">Select items from the map</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default MediaViewer;
