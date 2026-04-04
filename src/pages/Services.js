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

  const establishments = [
    {
      id: 1,
      title: "Dar El Jeld",
      category: "Restaurants",
      location: "Tunis",
      rating: 4.7,
      icon: "restaurant",
      lat: 36.7950,
      lng: 10.1700,
      address: "6 Rue Dar El Jeld, Medina de Tunis",
      phone: "+216 71 325 729",
      priceRange: "€€€ - Élevé",
      capacity: 120,
      description: "Restaurant gastronomique tunisien dans un palais historique du XVIIe siècle. Cuisine traditionnelle raffinée.",
      openingHours: {
        monday: { open: "19:00", close: "23:00", closed: false },
        tuesday: { open: "19:00", close: "23:00", closed: false },
        wednesday: { open: "19:00", close: "23:00", closed: false },
        thursday: { open: "19:00", close: "23:00", closed: false },
        friday: { open: "19:00", close: "23:00", closed: false },
        saturday: { open: "19:00", close: "23:00", closed: false },
        sunday: { open: "19:00", close: "23:00", closed: false }
      },
      images: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop"]
    },
    {
      id: 2,
      title: "Café de Paris",
      category: "Cafés",
      location: "Tunis",
      rating: 4.3,
      icon: "cafe",
      lat: 36.8000,
      lng: 10.1850,
      address: "Avenue Habib Bourguiba, Tunis",
      phone: "+216 71 350 577",
      priceRange: "€€ - Moyen",
      capacity: 80,
      description: "Café historique au cœur de Tunis, lieu de rencontre des intellectuels et artistes depuis 1882.",
      openingHours: {
        monday: { open: "07:00", close: "23:00", closed: false },
        tuesday: { open: "07:00", close: "23:00", closed: false },
        wednesday: { open: "07:00", close: "23:00", closed: false },
        thursday: { open: "07:00", close: "23:00", closed: false },
        friday: { open: "07:00", close: "23:00", closed: false },
        saturday: { open: "07:00", close: "23:00", closed: false },
        sunday: { open: "08:00", close: "22:00", closed: false }
      },
      images: ["https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500&h=300&fit=crop"]
    },
    {
      id: 3,
      title: "Bibliothèque Nationale de Tunisie",
      category: "Bibliothèques",
      location: "Tunis",
      rating: 4.8,
      icon: "library",
      lat: 36.8000,
      lng: 10.1800,
      address: "Place de la Kasbah, Tunis",
      phone: "+216 71 287 200",
      priceRange: "",
      capacity: 500,
      description: "La plus grande bibliothèque de Tunisie avec plus de 1 million de documents. Collections historiques et contemporaines.",
      openingHours: {
        monday: { open: "09:00", close: "17:00", closed: false },
        tuesday: { open: "09:00", close: "17:00", closed: false },
        wednesday: { open: "09:00", close: "17:00", closed: false },
        thursday: { open: "09:00", close: "17:00", closed: false },
        friday: { open: "09:00", close: "17:00", closed: false },
        saturday: { open: "09:00", close: "17:00", closed: false },
        sunday: { open: "09:00", close: "17:00", closed: true }
      },
      images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop"]
    },
    {
      id: 4,
      title: "Stade Olympique de Radès",
      category: "Terrains de sport",
      location: "Radès",
      rating: 4.5,
      icon: "stadium",
      lat: 36.7547,
      lng: 10.2750,
      address: "Boulevard de l'Environnement, Radès",
      phone: "+216 71 413 000",
      priceRange: "€ - Budget",
      capacity: 65000,
      description: "Plus grand stade d'Afrique du Nord, accueille les matchs de l'équipe nationale et événements sportifs majeurs.",
      openingHours: {
        monday: { open: "08:00", close: "22:00", closed: false },
        tuesday: { open: "08:00", close: "22:00", closed: false },
        wednesday: { open: "08:00", close: "22:00", closed: false },
        thursday: { open: "08:00", close: "22:00", closed: false },
        friday: { open: "08:00", close: "22:00", closed: false },
        saturday: { open: "08:00", close: "22:00", closed: false },
        sunday: { open: "08:00", close: "22:00", closed: false }
      },
      images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&h=300&fit=crop"]
    },
    {
      id: 5,
      title: "Café Clock",
      category: "Cafés",
      location: "Sfax",
      rating: 4.4,
      icon: "cafe",
      lat: 34.7400,
      lng: 10.7600,
      address: "Avenue de la République, Sfax",
      phone: "+216 74 407 000",
      priceRange: "€ - Budget",
      capacity: 60,
      description: "Café moderne avec espace de coworking, wifi gratuit et spécialités locales.",
      openingHours: {
        monday: { open: "08:00", close: "22:00", closed: false },
        tuesday: { open: "08:00", close: "22:00", closed: false },
        wednesday: { open: "08:00", close: "22:00", closed: false },
        thursday: { open: "08:00", close: "22:00", closed: false },
        friday: { open: "08:00", close: "22:00", closed: false },
        saturday: { open: "08:00", close: "22:00", closed: false },
        sunday: { open: "10:00", close: "20:00", closed: false }
      },
      images: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=300&fit=crop"]
    },
    {
      id: 6,
      title: "Médina de Sousse",
      category: "Bibliothèques",
      location: "Sousse",
      rating: 4.6,
      icon: "library",
      lat: 35.8250,
      lng: 10.6400,
      address: "Médina de Sousse",
      phone: "+216 73 224 673",
      priceRange: "",
      capacity: 200,
      description: "Site historique classé UNESCO avec bibliothèque et centre culturel au cœur de la médina.",
      openingHours: {
        monday: { open: "09:00", close: "17:00", closed: false },
        tuesday: { open: "09:00", close: "17:00", closed: false },
        wednesday: { open: "09:00", close: "17:00", closed: false },
        thursday: { open: "09:00", close: "17:00", closed: false },
        friday: { open: "09:00", close: "17:00", closed: false },
        saturday: { open: "09:00", close: "17:00", closed: false },
        sunday: { open: "09:00", close: "17:00", closed: false }
      },
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop"]
    },
    {
      id: 7,
      title: "Salon de Coiffure Elegance",
      category: "Centres de coiffure",
      location: "Tunis",
      rating: 4.8,
      icon: "hairdresser",
      lat: 36.8000,
      lng: 10.1800,
      address: "Avenue Habib Bourguiba, Tunis",
      phone: "+216 71 123 456",
      priceRange: "€€ - Moyen",
      capacity: 8,
      description: "Salon de coiffure moderne offrant coupes, colorations et soins capillaires professionnels.",
      openingHours: {
        monday: { open: "09:00", close: "19:00", closed: false },
        tuesday: { open: "09:00", close: "19:00", closed: false },
        wednesday: { open: "09:00", close: "19:00", closed: false },
        thursday: { open: "09:00", close: "19:00", closed: false },
        friday: { open: "09:00", close: "19:00", closed: false },
        saturday: { open: "09:00", close: "18:00", closed: false },
        sunday: { open: "10:00", close: "16:00", closed: false }
      },
      images: ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop"]
    },
    {
      id: 8,
      title: "Spa & Beauté Zen",
      category: "Centres esthétiques",
      location: "Sousse",
      rating: 4.7,
      icon: "spa",
      lat: 35.8300,
      lng: 10.6400,
      address: "Boulevard du 14 Janvier, Sousse",
      phone: "+216 73 456 789",
      priceRange: "€€€ - Élevé",
      capacity: 15,
      description: "Centre de bien-être offrant massages, soins du visage, épilation et relaxation dans un cadre apaisant.",
      openingHours: {
        monday: { open: "10:00", close: "20:00", closed: false },
        tuesday: { open: "10:00", close: "20:00", closed: false },
        wednesday: { open: "10:00", close: "20:00", closed: false },
        thursday: { open: "10:00", close: "20:00", closed: false },
        friday: { open: "10:00", close: "20:00", closed: false },
        saturday: { open: "09:00", close: "19:00", closed: false },
        sunday: { open: "11:00", close: "18:00", closed: false }
      },
      images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&h=300&fit=crop"]
    },
    {
      id: 9,
      title: "Centre Médical Ibn Sina",
      category: "Autres établissements",
      location: "Tunis",
      rating: 4.5,
      icon: "medical",
      lat: 36.8100,
      lng: 10.1700,
      address: "Rue de la Kasbah, Tunis",
      phone: "+216 71 987 654",
      priceRange: "€€ - Moyen",
      capacity: 50,
      description: "Centre médical moderne offrant consultations, analyses et soins spécialisés avec prise de rendez-vous.",
      openingHours: {
        monday: { open: "08:00", close: "18:00", closed: false },
        tuesday: { open: "08:00", close: "18:00", closed: false },
        wednesday: { open: "08:00", close: "18:00", closed: false },
        thursday: { open: "08:00", close: "18:00", closed: false },
        friday: { open: "08:00", close: "17:00", closed: false },
        saturday: { open: "08:00", close: "13:00", closed: false },
        sunday: { open: "00:00", close: "00:00", closed: true }
      },
      images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=300&fit=crop"]
    }
  ];

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
