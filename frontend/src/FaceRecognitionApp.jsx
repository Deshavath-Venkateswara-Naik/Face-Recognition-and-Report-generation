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

  // Fetch registered users on mount
  useEffect(() => {
    fetch('http://localhost:5000/registered_users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  // Capture image and send to backend
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
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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

      <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem' }}>
        {/* Video + Detection Section */}
        <div style={{
          flex: 1,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: darkMode ? '0 0 10px rgba(255,255,255,0.05)' : '0 0 10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}>
          <video ref={videoRef} style={{ width: '100%', borderRadius: '0.5rem' }} autoPlay muted />
          <canvas ref={canvasRef} className="hidden" />

          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={handleCapture}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Capture Now
            </button>
            {loading && <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>Analyzing...</p>}
          </div>

          <h2 style={{ marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Recognized Faces</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            {detections.length === 0 ? (
              <p style={{ color: '#9ca3af' }}>No faces recognized yet.</p>
            ) : (
              detections.map((face, idx) => (
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
              ))
            )}
          </div>
        </div>

        {/* Registered Users Section
        <div style={{
          width: '350px',
          maxHeight: '600px',
          overflowY: 'auto',
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: darkMode ? '0 0 10px rgba(255,255,255,0.05)' : '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Registered People</h2>
          {users.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No registered users found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {users.map((user, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '1rem',
                    flexShrink: 0,
                    backgroundColor: '#ccc'
                  }}>
                    {user.image ? (
                      <img
                        src={`data:image/jpeg;base64,${user.image}`}
                        alt={user.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src="/default-user.png"
                        alt="Default"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 500 }}>{user.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div> */}
      </div>
    </div>
  );
}
