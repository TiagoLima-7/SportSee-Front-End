import { NavLink } from "react-router-dom";

import logo from "../../assets/logo.png";
import { useApiSource } from "../../services/mockApi";
import useAvailableUsers from "../../hooks/useAvailableUsers";

/**
 * Header - barre de navigation principale.
 *
 * Le lien "Accueil" est un interrupteur Mock / API : un clic bascule entre
 * les deux back-ends, sans naviguer. Le badge à côté ("MOCK" ou "API")
 * affiche en permanence la source courante.
 *
 * Le lien "Communauté" déclenche au survol un dropdown qui affiche la source
 * courante et la liste des utilisateurs disponibles (id + prénom). Cliquer
 * sur un prénom navigue vers la page de ce user.
 *
 * La navigation vers la racine reste possible via le logo SportSee à gauche.
 */

const STATIC_NAV_ITEMS = [
  { to: "/profile", label: "Profil" },
  { to: "/settings", label: "Réglage" },
];

const Header = () => {
  const { source, toggle } = useApiSource();
  const users = useAvailableUsers();
  const isReal = source === "real";

  return (
    <header className="header" role="banner">
      <NavLink to="/" className="header_logo" aria-label="SportSee accueil">
        <img src={logo} alt="" />
      </NavLink>
      <nav className="header-nav" aria-label="Navigation principale">
        <ul className="header-list">
          <li>
            <button
              type="button"
              className="header-link header-link-toggle"
              onClick={toggle}
              aria-pressed={isReal}
              title={`Source actuelle : ${
                isReal ? "API réelle (localhost:3000)" : "données mockées"
              }. Cliquez pour basculer.`}
            >
              Accueil
              <span
                className={`header-source-badge header-source-badge--${source}`}
              >
                {isReal ? "API" : "MOCK"}
              </span>
            </button>
          </li>
          {STATIC_NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className="header-link">
                {item.label}
              </NavLink>
            </li>
          ))}
          <li className="header-item-with-dropdown">
            <NavLink to="/community" className="header-link">
              Communauté
            </NavLink>
            <div
              className="header-dropdown"
              role="menu"
              aria-label="Choix de l'utilisateur"
            >
              <div className="header-dropdown-source">
                Source :
                <span className="header-dropdown-source-value">
                  {isReal ? "API" : "Mock"}
                </span>
              </div>
              {users.length === 0 ? (
                <div className="header-dropdown-empty">
                  Aucun utilisateur disponible
                </div>
              ) : (
                <ul className="header-dropdown-users">
                  {users.map((u) => (
                    <li key={u.id}>
                      <NavLink
                        to={`/user/${u.id}`}
                        className="header-dropdown-user-link"
                      >
                        {u.firstName}
                        <span className="header-dropdown-user-id">#{u.id}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
