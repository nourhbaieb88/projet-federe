import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Input from "../components/Input";
import MapSelector from "../components/MapSelectorLeaflet";
import { useAuth } from "../context/AuthContext";
import { reverseGeocode } from "../utils/location";

function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "+216",
    address: "",
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);

    if (!formData.address.trim()) {
      const address = await reverseGeocode(location.lat, location.lng);
      if (address) {
        setFormData((current) => ({
          ...current,
          address,
        }));
      }
    }
  };

  const handleRegister = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.passwordConfirm ||
      !formData.phone
    ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (
      selectedLocation?.lat === undefined ||
      selectedLocation?.lat === null ||
      selectedLocation?.lng === undefined ||
      selectedLocation?.lng === null
    ) {
      setError(
        "Autorisez la localisation ou selectionnez votre position manuellement sur la carte."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const address =
        formData.address.trim() || (await reverseGeocode(selectedLocation.lat, selectedLocation.lng));

      const result = await registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        phone: formData.phone,
        user_type: "client",
        latitude: Number(selectedLocation.lat.toFixed(6)),
        longitude: Number(selectedLocation.lng.toFixed(6)),
        address,
      });

      if (!result.success) {
        setError(result.error || "Erreur d'inscription.");
        return;
      }

      navigate("/");
    } catch (registrationError) {
      setError(registrationError.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "680px" }}>
      <div className="glass-panel" style={{ textAlign: "center" }}>
        <h2 className="page-title" style={{ marginBottom: "2rem" }}>
          Inscription Client
        </h2>

        <div style={{ textAlign: "left" }}>
          {error && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Prenom</label>
              <Input
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="form-label">Nom</label>
              <Input
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <label className="form-label" style={{ marginTop: "1rem" }}>
            Email
          </label>
          <Input
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            disabled={loading}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label className="form-label">Mot de passe</label>
              <Input
                type="password"
                placeholder="********"
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="form-label">Confirmer le mot de passe</label>
              <Input
                type="password"
                placeholder="********"
                value={formData.passwordConfirm}
                onChange={(event) => updateField("passwordConfirm", event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <label className="form-label" style={{ marginTop: "1rem" }}>
            Telephone
          </label>
          <Input
            type="tel"
            placeholder="+216 XX XXX XXX"
            value={formData.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            disabled={loading}
          />

          <label className="form-label" style={{ marginTop: "1rem" }}>
            Adresse
          </label>
          <Input
            type="text"
            placeholder="Remplie automatiquement ou modifiez-la"
            value={formData.address}
            onChange={(event) => updateField("address", event.target.value)}
            disabled={loading}
          />

          <label className="form-label" style={{ marginTop: "1rem" }}>
            Localisation
          </label>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Nous essayons d'abord votre position actuelle. Si vous refusez, vous pouvez cliquer
            sur la carte ou saisir les coordonnees manuellement.
          </p>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden" }}>
            <MapSelector
              onLocationSelect={handleLocationSelect}
              initialLocation={selectedLocation}
              placeholder="Autorisez la localisation ou choisissez votre position manuellement."
            />
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Button
            text={loading ? "Inscription en cours..." : "Creer mon compte"}
            onClick={handleRegister}
            disabled={loading}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ color: "var(--text-muted)" }}>
            Deja inscrit ?{" "}
            <Link to="/login" style={{ color: "var(--accent-color)" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
