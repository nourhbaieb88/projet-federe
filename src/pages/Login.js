import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaStore, FaUser } from "react-icons/fa";

import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("client");
  const [formError, setFormError] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Veuillez renseigner l'email et le mot de passe.");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      const authenticatedUserType = result.user?.user_type;
      toast.success("Connexion reussie. Bienvenue.");

      if (authenticatedUserType === "establishment") {
        navigate("/establishment-dashboard");
      } else {
        navigate("/");
      }
      return;
    }

    const message = result.error || "Echec de la connexion. Verifiez vos identifiants.";
    toast.error(message);
    setFormError(message);
  };

  return (
    <div className="container" style={{ maxWidth: "500px" }}>
      <div className="glass-panel" style={{ textAlign: "center" }}>
        <h2 className="page-title" style={{ marginBottom: "2rem" }}>
          Connexion
        </h2>

        {(formError || error) && (
          <div
            style={{
              backgroundColor: "#ff6b6b",
              color: "white",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            {formError || error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ marginBottom: "0.75rem", fontWeight: "bold" }}>Type d'utilisateur</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setUserType("client")}
                style={{
                  flex: 1,
                  borderRadius: "14px",
                  border:
                    userType === "client"
                      ? "2px solid #2563eb"
                      : "1px solid rgba(148, 163, 184, 0.4)",
                  background:
                    userType === "client"
                      ? "rgba(59, 130, 246, 0.12)"
                      : "rgba(15, 23, 42, 0.9)",
                  color: "white",
                  padding: "1rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: userType === "client" ? "#3b82f6" : "#1e293b",
                    margin: "0 auto 0.75rem",
                  }}
                >
                  <FaUser size={20} />
                </div>
                Client
              </button>
              <button
                type="button"
                onClick={() => setUserType("establishment")}
                style={{
                  flex: 1,
                  borderRadius: "14px",
                  border:
                    userType === "establishment"
                      ? "2px solid #2563eb"
                      : "1px solid rgba(148, 163, 184, 0.4)",
                  background:
                    userType === "establishment"
                      ? "rgba(59, 130, 246, 0.12)"
                      : "rgba(15, 23, 42, 0.9)",
                  color: "white",
                  padding: "1rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: userType === "establishment" ? "#3b82f6" : "#1e293b",
                    margin: "0 auto 0.75rem",
                  }}
                >
                  <FaStore size={20} />
                </div>
                Etablissement
              </button>
            </div>
          </div>

          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Email
          </label>
          <Input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            Mot de passe
          </label>
          <Input
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <div style={{ marginTop: "0.75rem", textAlign: "right" }}>
            <Link to="/forgot-password" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
              Mot de passe oublie ?
            </Link>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Button
              text={loading ? "Connexion..." : "Se connecter"}
              type="submit"
              disabled={loading}
              className="btn-primary"
            />
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Pas encore de compte ?</p>
          {userType === "client" ? (
            <p style={{ color: "var(--text-muted)" }}>
              <Link to="/register" style={{ color: "var(--accent-color)" }}>
                S'inscrire en tant que client
              </Link>
            </p>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>
              <Link to="/establishment-register" style={{ color: "var(--accent-color)" }}>
                S'inscrire en tant qu'etablissement
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
