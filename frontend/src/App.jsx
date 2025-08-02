import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import RegisteredPeople from './components/RegisteredPeople';
import FaceRecognitionApp from './FaceRecognitionApp';
import EditUser from './components/EditUser'; // Make sure EditUser is in components folder
import './App.css';

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/face-recognition"
          element={
            <ProtectedRoute>
              <FaceRecognitionApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registered-users"
          element={
            <ProtectedRoute>
              <RegisteredPeople />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-user/:userId"
          element={
            <ProtectedRoute>
              <EditUser />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
