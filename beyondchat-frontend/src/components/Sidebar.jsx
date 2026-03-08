import { Link, useLocation } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <h2>BeyondChats</h2>

      <nav>
        <Link
          to="/integrations"
          className={location.pathname === '/integrations' ? 'active' : ''}
          onClick={onClose}
        >
          Integrations
        </Link>

        <Link
          to="/chats"
          className={location.pathname === '/chats' ? 'active' : ''}
          onClick={onClose}
        >
          Chats
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;