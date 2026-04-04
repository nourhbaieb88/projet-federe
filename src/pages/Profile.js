import { useState } from "react";
import Button from "../components/Button";

function Profile() {
  const [profileData, setProfileData] = useState({
    name: "Utilisateur Démo",
    email: "demo@example.com",
    phone: "+216 XX XXX XXX",
    address: "Tunis, Tunisie",
    latitude: 36.8065,
    longitude: 10.1815,
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profileData });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
          ...editData,
          latitude: latitude,
          longitude: longitude,
          address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        };
        
        setEditData(newData);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...editData });
    setIsEditing(false);
    alert("Profil mis à jour !");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profileData });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData({ ...editData, profileImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container">
      <div className="glass-panel">
        <h2 className="page-title" style={{marginBottom: "2rem"}}>Profil Utilisateur</h2>

        <div style={{display: "flex", gap: "2rem", alignItems: "flex-start"}}>
          {/* Image de profil */}
          <div style={{textAlign: "center"}}>
            <img
              src={isEditing ? editData.profileImage : profileData.profileImage}
              alt="Profil utilisateur"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--accent-color)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
              }}
            />
            {isEditing && (
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

          {/* Informations du profil */}
          <div style={{flex: 1}}>
            {isEditing ? (
              <div style={{display: "grid", gap: "1rem"}}>
                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Nom complet</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
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
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>

                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Téléphone</label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>

                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Adresse</label>
                  <div style={{display: "flex", gap: "0.5rem", alignItems: "center"}}>
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
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

                <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
                  <Button text="Sauvegarder" onClick={handleSave} />
                  <Button text="Annuler" onClick={handleCancel} />
                </div>
              </div>
            ) : (
              <div style={{display: "grid", gap: "1rem"}}>
                <div>
                  <strong>Nom:</strong> {profileData.name}
                </div>
                <div>
                  <strong>Email:</strong> {profileData.email}
                </div>
                <div>
                  <strong>Téléphone:</strong> {profileData.phone}
                </div>
                <div>
                  <strong>Adresse:</strong> {profileData.address}
                </div>
                <div>
                  <strong>Coordonnées GPS:</strong> {profileData.latitude.toFixed(4)}, {profileData.longitude.toFixed(4)}
                </div>

                <div style={{marginTop: "1rem"}}>
                  <Button text="Modifier le Profil" onClick={handleEdit} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
