import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Simulation de connexion - en réalité, vérifier les credentials
    if (email.includes("establishment") || email.includes("resto") || email.includes("cafe")) {
      alert("Connexion établissement réussie ! Redirection vers le tableau de bord...");
      // Ici on redirigerait vers /establishment-dashboard
    } else {
      alert("Connexion client réussie !");
      // Ici on redirigerait vers la page d'accueil ou profil
    }
  };

  return (
    <div className="container" style={{maxWidth: "500px"}}>
      <div className="glass-panel" style={{textAlign: "center"}}>
        <h2 className="page-title" style={{marginBottom: "2rem"}}>Connexion</h2>

        <div style={{textAlign: "left"}}>
          <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Email</label>
          <Input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>Mot de passe</label>
          <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div style={{marginTop: "1rem"}}>
          <Button text="Se Connecter" onClick={handleLogin} />
        </div>

        <div style={{textAlign: "center", marginTop: "1rem"}}>
          <p style={{color: 'var(--text-muted)'}}>
            Pas encore de compte ? <a href="/register" style={{color: 'var(--accent-color)'}}>S'inscrire en tant que client</a>
          </p>
          <p style={{color: 'var(--text-muted)'}}>
            Vous êtes un établissement ? <a href="/establishment-register" style={{color: 'var(--accent-color)'}}>S'inscrire ici</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
