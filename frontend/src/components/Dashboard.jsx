import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('authenticated');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2 className="logo">Admin Dashboard</h2>
        <div className="nav-links">
          <Link to="/register" className="nav-link">Register</Link>
          <Link to="/registered-users" className="nav-link">Registered People</Link>
          <Link to="/face-recognition" className="nav-link">Face Recognition</Link>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="welcome-section">
        <h1>Welcome to the Admin Panel</h1>
        <p>Manage your users easily and securely.</p>
      </div>
    </div>
  );
} 
