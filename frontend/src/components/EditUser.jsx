import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditUser.css'; // 👈 new CSS file

export default function EditUser() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    purpose: '',
    image: ''
  });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/users/${userId}`)
      .then(response => {
        setFormData(response.data);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prevData => ({
        ...prevData,
        [name]: reader.result
      }));
    };
    if (files[0]) {
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = { ...formData, image: formData.image || undefined };

    axios.put(`http://localhost:5000/api/users/${userId}`, updatedData)
      .then(() => {
        alert('✅ User updated successfully!');
        navigate('/registered-users');
      })
      .catch(error => {
        console.error('Error updating user:', error);
        alert('❌ Failed to update user.');
      });
  };

  return (
    <div className="edit-user-container">
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit} className="edit-user-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Role</label>
          <input type="text" name="role" value={formData.role} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Purpose</label>
          <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Profile Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
          {formData.image && (
            <img src={formData.image} alt="Preview" className="preview-img" />
          )}
        </div>

        <button type="submit" className="update-btn">Update User</button>
      </form>
    </div>
  );
}
