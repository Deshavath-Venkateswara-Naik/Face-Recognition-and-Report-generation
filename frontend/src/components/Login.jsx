import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (email === 'admin@gmail.com' && password === 'admin123') {
        toast.success('Login successful!');
        localStorage.setItem('authenticated', true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast.error('Invalid credentials.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-wrapper">
      <Toaster />
      <div className="login-card">
        <h1 className="login-title">Welcome Back 👋</h1>
        <p className="login-subtitle">Please enter your login details</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="register-link">
          Don't have an account? <Link to="/register" className="link">Register here</Link>
        </p>
      </div>

      <style>{`
        .login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 175vh;
          background: linear-gradient(135deg, #1e3a8a, #9333ea);
        }

        .login-card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 400px;
          text-align: center;
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .login-title {
          font-size: 2rem;
          color: #4f46e5;
          margin-bottom: 10px;
        }

        .login-subtitle {
          color: #555;
          margin-bottom: 25px;
        }

        .input-field {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border-radius: 10px;
          border: 1px solid #ccc;
          background:rgb(73, 176, 168);
          font-size: 1rem;
          transition: 0.3s;
        }

        .input-field:focus {
          border-color: #6366f1;
          background-color:rgb(17, 22, 23);
          outline: none;
        }

        .btn-login {
          width: 100%;
          padding: 12px;
          margin-top: 20px;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }

        .btn-login:hover {
          background: linear-gradient(to right, #4f46e5, #7c3aed);
        }

        .btn-login:disabled {
          background-color: #ddd;
          cursor: not-allowed;
        }

        .register-link {
          margin-top: 20px;
          font-size: 0.9rem;
          color: #333;
        }

        .link {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
