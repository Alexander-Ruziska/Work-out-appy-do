import { useNavigate } from 'react-router-dom';
import useStore from '../zustand/store';
import { BiLogOut, BiUser } from 'react-icons/bi';
import './Nav.css';

function Nav() {
  const user = useStore((state) => state.user);
  const logOut = useStore((state) => state.logOut);
  const navigate = useNavigate();

  const handleLogOut = async () => {
    await logOut();
    navigate('/login');
  };

  if (!user.id) return null;

  return (
    <nav className="nav-bar">
      <div className="nav-content">
        <div className="nav-user">
          <BiUser size={20} />
          <span>{user.user_metadata?.username || 'User'}</span>
        </div>
        <button onClick={handleLogOut} className="logout-button">
          <BiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Nav;
