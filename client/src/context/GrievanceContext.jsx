import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const GrievanceContext = createContext();

export const GrievanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComplaints = async (params = {}) => {
    if (!user) {
      setComplaints([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/complaints', { params });
      setComplaints(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  // Refetch whenever the logged-in user changes (login/logout)
  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Accepts a FormData object (so image file upload works)
  const addComplaint = async (formData) => {
    const { data } = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setComplaints((prev) => [data, ...prev]);
    return data;
  };

  const updateComplaintStatus = async (id, newStatus, description) => {
    // Optimistic UI update
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              timeline: c.timeline.map((t) =>
                t.status === newStatus ? { ...t, time: new Date().toISOString(), description: description || t.description, active: true } : t
              ),
            }
          : c
      )
    );

    try {
      const { data } = await api.patch(`/complaints/${id}/status`, { status: newStatus, description });
      setComplaints((prev) => prev.map((c) => (c.id === id ? data : c)));
    } catch (err) {
      console.error('Failed to update status on server:', err.response?.data?.message || err.message);
      // Re-fetch to correct any optimistic drift
      fetchComplaints();
    }
  };

  return (
    <GrievanceContext.Provider value={{ complaints, addComplaint, updateComplaintStatus, fetchComplaints, loading, error }}>
      {children}
    </GrievanceContext.Provider>
  );
};

export const useGrievances = () => useContext(GrievanceContext);