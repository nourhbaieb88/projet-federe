import { useState } from "react";
import Button from "../components/Button";

function History() {
  const [reservations, setReservations] = useState([
    { id: "RES-001", establishment: "Restaurant Le Jardin", date: "10 Avr 2026", time: "19:00", status: "Confirmée", statusClass: "status-completed" },
    { id: "RES-002", establishment: "Bibliothèque Nationale", date: "15 Avr 2026", time: "14:00", status: "En attente", statusClass: "status-pending" },
    { id: "RES-003", establishment: "Café Central", date: "20 Avr 2026", time: "10:00", status: "Confirmée", statusClass: "status-completed" },
    { id: "RES-004", establishment: "Stade Olympique", date: "25 Avr 2026", time: "16:00", status: "Refusée", statusClass: "status-refused" }
  ]);

  const handleCancel = (id) => {
    setReservations(reservations.map(res => 
      res.id === id ? { ...res, status: "Annulé", statusClass: "status-cancelled" } : res
    ));
    alert("Réservation annulée !");
  };

  return (
    <div className="container">
      <div className="glass-panel">
        <h2 className="page-title" style={{marginBottom: "2rem"}}>Historique des Réservations</h2>

        <ul className="history-list">
          {reservations.map((res) => (
            <li key={res.id} className="history-item">
              <div>
                <h3 style={{marginBottom: "0.5rem"}}>{res.establishment}</h3>
                <p className="card-desc" style={{margin: 0}}>Date: {res.date} à {res.time} | Ref: {res.id}</p>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                <span className={`status-badge ${res.statusClass}`}>{res.status}</span>
                {res.status === "En attente" && (
                  <Button text="Annuler" onClick={() => handleCancel(res.id)} style={{fontSize: "0.8rem", padding: "0.3rem 0.6rem"}} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default History;
