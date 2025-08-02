import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function RegisteredPeople() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6; // Default users per page
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/registered_users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (user_id) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${user_id}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/delete_user/${user_id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || `${user_id} deleted successfully!`);
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to delete user.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again later.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '40px 20px',
      }}
    >
      <Toaster />
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px' }}>
          Registered Users
        </h1>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)', // 3 columns
            gap: '30px',
            width: '172vh',
          }}
        >
          {loading ? (
            Array.from({ length: usersPerPage }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#2c2f3a',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              >
                <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: '#444' }}></div>
                <div style={{ height: 20, width: 100, backgroundColor: '#444', borderRadius: 4 }}></div>
                <div style={{ height: 14, width: 150, backgroundColor: '#444', borderRadius: 4 }}></div>
              </div>
            ))
          ) : currentUsers.length > 0 ? (
            currentUsers.map((user, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                style={{
                  backgroundColor: '#2c2f3a',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 400,
                  boxShadow: '0 0 8px rgba(255,255,255,0.05)',
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginBottom: 12,
                    backgroundColor: '#444',
                  }}
                >
                  <img
                    src={
                      user.image
                        ? `data:image/jpeg;base64,${user.image}`
                        : '/default-user.png'
                    }
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 8 }}>
                  {user.name}
                </h2>
                <div style={{ fontSize: '0.9rem', color: '#ccc', textAlign: 'center', lineHeight: 1.5 }}>
                  <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                  <p><strong>ID:</strong> {user.user_id || 'N/A'}</p>
                  <p><strong>Role:</strong> {user.role || 'N/A'}</p>
                  <p><strong>Purpose:</strong> {user.purpose || 'N/A'}</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 16 }}>
                  <button
            onClick={() => navigate(`/edit-user/${user.user_id}`)}
                style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user.user_id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ color: '#888', textAlign: 'center', gridColumn: '1 / -1' }}>
              No registered users found.
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '40px',
              alignItems: 'center',
              fontSize: '0.9rem',
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                backgroundColor: currentPage === 1 ? '#555' : '#6b46c1',
                color: '#fff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            <span style={{ backgroundColor: '#333', padding: '10px 20px', borderRadius: 8 }}>
              Page {currentPage} of {Math.ceil(users.length / usersPerPage)}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  indexOfLastUser < users.length ? prev + 1 : prev
                )
              }
              disabled={indexOfLastUser >= users.length}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                backgroundColor: indexOfLastUser >= users.length ? '#555' : '#6b46c1',
                color: '#fff',
                cursor: indexOfLastUser >= users.length ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Back Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: '#fff',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Back to Registration
          </button>
        </div>
      </div>
    </motion.div>
  );
}