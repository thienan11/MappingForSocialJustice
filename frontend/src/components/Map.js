import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { SearchBox } from '@mapbox/search-js-react';
import axios from 'axios';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [lng, setLng] = useState(-120.6556);
  const [lat, setLat] = useState(35.2901);
  const [zoom, setZoom] = useState(12);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/standard');
  const [selectedLocation, setSelectedLocation] = useState({ lng: -120.6556, lat: 35.2901 });
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

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
          const centerLng = parseFloat(map.getCenter().lng.toFixed(12));
          const centerLat = parseFloat(map.getCenter().lat.toFixed(12));
          const currentZoom = parseFloat(map.getZoom().toFixed(2));
          setLng(centerLng);
          setLat(centerLat);
          setZoom(currentZoom);
          setSelectedLocation({ lng: centerLng, lat: centerLat });
      });

      mapRef.current = map;
      return () => map.remove();
  }, [mapStyle]);

  useEffect(() => {
    if (mapLoaded) {
        axios.get('http://localhost:4000/media')
            .then(response => {
                const mediaItems = response.data;
                mediaItems.forEach(item => {
                    const { lat, lng, title, description, url, mediaType } = item;

                    /// Create a hyperlink for the media
                    let linkHTML = `<a href="${url}" target="_blank">View Content</a>`;

                    // Create a popup with the media link
                    const popup = new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`<h3>${title}</h3><p>${description}</p>${linkHTML}`);

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
    } catch (error) {
        console.error('Error uploading file', error);
    }
  };


  const toggleMapStyle = () => {
      const style = mapStyle === 'mapbox://styles/mapbox/standard'
          ? 'mapbox://styles/mapbox/satellite-v9'
          : 'mapbox://styles/mapbox/standard';
      setMapStyle(style);
  };

  return (
      <div className='layout-container'>
          <div className='sidebarStyle'>
              <div>Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}</div>
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
              >
                  <input
                      placeholder="Search for places"
                      onChange={(e) => {}}
                  />
              </SearchBox>
              <form onSubmit={handleSubmit}>
                  <input className="in" type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                  <input className="in" type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                  <input type="file" onChange={handleFileChange} />
                  <button type="submit">Upload</button>
              </form>
              <button onClick={toggleMapStyle}>Toggle Map Style</button>
          </div>
          <div className='map-container' ref={mapContainerRef} />
      </div>
  );
};

export default Map;