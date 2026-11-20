import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../components/Button";
import { reservationService } from "../services/api";
import {
  formatReservationDate,
  formatReservationTime,
  getReservationStatusMeta,
  isReservationCancellable,
  sortReservationsByDate,
} from "../utils/reservations";

function ReservationCard({ reservation, onCancel }) {
  const statusMeta = getReservationStatusMeta(
    reservation.status,
    reservation.status_label
  );

  return (
    <div
      className="glass-panel"
      style={{
        display: "grid",
        gap: "1rem",
        padding: "1.35rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>{reservation.establishment_name || "Etablissement"}</h3>
          <div style={{ color: "var(--text-muted)", marginTop: "0.35rem" }}>
            Ref #{reservation.id}
          </div>
        </div>
        <span className={`status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem 1rem",
          color: "var(--text-secondary)",
        }}
      >
        <div>Date : {formatReservationDate(reservation.date)}</div>
        <div>Heure : {formatReservationTime(reservation.time)}</div>
        <div>Personnes : {reservation.number_of_people}</div>
        <div>Etat : {reservation.status_label || statusMeta.label}</div>
      </div>

      {reservation.special_requests && (
        <div
          style={{
            padding: "0.9rem 1rem",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border-color)",
          }}
        >
          <strong>Demandes speciales</strong>
          <div style={{ marginTop: "0.35rem", color: "var(--text-secondary)" }}>
            {reservation.special_requests}
          </div>
        </div>
      )}

      <div style={{ color: "var(--text-muted)" }}>{statusMeta.description}</div>

      {isReservationCancellable(reservation.status) && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            text="Annuler la reservation"
            className="btn-outline"
            onClick={() => onCancel(reservation.id)}
            style={{ borderColor: "var(--error-color)", color: "var(--error-color)" }}
          />
        </div>
      )}
    </div>
  );
}

function History() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchReservations = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const data = await reservationService.getAll();
      const results = Array.isArray(data) ? data : data.results || [];
      setReservations(results);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Impossible de recuperer l'historique des reservations.");
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchReservations(true);
    const intervalId = setInterval(() => {
      fetchReservations(false);
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchReservations]);

  const handleCancel = async (id) => {
    try {
      const toastId = toast.loading("Annulation en cours...");
      const updatedReservation = await reservationService.cancel(id);

      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === id ? updatedReservation : reservation
        )
      );
      toast.success("Reservation annulee avec succes.", { id: toastId });
    } catch (error) {
      console.error("Error canceling reservation:", error);
      toast.error(
        error.message || "Erreur lors de l'annulation de la reservation."
      );
    }
  };

  const sortedReservations = useMemo(
    () => sortReservationsByDate(reservations, "desc"),
    [reservations]
  );

  const pendingReservations = sortedReservations.filter(
    (reservation) => reservation.status === "pending"
  );
  const upcomingReservations = sortReservationsByDate(
    sortedReservations.filter((reservation) => reservation.status === "confirmed"),
    "asc"
  );
  const processedReservations = sortedReservations.filter((reservation) =>
    ["completed", "rejected", "cancelled"].includes(reservation.status)
  );

  const stats = {
    total: sortedReservations.length,
    pending: pendingReservations.length,
    upcoming: upcomingReservations.length,
    processed: processedReservations.length,
  };

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--";

  if (loading) {
    return (
      <div className="container">
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem" }}>
          <div className="loading" style={{ justifyContent: "center", marginBottom: "1rem" }}>
            <div className="spinner"></div>
            <span style={{ fontSize: "1.2rem" }}>Chargement de l'historique...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">Mes reservations</h1>
        <p className="section-subtitle">
          Suivez vos demandes envoyees, vos reservations acceptees et l'historique complet.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ color: "var(--text-muted)" }}>
          Derniere mise a jour : {lastUpdatedLabel}
        </div>
        <Button
          text={isRefreshing ? "Actualisation..." : "Actualiser"}
          className="btn-secondary"
          onClick={() => fetchReservations(false)}
          disabled={isRefreshing}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="glass-panel">
          <div style={{ color: "var(--text-muted)", marginBottom: "0.45rem" }}>
            Total
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div className="glass-panel">
          <div style={{ color: "var(--text-muted)", marginBottom: "0.45rem" }}>
            En attente
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{stats.pending}</div>
        </div>
        <div className="glass-panel">
          <div style={{ color: "var(--text-muted)", marginBottom: "0.45rem" }}>
            Acceptees a venir
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{stats.upcoming}</div>
        </div>
        <div className="glass-panel">
          <div style={{ color: "var(--text-muted)", marginBottom: "0.45rem" }}>
            Historique traite
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{stats.processed}</div>
        </div>
      </div>

      {sortedReservations.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <h3>Aucune reservation</h3>
          <p style={{ margin: "0.75rem 0 1.5rem", color: "var(--text-muted)" }}>
            Vous n'avez pas encore effectue de reservation.
          </p>
          <Link to="/services" className="btn btn-primary">
            Decouvrir les etablissements
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "2rem" }}>
          <section style={{ display: "grid", gap: "1rem" }}>
            <div>
              <h2 style={{ marginBottom: "0.35rem" }}>Demandes en attente</h2>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                Ces demandes ont bien ete envoyees. L'etablissement doit encore accepter ou refuser.
              </p>
            </div>

            {pendingReservations.length === 0 ? (
              <div className="glass-panel" style={{ color: "var(--text-muted)" }}>
                Aucune demande en attente.
              </div>
            ) : (
              pendingReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancel}
                />
              ))
            )}
          </section>

          <section style={{ display: "grid", gap: "1rem" }}>
            <div>
              <h2 style={{ marginBottom: "0.35rem" }}>Reservations acceptees</h2>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                Vos prochaines reservations confirmees par les etablissements.
              </p>
            </div>

            {upcomingReservations.length === 0 ? (
              <div className="glass-panel" style={{ color: "var(--text-muted)" }}>
                Aucune reservation acceptee pour le moment.
              </div>
            ) : (
              upcomingReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancel}
                />
              ))
            )}
          </section>

          <section style={{ display: "grid", gap: "1rem" }}>
            <div>
              <h2 style={{ marginBottom: "0.35rem" }}>Historique</h2>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                Reservations terminees, refusees ou annulees.
              </p>
            </div>

            {processedReservations.length === 0 ? (
              <div className="glass-panel" style={{ color: "var(--text-muted)" }}>
                Aucun historique traite pour le moment.
              </div>
            ) : (
              processedReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancel}
                />
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default History;
