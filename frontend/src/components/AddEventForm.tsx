import React, { useState } from "react";
import { AddEventFormProps } from "../models/AddEventProps";

const AddEventForm: React.FC<AddEventFormProps> = ({ location, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

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
    try {
      const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      alert('Upload successful');
      onClose(); // Close the form after submission
    } catch (error) {
      console.error('Error uploading file:', error);
    }
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
        <label className="block mb-4 text-lg text-gray-700" htmlFor="file">
          File:
          <input 
            id="file"
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="form-input mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          />
        </label>
      </div>
      <div className="mb-4">
        <strong className="mb-4 text-lg text-gray-700">Coordinates:</strong> 
        <div>Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</div>
      </div>
      <div className="flex justify-center space-x-4">
        <button type="submit" className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
          Upload
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddEventForm;
