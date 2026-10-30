
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Global styles
import './index.css';

// Shared component styles
import './css/components.css';
import './css/style.css';

// Page-specific styles
import './css/auth.css';
import './css/admin.css';
import './css/student.css';
import './css/courses.css';
import './css/learning.css';

// Responsive styles (keep last)
import './css/responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
