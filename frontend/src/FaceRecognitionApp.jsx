import React, { useEffect, useRef, useState } from 'react';

export default function FaceRecognitionApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Start webcam
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/registered_users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);
  const handleCapture = async () => {
    if (!videoRef.current) return;
    setLoading(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    try {
      const res = await fetch('http://localhost:5000/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await res.json();
      setDetections(data.results || []);
    } catch (err) {
      console.error('Recognition error:', err);
    }
    setLoading(false);
  };

  // Auto-capture every 20s
  useEffect(() => {
    const interval = setInterval(() => {
      handleCapture();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#111827' : '#f9fafb',
      color: darkMode ? '#ffffff' : '#1f2937',
      padding: '1.5rem',
      fontFamily: 'Arial, sans-serif',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Face Recognition System</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: darkMode ? '#4B5563' : '#E5E7EB',
            color: darkMode ? '#FFF' : '#111827',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        width: '170vh',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Live Video Section (Left Half) */}
        <div style={{
          flex: 1,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: darkMode ? '0 0 10px rgba(255,255,255,0.05)' : '0 0 10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <video ref={videoRef} style={{ width: '100%', borderRadius: '0.5rem' }} autoPlay muted />
        </div>

        {/* Canvas Section (Right Half) */}
        <div style={{
          flex: 1,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: darkMode ? '0 0 10px rgba(255,255,255,0.05)' : '0 0 10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px'
        }}>
          <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '0.5rem', backgroundColor: darkMode ? '#374151' : '#f3f4f6' }} />
        </div>
      </div>

      {/* Capture Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={handleCapture}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.125rem',
            fontWeight: 'bold'
          }}
        >
          Capture Now
        </button>
        {loading && <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem', textAlign: 'center' }}>Analyzing...</p>}
      </div>

      {/* Predictions */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: darkMode ? '0 0 10px rgba(255,255,255,0.05)' : '0 0 10px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Recognized Faces</h2>
        {detections.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center' }}>No faces recognized yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {detections.map((face, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#eff6ff',
                  borderLeft: '4px solid #3b82f6',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}
              >
                <h3 style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{face.label}</h3>
                <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>Confidence: {face.confidence}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Box: ({face.box.join(', ')})</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
