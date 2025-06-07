import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Register';
import RegisteredPeople from './RegisteredPeople';
import FaceRecognitionApp from './FaceRecognitionApp';

export default function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<FaceRecognitionApp />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registered" element={<RegisteredPeople />} />
      </Routes>
    </Router>
  );
}


