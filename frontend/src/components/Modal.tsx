import React, { useEffect, useRef } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  contentUrl: string;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, contentUrl }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close modal if click is outside of the modal content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine if the content is a video or an image
  const isVideo = /\.(mp4|mov)$/.test(contentUrl);

  // Determine MIME type for video
  const mimeType = contentUrl.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 max-w-full max-h-full w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-black">
            <img
              src="/icons/close.svg"
              alt="close"
              width="30px"
              className="hover:transform hover:scale-110"
            />
          </button>
        </div>
        <p className="mb-4">{description}</p>
        <div className="bg-white media-content flex justify-center items-center">
          {isVideo ? (
            <video controls className="max-w-full max-h-96">
              <source src={contentUrl} type={mimeType} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={contentUrl} alt={title} className="max-w-full max-h-96 object-contain" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
