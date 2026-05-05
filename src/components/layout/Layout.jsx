import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

/**
 * Layout - squelette commun à toutes les pages.
 *
 * Header et Sidebar sont fixes (position: fixed dans le SCSS).
 * <main className="content"> applique le padding-left/top qui décale
 * le contenu pour qu'il ne passe pas sous la Header ni la Sidebar.
 *
 * <Outlet /> est le "trou" dans lequel React Router injecte la page
 * enfant correspondant à l'URL courante.
 */
const Layout = () => {
  return (
    <>
      <Header />
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
