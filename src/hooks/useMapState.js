import { useState, useCallback } from 'react';

const useMapState = () => {
  const [zoomLevel, setZoomLevel] = useState(4);
  const [selectedZip, setSelectedZip] = useState('');
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]);
  const [mapBounds, setMapBounds] = useState(null);

  const validateZoomLevel = useCallback((newZoom) => {
    return Math.min(Math.max(newZoom, 1), 18);
  }, []);

  const updateZoomLevel = useCallback((newZoom) => {
    setZoomLevel(validateZoomLevel(newZoom));
  }, [validateZoomLevel]);

  const updateMapCenter = useCallback((newCenter) => {
    if (Array.isArray(newCenter) && newCenter.length === 2) {
      setMapCenter(newCenter);
    }
  }, []);

  const updateMapBounds = useCallback((newBounds) => {
    if (newBounds && typeof newBounds === 'object') {
      setMapBounds(newBounds);
    }
  }, []);

  return {
    zoomLevel,
    setZoomLevel: updateZoomLevel,
    selectedZip,
    setSelectedZip,
    mapCenter,
    setMapCenter: updateMapCenter,
    mapBounds,
    setMapBounds: updateMapBounds,
  };
};

export default useMapState;
