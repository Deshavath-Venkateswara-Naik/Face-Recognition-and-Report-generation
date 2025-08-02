import React, { useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [purpose, setPurpose] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        toast.error('Could not access camera.');
        console.error(err);
      }
    };

    startCamera();
  }, []);

  const handlePreview = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');
    setPreviewImage(imageData);
    toast.success('Preview captured!');
  };

  const handleRegister = async () => {
    if (!name || !email || !userId || !role || !purpose) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (!previewImage) {
      toast.error('Please preview the image first.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          user_id: userId,
          role,
          purpose,
          image: previewImage
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Face registered successfully!');
        setName('');
        setEmail('');
        setUserId('');
        setRole('');
        setPurpose('');
        setPreviewImage(null);
      } else {
        toast.error(data.error || 'Registration failed.');
      }
    } catch (err) {
      toast.error('Error registering face.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`register-container ${darkMode ? 'dark' : 'light'}`}
    >
      <Toaster />
      <div className="theme-toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="slider round"></span>
        </label>
        <span className="mode-label">{darkMode ? 'Dark' : 'Light'} Mode</span>
      </div>

      <motion.h1
        className="register-title"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Register New Face
      </motion.h1>

      <motion.div
        className="register-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <AnimatePresence>
          {!previewImage ? (
            <motion.video
              key="video"
              ref={videoRef}
              className="preview"
              autoPlay
              muted
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.img
              key="image"
              src={previewImage}
              alt="Preview"
              className="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <canvas ref={canvasRef} className="hidden-canvas" />
        <input
          type="text"
          placeholder="Enter ID Number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field"
        >
          <option value="">Select Role</option>
          <option value="Student">Student</option>
          {/* <option value="Staff">Staff</option> */}
          <option value="Visitor">Visitor</option>
        </select>
        <input
          type="text"
          placeholder="Purpose of Visit"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="input-field"
        />

        <div className="button-group">
          {!previewImage && (
            <button onClick={handlePreview} className="btn btn-warning">
              Preview
            </button>
          )}
          {previewImage && (
            <button onClick={() => setPreviewImage(null)} className="btn btn-secondary">
              Retake Photo
            </button>
          )}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>

        <button
          onClick={() => navigate('/registered-users')}
          className="btn btn-view"
        >
          View Registered Faces
        </button>
      </motion.div>
       {/* Re-attached full CSS below */}
       <style>{`
        body {
          margin: 0;
        }

        .register-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          transition: background-color 0.3s ease;
        }

        .register-container.light {
          background-color: #f4f4f9;
          color: #222;
        }

        .register-container.dark {
          background-color: #121212;
          color: #f1f1f1;
        }

        .theme-toggle {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mode-label {
          font-weight: bold;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #66bb6a;
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        .register-title {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .register-card {
          background: inherit;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          max-width: 450px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .preview {
          width: 100%;
          max-height: 300px;
          border-radius: 0.5rem;
          border: 1px solid #ccc;
          object-fit: contain;
          margin-bottom: 1rem;
        }

        .hidden-canvas {
          display: none;
        }

        .input-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          margin-top: 1rem;
          font-size: 1rem;
          background: inherit;
          color: inherit;
        }

        .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1rem;
          width: 100%;
        }

        .btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: bold;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .btn-warning {
          background-color: #f9a825;
        }

        .btn-warning:hover {
          background-color: #f57f17;
        }

        .btn-secondary {
          background-color: #1976d2;
        }

        .btn-secondary:hover {
          background-color: #1565c0;
        }

        .btn-success {
          background-color: #43a047;
        }

        .btn-success:hover {
          background-color: #2e7d32;
        }

        .btn:disabled {
          background-color: #9e9e9e;
          cursor: not-allowed;
        }

        .btn-view {
          margin-top: 1.5rem;
          background-color: #7b1fa2;
        }

        .btn-view:hover {
          background-color: #6a1b9a;
        }
      `}</style>
    </motion.div>
  );
}  
 