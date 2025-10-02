import React, { useState } from 'react';
import './../theme/design-system.css';

const DesignSystemDemo = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [rating, setRating] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'resources', label: 'Resource Hub', icon: '📚' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'inquiries', label: 'Inquiries', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  const handleAskAI = () => {
    setIsLoading(true);
    // Simulate AI response delay
    setTimeout(() => {
      setIsLoading(false);
      alert('AI response received!');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Side Navigation */}
      <nav className="side-nav">
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(127, 219, 255, 0.2)' }}>
          <h2 style={{ color: 'white', margin: '0 0 20px' }}>School Platform</h2>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span style={{ marginRight: '12px' }}>{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '250px', padding: '20px' }}>
        {/* Header */}
        <header className="app-header">
          <h1>Design System Demo</h1>
          <div>
            <span className="chip">Admin</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="container mt-6">
          <h2>Dashboard Overview</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-4 gap-4 mt-4">
            <div className="card">
              <h3>Resources</h3>
              <p className="caption">124 total resources</p>
              <div className="mt-4">
                <span className="chip">Mathematics</span>
                <span className="chip ml-2">Science</span>
              </div>
            </div>
            
            <div className="card">
              <h3>Messages</h3>
              <p className="caption">5 unread messages</p>
              <div className="mt-4">
                <span className="chip pulse">New</span>
              </div>
            </div>
            
            <div className="card">
              <h3>Inquiries</h3>
              <p className="caption">8 pending inquiries</p>
              <div className="mt-4">
                <span className="chip">High Priority</span>
              </div>
            </div>
            
            <div className="card">
              <h3>AI Interactions</h3>
              <p className="caption">24 this week</p>
              <div className="mt-4">
                <button className="btn btn-ask-ai" onClick={handleAskAI} disabled={isLoading}>
                  {isLoading ? 'Asking AI...' : 'Ask AI Assistant'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Resource Hub Preview */}
          <div className="mt-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Resource Hub</h2>
              <button className="btn btn-primary">Upload Resource</button>
            </div>
            
            <div className="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 gap-4 mt-4">
              {[1, 2, 3].map((item) => (
                <div className="card" key={item}>
                  <h3>Mathematics Lesson Plan</h3>
                  <p className="caption">Comprehensive lesson plan for algebra basics</p>
                  <div className="mt-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="chip">Secondary 2</span>
                        <span className="chip ml-2">Lesson Plan</span>
                      </div>
                      <div>
                        {/* Rating component */}
                        <div style={{ display: 'flex' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={star <= rating ? 'rating-filled' : 'rating-empty'}
                              style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                              onClick={() => setRating(star)}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Messaging Preview */}
          <div className="mt-6">
            <h2>Recent Messages</h2>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              {[1, 2].map((item) => (
                <div className="card" key={item}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>John Teacher</h3>
                    <span className="caption">2 hours ago</span>
                  </div>
                  <p className="mt-2">Let's schedule a meeting for tomorrow to discuss the new curriculum.</p>
                  <div className="mt-4">
                    <button className="btn btn-secondary">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesignSystemDemo;