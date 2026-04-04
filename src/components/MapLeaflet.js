import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="white" stroke-width="2"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const establishmentIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10b981"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const containerStyle = {
  width: '100%',
  height: '400px'
};

function Map({ userLocation, establishments }) {
  const center = userLocation || [36.8065, 10.1815]; // Tunis par défaut

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <MapContainer
        center={center}
        zoom={userLocation ? 12 : 10}
        style={containerStyle}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <strong>📍 Votre position</strong><br />
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {establishments && establishments.map((est) => (
          <Marker
            key={est.id}
            position={[est.lat, est.lng]}
            icon={establishmentIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>{est.title}</strong><br />
                <span style={{ color: '#666', fontSize: '12px' }}>
                  {est.category} • {est.location}
                </span>
                {est.distance && (
                  <div style={{ marginTop: '5px', fontSize: '12px', color: '#10b981' }}>
                    📍 {est.distance.toFixed(1)} km
                  </div>
                )}
                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: '#fbbf24' }}>
                    ⭐ {est.rating}/5
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;