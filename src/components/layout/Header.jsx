import { NavLink } from "react-router-dom"
import logo from '../../assets/logo.png'

const NAV_ITEMS = [
  {to: '/', label: 'Accueil'},
  {to: '/profile', label: 'Profil'},
  {to: '/settings', label: 'Réglage'},
  {to: '/community', label: 'Communauté'}
]
const Header = () => {
  return (
    <header className="header" role='banner'>
      <NavLink to='/' className='header_logo' aria-label='SportSee accueil'>
        <img src={logo} alt="" />
      </NavLink>
      <nav className='header-nav' aria-label='Navigation principale'>
        <ul className='header-list'>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className='header-link'>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header