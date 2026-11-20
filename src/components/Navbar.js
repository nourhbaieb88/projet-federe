import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar" style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <h2 style={{margin: 0}}>
        <Link to="/" style={{color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold'}}>
          City<span style={{color: 'var(--accent-color)'}}>Reserve</span>
        </Link>
      </h2>

      <div className="nav-links" style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
        <Link to="/" className="nav-link" style={{color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500'}}>Accueil</Link>
        <Link to="/services" className="nav-link" style={{color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500'}}>Établissements</Link>

        {isAuthenticated && (
          <>
            <Link to="/messages" className="nav-link" style={{color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500'}}>Messages</Link>
            
            {user?.user_type === 'client' && (
              <Link to="/history" className="nav-link" style={{color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500'}}>Historique</Link>
            )}
            
            {user?.user_type === 'establishment' && (
              <Link to="/establishment-dashboard" className="nav-link" style={{color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 'bold'}}>Tableau de bord</Link>
            )}
            
            <Link to="/profile" className="nav-link" style={{color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500'}}>Profil</Link>
          </>
        )}
      </div>

      <div className="nav-auth" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        {isAuthenticated ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '20px'}}>
              <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                {user?.first_name || user?.username || 'Utilisateur'}
              </span>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{padding: '0.4rem 1rem', fontSize: '0.9rem'}}
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-link" style={{color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500'}}>Connexion</Link>
            <Link to="/register" className="btn btn-primary" style={{padding: '0.4rem 1rem', fontSize: '0.9rem', textDecoration: 'none'}}>S'inscrire</Link>
            <Link to="/establishment-register" className="btn btn-secondary" style={{padding: '0.4rem 1rem', fontSize: '0.9rem', textDecoration: 'none'}}>Devenir Partenaire</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
