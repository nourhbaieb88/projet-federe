import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBook,
  FaCalendarCheck,
  FaCoffee,
  FaCut,
  FaFutbol,
  FaMapMarkerAlt,
  FaSpa,
  FaStar,
  FaStore,
  FaTags,
  FaUsers,
  FaUtensils,
} from "react-icons/fa";

import Map from "../components/MapLeaflet";
import { sampleEstablishments } from "../data/sampleEstablishments";
import { establishmentService } from "../services/api";
import { formatTnd, normalizePriceRange } from "../utils/currency";

const DEFAULT_LOCATION = { lat: 36.8065, lng: 10.1815 };

const categoryStyles = {
  Restaurants: {
    icon: <FaUtensils />,
    gradient: "linear-gradient(135deg, #3b82f6, #7c3aed)",
  },
  Cafes: {
    icon: <FaCoffee />,
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
  "Caf\u00e9s": {
    icon: <FaCoffee />,
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
  Bibliotheques: {
    icon: <FaBook />,
    gradient: "linear-gradient(135deg, #38bdf8, #2563eb)",
  },
  "Biblioth\u00e8ques": {
    icon: <FaBook />,
    gradient: "linear-gradient(135deg, #38bdf8, #2563eb)",
  },
  "Terrains de sport": {
    icon: <FaFutbol />,
    gradient: "linear-gradient(135deg, #60a5fa, #0ea5e9)",
  },
  "Centres de coiffure": {
    icon: <FaCut />,
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  },
  "Centres esthetiques": {
    icon: <FaSpa />,
    gradient: "linear-gradient(135deg, #ec4899, #db2777)",
  },
  "Centres esth\u00e9tiques": {
    icon: <FaSpa />,
    gradient: "linear-gradient(135deg, #ec4899, #db2777)",
  },
};

const getCategoryStyle = (category) =>
  categoryStyles[category] || {
    icon: <FaStore />,
    gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  };

const normalizeCategory = (category = "") => {
  const text = category.toLowerCase();
  if (text.includes("caf")) return "Cafes";
  if (text.includes("biblioth")) return "Bibliotheques";
  if (text.includes("esth")) return "Centres esthetiques";
  return category;
};

function Services() {
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get("category");
    setSelectedCategory(categoryParam || "");
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const fetchEstablishments = async () => {
      try {
        const data = await establishmentService.getAll();
        const results = Array.isArray(data) ? data : data.results || [];
        if (isMounted) {
          setEstablishments(results.length > 0 ? results : sampleEstablishments);
        }
      } catch (error) {
        console.error("Error fetching establishments:", error);
        if (isMounted) {
          setEstablishments(sampleEstablishments);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEstablishments();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setUserLocation(DEFAULT_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if ([lat1, lng1, lat2, lng2].some((value) => typeof value !== "number")) {
      return null;
    }

    const radius = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
  };

  const filteredEstablishments = establishments
    .map((establishment) => ({
      ...establishment,
      price_range: normalizePriceRange(establishment.price_range),
      distance: userLocation
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            establishment.lat,
            establishment.lng
          )
        : null,
    }))
    .filter((establishment) => {
      const haystack = [
        establishment.title,
        establishment.location,
        establishment.category,
        establishment.price_range,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const normalizedSelectedCategory = normalizeCategory(selectedCategory);
      const normalizedEstablishmentCategory = normalizeCategory(establishment.category);

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesCategory =
        !selectedCategory || normalizedEstablishmentCategory === normalizedSelectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((left, right) => {
      if (left.distance === null || right.distance === null) {
        return 0;
      }
      return left.distance - right.distance;
    });

  return (
    <div className="container services-page">
      <div className="services-hero glass-panel">
        <div>
          <span className="eyebrow">CityReserve Tunisie</span>
          <h1 className="section-title">
            {selectedCategory ? selectedCategory : "Etablissements disponibles"}
          </h1>
          <p className="section-subtitle">
            {selectedCategory
              ? `Decouvrez et reservez dans les meilleurs ${selectedCategory.toLowerCase()} partout en Tunisie.`
              : "Explorez restaurants, cafes, bibliotheques, terrains et salons dans toute la Tunisie avec un parcours de reservation fluide."}
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{filteredEstablishments.length}</strong>
            <span>lieux affiches</span>
          </div>
          <div>
            <strong>TN</strong>
            <span>couverture nationale</span>
          </div>
          <div>
            <strong>4.6+</strong>
            <span>note moyenne</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Chargement des etablissements...
        </div>
      ) : (
        <>
          <div className="filter-panel glass-panel">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                type="text"
                placeholder="Rechercher par nom, adresse, categorie ou prix..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="form-input"
                style={{ marginBottom: 0 }}
              />
            </div>

            <div className="filter-meta">
              {selectedCategory ? (
                <>
                  <span>
                    Filtre actif : <strong>{selectedCategory}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="btn btn-secondary"
                    type="button"
                  >
                    Effacer
                  </button>
                </>
              ) : (
                <span>Toutes les categories sont visibles.</span>
              )}
            </div>
          </div>

          {userLocation && (
            <div className="location-strip glass-panel">
              <div className="icon icon-primary icon-sm">
                <FaMapMarkerAlt />
              </div>
              <p>
                Etablissements tries par proximite depuis votre position (
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}).
              </p>
            </div>
          )}

          <div style={{ marginBottom: "2rem" }}>
            <Map userLocation={userLocation} establishments={filteredEstablishments} />
          </div>

          <div className="grid-container establishment-grid">
            {filteredEstablishments.map((establishment) => {
              const categoryStyle = getCategoryStyle(establishment.category);
              const lowestServicePrice =
                establishment.services?.length > 0
                  ? Math.min(...establishment.services.map((service) => Number(service.price || 0)))
                  : null;

              return (
                <div key={establishment.id} className="card glass-panel establishment-card">
                  <div
                    className="card-cover"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(10, 16, 34, 0.92), rgba(10, 16, 34, 0.12)), url(${establishment.profile_image ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80"})`,
                    }}
                  >
                    <div className="icon icon-md" style={{ background: categoryStyle.gradient, color: "white" }}>
                      {categoryStyle.icon}
                    </div>
                    <span className="rating-chip">
                      <FaStar /> {(establishment.rating || 0).toFixed(1)}
                    </span>
                  </div>

                  <div className="establishment-card-body">
                    <div>
                      <h3 className="card-title">{establishment.title}</h3>
                      <p className="card-desc">{establishment.description || establishment.category}</p>
                    </div>

                    <div className="info-stack">
                      <div>
                        <FaMapMarkerAlt className="icon icon-sm icon-secondary" />
                        <span>{establishment.location || "Adresse non renseignee"}</span>
                      </div>
                      <div>
                        <FaUsers className="icon icon-sm icon-secondary" />
                        <span>Capacite : {establishment.capacity || "N/A"} personnes</span>
                      </div>
                      <div>
                        <FaTags className="icon icon-sm icon-secondary" />
                        <span>{establishment.price_range || "Prix non renseigne"}</span>
                      </div>
                      {lowestServicePrice !== null && (
                        <div>
                          <FaCalendarCheck className="icon icon-sm icon-secondary" />
                          <span>Services a partir de {formatTnd(lowestServicePrice)}</span>
                        </div>
                      )}
                      {establishment.distance !== null && (
                        <div>
                          <FaMapMarkerAlt className="icon icon-sm icon-secondary" />
                          <span>Distance : {establishment.distance.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>

                    <Link to={`/establishment/${establishment.id}`} className="btn btn-primary">
                      Voir details et reserver
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Services;
