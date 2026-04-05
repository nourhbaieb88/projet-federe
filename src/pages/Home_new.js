import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUtensils, FaCoffee, FaBook, FaFutbol, FaCut, FaSpa, FaArrowRight, FaStar } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const categories = [
    {
      name: "Restaurants",
      icon: FaUtensils,
      color: "linear-gradient(135deg, #3b82f6, #7c3aed)",
      count: 1250
    },
    {
      name: "Cafés",
      icon: FaCoffee,
      color: "linear-gradient(135deg, #10b981, #059669)",
      count: 840
    },
    {
      name: "Bibliothèques",
      icon: FaBook,
      color: "linear-gradient(135deg, #f59e0b, #d97706)",
      count: 125
    },
    {
      name: "Terrains de sport",
      icon: FaFutbol,
      color: "linear-gradient(135deg, #60a5fa, #93c5fd)",
      count: 340
    },
    {
      name: "Centres de coiffure",
      icon: FaCut,
      color: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      count: 560
    },
    {
      name: "Centres esthétiques",
      icon: FaSpa,
      color: "linear-gradient(135deg, #ec4899, #db2777)",
      count: 290
    }
  ];

  const handleCategoryClick = (category) => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(`/services?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "4rem 2rem",
        borderRadius: "12px",
        textAlign: "center",
        marginBottom: "3rem",
        color: "white"
      }}>
        <h1 style={{
          fontSize: "3rem",
          marginBottom: "1rem",
          fontWeight: "bold"
        }}>
          Bienvenue sur CityReserve
        </h1>
        <p style={{
          fontSize: "1.2rem",
          marginBottom: "2rem",
          opacity: 0.9
        }}>
          Réservez facilement dans les meilleurs établissements de votre ville
        </p>

        {!isAuthenticated ? (
          <div style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "0.75rem 2rem",
                background: "white",
                color: "#667eea",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "transform 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "0.75rem 2rem",
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "2px solid white",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "transform 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              S'inscrire
            </button>
          </div>
        ) : user?.is_establishment ? (
          <button
            onClick={() => navigate("/establishment-dashboard")}
            style={{
              padding: "0.75rem 2rem",
              background: "white",
              color: "#667eea",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            Mon tableau de bord
          </button>
        ) : (
          <button
            onClick={() => navigate("/services")}
            style={{
              padding: "0.75rem 2rem",
              background: "white",
              color: "#667eea",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            Découvrir les établissements
          </button>
        )}
      </div>

      {/* Section des catégories */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{
          fontSize: "2rem",
          marginBottom: "2rem",
          textAlign: "center"
        }}>
          Explorez par catégorie
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem"
        }}>
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.name)}
                style={{
                  padding: "2rem",
                  background: category.color,
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  textAlign: "center"
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
                <Icon size={40} style={{ marginBottom: "1rem" }} />
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{category.name}</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
                  {category.count} établissements
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section des avantages */}
      <div className="glass-panel" style={{
        padding: "3rem",
        marginBottom: "3rem"
      }}>
        <h2 style={{
          fontSize: "2rem",
          marginBottom: "2rem",
          textAlign: "center"
        }}>
          Pourquoi CityReserve ?
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "2.5rem",
              marginBottom: "1rem"
            }}>
              ⚡
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>Réservation rapide</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Réservez en quelques clics en quelques secondes
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "2.5rem",
              marginBottom: "1rem"
            }}>
              🔒
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>Sécurisé</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Vos données sont protégées par les normes de sécurité les plus élevées
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "2.5rem",
              marginBottom: "1rem"
            }}>
              💬
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>Communication directe</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Discutez directement avec les établissements
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "2.5rem",
              marginBottom: "1rem"
            }}>
              ⭐
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>Avis vérifiés</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Lisez les avis d'autres clients pour faire votre choix
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "2.5rem",
              marginBottom: "1rem"
            }}>
              📍
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>Localisation en temps réel</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Trouvez les établissements les plus proches de vous
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "2.5rem",
              marginBottom: "1rem"
            }}>
              📱
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>Accessible partout</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Utilisez CityReserve sur votre téléphone, tablette ou ordinateur
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {isAuthenticated && !user?.is_establishment && (
        <div style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          padding: "3rem 2rem",
          borderRadius: "12px",
          textAlign: "center",
          color: "white",
          marginBottom: "2rem"
        }}>
          <h2 style={{ marginBottom: "1rem" }}>Passez vos commandes dès maintenant !</h2>
          <p style={{ marginBottom: "1.5rem", opacity: 0.9 }}>
            Découvrez les meilleurs établissements et réservez instantanément
          </p>
          <button
            onClick={() => navigate("/services")}
            style={{
              padding: "0.75rem 2rem",
              background: "white",
              color: "#f5576c",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "transform 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            Commencer maintenant
            <FaArrowRight />
          </button>
        </div>
      )}

      {/* Footer simple */}
      <div style={{
        textAlign: "center",
        padding: "2rem",
        color: "var(--text-muted)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <p>© 2026 CityReserve. Tous droits réservés.</p>
      </div>
    </div>
  );
}

export default Home;
