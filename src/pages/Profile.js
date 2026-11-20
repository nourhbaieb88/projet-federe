import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "../components/Button";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    latitude: 36.8065,
    longitude: 10.1815,
    profile_image: null,
    user_type: "client"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profileData });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      const mappedData = {
        username: data.username || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        latitude: parseFloat(data.latitude) || 36.8065,
        longitude: parseFloat(data.longitude) || 10.1815,
        profile_image: data.profile_image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        user_type: data.user_type || "client"
      };
      setProfileData(mappedData);
      setEditData(mappedData);
    } catch (error) {
      console.error("Erreur de récupération du profil:", error);
      toast.error("Impossible de récupérer les informations du profil.");
    } finally {
      setLoading(false);
    }
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const addressParts = data.display_name.split(', ');
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
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        setEditData({
          ...editData,
          latitude: latitude,
          longitude: longitude,
          address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
        setIsGettingLocation(false);
        toast.success('Localisation récupérée avec succès !');
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        toast.error('Erreur lors de la récupération de votre position.');
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

  const handleSave = async () => {
    try {
      const updatePayload = {
        first_name: editData.first_name,
        last_name: editData.last_name,
        phone: editData.phone,
        address: editData.address,
        latitude: editData.latitude,
        longitude: editData.longitude,
      };

      // Si une nouvelle image en Base64 a été sélectionnée, on l'ajoute
      if (editData.profile_image && editData.profile_image.startsWith("data:image")) {
        updatePayload.profile_image_base64 = editData.profile_image;
      }

      const result = await updateProfile(updatePayload);
      if (!result.success) {
        throw new Error(result.error || "Profile update failed");
      }

      const nextProfile = {
        ...editData,
        ...result.user,
        latitude: parseFloat(result.user.latitude ?? editData.latitude) || 36.8065,
        longitude: parseFloat(result.user.longitude ?? editData.longitude) || 10.1815,
      };

      setProfileData(nextProfile);
      setEditData(nextProfile);
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Impossible de mettre à jour le profil.");
    }
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
        setEditData({ ...editData, profile_image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div> Chargement du profil...
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="glass-panel">
        <h2 className="page-title" style={{marginBottom: "2rem"}}>Profil Utilisateur</h2>

        <div style={{display: "flex", gap: "3rem", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center"}}>
          {/* Image de profil */}
          <div style={{textAlign: "center"}}>
            <img
              src={isEditing ? editData.profile_image : profileData.profile_image}
              alt="Profil utilisateur"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid var(--accent-color)",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)"
              }}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"; }}
            />
            {isEditing && (
              <div style={{marginTop: "1.5rem"}}>
                <label className="btn btn-secondary" style={{cursor: "pointer", fontSize: "0.85rem", padding: "0.5rem 1rem"}}>
                  Changer de photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{display: "none"}}
                  />
                </label>
              </div>
            )}
            <div style={{marginTop: "1.5rem"}}>
              <span className="status-badge status-completed" style={{textTransform: "capitalize"}}>
                Type de compte: {profileData.user_type}
              </span>
            </div>
          </div>

          {/* Informations du profil */}
          <div style={{flex: "1 1 400px"}}>
            {isEditing ? (
              <div style={{display: "grid", gap: "1.5rem"}}>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem"}}>
                  <div>
                    <label className="form-label">Prénom</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editData.first_name}
                      onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Nom</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editData.last_name}
                      onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Email <span style={{color: "var(--text-muted)", fontSize: "0.8rem"}}>(Lecture seule)</span></label>
                  <input
                    type="email"
                    className="form-input"
                    value={editData.email}
                    disabled
                    style={{opacity: 0.6, cursor: "not-allowed"}}
                  />
                </div>

                <div>
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    placeholder="+216XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="form-label">Adresse</label>
                  <div style={{display: "flex", gap: "0.5rem", alignItems: "stretch"}}>
                    <input
                      type="text"
                      className="form-input"
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      style={{marginBottom: 0, flex: 1}}
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="btn btn-secondary"
                      style={{
                        padding: "0 1rem",
                        opacity: isGettingLocation ? 0.7 : 1
                      }}
                    >
                      {isGettingLocation ? "⏳" : "📍 Localiser"}
                    </button>
                  </div>
                </div>

                <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
                  <Button text="Sauvegarder les modifications" onClick={handleSave} />
                  <Button text="Annuler" onClick={handleCancel} className="btn-secondary" />
                </div>
              </div>
            ) : (
              <div style={{display: "grid", gap: "1.5rem", background: "rgba(255, 255, 255, 0.03)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)"}}>
                <div style={{borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem"}}>
                  <div style={{color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem"}}>Nom complet</div>
                  <div style={{fontSize: "1.1rem", fontWeight: "600"}}>
                    {profileData.first_name || profileData.last_name 
                      ? `${profileData.first_name} ${profileData.last_name}` 
                      : profileData.username}
                  </div>
                </div>
                <div style={{borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem"}}>
                  <div style={{color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem"}}>Email</div>
                  <div style={{fontSize: "1.1rem"}}>{profileData.email}</div>
                </div>
                <div style={{borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem"}}>
                  <div style={{color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem"}}>Téléphone</div>
                  <div style={{fontSize: "1.1rem"}}>{profileData.phone || <em style={{color: "var(--text-muted)"}}>Non renseigné</em>}</div>
                </div>
                <div style={{paddingBottom: "0.5rem"}}>
                  <div style={{color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem"}}>Localisation</div>
                  <div style={{fontSize: "1.1rem"}}>{profileData.address || <em style={{color: "var(--text-muted)"}}>Non renseignée</em>}</div>
                  <div style={{color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem"}}>
                    📍 {profileData.latitude.toFixed(4)}, {profileData.longitude.toFixed(4)}
                  </div>
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
