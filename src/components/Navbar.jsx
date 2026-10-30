
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.svg';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { unread, connected } = useSocket();
  const navigate = useNavigate();

  const home =
    role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="site-nav">
      <Link to="/" className="brand">
        <img src={logo} alt="StudySphere logo" />
        <div>
          Study<span>Sphere</span>
        </div>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        {!isAuthenticated ? (
          <NavLink
            to="/auth/register"
            className="btn btn-primary"
          >
            Register
          </NavLink>
        ) : (
          <>
            <span
              className="nav-user"
              title={connected ? 'Real-time connection active' : 'Offline'}
            >
              <span className={`dot${connected ? ' on' : ''}`} />
              {user.name} · <strong>{role}</strong>
            </span>

            <NavLink to={home} className="btn btn-secondary">
              Dashboard
            </NavLink>

            {role === 'student' && (
              <Link
                to="/student/notifications"
                className="nav-bell"
                aria-label={`${unread} unread notifications`}
              >
                🔔
                {unread > 0 && (
                  <span className="count">{unread}</span>
                )}
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="btn btn-dark"
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
