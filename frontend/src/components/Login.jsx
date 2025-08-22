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
        <p className="login-subtitle">Sign in to continue to your dashboard</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
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
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
        <p className="register-link">
          New here? <Link to="/register" className="link">Create an account</Link>
        </p>
      </div>

      <style>{`
        .login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #9333ea);
          padding: 20px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          padding: 50px 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 420px;
          text-align: center;
          color: white;
          animation: fadeIn 0.7s ease;
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .login-title {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: #e0e7ff;
          margin-bottom: 30px;
          font-size: 1rem;
        }

        .input-field {
          width: 100%;
          padding: 14px;
          margin: 12px 0;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255, 255, 255, 0.15);
          color: white;
          font-size: 1rem;
          transition: 0.3s ease;
        }

        .input-field::placeholder {
          color: rgba(255,255,255,0.7);
        }

        .input-field:focus {
          border-color: #a78bfa;
          background: rgba(255, 255, 255, 0.25);
          outline: none;
          transform: scale(1.02);
        }

        .btn-login {
          width: 100%;
          padding: 14px;
          margin-top: 20px;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-login:hover {
          transform: translateY(-2px);
          background: linear-gradient(to right, #4f46e5, #7c3aed);
          box-shadow: 0 6px 15px rgba(0,0,0,0.3);
        }

        .btn-login:disabled {
          background: #aaa;
          cursor: not-allowed;
        }

        .register-link {
          margin-top: 25px;
          font-size: 0.95rem;
          color: #e0e7ff;
        }

        .link {
          color: #c4b5fd;
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
