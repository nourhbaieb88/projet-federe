import { useState, useEffect } from "react";
import { reservationService, establishmentService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FaCalendarAlt, FaUsers, FaClock, FaMapMarkerAlt, FaTrash, FaCheckCircle } from "react-icons/fa";

function History() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, past

  // Charger les réservations
  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getAll();
        setReservations(data.results || data);
        setError("");
      } catch (err) {
        setError("Erreur lors du chargement des réservations");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadReservations();
    }
  }, [user]);

  // Filtrer les réservations
  useEffect(() => {
    const now = new Date();
    let filtered = reservations;

    if (filter === "upcoming") {
      filtered = filtered.filter(res => new Date(res.date) >= now);
    } else if (filter === "past") {
      filtered = filtered.filter(res => new Date(res.date) < now);
    }

    // Trier par date (plus récentes d'abord pour past, plus proches pour upcoming)
    filtered.sort((a, b) => {
      if (filter === "upcoming") {
        return new Date(a.date) - new Date(b.date);
      } else {
        return new Date(b.date) - new Date(a.date);
      }
    });

    setFilteredReservations(filtered);
  }, [reservations, filter]);

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      try {
        await reservationService.cancel(reservationId);
        setReservations(reservations.filter(res => res.id !== reservationId));
        alert("Réservation annulée avec succès !");
      } catch (err) {
        setError(err.message || "Erreur lors de l'annulation");
      }
    }
  };

  const getReservationStatus = (date) => {
    const reservationDate = new Date(date);
    const now = new Date();
    
    if (reservationDate < now) {
      return { label: "Passée", color: "#ccc" };
    } else if (reservationDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { label: "Demain", color: "#FFD700" };
    } else {
      return { label: "À venir", color: "#4CAF50" };
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "2rem" }}>
        <p>Chargement de votre historique...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header" style={{ marginBottom: "2rem" }}>
        <h1 className="section-title">Mes réservations</h1>
        <p className="section-subtitle">Historique et gestion de vos réservations</p>
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

      {/* Filtres */}
      <div className="glass-panel" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "0.5rem 1rem",
              background: filter === "all" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Toutes les réservations
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            style={{
              padding: "0.5rem 1rem",
              background: filter === "upcoming" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            À venir
          </button>
          <button
            onClick={() => setFilter("past")}
            style={{
              padding: "0.5rem 1rem",
              background: filter === "past" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Passées
          </button>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>
            {filter === "all" && "Vous n'avez pas encore de réservations"}
            {filter === "upcoming" && "Aucune réservation à venir"}
            {filter === "past" && "Aucune réservation passée"}
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "1.5rem"
        }}>
          {filteredReservations.map((reservation) => {
            const status = getReservationStatus(reservation.date);
            const reservationDate = new Date(reservation.date);

            return (
              <div
                key={reservation.id}
                className="glass-panel"
                style={{
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Status indicator */}
                <div style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  padding: "0.5rem 1rem",
                  background: status.color,
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <FaCheckCircle size={12} />
                  {status.label}
                </div>

                {/* Titre de l'établissement */}
                <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem", fontWeight: "bold" }}>
                  {reservation.establishment?.name || "Établissement"}
                </h3>

                {/* Catégorie */}
                <p style={{
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                  fontSize: "0.9rem"
                }}>
                  {reservation.establishment?.category}
                </p>

                {/* Détails */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <FaCalendarAlt color="#667eea" />
                    <div>
                      <p style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        margin: "0 0 0.25rem 0"
                      }}>Date</p>
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        {reservationDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <FaClock color="#667eea" />
                    <div>
                      <p style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        margin: "0 0 0.25rem 0"
                      }}>Heure</p>
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        {reservation.time.substring(0, 5)}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <FaUsers color="#667eea" />
                    <div>
                      <p style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        margin: "0 0 0.25rem 0"
                      }}>Personnes</p>
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        {reservation.number_of_guests}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <FaMapMarkerAlt color="#667eea" />
                    <div>
                      <p style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        margin: "0 0 0.25rem 0"
                      }}>Lieu</p>
                      <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>
                        {reservation.establishment?.address?.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Demandes spéciales */}
                {reservation.special_requests && (
                  <div style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    fontSize: "0.9rem"
                  }}>
                    <strong>Demandes spéciales:</strong> {reservation.special_requests}
                  </div>
                )}

                {/* Boutons d'action */}
                <div style={{
                  display: "flex",
                  gap: "0.5rem"
                }}>
                  {status.label === "À venir" && (
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "rgba(255, 107, 107, 0.2)",
                        color: "#ff6b6b",
                        border: "1px solid #ff6b6b",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem"
                      }}
                    >
                      <FaTrash size={14} />
                      Annuler
                    </button>
                  )}
                  <button
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
