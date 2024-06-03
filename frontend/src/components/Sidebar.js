import React, { useState } from 'react';
import { SearchBox } from '@mapbox/search-js-react';

const Sidebar = ({ mapRef, accessToken, onLocationSelect, onFileUpload }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onFileUpload({ file, title, description });
  };

  return (
    <div className='sidebarStyle'>
      <SearchBox
        accessToken={accessToken}
        map={mapRef.current}
        onResult={(result) => {
          const { center } = result.result;
          onLocationSelect({
            lng: center[0].toFixed(12),
            lat: center[1].toFixed(12)
          });
        }}
      >
        <input placeholder="Search for places" onChange={() => {}} />
      </SearchBox>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Sidebar;
