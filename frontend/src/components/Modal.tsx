import React from 'react';
import { ModalProps } from '../models/ModalProps';
import { X } from "lucide-react";

const Modal: React.FC<ModalProps> = ({ title, content, onClose }) => {
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close the modal only if the background (overlay) is clicked
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleBackgroundClick} // Handles clicking outside the modal
    >
      <div className="bg-white p-8 rounded shadow-lg max-w-3xl w-full h-auto relative m-5">
        <h2 className="text-xl font-bold text-center">{title}</h2>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:text-red-500 transition-transform transform hover:scale-110 cursor-pointer text-xl"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Content */}
        <div className="mt-6 text-md">{content}</div>
      </div>
    </div>
  );
};

export default Modal;
