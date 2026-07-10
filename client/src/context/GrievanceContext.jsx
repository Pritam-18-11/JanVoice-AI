import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const GrievanceContext = createContext();

const POLL_INTERVAL_MS = 30000; // 30 seconds — near-real-time without hammering a free-tier backend

export const GrievanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newCount, setNewCount] = useState(0); // complaints that arrived since the user last checked the bell

  const knownIdsRef = useRef(new Set());
  const hasLoadedOnceRef = useRef(false);

  const fetchComplaints = async (params = {}) => {
    if (!user) {
      setComplaints([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/complaints', { params });

      // Detect genuinely new complaints for the notification bell (skip on first load)
      if (hasLoadedOnceRef.current) {
        const arrivedCount = data.filter((c) => !knownIdsRef.current.has(c.id)).length;
        if (arrivedCount > 0) setNewCount((prev) => prev + arrivedCount);
      }
      knownIdsRef.current = new Set(data.map((c) => c.id));
      hasLoadedOnceRef.current = true;

      setComplaints(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const clearNewCount = () => setNewCount(0);

  useEffect(() => {
    hasLoadedOnceRef.current = false;
    knownIdsRef.current = new Set();
    setNewCount(0);
    fetchComplaints();

    if (!user) return;

    const interval = setInterval(() => fetchComplaints(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addComplaint = async (formData) => {
    const { data } = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setComplaints((prev) => [data, ...prev]);
    knownIdsRef.current.add(data.id);
    return data;
  };

  const updateComplaintStatus = async (id, newStatus, description) => {
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
      fetchComplaints();
    }
  };

  return (
    <GrievanceContext.Provider
      value={{ complaints, addComplaint, updateComplaintStatus, fetchComplaints, loading, error, newCount, clearNewCount }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};

export const useGrievances = () => useContext(GrievanceContext);