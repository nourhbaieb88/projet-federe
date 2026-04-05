import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { establishmentService } from "../services/api";
import Map from "../components/MapLeaflet";
import { FaUtensils, FaCoffee, FaBook, FaFutbol, FaCut, FaSpa, FaStore, FaMapMarkerAlt, FaStar, FaUsers, FaPhone, FaClock } from "react-icons/fa";

function Services() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [establishments, setEstablishments] = useState([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapLocation, setMapLocation] = useState(null);
  const location = useLocation();

  // Récupérer la catégorie de l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  // Charger les établissements depuis le backend
  useEffect(() => {
    const loadEstablishments = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (search) params.search = search;
        
        const data = await establishmentService.getAll(params);
        setEstablishments(data.results || data);
        setError("");
      } catch (err) {
        setError("Erreur lors du chargement des établissements");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEstablishments();
  }, [selectedCategory, search]);

  // Filtrer les établissements
  useEffect(() => {
    let filtered = establishments;

    if (search) {
      filtered = filtered.filter(est =>
        est.name.toLowerCase().includes(search.toLowerCase()) ||
        est.category.toLowerCase().includes(search.toLowerCase()) ||
        est.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(est => est.category === selectedCategory);
    }

    setFilteredEstablishments(filtered);
  }, [establishments, search, selectedCategory]);

  const getCategoryIcon = (category) => {
    const getIconStyle = (bgColor) => ({
      background: bgColor,
      boxShadow: `0 8px 25px ${bgColor.replace(')', ', 0.3)')}, 0 4px 12px ${bgColor.replace(')', ', 0.2)')}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      color: 'white'
    });

    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('restaurant')) {
      return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #3b82f6, #7c3aed)')}>
        <FaUtensils />
      </div>;
    } else if (categoryLower.includes('café') || categoryLower.includes('cafe')) {
      return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #10b981, #059669)')}>
        <FaCoffee />
      </div>;
    } else if (categoryLower.includes('bibliothèque') || categoryLower.includes('bibliotheque')) {
      return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #f59e0b, #d97706)')}>
        <FaBook />
      </div>;
    } else if (categoryLower.includes('sport')) {
      return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #60a5fa, #93c5fd)')}>
        <FaFutbol />
      </div>;
    } else if (categoryLower.includes('coiffure')) {
      return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #8b5cf6, #7c3aed)')}>
        <FaCut />
      </div>;
    } else if (categoryLower.includes('esthétique') || categoryLower.includes('esthetique')) {
      return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #ec4899, #db2777)')}>
        <FaSpa />
      </div>;
    } else {
      return <div className="icon icon-md icon-primary" style={getIconStyle('linear-gradient(135deg, #2563eb, #1d4ed8)')}>
        <FaStore />
      </div>;
    }
  };

  return (
    <div className="container">
      {/* Section de recherche et filtre */}
      <div style={{
        padding: "2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        marginBottom: "2rem",
        color: "white"
      }}>
        <h2 style={{ marginBottom: "1rem" }}>Trouvez votre établissement idéal</h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem"
        }}>
          <input
            type="text"
            placeholder="Rechercher par nom, catégorie ou localité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem"
            }}
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem"
            }}
          >
            <option value="">Toutes les catégories</option>
            <option value="Restaurant">Restaurants</option>
            <option value="Café">Cafés</option>
            <option value="Bibliothèque">Bibliothèques</option>
            <option value="Sport">Terrains de sport</option>
            <option value="Coiffure">Centres de coiffure</option>
            <option value="Esthétique">Centres esthétiques</option>
            <option value="Autre">Autres établissements</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#ff6b6b",
          color: "white",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem"
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Chargement des établissements...</p>
        </div>
      ) : filteredEstablishments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Aucun établissement trouvé</p>
        </div>
      ) : (
        <>
          {/* Grille d'établissements */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem"
          }}>
            {filteredEstablishments.map((establishment) => (
              <div
                key={establishment.id}
                className="glass-panel"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* Image */}
                {establishment.image && (
                  <img
                    src={establishment.image}
                    alt={establishment.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px 8px 0 0",
                      marginBottom: "1rem"
                    }}
                  />
                )}

                {/* Icône de catégorie */}
                <div style={{ marginBottom: "0.5rem" }}>
                  {getCategoryIcon(establishment.category)}
                </div>

                {/* Titre */}
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1.2rem", fontWeight: "bold" }}>
                  {establishment.name}
                </h3>

                {/* Catégorie et localisation */}
                <p style={{
                  color: "var(--text-muted)",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem"
                }}>
                  {establishment.category}
                </p>

                {/* Adresse */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  color: "var(--text-muted)"
                }}>
                  <FaMapMarkerAlt size={14} />
                  <span>{establishment.city || establishment.address}</span>
                </div>

                {/* Téléphone */}
                {establishment.phone && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    color: "var(--text-muted)"
                  }}>
                    <FaPhone size={14} />
                    <span>{establishment.phone}</span>
                  </div>
                )}

                {/* Horaires */}
                {establishment.opening_hours && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    color: "var(--text-muted)"
                  }}>
                    <FaClock size={14} />
                    <span>Ouvert</span>
                  </div>
                )}

                {/* Rating et capacité */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "auto",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <FaStar color="#FFD700" size={14} />
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      {establishment.rating || "N/A"}
                    </span>
                  </div>

                  {establishment.capacity && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" }}>
                      <FaUsers size={14} />
                      <span>{establishment.capacity}</span>
                    </div>
                  )}
                </div>

                {/* Bouton */}
                <Link
                  to={`/establishment/${establishment.id}`}
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    textAlign: "center",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    transition: "opacity 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "0.8"}
                  onMouseLeave={(e) => e.target.style.opacity = "1"}
                >
                  Voir détails
                </Link>
              </div>
            ))}
          </div>

          {/* Afficher la carte si des établissements existent */}
          {filteredEstablishments.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h2>Localisation des établissements</h2>
              <Map
                establishments={filteredEstablishments}
                onLocationSelect={setMapLocation}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Services;
