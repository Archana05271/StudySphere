import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '5rem', color: '#dc2626', margin: '0' }}>404</h1>
      <h2>Page Not Found / Out of Bounds</h2>
      <p style={{ color: '#64748b', maxWidth: '400px', margin: '1rem auto' }}>
        The URL or page you pasted or tried to visit does not exist or is unavailable in StudySphere.
      </p>
      <Link 
        to="/" 
        style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '6px' }}
      >
        Back to Home / Login
      </Link>
    </div>
  );
};

export default NotFound;