import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>タイマー</NavLink>
      <NavLink to="/logs" className={({ isActive }) => isActive ? 'active' : ''}>履歴</NavLink>
      <NavLink to="/statistics" className={({ isActive }) => isActive ? 'active' : ''}>分析</NavLink>
    </nav>
  );
};

export default BottomNav;
