import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../components/Button";
import Input from "../components/Input";
import { authService } from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const hasValidLinkParams = useMemo(() => Boolean(uid && token), [token, uid]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!hasValidLinkParams) {
      setError("Lien de reinitialisation invalide.");
      return;
    }

    if (!newPassword || !newPasswordConfirm) {
      setError("Veuillez saisir et confirmer le nouveau mot de passe.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.confirmPasswordReset({
        uid,
        token,
        newPassword,
        newPasswordConfirm,
      });

      toast.success(response.message || "Mot de passe mis a jour.");
      navigate("/login");
    } catch (resetError) {
      const nextError =
        resetError.message || "Impossible de reinitialiser le mot de passe.";
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
          Nouveau mot de passe
        </h2>

        {!hasValidLinkParams && (
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
            Le lien est incomplet ou invalide.
          </div>
        )}

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

        <form onSubmit={handleSubmit}>
          <label className="form-label">Nouveau mot de passe</label>
          <Input
            type="password"
            placeholder="********"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={loading || !hasValidLinkParams}
          />

          <label className="form-label" style={{ marginTop: "1rem" }}>
            Confirmer le nouveau mot de passe
          </label>
          <Input
            type="password"
            placeholder="********"
            value={newPasswordConfirm}
            onChange={(event) => setNewPasswordConfirm(event.target.value)}
            disabled={loading || !hasValidLinkParams}
          />

          <div style={{ marginTop: "1.5rem" }}>
            <Button
              type="submit"
              text={loading ? "Mise a jour..." : "Reinitialiser"}
              disabled={loading || !hasValidLinkParams}
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

export default ResetPassword;
