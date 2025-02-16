import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import './index.css';
import useMapStore from './hooks/useMapState';
import MapControls from './components/MapControls';
import SchoolMarker from './components/SchoolMarker';
import PropTypes from 'prop-types';

function App() {
  const { zoomLevel, setZoomLevel, mapCenter, setMapBounds, selectedZip } = useMapStore();
  const [schools, setSchools] = useState([]);
  const [usStates, setUsStates] = useState({ type: "FeatureCollection", features: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch US states data
    const fetchStates = async () => {
      try {
        const response = await fetch('/data/us-states.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('US States Data:', data); // Debug log
        setUsStates(data);
      } catch (err) {
        console.error('Error fetching states data:', err);
        setError('Error fetching states data');
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    // Fetch school data
    const fetchSchools = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/data/SchoolInformation.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Schools Data:', data); // Debug log
        setSchools(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching schools data:', err);
        setError('Error fetching schools data');
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleStateClick = (e) => {
    const map = e.target._map;
    map.flyTo(e.latlng, 8);
    setZoomLevel(8);
  };

  const handleMapMove = (e) => {
    const bounds = e.target.getBounds();
    setMapBounds(bounds);
  };

  // Filter schools based on selected zip code
  const filteredSchools = selectedZip
    ? schools.filter((school) => school.zipCode === selectedZip)
    : schools;

  return (
    <div className="map-container">
      <div className="title">SafeSchool|MAP℠</div>
      <MapControls />
      
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="map"
        aria-label="School Map"
        whenCreated={map => {
          map.on('moveend', handleMapMove);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {usStates.features.length > 0 && (
          <GeoJSON
            key={JSON.stringify(usStates)}
            data={usStates}
            onEachFeature={(feature, layer) => {
              layer.on('click', handleStateClick);
            }}
          />
        )}
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            Loading schools...
          </div>
        )}
        
        {filteredSchools.map((school) => (
          <SchoolMarker key={school.name} school={school} />
        ))}
      </MapContainer>
    </div>
  );
}

App.propTypes = {
  // Add prop types validation if needed
};

export default App;
