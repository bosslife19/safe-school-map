import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

const SchoolMarker = ({ school }) => {
  const icon = L.icon({
    iconUrl: '/school-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <Marker position={[school.lat, school.lng]} icon={icon}>
      <Popup>
        <div className="school-popup">
          <h3>{school.name}</h3>
          <p>Address: {school.address}</p>
          <p>Phone: {school.phone}</p>
        </div>
      </Popup>
    </Marker>
  );
};

export default SchoolMarker;
