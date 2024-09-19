import React, { useState } from "react";
import { AddEventFormProps } from "../models/AddEventProps";
import Loading from "./Loading";

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:4000' : import.meta.env.VITE_API_PROD_URL;

const AddEventForm: React.FC<AddEventFormProps> = ({ location, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('lat', location.lat.toString());
    formData.append('lng', location.lng.toString());

    // TODO: add uploading progress indicator
    const controller = new AbortController(); // Create a new AbortController
    setUploadAbortController(controller);
    setIsUploading(true); // Start uploading

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal // Pass the abort signal to the fetch request
      });
      if (!response.ok) throw new Error('Upload failed');
      alert('Upload successful');
      onClose(); // Close the form after submission
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Upload cancelled');
      } else {
        console.error('Error uploading file:', error);
      }
    } finally {
      setIsUploading(false); // End uploading
    }
  };

  // TODO: need to handle on the backend
  const handleCancel = () => {
    if (uploadAbortController) {
      uploadAbortController.abort(); // Cancel the ongoing upload
      setIsUploading(false); // Stop showing the progress bar
      setFile(null); // Optionally, reset the file input
    }
    onClose(); // Close the form
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-semibold mb-4">Upload Media</h2>
      <div className="mb-4">
        <label className="block mb-4 text-lg text-gray-700" htmlFor="title">
          Title:
          <input 
            id="title"
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-4 text-lg text-gray-700" htmlFor="description">
          Description:
          <textarea 
            id="description"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="form-textarea mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          />
        </label>
      </div>
      <div className="mb-4">
        {!isUploading && (
          <label className="block mb-4 text-lg text-gray-700" htmlFor="file">
          File:
          <input 
            id="file"
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="form-input mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          />
          </label>
        )}
      </div>
      <div className="mb-4">
        <strong className="mb-4 text-lg text-gray-700">Coordinates:</strong> 
        <div>Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</div>
      </div>
      {isUploading && (
        <div className="mb-4">
          <Loading />
        </div>
      )}
      <div className="flex justify-center space-x-4">
        {!isUploading && (
          <button 
            type="submit" 
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Upload
          </button>
        )}
        {!isUploading && (
          <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddEventForm;
