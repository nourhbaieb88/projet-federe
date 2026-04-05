import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { reservationService } from "../services/api";
import { FaCalendarAlt, FaUsers, FaClock, FaCheckCircle, FaClock as FaClock2 } from "react-icons/fa";

function EstablishmentDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending"); // pending, confirmed, cancelled

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        // Note: Vous devrez implémenter un endpoint pour récupérer les réservations de l'établissement
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

    if (user?.is_establishment) {
      loadReservations();
    }
  }, [user]);

  const handleConfirmReservation = async (reservationId) => {
    try {
      // Implémenter la confirmation de réservation
      alert("Réservation confirmée !");
    } catch (err) {
      setError("Erreur lors de la confirmation");
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      try {
        await reservationService.cancel(reservationId);
        setReservations(reservations.filter(res => res.id !== reservationId));
        alert("Réservation annulée !");
      } catch (err) {
        setError("Erreur lors de l'annulation");
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "2rem" }}>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (!user?.is_establishment) {
    return (
      <div className="container">
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p>Accès réservé aux établissements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header" style={{ marginBottom: "2rem" }}>
        <h1 className="section-title">Tableau de Bord</h1>
        <p className="section-subtitle">Gérez les réservations de votre établissement</p>
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

      {/* Statistiques */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
          <p style={{ color: "var(--text-muted)", margin: "0 0 0.5rem 0" }}>Réservations</p>
          <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{reservations.length}</h3>
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
          <p style={{ color: "var(--text-muted)", margin: "0 0 0.5rem 0" }}>En attente</p>
          <h3 style={{ margin: 0, fontSize: "1.5rem" }}>
            {reservations.filter(r => r.status === "pending").length}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
          <p style={{ color: "var(--text-muted)", margin: "0 0 0.5rem 0" }}>Confirmées</p>
          <h3 style={{ margin: 0, fontSize: "1.5rem" }}>
            {reservations.filter(r => r.status === "confirmed").length}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
          <p style={{ color: "var(--text-muted)", margin: "0 0 0.5rem 0" }}>Personnes attendues</p>
          <h3 style={{ margin: 0, fontSize: "1.5rem" }}>
            {reservations.reduce((sum, r) => sum + (r.number_of_guests || 0), 0)}
          </h3>
        </div>
      </div>

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
            Toutes
          </button>
          <button
            onClick={() => setFilter("pending")}
            style={{
              padding: "0.5rem 1rem",
              background: filter === "pending" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            style={{
              padding: "0.5rem 1rem",
              background: filter === "confirmed" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Confirmées
          </button>
        </div>
      </div>

      {/* Liste des réservations */}
      {reservations.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>
            Aucune réservation pour le moment
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "1.5rem"
        }}>
          {reservations.map((reservation) => (
            <div key={reservation.id} className="glass-panel">
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>
                  {reservation.client?.first_name} {reservation.client?.last_name}
                </h3>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>
                  ID: {reservation.id}
                </p>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaCalendarAlt color="#667eea" />
                  <div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Date</p>
                    <p style={{ fontWeight: "bold", margin: 0 }}>
                      {new Date(reservation.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaClock color="#667eea" />
                  <div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Heure</p>
                    <p style={{ fontWeight: "bold", margin: 0 }}>
                      {reservation.time.substring(0, 5)}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaUsers color="#667eea" />
                  <div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Personnes</p>
                    <p style={{ fontWeight: "bold", margin: 0 }}>
                      {reservation.number_of_guests}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaCheckCircle color={reservation.status === "confirmed" ? "#4CAF50" : "#FFD700"} />
                  <div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Statut</p>
                    <p style={{ fontWeight: "bold", margin: 0, textTransform: "capitalize" }}>
                      {reservation.status}
                    </p>
                  </div>
                </div>
              </div>

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

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {reservation.status !== "confirmed" && (
                  <button
                    onClick={() => handleConfirmReservation(reservation.id)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Confirmer
                  </button>
                )}
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
                    fontWeight: "bold"
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EstablishmentDashboard;
