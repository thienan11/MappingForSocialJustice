import React from 'react';
import { MediaViewerProps } from '../models/MediaViewerProps';

const MediaViewer: React.FC<MediaViewerProps> = ({ title, description, contentUrl, onClose }) => {
  // Determine if the content is a video or an image
  const isVideo = /\.(mp4|mov)$/i.test(contentUrl); // i flag for case-insensitive

  // Determine MIME type for video
  const mimeType = contentUrl.endsWith('.mp4') ? 'video/mp4' : contentUrl.endsWith('.mov') ? 'video/quicktime' : '';
  
  console.log('contentUrl:', contentUrl);
  console.log('isVideo:', isVideo);
  console.log('mimeType:', mimeType);

  return (
    // border border-blue-600 mt-8 pt-15 pb-20
    <div className="p-6 bg-white rounded-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-semibold mb-4">{title}</h2>
      <p className="mb-4 text-lg text-gray-700">{description}</p>
      {isVideo ? (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <video
            controls
            className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          >
            <source src={contentUrl} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <img
            src={contentUrl}
            alt={title}
            className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>
      )}
      <div className="flex justify-center mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MediaViewer;
