import React, { useState } from "react";
import { AddEventFormProps } from "../models/AddEventProps";
import Loading from "./Loading";
import { X } from "lucide-react";

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:4000' : import.meta.env.VITE_API_PROD_URL;

const AddEventForm: React.FC<AddEventFormProps> = ({ location, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    // Create preview for images
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

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
      setFilePreview(null);
    }
    onClose(); // Close the form
  };

  return (
    <div className="flex flex-col h-full">

      <div className="flex justify-between items-center p-2 sm:p-4 border-b">
        <h2 className="text-xl sm:text-3xl font-semibold">Upload Media</h2>
        <button 
          onClick={handleCancel}
          className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Form content */}
      <div className="flex-grow overflow-auto p-2 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block mb-1 sm:mb-2 text-base sm:text-lg text-gray-700" htmlFor="title">
              Title
            </label>
            <input 
              id="title"
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="form-input p-2 sm:p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base" 
              placeholder="Enter a title"
            />
          </div>

          <div>
            <label className="block mb-1 sm:mb-2 text-base sm:text-lg text-gray-700" htmlFor="description">
              Description
            </label>
            <textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)} 
              className="form-textarea p-2 sm:p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base min-h-[80px]" 
              placeholder="Enter a description"
            />
          </div>

          <div className="pt-2">
            {!isUploading && (
              <div>
                <label className="block mb-1 sm:mb-2 text-base sm:text-lg text-gray-700" htmlFor="file">
                  Upload File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {filePreview ? (
                      <div className="mb-3">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none"
                      >
                        <span>Select a file</span>
                        <input
                          id="file"
                          name="file"
                          type="file"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">Image or video</p>
                    {file && (
                      <p className="text-sm text-gray-700 mt-2">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coordinates display */}
          <div className="pt-2 sm:pt-4">
            <strong className="block text-base sm:text-lg text-gray-700 mb-2">Location</strong> 
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gray-200 text-gray-800 rounded-full shadow-sm flex items-center justify-center">
                <span className="font-semibold mr-1">Lat:</span> {location.lat.toFixed(4)}
              </div>
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gray-200 text-gray-800 rounded-full shadow-sm flex items-center justify-center">
                <span className="font-semibold mr-1">Lng:</span> {location.lng.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          {isUploading && (
            <div className="my-4">
              <Loading />
            </div>
          )}
        </form>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 p-2 sm:p-4 border-t bg-gray-50">
        <div className="flex justify-center gap-3 sm:gap-4">
          {!isUploading && (
            <>
              <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={!file}
                className={`px-4 py-2 flex-1 max-w-[120px] sm:max-w-[150px] text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  file ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Upload
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="px-4 py-2 flex-1 max-w-[120px] sm:max-w-[150px] bg-gray-500 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEventForm;
