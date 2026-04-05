import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>CityReserve</h2>

      <div className="nav-links">
        <Link to="/" className="nav-link">Accueil</Link>
        <Link to="/services" className="nav-link">Services</Link>
        <Link to="/messages" className="nav-link">Messages</Link>
        <Link to="/history" className="nav-link">Historique</Link>
        <Link to="/profile" className="nav-link">Profil</Link>
      </div>

      <div className="nav-auth">
        <Link to="/login" className="nav-link">Connexion</Link>
      </div>
    </nav>
  );
}

export default Navbar;
