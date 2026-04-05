import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import MapSelector from "../components/MapSelectorLeaflet";

function EstablishmentRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !phone || !address || !category) {
      setError("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" "),
        email,
        password,
        password2,
        phone,
        address,
        category,
        description,
        capacity: capacity ? parseInt(capacity) : null,
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
        is_establishment: true,
      });

      if (result.success) {
        alert("Inscription réussie ! Veuillez vous connecter.");
        navigate("/login");
      } else {
        setError(result.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "700px" }}>
      <div className="glass-panel" style={{ textAlign: "center" }}>
        <h2 className="page-title" style={{ marginBottom: "0.5rem" }}>Inscription Établissement</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Créez un compte pour votre établissement
        </p>

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

        <form onSubmit={handleRegister}>
          <div style={{ textAlign: "left" }}>
            {/* Nom de l'établissement */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Nom de l'établissement
            </label>
            <Input
              type="text"
              placeholder="Exemple: Restaurant Dorna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />

            {/* Email */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Email
            </label>
            <Input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            {/* Mot de passe */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Mot de passe
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            {/* Confirmer mot de passe */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Confirmer le mot de passe
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              disabled={loading}
              required
            />

            {/* Téléphone */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Numéro de téléphone
            </label>
            <Input
              type="tel"
              placeholder="+216 XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              required
            />

            {/* Adresse */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Adresse
            </label>
            <Input
              type="text"
              placeholder="Rue, Ville, Code Postal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              required
            />

            {/* Catégorie */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
                fontFamily: "inherit",
                marginBottom: "1rem"
              }}
              disabled={loading}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Café">Café</option>
              <option value="Bibliothèque">Bibliothèque</option>
              <option value="Sport">Terrain de sport</option>
              <option value="Coiffure">Centre de coiffure</option>
              <option value="Esthétique">Centre esthétique</option>
              <option value="Autre">Autre</option>
            </select>

            {/* Capacité */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Capacité (optionnel)
            </label>
            <Input
              type="number"
              placeholder="Nombre de personnes"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={loading}
            />

            {/* Description */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Description (optionnel)
            </label>
            <textarea
              placeholder="Décrivez votre établissement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
                fontFamily: "inherit",
                minHeight: "100px",
                resize: "vertical",
                marginBottom: "1rem"
              }}
            />

            {/* Localisation */}
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", marginTop: "1rem" }}>
              Localisation sur la carte (optionnel)
            </label>
            <MapSelector
              onLocationSelect={handleLocationSelect}
              initialLocation={selectedLocation}
              placeholder="Cliquez sur la carte pour définir votre localisation"
            />
          </div>

          <div style={{ marginTop: "2rem" }}>
            <Button text={loading ? "Inscription..." : "S'inscrire"} disabled={loading} />
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p style={{ color: "var(--text-muted)" }}>
            Vous avez un compte ? <a href="/login" style={{ color: "var(--accent-color)" }}>Se connecter</a>
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            Vous êtes un client ? <a href="/register" style={{ color: "var(--accent-color)" }}>S'inscrire comme client</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EstablishmentRegister;
