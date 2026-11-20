import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../components/Button";
import { getSampleEstablishmentById } from "../data/sampleEstablishments";
import {
  establishmentService,
  messageService,
  reservationService,
} from "../services/api";
import { formatTnd, normalizePriceRange } from "../utils/currency";
import {
  formatReservationDate,
  formatReservationTime,
} from "../utils/reservations";

const initialReservationData = {
  date: "",
  time: "",
  guests: "2",
  specialRequests: "",
};

const initialMessageData = {
  subject: "",
  message: "",
};

function EstablishmentDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("about");
  const [establishment, setEstablishment] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationData, setReservationData] = useState(initialReservationData);
  const [reservationFeedback, setReservationFeedback] = useState(null);
  const [messageData, setMessageData] = useState(initialMessageData);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (parseError) {
      return null;
    }
  }, []);

  const isOwner = currentUser?.user_type === "establishment";
  const isSampleEstablishment = String(establishment?.id || "").startsWith("sample-");
  const openingHoursEntries = Object.entries(establishment?.opening_hours || {});
  const today = new Date().toISOString().split("T")[0];

  const fetchEstablishmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const sampleEstablishment = getSampleEstablishmentById(id);
      if (sampleEstablishment) {
        setEstablishment({
          ...sampleEstablishment,
          price_range: normalizePriceRange(sampleEstablishment.price_range),
        });
        setReviews(sampleEstablishment.reviews || []);
        setServices(sampleEstablishment.services || []);
        return;
      }

      const [establishmentData, reviewData, serviceData] = await Promise.all([
        establishmentService.getById(id),
        establishmentService.getReviews(id).catch(() => []),
        establishmentService.getServices(id).catch(() => []),
      ]);

      setEstablishment({
        ...establishmentData,
        price_range: normalizePriceRange(establishmentData.price_range),
      });
      setReviews(Array.isArray(reviewData) ? reviewData : reviewData.results || []);
      setServices(Array.isArray(serviceData) ? serviceData : serviceData.results || []);
    } catch (fetchError) {
      console.error(fetchError);
      const sampleEstablishment = getSampleEstablishmentById(id);
      if (sampleEstablishment) {
        setEstablishment({
          ...sampleEstablishment,
          price_range: normalizePriceRange(sampleEstablishment.price_range),
        });
        setReviews(sampleEstablishment.reviews || []);
        setServices(sampleEstablishment.services || []);
        return;
      }
      setError("Impossible de charger cet etablissement.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEstablishmentDetails();
  }, [fetchEstablishmentDetails]);

  const handleReservationSubmit = async () => {
    if (!currentUser) {
      toast.error("Connectez-vous pour reserver.");
      return;
    }

    if (!reservationData.date || !reservationData.time) {
      toast.error("Veuillez selectionner une date et une heure.");
      return;
    }

    try {
      setIsSubmittingReservation(true);

      if (isSampleEstablishment) {
        setReservationFeedback({
          id: "sample-reservation",
          date: reservationData.date,
          time: reservationData.time,
          guests: Number(reservationData.guests),
          label: "En attente",
        });
        setReservationData(initialReservationData);
        toast.success("Reservation envoyee avec succes.");
        return;
      }

      const reservation = await reservationService.create({
        establishment: id,
        date: reservationData.date,
        time: reservationData.time,
        number_of_people: Number(reservationData.guests),
        special_requests: reservationData.specialRequests,
      });

      setReservationFeedback({
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.number_of_people,
        label: reservation.status_label || "En attente",
      });
      setReservationData(initialReservationData);

      toast.success(
        "Reservation envoyee. L'etablissement la voit maintenant dans ses demandes."
      );
    } catch (submitError) {
      console.error(submitError);
      toast.error(submitError.message || "Impossible d'envoyer cette reservation.");
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  const handleMessageSubmit = async () => {
    if (!currentUser) {
      toast.error("Connectez-vous pour envoyer un message.");
      return;
    }

    if (!messageData.message.trim()) {
      toast.error("Veuillez ecrire un message.");
      return;
    }

    try {
      setIsSubmittingMessage(true);

      if (isSampleEstablishment) {
        setMessageData(initialMessageData);
        toast.success("Message envoye avec succes.");
        return;
      }

      const conversationsData = await messageService.getAll();
      const conversations = Array.isArray(conversationsData)
        ? conversationsData
        : conversationsData.results || [];

      let conversation = conversations.find(
        (item) => Number(item.establishment) === Number(id)
      );

      if (!conversation) {
        conversation = await messageService.createConversation(id);
      }

      const content = messageData.subject
        ? `[${messageData.subject}]\n${messageData.message.trim()}`
        : messageData.message.trim();

      await messageService.sendMessage(conversation.id, content);
      setMessageData(initialMessageData);
      toast.success("Message envoye avec succes.");
    } catch (submitError) {
      console.error(submitError);
      toast.error(submitError.message || "Impossible d'envoyer ce message.");
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!currentUser) {
      toast.error("Connectez-vous pour laisser un avis.");
      return;
    }

    if (!newComment.trim() || userRating === 0) {
      toast.error("Ajoutez une note et un commentaire.");
      return;
    }

    try {
      setIsSubmittingReview(true);

      if (isSampleEstablishment) {
        const review = {
          id: `sample-review-${Date.now()}`,
          user_name: currentUser?.first_name || "Utilisateur",
          rating: userRating,
          comment: newComment.trim(),
          created_at: new Date().toISOString(),
        };
        setReviews((current) => [review, ...current]);
        setNewComment("");
        setUserRating(0);
        toast.success("Avis publie avec succes.");
        return;
      }

      const review = await establishmentService.addReview(id, {
        rating: userRating,
        comment: newComment.trim(),
      });
      setReviews((current) => [review, ...current]);
      setEstablishment((current) => {
        if (!current) {
          return current;
        }

        const currentTotal = Number(current.total_reviews || 0);
        const currentAverage = Number(current.average_rating || current.rating || 0);
        const nextTotal = currentTotal + 1;
        const nextAverage = ((currentAverage * currentTotal) + userRating) / nextTotal;

        return {
          ...current,
          total_reviews: nextTotal,
          average_rating: nextAverage,
          rating: nextAverage,
        };
      });
      setNewComment("");
      setUserRating(0);
      toast.success("Avis publie avec succes.");
    } catch (submitError) {
      console.error(submitError);
      toast.error(submitError.message || "Impossible de publier cet avis.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "5rem" }}>
        <div className="spinner"></div> Chargement...
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "5rem" }}>
        {error || "Etablissement introuvable."}
      </div>
    );
  }

  return (
    <div className="container">
      <div
        className="glass-panel"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "280px",
          display: "flex",
          alignItems: "flex-end",
          marginBottom: "2rem",
          backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.25)), url(${
            establishment.profile_image ||
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="status-badge status-confirmed">{establishment.category}</span>
          <h1 style={{ margin: "1rem 0 0.5rem", fontSize: "2.4rem" }}>{establishment.name}</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)" }}>{establishment.address}</p>
          <div style={{ marginTop: "1rem", color: "rgba(255,255,255,0.9)" }}>
            Note moyenne : {(establishment.average_rating || establishment.rating || 0).toFixed(1)}
            /5 - {establishment.total_reviews || 0} avis
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 360px)",
          gap: "2rem",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            {[
              ["about", "A propos"],
              ["services", "Services"],
              ["reviews", `Avis (${reviews.length})`],
              ["contact", "Contact"],
            ].map(([tabValue, label]) => (
              <button
                key={tabValue}
                type="button"
                onClick={() => setActiveTab(tabValue)}
                className={activeTab === tabValue ? "btn btn-primary" : "btn btn-secondary"}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="glass-panel">
            {activeTab === "about" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div>
                  <h3>Description</h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {establishment.description || "Aucune description disponible."}
                  </p>
                </div>

                {establishment.images?.length > 0 && (
                  <div>
                    <h3>Galerie</h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {establishment.images.slice(0, 6).map((image, index) => (
                        <img
                          key={`${image}-${index}`}
                          src={image}
                          alt={`${establishment.name} ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "14px",
                            border: "1px solid var(--border-color)",
                            boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "2rem",
                  }}
                >
                  <div>
                    <h4>Horaires d'ouverture</h4>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {openingHoursEntries.length === 0 ? (
                        <li>Horaires non renseignes.</li>
                      ) : (
                        openingHoursEntries.map(([day, hours]) => (
                          <li
                            key={day}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "0.45rem 0",
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            <span style={{ textTransform: "capitalize" }}>{day}</span>
                            <strong>
                              {hours.closed
                                ? "Ferme"
                                : `${hours.open || "--:--"} - ${hours.close || "--:--"}`}
                            </strong>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4>Informations pratiques</h4>
                    <div style={{ display: "grid", gap: "0.6rem", color: "var(--text-secondary)" }}>
                      <div>Telephone : {establishment.phone || "Non renseigne"}</div>
                      <div>Email : {establishment.email || "Non renseigne"}</div>
                      <div>Capacite : {establishment.capacity || "N/A"} personnes</div>
                      <div>Prix : {normalizePriceRange(establishment.price_range) || "Non renseigne"}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div>
                <h3>Services proposes</h3>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {services.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>
                      Aucun service specifique n'est encore renseigne.
                    </p>
                  ) : (
                    services.map((service) => (
                      <div
                        key={service.id}
                        style={{
                          padding: "1rem",
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "1rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <strong>{service.name}</strong>
                            <div style={{ color: "var(--text-muted)", marginTop: "0.35rem" }}>
                              {service.description || "Aucune description"}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div>{formatTnd(service.price)}</div>
                            <div style={{ color: "var(--text-muted)" }}>{service.duration} min</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {currentUser && !isOwner && (
                  <div
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      padding: "1rem",
                    }}
                  >
                    <h4>Laisser un avis</h4>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: star <= userRating ? "var(--warning-color)" : "var(--text-muted)",
                            fontSize: "1.4rem",
                            cursor: "pointer",
                          }}
                        >
                          *
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      placeholder="Partagez votre experience..."
                    />
                    <div style={{ marginTop: "1rem" }}>
                      <Button
                        text={isSubmittingReview ? "Publication..." : "Publier l'avis"}
                        className="btn-primary"
                        onClick={handleReviewSubmit}
                        disabled={isSubmittingReview}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gap: "1rem" }}>
                  {reviews.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>Aucun avis pour le moment.</p>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        style={{
                          paddingBottom: "1rem",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "1rem",
                            marginBottom: "0.35rem",
                          }}
                        >
                          <strong>{review.user_name || review.user_username || "Utilisateur"}</strong>
                          <span>{`${"*".repeat(review.rating)}${".".repeat(5 - review.rating)}`}</span>
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.6rem" }}>
                          {new Date(review.created_at).toLocaleDateString("fr-FR")}
                        </div>
                        <div>{review.comment}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div style={{ display: "grid", gap: "1rem" }}>
                {!currentUser ? (
                  <div style={{ textAlign: "center" }}>
                    <p>Connectez-vous pour contacter cet etablissement.</p>
                    <Link to="/login" className="btn btn-primary">
                      Se connecter
                    </Link>
                  </div>
                ) : isOwner ? (
                  <p style={{ color: "var(--text-muted)" }}>
                    Un gerant ne peut pas ouvrir une conversation avec son propre etablissement.
                  </p>
                ) : (
                  <>
                    <div>
                      <label className="form-label">Sujet (optionnel)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={messageData.subject}
                        onChange={(event) =>
                          setMessageData((current) => ({
                            ...current,
                            subject: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="form-label">Message</label>
                      <textarea
                        className="form-input"
                        rows={5}
                        value={messageData.message}
                        onChange={(event) =>
                          setMessageData((current) => ({
                            ...current,
                            message: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      text={isSubmittingMessage ? "Envoi..." : "Envoyer le message"}
                      className="btn-primary"
                      onClick={handleMessageSubmit}
                      disabled={isSubmittingMessage}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ position: "sticky", top: "2rem", display: "grid", gap: "1rem" }}>
            <div>
              <h3 style={{ marginTop: 0 }}>Faire une reservation</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
                Chaque demande est envoyee a l'etablissement, qui peut ensuite l'accepter ou la refuser.
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                borderRadius: "14px",
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                display: "grid",
                gap: "0.45rem",
              }}
            >
              <div>Capacite maximale : {establishment.capacity || "N/A"} personnes</div>
              <div>Reponse du partenaire : acceptation ou refus depuis son tableau de bord</div>
              <div>Suivi client : visible ensuite dans votre historique et vos messages</div>
            </div>

            {reservationFeedback && (
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "14px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  display: "grid",
                  gap: "0.45rem",
                }}
              >
                <strong>Reservation envoyee</strong>
                <div>
                  {formatReservationDate(reservationFeedback.date)} a {formatReservationTime(reservationFeedback.time)}
                </div>
                <div>{reservationFeedback.guests} personne(s)</div>
                <span className="status-badge status-pending" style={{ width: "fit-content" }}>
                  {reservationFeedback.label}
                </span>
                <Link to="/history" className="btn btn-outline" style={{ marginTop: "0.35rem" }}>
                  Voir mon historique
                </Link>
              </div>
            )}

            {!currentUser ? (
              <div style={{ display: "grid", gap: "1rem" }}>
                <p>Veuillez vous connecter pour reserver.</p>
                <Link to="/login" className="btn btn-primary">
                  Connexion
                </Link>
              </div>
            ) : isOwner ? (
              <p style={{ color: "var(--text-muted)" }}>
                Les comptes gerants ne peuvent pas creer de reservation.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={reservationData.date}
                    min={today}
                    onChange={(event) =>
                      setReservationData((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Heure</label>
                  <input
                    type="time"
                    className="form-input"
                    value={reservationData.time}
                    onChange={(event) =>
                      setReservationData((current) => ({
                        ...current,
                        time: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Nombre de personnes</label>
                  <select
                    className="form-input"
                    value={reservationData.guests}
                    onChange={(event) =>
                      setReservationData((current) => ({
                        ...current,
                        guests: event.target.value,
                      }))
                    }
                  >
                    {Array.from({ length: Math.max(Number(establishment.capacity || 10), 1) }, (_, index) => index + 1)
                      .slice(0, 12)
                      .map((count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? "personne" : "personnes"}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Demandes speciales</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={reservationData.specialRequests}
                    onChange={(event) =>
                      setReservationData((current) => ({
                        ...current,
                        specialRequests: event.target.value,
                      }))
                    }
                    placeholder="Allergies, emplacement souhaite, precision utile..."
                  />
                </div>
                <Button
                  text={isSubmittingReservation ? "Envoi..." : "Envoyer la demande"}
                  className="btn-primary"
                  onClick={handleReservationSubmit}
                  disabled={isSubmittingReservation}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstablishmentDetails;
