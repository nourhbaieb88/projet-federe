import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import MapSelector from "../components/MapSelectorLeaflet";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleRegister = () => {
    if (!name || !email || !password || !phone) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }
    alert("Simulation d'Inscription ! Téléphone enregistré : " + phone);
  };

  return (
    <div className="container" style={{maxWidth: "500px"}}>
      <div className="glass-panel" style={{textAlign: "center"}}>
        <h2 className="page-title" style={{marginBottom: "2rem"}}>Inscription</h2>

        <div style={{textAlign: "left"}}>
          <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Nom Complet</label>
          <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />

          <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Email</label>
          <Input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Mot de passe</label>
          <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

          <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Numéro de téléphone *</label>
          <Input type="tel" placeholder="+216 XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />

          <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Votre localisation (optionnel)</label>
          <MapSelector
            onLocationSelect={handleLocationSelect}
            initialLocation={selectedLocation}
            placeholder="Cliquez sur la carte pour définir votre position par défaut"
          />
        </div>

        <div style={{marginTop: "1rem"}}>
          <Button text="S'inscrire" onClick={handleRegister} />
        </div>
      </div>
    </div>
  );
}

export default Register;
