import { Link } from "react-router-dom";
import { FaUtensils, FaCoffee, FaBook, FaFutbol, FaCut, FaSpa, FaStore } from "react-icons/fa";

function Home() {
  const categories = [
    {
      id: 1,
      title: "Restaurants",
      icon: <FaUtensils />,
      desc: "Réservez une table dans vos restaurants préférés.",
      color: "linear-gradient(135deg, #3b82f6, #7c3aed)",
      iconBg: "rgba(59, 130, 246, 0.1)"
    },
    {
      id: 2,
      title: "Cafés",
      icon: <FaCoffee />,
      desc: "Détendez-vous dans un café près de chez vous.",
      color: "linear-gradient(135deg, #10b981, #059669)",
      iconBg: "rgba(16, 185, 129, 0.1)"
    },
    {
      id: 3,
      title: "Bibliothèques",
      icon: <FaBook />,
      desc: "Accédez aux ressources éducatives.",
      color: "linear-gradient(135deg, #f59e0b, #d97706)",
      iconBg: "rgba(245, 158, 11, 0.1)"
    },
    {
      id: 4,
      title: "Terrains de sport",
      icon: <FaFutbol />,
      desc: "Réservez un terrain pour vos activités sportives.",
      color: "linear-gradient(135deg, #60a5fa, #93c5fd)",
      iconBg: "rgba(96, 165, 250, 0.1)"
    },
    {
      id: 5,
      title: "Centres de coiffure",
      icon: <FaCut />,
      desc: "Prenez rendez-vous dans un salon de coiffure.",
      color: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      iconBg: "rgba(139, 92, 246, 0.1)"
    },
    {
      id: 6,
      title: "Centres esthétiques",
      icon: <FaSpa />,
      desc: "Réservez vos soins de beauté et bien-être.",
      color: "linear-gradient(135deg, #ec4899, #db2777)",
      iconBg: "rgba(236, 72, 153, 0.1)"
    },
    {
      id: 7,
      title: "Autres établissements",
      icon: <FaStore />,
      desc: "Découvrez d'autres services nécessitant réservation.",
      color: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      iconBg: "rgba(37, 99, 235, 0.1)"
    }
  ];

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">Bienvenue sur CityReserve</h1>
        <p className="section-subtitle">Réservez en ligne dans vos établissements préférés en Tunisie</p>
      </div>

      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <Link to="/establishment-register">
          <button className="btn btn-primary" style={{background: 'linear-gradient(90deg, #8b5cf6, #c084fc)'}}>
            <FaStore className="icon icon-sm" />
            Vous êtes un établissement ? Inscrivez-vous ici
          </button>
        </Link>
      </div>

      <div className="grid-container">
        {categories.map((cat) => (
          <div key={cat.id} className="card glass-panel">
            <div
              className="card-icon icon icon-lg icon-primary"
              style={{
                background: cat.color,
                boxShadow: `0 8px 25px ${cat.iconBg}, 0 4px 12px ${cat.iconBg}80, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                color: 'white'
              }}
            >
              {cat.icon}
            </div>
            <h3 className="card-title">{cat.title}</h3>
            <p className="card-desc">{cat.desc}</p>
            <Link to={`/services?category=${encodeURIComponent(cat.title)}`}>
              <button className="btn btn-primary" style={{marginTop: '1rem'}}>
                Voir les établissements
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
