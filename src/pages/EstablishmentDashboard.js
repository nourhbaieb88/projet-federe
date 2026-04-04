import { useState } from "react";
import Button from "../components/Button";

function EstablishmentDashboard() {
  const [activeTab, setActiveTab] = useState('reservations');

  const categories = [
    "Restaurants",
    "Cafés",
    "Bibliothèques",
    "Terrains de sport",
    "Centres de coiffure",
    "Centres esthétiques",
    "Autres établissements"
  ];
  const [establishmentInfo, setEstablishmentInfo] = useState({
    name: "Restaurant Le Jardin",
    category: "Restaurants",
    address: "123 Rue de la Liberté, Tunis",
    phone: "+216 71 123 456",
    email: "contact@lejardin.tn",
    description: "Restaurant traditionnel tunisien avec vue sur la mer",
    latitude: 36.8065,
    longitude: 10.1815,
    priceRange: "€€ - Moyen",
    capacity: 80,
    profileImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"
    ],
    openingHours: {
      monday: { open: "12:00", close: "23:00", closed: false },
      tuesday: { open: "12:00", close: "23:00", closed: false },
      wednesday: { open: "12:00", close: "23:00", closed: false },
      thursday: { open: "12:00", close: "23:00", closed: false },
      friday: { open: "12:00", close: "23:00", closed: false },
      saturday: { open: "12:00", close: "23:00", closed: false },
      sunday: { open: "12:00", close: "23:00", closed: false }
    }
  });

  const [availableSlots, setAvailableSlots] = useState([
    { date: "2026-04-15", time: "12:00", available: true },
    { date: "2026-04-15", time: "13:00", available: true },
    { date: "2026-04-15", time: "14:00", available: false },
    { date: "2026-04-15", time: "15:00", available: true },
    { date: "2026-04-16", time: "12:00", available: true },
    { date: "2026-04-16", time: "13:00", available: true },
    { date: "2026-04-16", time: "14:00", available: true },
  ]);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editInfoData, setEditInfoData] = useState({ ...establishmentInfo });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [reservations, setReservations] = useState([
    {
      id: "RES-001",
      clientName: "Ahmed Ben Ali",
      clientEmail: "ahmed@example.com",
      date: "15 Avr 2026",
      time: "19:00",
      status: "En attente",
      statusClass: "status-pending"
    },
    {
      id: "RES-002",
      clientName: "Fatma Trabelsi",
      clientEmail: "fatma@example.com",
      date: "20 Avr 2026",
      time: "14:00",
      status: "Confirmée",
      statusClass: "status-completed"
    },
    {
      id: "RES-003",
      clientName: "Mohamed Salah",
      clientEmail: "mohamed@example.com",
      date: "25 Avr 2026",
      time: "16:30",
      status: "Annulée",
      statusClass: "status-cancelled"
    }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setReservations(reservations.map(res =>
      res.id === id ? { ...res, status: newStatus, statusClass: getStatusClass(newStatus) } : res
    ));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmée": return "status-completed";
      case "Refusée": return "status-refused";
      case "Annulée": return "status-cancelled";
      default: return "status-pending";
    }
  };

  const pendingReservations = reservations.filter(res => res.status === "En attente");
  const confirmedReservations = reservations.filter(res => res.status === "Confirmée");

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Nettoyer l'adresse pour ne garder que les informations essentielles
        const addressParts = data.display_name.split(', ');
        // Garder généralement les 3-4 premiers éléments (rue, ville, pays)
        const cleanAddress = addressParts.slice(0, 4).join(', ');
        return cleanAddress;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
    }
    return null;
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Obtenir l'adresse automatiquement
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        const newData = {
          ...editInfoData,
          latitude: latitude,
          longitude: longitude,
          address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        };
        
        setEditInfoData(newData);
        setIsGettingLocation(false);
        alert('Localisation récupérée avec succès !');
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Erreur lors de la récupération de votre position. Vérifiez que la géolocalisation est activée.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const renderReservationsTab = () => (
    <>
      <div className="dashboard-stats" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
        <div className="glass-panel" style={{textAlign: 'center'}}>
          <h3>Réservations en attente</h3>
          <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)'}}>
            {pendingReservations.length}
          </div>
        </div>
        <div className="glass-panel" style={{textAlign: 'center'}}>
          <h3>Réservations confirmées</h3>
          <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#34d399'}}>
            {confirmedReservations.length}
          </div>
        </div>
        <div className="glass-panel" style={{textAlign: 'center'}}>
          <h3>Total des réservations</h3>
          <div style={{fontSize: '2rem', fontWeight: 'bold'}}>
            {reservations.length}
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h2 style={{marginBottom: "2rem"}}>Demandes de Réservation</h2>

        {pendingReservations.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>
            Aucune demande de réservation en attente
          </p>
        ) : (
          <div className="reservations-list">
            {pendingReservations.map((res) => (
              <div key={res.id} className="reservation-item" style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                  <div>
                    <h3 style={{marginBottom: '0.5rem'}}>{res.clientName}</h3>
                    <p style={{color: 'var(--text-muted)', margin: '0.25rem 0'}}>
                      {res.clientEmail}
                    </p>
                    <p style={{margin: '0.25rem 0'}}>
                      📅 {res.date} à {res.time}
                    </p>
                    <p style={{margin: '0.25rem 0'}}>
                      Ref: {res.id}
                    </p>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <Button
                      text="Accepter"
                      onClick={() => handleStatusChange(res.id, "Confirmée")}
                    />
                    <Button
                      text="Refuser"
                      onClick={() => handleStatusChange(res.id, "Refusée")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{marginTop: '2rem'}}>
        <h2 style={{marginBottom: "2rem"}}>Historique des Réservations</h2>

        <div className="reservations-list">
          {reservations.filter(res => res.status !== "En attente").map((res) => (
            <div key={res.id} className="reservation-item" style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              background: 'rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h3 style={{marginBottom: '0.5rem'}}>{res.clientName}</h3>
                  <p style={{color: 'var(--text-muted)', margin: '0.25rem 0'}}>
                    {res.clientEmail}
                  </p>
                  <p style={{margin: '0.25rem 0'}}>
                    📅 {res.date} à {res.time}
                  </p>
                  <p style={{margin: '0.25rem 0'}}>
                    Ref: {res.id}
                  </p>
                </div>
                <span className={`status-badge ${res.statusClass}`}>{res.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderAvailabilityTab = () => {
    const toggleSlotAvailability = (index) => {
      const updatedSlots = [...availableSlots];
      updatedSlots[index].available = !updatedSlots[index].available;
      setAvailableSlots(updatedSlots);
    };

    const addNewSlot = () => {
      const newSlot = {
        date: new Date().toISOString().split('T')[0],
        time: "12:00",
        available: true
      };
      setAvailableSlots([...availableSlots, newSlot]);
    };

    const groupedSlots = availableSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {});

    return (
      <div className="glass-panel">
        <h2 style={{marginBottom: "2rem"}}>Gestion des Temps Libres</h2>
        
        <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem'}}>
          <p style={{color: 'var(--text-color)', margin: 0, fontSize: '0.9rem'}}>
            💡 <strong>Gérez vos créneaux disponibles :</strong> Les clients peuvent voir et réserver uniquement les créneaux marqués comme disponibles. 
            Cliquez sur un créneau pour changer son statut.
          </p>
        </div>

        <div style={{marginBottom: '2rem'}}>
          <Button text="Ajouter un nouveau créneau" onClick={addNewSlot} />
        </div>

        {Object.keys(groupedSlots).map(date => (
          <div key={date} style={{marginBottom: '2rem'}}>
            <h3 style={{marginBottom: '1rem', color: 'var(--accent-color)'}}>
              📅 {new Date(date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem'}}>
              {groupedSlots[date].map((slot, index) => {
                const globalIndex = availableSlots.findIndex(s => s.date === slot.date && s.time === slot.time);
                return (
                  <button
                    key={index}
                    onClick={() => toggleSlotAvailability(globalIndex)}
                    style={{
                      padding: '0.75rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: slot.available ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: slot.available ? '#34d399' : '#ef4444',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🕒 {slot.time}
                    <br />
                    <small>{slot.available ? 'Disponible' : 'Occupé'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedSlots).length === 0 && (
          <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>
            Aucun créneau défini. Ajoutez des créneaux pour permettre aux clients de réserver.
          </p>
        )}
      </div>
    );
  };

  const renderInfoTab = () => {

    const handleSave = () => {
      setEstablishmentInfo({ ...editInfoData });
      setIsEditingInfo(false);
      alert("Informations mises à jour !");
    };

    const handleCancel = () => {
      setIsEditingInfo(false);
      setEditInfoData({ ...establishmentInfo });
    };

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setEditInfoData({ ...editInfoData, profileImage: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="glass-panel">
        <h2 style={{marginBottom: "2rem"}}>Informations de l'établissement</h2>

        <div style={{display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "2rem"}}>
          {/* Image de profil */}
          <div style={{textAlign: "center"}}>
            <img
              src={isEditingInfo ? editInfoData.profileImage : establishmentInfo.profileImage}
              alt="Profil de l'établissement"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--accent-color)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
              }}
            />
            {isEditingInfo && (
              <div style={{marginTop: "1rem"}}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{display: "block", margin: "0 auto"}}
                />
              </div>
            )}
          </div>

          {/* Informations générales */}
          <div style={{flex: 1}}>
            {isEditingInfo ? (
              <div style={{display: "grid", gap: "1rem"}}>
                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Nom de l'établissement</label>
                  <input
                    type="text"
                    value={editInfoData.name}
                    onChange={(e) => setEditInfoData({...editInfoData, name: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>

                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Catégorie</label>
                  <select
                    value={editInfoData.category}
                    onChange={(e) => setEditInfoData({...editInfoData, category: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc"
                    }}
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Adresse</label>
                  <div style={{display: "flex", gap: "0.5rem", alignItems: "center"}}>
                    <input
                      type="text"
                      value={editInfoData.address}
                      onChange={(e) => setEditInfoData({...editInfoData, address: e.target.value})}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                      }}
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "var(--accent-color)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isGettingLocation ? "not-allowed" : "pointer",
                        opacity: isGettingLocation ? 0.6 : 1,
                        fontSize: "0.9rem"
                      }}
                    >
                      {isGettingLocation ? "⏳ Localisation..." : "📍 Localisation auto"}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Téléphone</label>
                  <input
                    type="tel"
                    value={editInfoData.phone}
                    onChange={(e) => setEditInfoData({...editInfoData, phone: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>

                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Email</label>
                  <input
                    type="email"
                    value={editInfoData.email}
                    onChange={(e) => setEditInfoData({...editInfoData, email: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>

                <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
                  <Button text="Sauvegarder" onClick={handleSave} />
                  <Button text="Annuler" onClick={handleCancel} />
                </div>
              </div>
            ) : (
              <div style={{display: "grid", gap: "1rem"}}>
                <div>
                  <strong>Nom:</strong> {establishmentInfo.name}
                </div>
                <div>
                  <strong>Catégorie:</strong> {establishmentInfo.category}
                </div>
                <div>
                  <strong>Adresse:</strong> {establishmentInfo.address}
                </div>
                <div>
                  <strong>Téléphone:</strong> {establishmentInfo.phone}
                </div>
                <div>
                  <strong>Email:</strong> {establishmentInfo.email}
                </div>
                <div>
                  <strong>Gamme de prix:</strong> {establishmentInfo.priceRange}
                </div>
                <div>
                  <strong>Capacité:</strong> {establishmentInfo.capacity} places
                </div>
                <div>
                  <strong>Coordonnées GPS:</strong> {establishmentInfo.latitude.toFixed(4)}, {establishmentInfo.longitude.toFixed(4)}
                </div>

                <div style={{marginTop: "1rem"}}>
                  <Button text="Modifier les informations" onClick={() => setIsEditingInfo(true)} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{marginBottom: '1rem'}}>Description</h3>
          <p style={{color: 'var(--text-muted)', lineHeight: '1.6'}}>
            {establishmentInfo.description}
          </p>

          <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>Horaires d'ouverture</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
            {Object.entries(establishmentInfo.openingHours).map(([day, hours]) => (
              <div key={day} style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{textTransform: 'capitalize', minWidth: '80px'}}>{day}:</span>
                <span>
                  {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>Galerie d'images</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem'}}>
            {establishmentInfo.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Établissement ${index + 1}`}
                style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px'}}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <h1 className="page-title">Tableau de Bord Établissement</h1>

      <div style={{marginBottom: '2rem'}}>
        <div style={{display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>
          <button
            onClick={() => setActiveTab('reservations')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'reservations' ? 'var(--accent-color)' : 'var(--panel-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📅 Réservations
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'availability' ? 'var(--accent-color)' : 'var(--panel-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🕒 Temps Libres
          </button>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'info' ? 'var(--accent-color)' : 'var(--panel-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ℹ️ Informations
          </button>
        </div>
      </div>

      {activeTab === 'reservations' ? renderReservationsTab() : 
       activeTab === 'availability' ? renderAvailabilityTab() : renderInfoTab()}
    </div>
  );
}

export default EstablishmentDashboard;