import React from 'react';
import { ModalProps } from '../models/ModalProps';

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
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transform hover:scale-110 cursor-pointer"
          >
            &#10005; {/* This is a simple "X" close button */}
          </button>
        </div>
        <div>{content}</div>
        {/* <button
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={onClose}
        >
          Close
        </button> */}
      </div>
    </div>
  );
};

export default Modal;
