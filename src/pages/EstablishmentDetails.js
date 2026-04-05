import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";

function EstablishmentDetails() {
  const { id } = useParams();
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reservationData, setReservationData] = useState({
    date: "",
    time: "",
    guests: 1,
    specialRequests: ""
  });
  const [messageData, setMessageData] = useState({
    subject: "",
    message: ""
  });
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Ahmed Ben Ali",
      rating: 5,
      comment: "Excellent restaurant ! La nourriture est délicieuse et le service impeccable. Je recommande vivement.",
      date: "2026-04-01"
    },
    {
      id: 2,
      user: "Fatma Trabelsi",
      rating: 4,
      comment: "Très bon restaurant, ambiance agréable. Les prix sont raisonnables pour la qualité.",
      date: "2026-03-28"
    },
    {
      id: 3,
      user: "Mohamed Salah",
      rating: 5,
      comment: "Une expérience culinaire exceptionnelle ! Le couscous était parfait et le service attentionné.",
      date: "2026-03-25"
    }
  ]);

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setReservationData({
      ...reservationData,
      [name]: value
    });
  };

  const handleReservationSubmit = () => {
    if (!reservationData.date || !reservationData.time) {
      alert("Veuillez sélectionner une date et une heure");
      return;
    }

    alert(`Demande de réservation envoyée à "${establishment.title}" pour le ${reservationData.date} à ${reservationData.time} pour ${reservationData.guests} personne(s). L'établissement devra confirmer votre demande.`);

    // Réinitialiser le formulaire
    setReservationData({
      date: "",
      time: "",
      guests: 1,
      specialRequests: ""
    });
    setShowReservationForm(false);
  };

  const handleMessageChange = (e) => {
    const { name, value } = e.target;
    setMessageData({
      ...messageData,
      [name]: value
    });
  };

  const handleMessageSubmit = () => {
    if (!messageData.subject || !messageData.message) {
      alert("Veuillez remplir l'objet et le message");
      return;
    }

    alert(`Message envoyé à "${establishment.title}" avec succès ! L'établissement vous répondra bientôt.`);

    // Réinitialiser le formulaire
    setMessageData({
      subject: "",
      message: ""
    });
    setShowMessageForm(false);
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim() || userRating === 0) {
      alert("Veuillez écrire un commentaire et donner une note");
      return;
    }

    const comment = {
      id: comments.length + 1,
      user: "Vous",
      rating: userRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0]
    };

    setComments([comment, ...comments]);
    setNewComment("");
    setUserRating(0);
    alert("Commentaire ajouté avec succès !");
  };

  // Simulation des données détaillées (en réalité, récupérer depuis une API)
  const establishments = [
    {
      id: 1,
      title: "Restaurant Le Jardin",
      category: "Restaurants",
      location: "Tunis",
      rating: 4.5,
      icon: "🍽️",
      lat: 36.8065,
      lng: 10.1815,
      address: "123 Rue de la Liberté, Tunis",
      phone: "+216 71 123 456",
      email: "contact@lejardin.tn",
      priceRange: "€€ - Moyen",
      capacity: 80,
      description: "Restaurant traditionnel tunisien avec vue sur la mer. Spécialités : couscous, tajine, pastilla. Ambiance conviviale avec musique traditionnelle.",
      openingHours: {
        monday: { open: "12:00", close: "23:00", closed: false },
        tuesday: { open: "12:00", close: "23:00", closed: false },
        wednesday: { open: "12:00", close: "23:00", closed: false },
        thursday: { open: "12:00", close: "23:00", closed: false },
        friday: { open: "12:00", close: "23:00", closed: false },
        saturday: { open: "12:00", close: "23:00", closed: false },
        sunday: { open: "12:00", close: "23:00", closed: false }
      },
      images: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600"
      ],
      features: ["Climatisation", "WiFi gratuit", "Parking", "Terrasse", "Accept cartes"]
    },
    {
      id: 2,
      title: "Café Central",
      category: "Cafés",
      location: "Sfax",
      rating: 4.2,
      icon: "☕",
      lat: 34.7398,
      lng: 10.7600,
      address: "45 Avenue Habib Bourguiba, Sfax",
      phone: "+216 74 567 890",
      email: "info@cafecentral.tn",
      priceRange: "€ - Budget",
      capacity: 50,
      description: "Café traditionnel avec spécialités tunisiennes. Idéal pour un café ou un thé à la menthe. Ambiance authentique.",
      openingHours: {
        monday: { open: "08:00", close: "20:00", closed: false },
        tuesday: { open: "08:00", close: "20:00", closed: false },
        wednesday: { open: "08:00", close: "20:00", closed: false },
        thursday: { open: "08:00", close: "20:00", closed: false },
        friday: { open: "08:00", close: "20:00", closed: false },
        saturday: { open: "08:00", close: "20:00", closed: false },
        sunday: { open: "10:00", close: "18:00", closed: false }
      },
      images: [
        "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
      ],
      features: ["WiFi gratuit", "Terrasse", "Spécialités tunisiennes"]
    }
  ];

  const establishment = establishments.find(est => est.id === parseInt(id));

  if (!establishment) {
    return (
      <div className="container">
        <h1 className="page-title">Établissement non trouvé</h1>
        <Link to="/services">
          <Button text="Retour aux services" />
        </Link>
      </div>
    );
  }

  const isOpenToday = () => {
    const today = new Date().toLocaleLowerCase('en', { weekday: 'long' });
    const hours = establishment.openingHours[today];
    if (!hours || hours.closed) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(hours.open.replace(':', ''));
    const closeTime = parseInt(hours.close.replace(':', ''));

    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <div className="container">
      <div className="establishment-header" style={{marginBottom: '2rem'}}>
        <Link to="/services" style={{color: 'var(--accent-color)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block'}}>
          ← Retour aux établissements
        </Link>
        <h1 className="page-title" style={{marginBottom: '0.5rem'}}>{establishment.title}</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
          <span className="rating">⭐ {establishment.rating}/5</span>
          <span style={{color: 'var(--text-muted)'}}>•</span>
          <span>{establishment.category}</span>
          <span style={{color: 'var(--text-muted)'}}>•</span>
          <span>{establishment.location}</span>
          {establishment.priceRange && (
            <>
              <span style={{color: 'var(--text-muted)'}}>•</span>
              <span>{establishment.priceRange}</span>
            </>
          )}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <span className={`status-badge ${isOpenToday() ? 'status-completed' : 'status-cancelled'}`}>
            {isOpenToday() ? '🟢 Ouvert' : '🔴 Fermé'}
          </span>
          <span style={{color: 'var(--text-muted)'}}>
            Capacité: {establishment.capacity} places
          </span>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem'}}>
        <div>
          <div className="glass-panel">
            <h2 style={{marginBottom: '1rem'}}>Images</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
              {establishment.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${establishment.title} ${index + 1}`}
                  style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer'}}
                  onClick={() => window.open(image, '_blank')}
                />
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{marginTop: '2rem'}}>
            <h2 style={{marginBottom: '1rem'}}>Description</h2>
            <p style={{color: 'var(--text-muted)', lineHeight: '1.6'}}>
              {establishment.description}
            </p>
          </div>

          {establishment.features && establishment.features.length > 0 && (
            <div className="glass-panel" style={{marginTop: '2rem'}}>
              <h2 style={{marginBottom: '1rem'}}>Équipements et services</h2>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                {establishment.features.map((feature, index) => (
                  <span key={index} style={{
                    background: 'var(--panel-bg)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="glass-panel">
            <h2 style={{marginBottom: '1rem'}}>Informations de contact</h2>
            <div style={{marginBottom: '1rem'}}>
              <strong>📍 Adresse:</strong><br />
              {establishment.address}
            </div>
            <div style={{marginBottom: '1rem'}}>
              <strong>📞 Téléphone:</strong><br />
              <a href={`tel:${establishment.phone}`} style={{color: 'var(--accent-color)'}}>
                {establishment.phone}
              </a>
            </div>
            <div style={{marginBottom: '1rem'}}>
              <strong>✉️ Email:</strong><br />
              <a href={`mailto:${establishment.email}`} style={{color: 'var(--accent-color)'}}>
                {establishment.email}
              </a>
            </div>
            <div style={{marginBottom: '1rem'}}>
              <strong>📍 Coordonnées GPS:</strong><br />
              {establishment.lat}, {establishment.lng}
            </div>
          </div>

          <div className="glass-panel" style={{marginTop: '2rem'}}>
            <h2 style={{marginBottom: '1rem'}}>🕐 Horaires d'ouverture</h2>
            <div style={{display: 'grid', gap: '0.75rem'}}>
              {Object.entries(establishment.openingHours).map(([day, hours]) => {
                const today = new Date();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = dayNames[today.getDay()];
                const isToday = day === currentDay;

                return (
                  <div
                    key={day}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: isToday ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: isToday ? '1px solid var(--accent-color)' : 'none'
                    }}
                  >
                    <span style={{
                      textTransform: 'capitalize',
                      fontWeight: isToday ? 'bold' : '500',
                      color: isToday ? 'var(--accent-color)' : 'var(--text-color)'
                    }}>
                      {day} {isToday ? '(Aujourd\'hui)' : ''}
                    </span>
                    <span style={{
                      color: hours.closed ? '#ef4444' : '#10b981',
                      fontWeight: '600'
                    }}>
                      {hours.closed ? '🔴 Fermé' : `🟢 ${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel" style={{marginTop: '2rem'}}>
            <h2 style={{marginBottom: '1rem'}}>📊 Disponibilité</h2>
            <div style={{display: 'grid', gap: '1rem'}}>
              <div>
                <p style={{color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Capacité totale</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    👥
                  </div>
                  <div>
                    <strong style={{fontSize: '1.25rem'}}>{establishment.capacity}</strong> places totales
                  </div>
                </div>
              </div>

              <div style={{borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                <p style={{color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Places disponibles aujourd'hui</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    ✓
                  </div>
                  <div>
                    <strong style={{fontSize: '1.25rem'}}>{Math.max(0, establishment.capacity - 15)}</strong> places libres
                  </div>
                </div>
              </div>

              <div style={{borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                <p style={{color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem'}}>État</p>
                <span className={`status-badge ${isOpenToday() ? 'status-completed' : 'status-cancelled'}`}>
                  {isOpenToday() ? '🟢 Ouvert maintenant' : '🔴 Actuellement fermé'}
                </span>
              </div>
            </div>
          </div>

          <div style={{marginTop: '2rem'}}>
            {!showReservationForm ? (
              <Button
                text="Demander une réservation"
                onClick={() => setShowReservationForm(true)}
              />
            ) : (
              <div className="glass-panel" style={{marginTop: '1rem'}}>
                <h3 style={{marginBottom: '1rem', color: 'var(--accent-color)'}}>
                  📅 Demander une réservation
                </h3>

                <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
                  <p style={{color: 'var(--text-color)', margin: 0, fontSize: '0.9rem'}}>
                    💡 Votre demande sera envoyée à <strong>{establishment.title}</strong>.
                    L'établissement devra confirmer ou refuser votre demande.
                  </p>
                </div>

                <div style={{marginBottom: "1rem"}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                    📅 Date souhaitée
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={reservationData.date}
                    onChange={handleReservationChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div style={{marginBottom: "1rem"}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                    🕐 Heure souhaitée
                  </label>
                  <Input
                    type="time"
                    name="time"
                    value={reservationData.time}
                    onChange={handleReservationChange}
                  />
                </div>

                <div style={{marginBottom: "1rem"}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                    👥 Nombre de personnes
                  </label>
                  <select
                    name="guests"
                    value={reservationData.guests}
                    onChange={handleReservationChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--panel-bg)',
                      color: 'var(--text-color)',
                      fontSize: '1rem'
                    }}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} personne{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div style={{marginBottom: "1.5rem"}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                    📝 Demandes spéciales (optionnel)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={reservationData.specialRequests}
                    onChange={handleReservationChange}
                    placeholder="Allergies, préférences spéciales, occasions particulières..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--panel-bg)',
                      color: 'var(--text-color)',
                      fontSize: '1rem',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{display: 'flex', gap: '1rem'}}>
                  <Button
                    text="Envoyer la demande"
                    onClick={handleReservationSubmit}
                  />
                  <Button
                    text="Annuler"
                    onClick={() => {
                      setShowReservationForm(false);
                      setReservationData({
                        date: "",
                        time: "",
                        guests: 1,
                        specialRequests: ""
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Messages */}
      <div className="glass-panel" style={{marginTop: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h2>💬 Contacter l'établissement</h2>
          {!showMessageForm ? (
            <Button
              text="Envoyer un message"
              onClick={() => setShowMessageForm(true)}
            />
          ) : (
            <Button
              text="Annuler"
              onClick={() => {
                setShowMessageForm(false);
                setMessageData({ subject: "", message: "" });
              }}
            />
          )}
        </div>

        {showMessageForm && (
          <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
            <p style={{color: 'var(--text-color)', margin: 0, fontSize: '0.9rem'}}>
              💡 Envoyez un message directement à <strong>{establishment.title}</strong>.
              Ils vous répondront par email ou téléphone.
            </p>
          </div>
        )}

        {showMessageForm && (
          <div style={{display: 'grid', gap: '1rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                📝 Objet du message
              </label>
              <Input
                type="text"
                name="subject"
                placeholder="Ex: Question sur le menu, demande d'information..."
                value={messageData.subject}
                onChange={handleMessageChange}
              />
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                💬 Votre message
              </label>
              <textarea
                name="message"
                placeholder="Écrivez votre message ici..."
                value={messageData.message}
                onChange={handleMessageChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--panel-bg)',
                  color: 'var(--text-color)',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            <Button
              text="Envoyer le message"
              onClick={handleMessageSubmit}
            />
          </div>
        )}
      </div>

      {/* Section Commentaires et Avis */}
      <div className="glass-panel" style={{marginTop: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h2>⭐ Avis et Commentaires ({comments.length})</h2>
          <Button
            text={showComments ? "Masquer les commentaires" : "Voir tous les commentaires"}
            onClick={() => setShowComments(!showComments)}
          />
        </div>

        {/* Système d'évaluation */}
        <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem', color: 'var(--accent-color)'}}>
            📝 Donnez votre avis sur {establishment.title}
          </h3>

          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
              ⭐ Votre note (sur 5 étoiles)
            </label>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: star <= userRating ? '#fbbf24' : '#e5e7eb'
                  }}
                >
                  ⭐
                </button>
              ))}
              <span style={{marginLeft: '1rem', color: 'var(--text-muted)'}}>
                {userRating > 0 && `${userRating}/5 étoiles`}
              </span>
            </div>
          </div>

          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
              💬 Votre commentaire
            </label>
            <textarea
              placeholder="Partagez votre expérience avec cet établissement..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--panel-bg)',
                color: 'var(--text-color)',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <Button
            text="Publier mon avis"
            onClick={handleCommentSubmit}
          />
        </div>

        {/* Affichage des commentaires */}
        {showComments && (
          <div style={{display: 'grid', gap: '1rem'}}>
            {comments.map((comment) => (
              <div key={comment.id} style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <strong>{comment.user}</strong>
                    <div style={{display: 'flex'}}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{color: star <= comment.rating ? '#fbbf24' : '#e5e7eb'}}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                    {new Date(comment.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p style={{margin: 0, color: 'var(--text-color)', lineHeight: '1.5'}}>
                  {comment.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EstablishmentDetails;