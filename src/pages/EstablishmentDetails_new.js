import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { establishmentService, reservationService, messageService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import { FaStar, FaMapMarkerAlt, FaPhone, FaClock, FaUsers, FaArrowLeft } from "react-icons/fa";

function EstablishmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [establishment, setEstablishment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [reservationData, setReservationData] = useState({
    date: "",
    time: "",
    number_of_guests: 1,
    special_requests: ""
  });

  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ""
  });

  // Charger les détails de l'établissement
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [estData, reviewsData] = await Promise.all([
          establishmentService.getById(id),
          establishmentService.getReviews(id)
        ]);
        
        setEstablishment(estData);
        setReviews(reviewsData.results || reviewsData || []);
        setError("");
      } catch (err) {
        setError("Erreur lors du chargement des détails");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setReservationData({
      ...reservationData,
      [name]: value
    });
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setReservationLoading(true);
    setError("");

    try {
      await reservationService.create({
        ...reservationData,
        establishment_id: id,
        date: reservationData.date,
        time: reservationData.time,
        number_of_guests: parseInt(reservationData.number_of_guests)
      });

      alert("Réservation confirmée !");
      setReservationData({ date: "", time: "", number_of_guests: 1, special_requests: "" });
      setShowReservationForm(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la création de la réservation");
    } finally {
      setReservationLoading(false);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData({
      ...reviewData,
      [name]: value
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setError("");

    try {
      const newReview = await establishmentService.addReview(id, {
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment
      });

      setReviews([...reviews, newReview]);
      alert("Avis publié avec succès !");
      setReviewData({ rating: 5, comment: "" });
      setShowReviewForm(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la publication de l'avis");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "2rem" }}>
        <p>Chargement des détails...</p>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="container">
        <button
          onClick={() => navigate("/services")}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <FaArrowLeft /> Retour
        </button>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Établissement non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Bouton retour */}
      <button
        onClick={() => navigate("/services")}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
      >
        <FaArrowLeft /> Retour
      </button>

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

      <div className="glass-panel" style={{ marginBottom: "2rem" }}>
        {/* Image */}
        {establishment.image && (
          <img
            src={establishment.image}
            alt={establishment.name}
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              borderRadius: "12px",
              marginBottom: "2rem"
            }}
          />
        )}

        {/* Informations principales */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem"
        }}>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{establishment.name}</h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <FaStar color="#FFD700" />
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {establishment.rating || "N/A"} ({reviews.length} avis)
              </span>
            </div>

            <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              {establishment.category}
            </p>

            {establishment.description && (
              <p style={{ marginBottom: "1rem" }}>
                {establishment.description}
              </p>
            )}
          </div>

          <div>
            {/* Informations de contact */}
            <div style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1rem"
            }}>
              <h3 style={{ marginBottom: "1rem" }}>Informations</h3>

              {establishment.phone && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem"
                }}>
                  <FaPhone />
                  <a href={`tel:${establishment.phone}`}>{establishment.phone}</a>
                </div>
              )}

              {establishment.address && (
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  marginBottom: "0.75rem"
                }}>
                  <FaMapMarkerAlt style={{ marginTop: "0.25rem" }} />
                  <span>{establishment.address}</span>
                </div>
              )}

              {establishment.capacity && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem"
                }}>
                  <FaUsers />
                  <span>Capacité: {establishment.capacity} personnes</span>
                </div>
              )}
            </div>

            {/* Horaires */}
            {establishment.opening_hours && (
              <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "1.5rem",
                borderRadius: "8px"
              }}>
                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaClock /> Horaires
                </h3>
                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  {typeof establishment.opening_hours === 'string' ? (
                    <p>{establishment.opening_hours}</p>
                  ) : (
                    Object.entries(establishment.opening_hours).map(([day, hours]) => (
                      <div key={day} style={{ marginBottom: "0.5rem" }}>
                        <strong style={{ textTransform: "capitalize" }}>{day}:</strong> {hours.closed ? "Fermé" : `${hours.open} - ${hours.close}`}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          <button
            onClick={() => setShowReservationForm(!showReservationForm)}
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {showReservationForm ? "Annuler" : "Faire une réservation"}
          </button>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {showReviewForm ? "Annuler" : "Laisser un avis"}
          </button>

          <button
            onClick={() => {
              if (!user) {
                navigate("/login");
              } else {
                // Rediriger vers messages
                navigate("/messages");
              }
            }}
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Contacter
          </button>
        </div>

        {/* Formulaire de réservation */}
        {showReservationForm && (
          <form
            onSubmit={handleReservationSubmit}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem"
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Faire une réservation</h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={reservationData.date}
                  onChange={handleReservationChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-color)"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  Heure
                </label>
                <input
                  type="time"
                  name="time"
                  value={reservationData.time}
                  onChange={handleReservationChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-color)"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Nombre de personnes
              </label>
              <input
                type="number"
                name="number_of_guests"
                value={reservationData.number_of_guests}
                onChange={handleReservationChange}
                min="1"
                max={establishment.capacity || 1000}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Demandes spéciales (optionnel)
              </label>
              <textarea
                name="special_requests"
                value={reservationData.special_requests}
                onChange={handleReservationChange}
                placeholder="Allergies, préférences, etc."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  fontFamily: "inherit",
                  minHeight: "100px",
                  resize: "vertical"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={reservationLoading}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: reservationLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                opacity: reservationLoading ? 0.7 : 1
              }}
            >
              {reservationLoading ? "Création..." : "Créer la réservation"}
            </button>
          </form>
        )}

        {/* Formulaire d'avis */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem"
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Laisser un avis</h3>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Note (1-5)
              </label>
              <select
                name="rating"
                value={reviewData.rating}
                onChange={handleReviewChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)"
                }}
              >
                <option value="1">1 - Mauvais</option>
                <option value="2">2 - Moyen</option>
                <option value="3">3 - Bon</option>
                <option value="4">4 - Très bon</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Votre avis
              </label>
              <textarea
                name="comment"
                value={reviewData.comment}
                onChange={handleReviewChange}
                placeholder="Partagez votre expérience..."
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  fontFamily: "inherit",
                  minHeight: "120px",
                  resize: "vertical"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={reviewLoading}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: reviewLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                opacity: reviewLoading ? 0.7 : 1
              }}
            >
              {reviewLoading ? "Publication..." : "Publier l'avis"}
            </button>
          </form>
        )}
      </div>

      {/* Avis et commentaires */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: "2rem" }}>Avis et commentaires ({reviews.length})</h2>

        {reviews.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
            Aucun avis pour le moment. Soyez le premier à laisser un avis !
          </p>
        ) : (
          <div>
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  marginBottom: "1rem"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "0.5rem"
                }}>
                  <div>
                    <strong>{review.user?.first_name} {review.user?.last_name}</strong>
                    <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem" }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          color={i < review.rating ? "#FFD700" : "#ccc"}
                          size={12}
                        />
                      ))}
                    </div>
                  </div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EstablishmentDetails;
