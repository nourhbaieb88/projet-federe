import { Link } from "react-router-dom";
import {
  FaBook,
  FaCalendarCheck,
  FaCoffee,
  FaCut,
  FaFutbol,
  FaMapMarkedAlt,
  FaPlayCircle,
  FaSpa,
  FaStore,
  FaUtensils,
} from "react-icons/fa";

function Home() {
  const categories = [
    {
      id: 1,
      title: "Restaurants",
      icon: <FaUtensils />,
      description: "Tables, menus et reservations de groupe en quelques clics.",
      color: "linear-gradient(135deg, #3b82f6, #7c3aed)",
      accent: "#60a5fa",
    },
    {
      id: 2,
      title: "Cafes",
      icon: <FaCoffee />,
      description: "Espaces calmes pour rendez-vous, travail et pauses rapides.",
      color: "linear-gradient(135deg, #10b981, #059669)",
      accent: "#34d399",
    },
    {
      id: 3,
      title: "Bibliotheques",
      icon: <FaBook />,
      description: "Places de revision et salles de groupe faciles a reserver.",
      color: "linear-gradient(135deg, #38bdf8, #2563eb)",
      accent: "#38bdf8",
    },
    {
      id: 4,
      title: "Terrains de sport",
      icon: <FaFutbol />,
      description: "Creneaux sportifs, vestiaires et terrains disponibles.",
      color: "linear-gradient(135deg, #60a5fa, #0ea5e9)",
      accent: "#7dd3fc",
    },
    {
      id: 5,
      title: "Centres de coiffure",
      icon: <FaCut />,
      description: "Coupes, brushing et colorations avec horaires visibles.",
      color: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      accent: "#a78bfa",
    },
    {
      id: 6,
      title: "Centres esthetiques",
      icon: <FaSpa />,
      description: "Soins, massages et prestations beaute sur rendez-vous.",
      color: "linear-gradient(135deg, #ec4899, #db2777)",
      accent: "#f472b6",
    },
  ];

  return (
    <div className="container home-page">
      <section className="home-hero glass-panel">
        <div className="home-hero-copy">
          <span className="eyebrow">Plateforme de reservation locale</span>
          <h1>Reserve vite. Trouve clair. Tout est pret.</h1>
          <p>
            CityReserve rassemble des etablissements partout en Tunisie avec un
            parcours simple pour chercher, comparer et reserver.
          </p>
          <div className="hero-actions">
            <Link to="/services" className="btn btn-primary">
              <FaPlayCircle className="icon icon-sm" />
              Explorer les etablissements
            </Link>
            <Link to="/establishment-register" className="btn btn-outline">
              <FaStore className="icon icon-sm" />
              Ajouter mon etablissement
            </Link>
          </div>
        </div>

        <div className="platform-preview-card">
          <div className="preview-topline">
            <span>CityReserve Tunisie</span>
            <strong>National</strong>
          </div>
          <div className="preview-map">
            <FaMapMarkedAlt />
            <span>Toute la Tunisie</span>
          </div>
          <div className="preview-booking">
            <FaCalendarCheck />
            <div>
              <strong>Reservation envoyee</strong>
              <span>Client -> etablissement -> historique</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-header">
        <span className="eyebrow">Explorer</span>
        <h2 className="section-title">Choisissez une categorie</h2>
        <p className="section-subtitle">
          Chaque carte mene vers une liste enrichie avec prix, capacite, distance et
          details de reservation.
        </p>
      </div>

      <div className="grid-container category-grid">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/services?category=${encodeURIComponent(category.title)}`}
            className="category-card glass-panel"
            style={{ "--category-accent": category.accent }}
          >
            <div
              className="card-icon icon icon-lg"
              style={{
                background: category.color,
                color: "white",
              }}
            >
              {category.icon}
            </div>
            <h3 className="card-title">{category.title}</h3>
            <p className="card-desc">{category.description}</p>
            <span className="category-link">Voir les etablissements</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
