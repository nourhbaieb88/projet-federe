import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../components/Button";
import Input from "../components/Input";
import { authService } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Veuillez renseigner votre email.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.requestPasswordReset(email.trim());
      setMessage(
        response.message ||
          "Si un compte existe avec cet email, un message de reinitialisation a ete envoye."
      );
      toast.success("Verification envoyee.");
    } catch (requestError) {
      const nextError =
        requestError.message || "Impossible d'envoyer l'email de reinitialisation.";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "520px" }}>
      <div className="glass-panel">
        <h2 className="page-title" style={{ marginBottom: "1rem", textAlign: "center" }}>
          Mot de passe oublie
        </h2>
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "1.5rem" }}>
          Saisissez votre email. Nous vous enverrons un lien pour choisir un nouveau mot de passe.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="form-label">Email</label>
          <Input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
          />

          <div style={{ marginTop: "1.5rem" }}>
            <Button
              type="submit"
              text={loading ? "Envoi..." : "Envoyer le lien"}
              disabled={loading}
              className="btn-primary"
            />
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/login" style={{ color: "var(--accent-color)" }}>
            Retour a la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
