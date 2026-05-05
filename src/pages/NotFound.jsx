import { Link } from "react-router-dom";

/**
 * Page 404 - affichée quand l'URL ne correspond à aucune route définie.
 * Header/Sidebar sont fournis par <Layout />.
 */
const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oups, cette page n'existe pas.</p>
      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
};

export default NotFound;
