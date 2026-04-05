import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import Button from "../components/Button";
import Input from "../components/Input";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaSignOutAlt } from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    latitude: user?.latitude || "",
    longitude: user?.longitude || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess("Profil mis à jour avec succès !");
        setIsEditing(false);
      } else {
        setError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "2rem" }}>
        <p>Veuillez vous connecter pour accéder à votre profil</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header" style={{ marginBottom: "2rem" }}>
        <h1 className="section-title">Mon Profil</h1>
        <p className="section-subtitle">Gérez vos informations personnelles</p>
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

      {success && (
        <div style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem"
        }}>
          {success}
        </div>
      )}

      <div className="glass-panel" style={{ marginBottom: "2rem" }}>
        {!isEditing ? (
          <>
            {/* Mode affichage */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "2rem"
            }}>
              <div>
                <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
                  {user.first_name} {user.last_name}
                </h2>
                <p style={{ color: "var(--text-muted)" }}>
                  {user.is_establishment ? "Établissement" : "Client"}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <FaEdit size={14} />
                Modifier
              </button>
            </div>

            {/* Informations */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginBottom: "2rem"
            }}>
              <div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem"
                }}>
                  <FaEnvelope color="#667eea" size={18} />
                  <div>
                    <p style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      margin: "0 0 0.25rem 0"
                    }}>Email</p>
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem"
                }}>
                  <FaPhone color="#667eea" size={18} />
                  <div>
                    <p style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      margin: "0 0 0.25rem 0"
                    }}>Téléphone</p>
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      {user.phone || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {user.latitude && user.longitude && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}>
                    <FaMapMarkerAlt color="#667eea" size={18} />
                    <div>
                      <p style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        margin: "0 0 0.25rem 0"
                      }}>Localisation</p>
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {user.bio && (
              <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "2rem"
              }}>
                <strong>Biographie:</strong>
                <p style={{ marginTop: "0.5rem" }}>{user.bio}</p>
              </div>
            )}

            {/* Bouton déconnexion */}
            <button
              onClick={handleLogout}
              style={{
                padding: "0.75rem 1.5rem",
                background: "rgba(255, 107, 107, 0.2)",
                color: "#ff6b6b",
                border: "1px solid #ff6b6b",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FaSignOutAlt size={14} />
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            {/* Mode édition */}
            <form onSubmit={handleSubmit}>
              <h2 style={{ marginBottom: "1.5rem" }}>Modifier le profil</h2>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem"
              }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                    Prénom
                  </label>
                  <Input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                    Nom
                  </label>
                  <Input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  Téléphone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+216 XX XXX XXX"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  Biographie
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Parlez-nous de vous..."
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
                  disabled={loading}
                />
              </div>

              <div style={{
                display: "flex",
                gap: "1rem"
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1.5rem",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <FaSave size={14} />
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      first_name: user?.first_name || "",
                      last_name: user?.last_name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                      bio: user?.bio || "",
                      latitude: user?.latitude || "",
                      longitude: user?.longitude || ""
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1.5rem",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
