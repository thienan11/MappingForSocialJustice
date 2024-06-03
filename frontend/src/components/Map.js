import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { SearchBox } from '@mapbox/search-js-react';
import axios from 'axios';
import ContentDisplay from './ContentDisplay';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = ({ isSidebarVisible }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [value, setValue] = useState("");

  const [lng, setLng] = useState(-120.6556);
  const [lat, setLat] = useState(35.2901);
  const [zoom, setZoom] = useState(12);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/standard');
  const [selectedLocation, setSelectedLocation] = useState({ lng: -120.6556, lat: 35.2901 });
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedContent, setSelectedContent] = useState({ url: null, title: '', description: '' });

  const markerRef = useRef(null); // Reference to keep track of the marker instance
  const [markerVisible, setMarkerVisible] = useState(false); // State to control marker visibility

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [lng, lat],
      zoom: zoom
    });

    map.on('load', () => {
      setMapLoaded(true);
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('move', () => {
      const center = map.getCenter();
      setLng(center.lng);
      setLat(center.lat);
      setZoom(map.getZoom());
      if (markerVisible && markerRef.current) {
        markerRef.current.setLngLat([center.lng, center.lat]);
      }
    });

    mapRef.current = map;
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      map.remove();
    };
  }, [mapStyle]);

  useEffect(() => {
    if (mapLoaded) {
      axios.get('http://localhost:4000/media')
        .then(response => {
          const mediaItems = response.data;
          mediaItems.forEach(item => {
            const { lat, lng, title, description, url, mediaType } = item;

            // Create a popup with a button to view the content
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<h3>${title}</h3><p>${description}</p><button class="form-button" onclick="window.showContent('${url}', '${title}', '${description}')">View Content</button>`);

            // Create and add the marker
            new mapboxgl.Marker()
              .setLngLat([parseFloat(lng), parseFloat(lat)])
              .setPopup(popup)
              .addTo(mapRef.current);
          });
        })
        .catch(error => console.error('Error fetching media items:', error));
    }
  }, [mapLoaded]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setLng(position.coords.longitude);
      setLat(position.coords.latitude);
      setZoom(14);
    });
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log(e.target.files[0]); // This will show you if the file is being captured
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (file) {
      formData.append('media', file, file.name);
    }
    formData.append('title', title);
    formData.append('description', description);
    formData.append('lng', selectedLocation.lng);
    formData.append('lat', selectedLocation.lat);

    try {
      const response = await axios.post('http://localhost:4000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload successful', response.data);
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file', error);
      alert('Error uploading file');
    }
  };

  const toggleMarker = () => {
    if (!markerRef.current) {
      // Create a new marker if it doesn't exist
      markerRef.current = new mapboxgl.Marker({
        draggable: true,
        color: "#FF0000"
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current)
        .on('dragend', onDragEnd); // Add dragend event handler
    }

    if (markerVisible) {
      markerRef.current.remove();
      markerRef.current = null;
    } else {
      markerRef.current.addTo(mapRef.current);
    }
    setMarkerVisible(!markerVisible);
  };
  
  // Handle dragend event
  const onDragEnd = () => {
    if (markerRef.current) {
      const lngLat = markerRef.current.getLngLat();
      setLng(lngLat.lng);
      setLat(lngLat.lat);
      setSelectedLocation({ lng: lngLat.lng, lat: lngLat.lat });
    }
  };

  const toggleMapStyle = () => {
    const style = mapStyle === 'mapbox://styles/mapbox/standard'
      ? 'mapbox://styles/mapbox/satellite-v9'
      : 'mapbox://styles/mapbox/standard';
    setMapStyle(style);
  };

  // Function to show content in the component
  const showContent = (url, title, description) => {
    setSelectedContent({ url, title, description });
  };

  // Add showContent function to the global window object to make it accessible in the popup
  useEffect(() => {
    window.showContent = showContent;
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize(); // Ensure map resizes when sidebar visibility changes
    }
  }, [isSidebarVisible]);

  return (
    <div className='layout-container'>
      <ContentDisplay
        url={selectedContent.url}
        title={selectedContent.title}
        description={selectedContent.description}
        onClose={() => setSelectedContent({ url: null, title: '', description: '' })}
      />
      <div className={`sidebarStyle ${isSidebarVisible ? '' : 'hidden'}`}>
        <p>Longitude: {lng}</p>
        <p>Latitude: {lat}</p>
        <p>Zoom: {zoom}</p>
        <button className="form-button" onClick={toggleMarker}>
          {markerVisible ? "Hide Marker" : "Place Marker"}
        </button>
        <form className="search-box">
          <SearchBox
            accessToken={mapboxgl.accessToken}
            map={mapRef.current}
            onResult={(result) => {
              const { center } = result.result;
              setSelectedLocation({
                lng: center[0].toFixed(12),
                lat: center[1].toFixed(12)
              });
            }}
            value={value}
          >
            <input
              placeholder="enter an address"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </SearchBox>
        </form>
        <form onSubmit={handleSubmit}>
          <input className="in" type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="in" type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <input type="file" onChange={handleFileChange} />
          <button className="form-button" type="submit">Upload</button>
        </form>
        <button className="form-button" onClick={toggleMapStyle}>Toggle Map Style</button>
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;
