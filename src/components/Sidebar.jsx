
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ links = [] }) => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? 'menu-item active' : 'menu-item'
            }
          >
            <span className="menu-icon">{link.icon}</span>
            <span className="menu-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
