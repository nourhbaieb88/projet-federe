import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom selected location icon
const selectedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
      <circle cx="14" cy="8" r="3" fill="white"/>
      <path d="M14 13v6" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// Component to handle map clicks
function LocationMarker({ onLocationSelect, initialLocation }) {
  const [position, setPosition] = useState(initialLocation);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPosition = { lat, lng };
      setPosition(newPosition);
      onLocationSelect(newPosition);
    },
  });

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} icon={selectedIcon}>
      <Popup>
        <strong>📍 Position sélectionnée</strong><br />
        {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
      </Popup>
    </Marker>
  );
}

const containerStyle = {
  width: '100%',
  height: '300px'
};

function MapSelector({ onLocationSelect, initialLocation = null, placeholder = "Cliquez sur la carte pour sélectionner votre position" }) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const mapCenter = initialLocation || { lat: 36.8065, lng: 10.1815 };

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  }, [onLocationSelect]);

  return (
    <div className="map-selector">
      <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {placeholder}
      </p>
      <div style={{ width: '100%', height: '300px' }}>
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={12}
          style={containerStyle}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            onLocationSelect={handleLocationSelect}
            initialLocation={initialLocation}
          />
        </MapContainer>
      </div>
      {selectedLocation && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Position sélectionnée: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}

export default MapSelector;