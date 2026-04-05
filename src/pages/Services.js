import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Map from "../components/MapLeaflet";
import { FaUtensils, FaCoffee, FaBook, FaFutbol, FaCut, FaSpa, FaStore, FaMapMarkerAlt, FaStar, FaUsers } from "react-icons/fa";

function Services() {
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  const getCategoryIcon = (category) => {
    const getIconStyle = (bgColor) => ({
      background: bgColor,
      boxShadow: `0 8px 25px ${bgColor.replace(')', ', 0.3)')}, 0 4px 12px ${bgColor.replace(')', ', 0.2)')}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      color: 'white'
    });

    switch (category) {
      case "Restaurants":
        return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #3b82f6, #7c3aed)')}>
          <FaUtensils />
        </div>;
      case "Cafés":
        return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #10b981, #059669)')}>
          <FaCoffee />
        </div>;
      case "Bibliothèques":
        return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #f59e0b, #d97706)')}>
          <FaBook />
        </div>;
      case "Terrains de sport":
        return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #60a5fa, #93c5fd)')}>
          <FaFutbol />
        </div>;
      case "Centres de coiffure":
        return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #8b5cf6, #7c3aed)')}>
          <FaCut />
        </div>;
      case "Centres esthétiques":
        return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #ec4899, #db2777)')}>
          <FaSpa />
        </div>;
      case "Autres établissements":
        return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #2563eb, #1d4ed8)')}>
          <FaStore />
        </div>;
      default:
        return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #6b7280, #4b5563)')}>
          <FaMapMarkerAlt />
        </div>;
    }
  };

  const establishments = [];

  // TODO: Fetch establishments from API
  // const [establishments, setEstablishments] = useState([]);
  // useEffect(() => {
  //   establishmentService.getAll().then(data => setEstablishments(data));
  // }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          // Position par défaut à Tunis si géolocalisation échoue
          setUserLocation({ lat: 36.8065, lng: 10.1815 });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      // Géolocalisation non supportée, utiliser Tunis par défaut
      setUserLocation({ lat: 36.8065, lng: 10.1815 });
    }
  }, []);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredEstablishments = establishments
    .map(est => ({
      ...est,
      distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, est.lat, est.lng) : null
    }))
    .filter(est => {
      const matchesSearch = est.location.toLowerCase().includes(search.toLowerCase()) ||
                           est.category.toLowerCase().includes(search.toLowerCase()) ||
                           est.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || est.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0;
      return a.distance - b.distance;
    });

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">
          {selectedCategory ? `${selectedCategory}` : "Établissements Disponibles"}
        </h1>
        <p className="section-subtitle">
          {selectedCategory
            ? `Découvrez et réservez dans les meilleurs ${selectedCategory.toLowerCase()} de Tunisie`
            : "Découvrez et réservez dans les meilleurs établissements de Tunisie"
          }
        </p>
      </div>

      <div className="glass-panel" style={{marginBottom: '2rem'}}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Rechercher par localisation, catégorie ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{marginBottom: 0}}
          />
        </div>
        {selectedCategory && (
          <div style={{marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <span style={{color: 'var(--text-color)', fontSize: '0.9rem'}}>
              Filtré par catégorie: <strong>{selectedCategory}</strong>
            </span>
            <button
              onClick={() => setSelectedCategory("")}
              className="btn btn-secondary"
              style={{fontSize: '0.8rem', padding: '0.3rem 0.6rem'}}
            >
              ✕ Effacer le filtre
            </button>
          </div>
        )}
      </div>

      {userLocation && (
        <div className="glass-panel" style={{marginBottom: '2rem', textAlign: 'center'}}>
          <div className="icon icon-primary icon-sm" style={{marginBottom: '0.5rem'}}>
            <FaMapMarkerAlt />
          </div>
          <p style={{color: 'var(--text-muted)', margin: 0}}>
            Établissements triés par proximité depuis votre position ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
          </p>
        </div>
      )}

      <div style={{marginBottom: '2rem'}}>
        <Map userLocation={userLocation} establishments={filteredEstablishments} />
      </div>

      <div className="grid-container">
        {filteredEstablishments.map((est) => (
          <div key={est.id} className="card glass-panel">
            <div className="card-icon">
              {getCategoryIcon(est.category)}
            </div>
            <h3 className="card-title">{est.title}</h3>
            <div className="card-desc">
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <FaMapMarkerAlt className="icon icon-sm icon-secondary" />
                <span>{est.location}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <FaUsers className="icon icon-sm icon-secondary" />
                <span>Capacité: {est.capacity} personnes</span>
              </div>
              {est.distance !== null && (
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                  <FaMapMarkerAlt className="icon icon-sm icon-secondary" />
                  <span>Distance: {est.distance.toFixed(1)} km</span>
                </div>
              )}
            </div>
            <div className="rating">
              <FaStar className="icon icon-xs" style={{marginRight: '0.25rem'}} />
              {est.rating}/5
            </div>
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
              <Link to={`/establishment/${est.id}`}>
                <button className="btn btn-primary">
                  <FaMapMarkerAlt className="icon icon-sm" />
                  Voir détails et réserver
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
