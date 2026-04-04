import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import MapSelector from "../components/MapSelectorLeaflet";

function EstablishmentRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    category: "",
    address: "",
    phone: "",
    description: "",
    latitude: "",
    longitude: "",
    priceRange: "",
    openingHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "09:00", close: "18:00", closed: false },
      sunday: { open: "09:00", close: "18:00", closed: true }
    },
    capacity: "",
    images: []
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  const categories = [
    "Restaurants",
    "Cafés",
    "Bibliothèques",
    "Terrains de sport",
    "Centres de coiffure",
    "Centres esthétiques",
    "Autres établissements"
  ];

  const priceRanges = [
    "€ - Budget",
    "€€ - Moyen",
    "€€€ - Élevé",
    "€€€€ - Très élevé"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [field]: value
        }
      }
    });
  };

  const handleClosedChange = (day, checked) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          closed: checked
        }
      }
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData({
      ...formData,
      images: [...formData.images, ...imageUrls]
    });
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData({
      ...formData,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleRegister = () => {
    alert(`Inscription de l'établissement "${formData.name}" effectuée avec succès !`);
    // Ici on pourrait envoyer les données à un backend
  };

  return (
    <div className="container" style={{maxWidth: "600px"}}>
      <div className="glass-panel">
        <h2 className="page-title" style={{marginBottom: "2rem"}}>Inscription Établissement</h2>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Nom de l'établissement</label>
          <Input
            type="text"
            name="name"
            placeholder="Ex: Restaurant Le Jardin"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Email</label>
          <Input
            type="email"
            name="email"
            placeholder="contact@etablissement.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Mot de passe</label>
          <Input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Catégorie</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--panel-bg)',
              color: 'var(--text-color)',
              fontSize: '1rem'
            }}
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Adresse</label>
          <Input
            type="text"
            name="address"
            placeholder="123 Rue de la Liberté, Tunis"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Localisation sur la carte</label>
          <MapSelector
            onLocationSelect={handleLocationSelect}
            initialLocation={selectedLocation}
            placeholder="Cliquez sur la carte pour définir l'emplacement de votre établissement"
          />
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Téléphone</label>
          <Input
            type="tel"
            name="phone"
            placeholder="+216 XX XXX XXX"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Gamme de prix (optionnel)</label>
          <select
            name="priceRange"
            value={formData.priceRange}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--panel-bg)',
              color: 'var(--text-color)',
              fontSize: '1rem'
            }}
          >
            <option value="">Sélectionnez une gamme</option>
            {priceRanges.map((range) => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>

        <div style={{marginBottom: "1rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Capacité (nombre de places)</label>
          <Input
            type="number"
            name="capacity"
            placeholder="50"
            value={formData.capacity}
            onChange={handleChange}
          />
        </div>

        <div style={{marginBottom: "2rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Description</label>
          <textarea
            name="description"
            placeholder="Décrivez votre établissement..."
            value={formData.description}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--panel-bg)',
              color: 'var(--text-color)',
              fontSize: '1rem',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{marginBottom: "2rem"}}>
          <label style={{display: 'block', marginBottom: '1rem', fontWeight: 'bold'}}>Horaires d'ouverture</label>
          {Object.entries(formData.openingHours).map(([day, hours]) => (
            <div key={day} style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
              <span style={{minWidth: '100px', textTransform: 'capitalize'}}>{day}</span>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <input
                  type="checkbox"
                  checked={hours.closed}
                  onChange={(e) => handleClosedChange(day, e.target.checked)}
                />
                Fermé
              </label>
              {!hours.closed && (
                <>
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    style={{width: '120px'}}
                  />
                  <span>à</span>
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    style={{width: '120px'}}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        <div style={{marginBottom: "2rem"}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Images de l'établissement</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--panel-bg)',
              color: 'var(--text-color)',
              fontSize: '1rem'
            }}
          />
          {formData.images.length > 0 && (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
              {formData.images.map((image, index) => (
                <div key={index} style={{position: 'relative'}}>
                  <img
                    src={image}
                    alt={`Établissement ${index + 1}`}
                    style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px'}}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(239, 68, 68, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '25px',
                      height: '25px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button text="S'inscrire en tant qu'établissement" onClick={handleRegister} />

        <div style={{textAlign: 'center', marginTop: '1rem'}}>
          <p style={{color: 'var(--text-muted)'}}>
            Déjà inscrit ? <Link to="/login" style={{color: 'var(--accent-color)'}}>Se connecter</Link>
          </p>
          <p style={{color: 'var(--text-muted)'}}>
            Vous êtes un client ? <Link to="/register" style={{color: 'var(--accent-color)'}}>Inscription client</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EstablishmentRegister;