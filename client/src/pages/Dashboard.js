import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';
import { Book, PersonCircle, BoxArrowRight, ArrowRight } from 'react-bootstrap-icons';

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase() || 'U';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const user = res.data;
        setUserName(
          user.firstName
            ? `${user.firstName} ${user.lastName}`
            : user.email?.split('@')[0] || 'User'
        );
        setLoadingUser(false);
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      });
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    toast.success('👋 Signed out successfully!');
    setTimeout(() => navigate('/login'), 1500);
  };

  const features = [
    {
      title: 'Review',
      description: 'Review your attempted questions and solutions.',
      icon: <Book size={32} />,
      onClick: () => navigate('/Review'),
      highlight: true,
    },
    {
      title: 'Profile',
      description: 'View and manage your personal details.',
      icon: <PersonCircle size={32} />,
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <div className="modern-dashboard">
      <div className="bg-pattern" aria-hidden="true" />

      {/* Top Bar */}
      <div className="top-bar">
  <div className="welcome-text">
    {loadingUser ? 'Loading your dashboard…' : `👋 Welcome, ${userName}`}
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div className="user-chip" title={userName}>
      <div className="avatar">{getInitials(userName)}</div>
      <span className="user-name">{userName || 'User'}</span>
    </div>
    <button className="signout-btn" onClick={handleSignOut}>
      <BoxArrowRight className="me-1" /> Sign Out
    </button>
  </div>
</div>


      {/* Main Shell */}
      <div className="dashboard-shell">
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-badge">🚀 AptiTrack</div>
          <h1 className="hero-title">
            Level up your aptitude with guided practice
          </h1>
          <p className="hero-text">
            Small, consistent steps lead to big results. We’re here to help you
            practice smarter and track your progress effectively.
          </p>
          <div className="cta-row">
            <button className="primary-btn" onClick={() => navigate('/practice')}>
              Start Practicing <ArrowRight size={18} />
            </button>
            <button className="ghost-btn" onClick={() => navigate('/Tracking')}>
              View Progress
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="feature-grid">
          {features.map((item, index) => (
            <div
              className={`feature-card ${item.highlight ? 'is-highlighted' : ''}`}
              key={index}
              onClick={item.onClick}
            >
              <div className="icon-box">{item.icon}</div>
              <h5>{item.title}</h5>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">PROJECT BY PRITIKA ©2025</footer>

      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default Dashboard;
