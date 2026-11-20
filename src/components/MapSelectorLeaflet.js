import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { DEFAULT_LOCATION } from "../utils/location";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const selectedIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
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

const containerStyle = {
  width: "100%",
  height: "300px",
};

function MapUpdater({ location }) {
  const map = useMap();

  useEffect(() => {
    if (
      location &&
      Number.isFinite(Number(location.lat)) &&
      Number.isFinite(Number(location.lng))
    ) {
      map.setView([location.lat, location.lng], 15);
    }
  }, [location, map]);

  return null;
}

function LocationMarker({ location, onLocationSelect }) {
  useMapEvents({
    click(event) {
      const nextLocation = {
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      };
      onLocationSelect(nextLocation);
    },
  });

  if (
    !location ||
    !Number.isFinite(Number(location.lat)) ||
    !Number.isFinite(Number(location.lng))
  ) {
    return null;
  }

  return (
    <Marker position={[location.lat, location.lng]} icon={selectedIcon}>
      <Popup>
        <strong>Position selectionnee</strong>
        <br />
        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
      </Popup>
    </Marker>
  );
}

function MapSelector({
  onLocationSelect,
  initialLocation = null,
  placeholder = "Cliquez sur la carte pour selectionner votre position",
  autoLocate = true,
}) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [geoStatus, setGeoStatus] = useState("");
  const autoLocateAttempted = useRef(false);

  const hasValidLocation =
    selectedLocation &&
    Number.isFinite(Number(selectedLocation.lat)) &&
    Number.isFinite(Number(selectedLocation.lng));

  useEffect(() => {
    setSelectedLocation(initialLocation);
  }, [initialLocation]);

  const applyLocation = useCallback(
    (location) => {
      const normalizedLocation = {
        lat: Number(location.lat),
        lng: Number(location.lng),
      };
      setSelectedLocation(normalizedLocation);
      onLocationSelect(normalizedLocation);
    },
    [onLocationSelect]
  );

  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("La geolocalisation n'est pas supportee par votre navigateur.");
      return;
    }

    setGeoStatus("Demande de localisation en cours...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyLocation({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
        setGeoStatus("Localisation detectee automatiquement.");
      },
      () => {
        setGeoStatus(
          "Autorisation refusee ou indisponible. Vous pouvez cliquer sur la carte ou saisir les coordonnees manuellement."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [applyLocation]);

  useEffect(() => {
    if (autoLocate && !initialLocation && !autoLocateAttempted.current) {
      autoLocateAttempted.current = true;
      requestBrowserLocation();
    }
  }, [autoLocate, initialLocation, requestBrowserLocation]);

  const handleCoordinateChange = (field, value) => {
    const numericValue = value === "" ? "" : Number(value);

    setSelectedLocation((current) => {
      const next = {
        lat: current?.lat ?? DEFAULT_LOCATION.lat,
        lng: current?.lng ?? DEFAULT_LOCATION.lng,
        [field]:
          numericValue === "" || Number.isNaN(numericValue) ? "" : numericValue,
      };

      if (next.lat !== "" && next.lng !== "") {
        onLocationSelect({
          lat: Number(next.lat),
          lng: Number(next.lng),
        });
      }

      return next;
    });
  };

  const mapCenter =
    selectedLocation && selectedLocation.lat !== "" && selectedLocation.lng !== ""
      ? selectedLocation
      : DEFAULT_LOCATION;

  return (
    <div className="map-selector">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>{placeholder}</p>
        <button
          type="button"
          onClick={requestBrowserLocation}
          className="btn btn-secondary"
          style={{ padding: "0.45rem 0.8rem", fontSize: "0.85rem" }}
        >
          Utiliser ma position actuelle
        </button>
      </div>

      <div style={{ width: "100%", height: "300px" }}>
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={12} style={containerStyle} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater location={selectedLocation} />
          <LocationMarker location={selectedLocation} onLocationSelect={applyLocation} />
        </MapContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          marginTop: "0.75rem",
        }}
      >
        <input
          type="number"
          step="0.000001"
          className="form-input"
          placeholder="Latitude"
          value={selectedLocation?.lat ?? ""}
          onChange={(event) => handleCoordinateChange("lat", event.target.value)}
        />
        <input
          type="number"
          step="0.000001"
          className="form-input"
          placeholder="Longitude"
          value={selectedLocation?.lng ?? ""}
          onChange={(event) => handleCoordinateChange("lng", event.target.value)}
        />
      </div>

      {hasValidLocation && (
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          Position selectionnee: {Number(selectedLocation.lat).toFixed(6)},{" "}
          {Number(selectedLocation.lng).toFixed(6)}
        </div>
      )}

      {geoStatus && (
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#94a3b8" }}>{geoStatus}</div>
      )}
    </div>
  );
}

export default MapSelector;
