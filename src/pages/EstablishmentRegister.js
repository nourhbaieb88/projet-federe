import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Input from "../components/Input";
import MapSelector from "../components/MapSelectorLeaflet";
import { useAuth } from "../context/AuthContext";
import { PRICE_RANGES } from "../utils/currency";
import { reverseGeocode } from "../utils/location";

const defaultOpeningHours = {
  monday: { open: "09:00", close: "18:00", closed: false },
  tuesday: { open: "09:00", close: "18:00", closed: false },
  wednesday: { open: "09:00", close: "18:00", closed: false },
  thursday: { open: "09:00", close: "18:00", closed: false },
  friday: { open: "09:00", close: "18:00", closed: false },
  saturday: { open: "09:00", close: "18:00", closed: false },
  sunday: { open: "09:00", close: "18:00", closed: true },
};

const categories = [
  { label: "Restaurants", value: "Restaurants" },
  { label: "Caf\u00e9s", value: "Caf\u00e9s" },
  { label: "Biblioth\u00e8ques", value: "Biblioth\u00e8ques" },
  { label: "Terrains de sport", value: "Terrains de sport" },
  { label: "Centres de coiffure", value: "Centres de coiffure" },
  { label: "Centres esth\u00e9tiques", value: "Centres esth\u00e9tiques" },
  { label: "Autres \u00e9tablissements", value: "Autres \u00e9tablissements" },
];

const priceRanges = PRICE_RANGES;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function EstablishmentRegister() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    category: "",
    address: "",
    phone: "",
    description: "",
    latitude: "",
    longitude: "",
    priceRange: "",
    capacity: "",
    openingHours: defaultOpeningHours,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setFormData((current) => ({
      ...current,
      openingHours: {
        ...current.openingHours,
        [day]: {
          ...current.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleClosedChange = (day, checked) => {
    setFormData((current) => ({
      ...current,
      openingHours: {
        ...current.openingHours,
        [day]: {
          ...current.openingHours[day],
          closed: checked,
        },
      },
    }));
  };

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);
    setFormData((current) => ({
      ...current,
      latitude: location.lat.toFixed(6),
      longitude: location.lng.toFixed(6),
    }));

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

  const handleCoverImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setCoverImage(dataUrl);
    } catch (imageError) {
      console.error(imageError);
      setError("Impossible de charger l'image principale.");
    }
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    try {
      const uploadedImages = await Promise.all(files.map(fileToDataUrl));
      setGalleryImages((current) => [...current, ...uploadedImages]);
    } catch (imageError) {
      console.error(imageError);
      setError("Impossible de charger une ou plusieurs images.");
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.passwordConfirm ||
      !formData.category ||
      !formData.address ||
      !formData.phone ||
      !formData.capacity
    ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (
      !selectedLocation ||
      formData.latitude === "" ||
      formData.latitude === null ||
      formData.longitude === "" ||
      formData.longitude === null
    ) {
      setError("Veuillez selectionner l'emplacement de l'etablissement sur la carte.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts[0] || "Etablissement";
      const lastName = nameParts.slice(1).join(" ") || "Partenaire";

      const registrationData = {
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        phone: formData.phone,
        user_type: "establishment",
        establishment_name: formData.name,
        category: formData.category,
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        description: formData.description,
        price_range: formData.priceRange,
        capacity: Number(formData.capacity),
        opening_hours: formData.openingHours,
        establishment_profile_image_base64: coverImage || undefined,
        establishment_images_base64: galleryImages,
      };

      const result = await registerUser(registrationData);

      if (!result.success) {
        setError(result.error || "Erreur lors de l'inscription.");
        return;
      }

      navigate("/establishment-dashboard");
    } catch (registrationError) {
      console.error(registrationError);
      setError(
        registrationError.message || "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "760px" }}>
      <div className="glass-panel">
        <h2 className="page-title" style={{ marginBottom: "2rem" }}>
          Inscription Etablissement
        </h2>

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

        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label className="form-label">Nom de l'etablissement</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ex: Restaurant Le Jardin"
              disabled={loading}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="contact@etablissement.com"
                disabled={loading}
              />
            </div>
            <div>
              <label className="form-label">Telephone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+216 XX XXX XXX"
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Mot de passe</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="********"
                disabled={loading}
              />
            </div>
            <div>
              <label className="form-label">Confirmer le mot de passe</label>
              <Input
                type="password"
                value={formData.passwordConfirm}
                onChange={(event) => updateField("passwordConfirm", event.target.value)}
                placeholder="********"
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Categorie</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(event) => updateField("category", event.target.value)}
                disabled={loading}
              >
                <option value="">Selectionnez une categorie</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Gamme de prix (TND)</label>
              <select
                className="form-input"
                value={formData.priceRange}
                onChange={(event) => updateField("priceRange", event.target.value)}
                disabled={loading}
              >
                <option value="">Selectionnez une gamme</option>
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Adresse</label>
              <Input
                type="text"
                value={formData.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="123 Rue de la Liberte"
                disabled={loading}
              />
            </div>
            <div>
              <label className="form-label">Capacite</label>
              <Input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(event) => updateField("capacity", event.target.value)}
                placeholder="50"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Decrivez votre etablissement..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label">Localisation sur la carte</label>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Nous essayons d'abord votre position actuelle. Sinon, vous pouvez cliquer sur la
              carte ou saisir les coordonnees manuellement.
            </p>
            <MapSelector
              onLocationSelect={handleLocationSelect}
              initialLocation={selectedLocation}
              placeholder="Autorisez la localisation ou choisissez l'emplacement manuellement."
            />
          </div>

          <div>
            <label className="form-label">Image principale</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--panel-bg)",
                color: "var(--text-color)",
                fontSize: "1rem",
              }}
            />
            {coverImage && (
              <div style={{ marginTop: "1rem" }}>
                <img
                  src={coverImage}
                  alt="Apercu principal"
                  style={{
                    width: "100%",
                    maxHeight: "220px",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Galerie d'images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryUpload}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--panel-bg)",
                color: "var(--text-color)",
                fontSize: "1rem",
              }}
            />
            {galleryImages.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                {galleryImages.map((image, index) => (
                  <div key={`${index}-${image.slice(0, 20)}`} style={{ position: "relative" }}>
                    <img
                      src={image}
                      alt={`Galerie ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "110px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(239, 68, 68, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        cursor: "pointer",
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Horaires d'ouverture</label>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {Object.entries(formData.openingHours).map(([day, hours]) => (
                <div
                  key={day}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 110px 120px 120px",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  <span style={{ textTransform: "capitalize" }}>{day}</span>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(event) => handleClosedChange(day, event.target.checked)}
                      disabled={loading}
                    />
                    Ferme
                  </label>
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(event) => handleHoursChange(day, "open", event.target.value)}
                    disabled={loading || hours.closed}
                  />
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(event) => handleHoursChange(day, "close", event.target.value)}
                    disabled={loading || hours.closed}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Button
            text={loading ? "Inscription en cours..." : "Creer mon etablissement"}
            onClick={handleRegister}
            disabled={loading}
            className="btn-primary"
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ color: "var(--text-muted)" }}>
            Deja inscrit ?{" "}
            <Link to="/login" style={{ color: "var(--accent-color)" }}>
              Se connecter
            </Link>
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            Vous etes client ?{" "}
            <Link to="/register" style={{ color: "var(--accent-color)" }}>
              Creer un compte client
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EstablishmentRegister;
