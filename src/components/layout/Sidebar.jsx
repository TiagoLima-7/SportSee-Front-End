/**
 * Sidebar - Navigation verticale
 * Pour le sprint actuel, les liens sont des placeholders (les pages sont à venir)
 */
import Yoga from '../../assets/yoga.png';
import Bike from '../../assets/bike.png';
import Swim from '../../assets/swim.png';
import Gym from '../../assets/gym.png';

const ICONS = [
    {id: 'yoga', label: 'Yoga', src: Yoga},
    {id: 'swim', label: 'Natation', src: Swim},
    {id: 'bike', label: 'Cyclisme', src: Bike},
    {id: 'gym', label: 'Musculation', src: Gym}
]

const Sidebar = () => {
    const Year = new Date().getFullYear();
  return (
    <aside className='sidebar' aria-label='Navigation des activités'>
        <ul className='sidebar-list'>
            { ICONS.map((icon) => (
                <li key={icon.id} className='sidebar-link'>
                    <button type='button' className='sidebar-btn' aria-label={icon.label}>
                        <img src={icon.src} alt={icon.label} className="sidebar-icon" />
                    </button>
                </li>
            ))}
        </ul>
        <p className='sidebar_copy'>Copyright, SportSee {Year}</p>
    </aside>
  )
}

export default Sidebar