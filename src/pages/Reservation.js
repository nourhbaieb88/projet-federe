import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";

function Reservation() {
  const [establishment, setEstablishment] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const establishments = [
    "Restaurant Le Jardin",
    "Café Central",
    "Bibliothèque Nationale",
    "Stade Olympique"
  ];

  const handleReserve = () => {
    if (!establishment) {
      alert("Veuillez sélectionner un établissement");
      return;
    }
    alert(`Invitation de réservation envoyée à "${establishment}" pour le ${date} à ${time}. L'établissement devra confirmer votre demande.`);
    // Ici on pourrait envoyer une notification à l'établissement
  };

  return (
    <div className="container" style={{maxWidth: "600px"}}>
      <div className="glass-panel">
        <h2 className="page-title" style={{marginBottom: "2rem"}}>Demander une Réservation</h2>
        
        <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem'}}>
          <p style={{color: 'var(--text-color)', margin: 0, fontSize: '0.9rem'}}>
            💡 <strong>Comment ça marche :</strong> Votre demande de réservation sera envoyée à l'établissement sélectionné. 
            L'établissement devra confirmer ou refuser votre demande. Vous recevrez une notification une fois la décision prise.
          </p>
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Établissement</label>
          <select value={establishment} onChange={(e) => setEstablishment(e.target.value)} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}}>
            <option value="">Sélectionnez un établissement</option>
            {establishments.map((est) => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div style={{marginBottom: "2rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Heure</label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <Button text="Confirmer la Réservation" onClick={handleReserve} />
      </div>
    </div>
  );
}

export default Reservation;
