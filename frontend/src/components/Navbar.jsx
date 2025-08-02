import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">Face Recognition System</h1>
      <div className="space-x-4">
        <Link
          to="/"
          className={`hover:underline ${location.pathname === '/' ? 'font-semibold underline' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/register"
          className={`hover:underline ${location.pathname === '/register' ? 'font-semibold underline' : ''}`}
        >
          Register
        </Link>
      </div>
    </nav>
  );
}  
 