import React, { useState } from 'react';
import Admin from './Admin.jsx';
import mccLogo from './assets/mcc logo .png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const problemOptions = [
  "Infrastructure (classroom, lab, hostel, washroom, etc.)",
  "Internet / Wi-Fi",
  "Food / Mess / Canteen",
  "Safety / Security",
  "Mental Health / Wellbeing",
  "Administration / Paperwork",
  "Faculty / Teaching",
  "Other"
];

const frequencyOptions = [
  "Daily",
  "Weekly",
  "Occasionally",
  "Rarely / One-time"
];

const affectedOptions = [
  "Students",
  "Faculty",
  "Staff",
  "Visitors",
  "Everyone"
];

const toolHelpOptions = [
  "Yes",
  "No",
  "Not sure"
];

const toolTypeOptions = [
  "Mobile App",
  "Website Portal",
  "Chatbot / Helpdesk",
  "Notification / Alert System",
  "Booking / Scheduling System",
  "QR-based System",
  "Other"
];

const userGroupOptions = [
  "Students",
  "Admin/Staff",
  "Both"
];

function App() {
  const currentPath = window.location.pathname;

  // User form states
  const [submitterName, setSubmitterName] = useState('');
  const [submitterDept, setSubmitterDept] = useState('');
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [frequency, setFrequency] = useState('');
  const [affected, setAffected] = useState('');
  const [toolHelp, setToolHelp] = useState('');
  const [selectedToolTypes, setSelectedToolTypes] = useState([]);
  const [userGroup, setUserGroup] = useState('');
  const [description, setDescription] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Hidden admin access and password modal states
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [modalError, setModalError] = useState('');

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: submitterName.trim() || "Anonymous",
      department: submitterDept || "N/A",
      problems: selectedProblems.length > 0 ? selectedProblems : ["Other"],
      frequency: frequency || "Occasionally",
      affected: affected || "Everyone",
      digitalToolHelp: toolHelp || "Not sure",
      digitalToolTypes: selectedToolTypes,
      userGroup: userGroup || "Both",
      description: description.trim() || "No detailed description provided.",
      priority: "Low",
      status: "Pending"
    };

    fetch(`${API_BASE_URL}/api/feedbacks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(newFeedback => {
        setFormSubmitted(true);
      })
      .catch(err => {
        console.error("Error submitting feedback:", err);
        alert("Failed to submit feedback. Make sure the backend server is running.");
      });
  };

  // Reset form
  const resetForm = () => {
    setSubmitterName('');
    setSubmitterDept('');
    setSelectedProblems([]);
    setFrequency('');
    setAffected('');
    setToolHelp('');
    setSelectedToolTypes([]);
    setUserGroup('');
    setDescription('');
    setFormSubmitted(false);
  };

  // Toggle handlers
  const handleToggleProblem = (prob) => {
    if (selectedProblems.includes(prob)) {
      setSelectedProblems(selectedProblems.filter(p => p !== prob));
    } else {
      setSelectedProblems([...selectedProblems, prob]);
    }
  };

  const handleToggleToolType = (tool) => {
    if (selectedToolTypes.includes(tool)) {
      setSelectedToolTypes(selectedToolTypes.filter(t => t !== tool));
    } else {
      setSelectedToolTypes([...selectedToolTypes, tool]);
    }
  };

  // Redirect handling for /admin route
  if (currentPath === '/admin') {
    const isAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuth) {
      window.location.href = '/';
      return null;
    }
    return <Admin />;
  }

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div 
          className="logo-section" 
          onClick={() => {
            setAdminClickCount(prev => prev + 1);
          }}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <div className="logo-icon" style={{ background: 'none', boxShadow: 'none', overflow: 'visible' }}>
            <img src={mccLogo} alt="MCC Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </div>
          <div className="logo-text">
            <h1>Review Hub</h1>
            <p>Feedback & Digital Solution System</p>
          </div>
        </div>

        {adminClickCount >= 5 && (
          <nav className="nav-tabs">
            <button 
              className="nav-tab active"
              onClick={() => { setShowPasswordModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              🔒 Admin Portal
            </button>
          </nav>
        )}
      </header>

      {/* Main Pages */}
      <main className="page-fade-in">
        <div className="user-page">
          {formSubmitted ? (
            <div className="confirmation-card page-fade-in">
              <div className="success-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
              <h2>Feedback Logged!</h2>
              <p>
                Thank you for speaking up. We take all feedback seriously. 
                Our developers evaluate each report to build and deploy custom digital solutions.
              </p>
              <div className="encouragement-alert">
                <strong>We can deal with these problems!</strong> Administrators have received this request and are prioritizing the deployment of a custom app/portal to resolve it.
              </div>
              <button className="submit-btn" style={{ margin: '0 auto' }} onClick={resetForm}>
                Submit Another Response
              </button>
            </div>
          ) : (
            <div className="questionnaire-view page-fade-in">
              <div className="form-hero">
                <h2>Share Your Experience</h2>
                <p>Help us improve our community and services. Report infrastructure, service, or administrative issues — and suggest digital solutions that can make a difference.</p>
              </div>

              <form onSubmit={handleSubmit} className="questionnaire-card">
                {/* Submitter Profile Details */}
                <div className="question-group profile-section" style={{
                  padding: '24px',
                  background: 'rgba(99, 102, 241, 0.03)',
                  border: '1px solid rgba(99, 102, 241, 0.08)',
                  borderRadius: '16px',
                  marginBottom: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Your Details
                  </h3>
                  <div className="profile-inputs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="submitter-name" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Full Name (Optional)</label>
                      <input 
                        type="text" 
                        id="submitter-name"
                        value={submitterName}
                        onChange={(e) => setSubmitterName(e.target.value)}
                        placeholder="Anonymous"
                        style={{
                          padding: '12px 16px',
                          background: '#fff',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: '10px',
                          color: '#1e293b',
                          outline: 'none',
                          fontSize: '0.9rem',
                          fontFamily: "'DM Sans', sans-serif",
                          transition: 'border-color 0.25s'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="submitter-dept" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Department / Branch</label>
                      <input 
                        type="text"
                        id="submitter-dept"
                        value={submitterDept}
                        onChange={(e) => setSubmitterDept(e.target.value)}
                        placeholder="e.g. CSE, ECE, Mechanical"
                        style={{
                          padding: '12px 16px',
                          background: '#fff',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: '10px',
                          color: '#1e293b',
                          outline: 'none',
                          fontSize: '0.9rem',
                          fontFamily: "'DM Sans', sans-serif",
                          transition: 'border-color 0.25s'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Q1: Problem type (Checkboxes) */}
                <div className="question-group">
                  <div className="question-title">
                    <span className="question-number">1</span>
                    <span>What type of problem is this?</span>
                  </div>
                  <div className="question-subtitle">Check one or more categories relating to the problem.</div>
                  <div className="options-grid">
                    {problemOptions.map(option => (
                      <div 
                        key={option} 
                        className={`option-card ${selectedProblems.includes(option) ? 'selected' : ''}`}
                        onClick={() => handleToggleProblem(option)}
                      >
                        <div className="checkbox-indicator">
                          <svg viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span className="option-label">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q2: Frequency (Radio-style checkboxes) */}
                <div className="question-group">
                  <div className="question-title">
                    <span className="question-number">2</span>
                    <span>How often does this problem occur?</span>
                  </div>
                  <div className="question-subtitle">Select the option that best represents its recurrence.</div>
                  <div className="options-grid">
                    {frequencyOptions.map(option => (
                      <div 
                        key={option}
                        className={`option-card ${frequency === option ? 'selected' : ''}`}
                        onClick={() => setFrequency(option)}
                      >
                        <div className="radio-indicator"></div>
                        <span className="option-label">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q3: Affected (Radio-style checkboxes) */}
                <div className="question-group">
                  <div className="question-title">
                    <span className="question-number">3</span>
                    <span>Who is most affected by it?</span>
                  </div>
                  <div className="question-subtitle">Select the primary group facing this issue.</div>
                  <div className="options-grid">
                    {affectedOptions.map(option => (
                      <div 
                        key={option}
                        className={`option-card ${affected === option ? 'selected' : ''}`}
                        onClick={() => setAffected(option)}
                      >
                        <div className="radio-indicator"></div>
                        <span className="option-label">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q4: Digital Solution Help (Radio-style checkboxes) */}
                <div className="question-group">
                  <div className="question-title">
                    <span className="question-number">4</span>
                    <span>Could a digital tool help solve it?</span>
                  </div>
                  <div className="question-subtitle">Do you think a custom software solution can address the issue?</div>
                  <div className="options-grid">
                    {toolHelpOptions.map(option => (
                      <div 
                        key={option}
                        className={`option-card ${toolHelp === option ? 'selected' : ''}`}
                        onClick={() => setToolHelp(option)}
                      >
                        <div className="radio-indicator"></div>
                        <span className="option-label">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q5: Tool types (Checkboxes) */}
                <div className="question-group">
                  <div className="question-title">
                    <span className="question-number">5</span>
                    <span>What kind of digital tool would help?</span>
                  </div>
                  <div className="question-subtitle">Check one or more digital systems that would be useful.</div>
                  <div className="options-grid">
                    {toolTypeOptions.map(option => (
                      <div 
                        key={option}
                        className={`option-card ${selectedToolTypes.includes(option) ? 'selected' : ''}`}
                        onClick={() => handleToggleToolType(option)}
                      >
                        <div className="checkbox-indicator">
                          <svg viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span className="option-label">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q6: Who would use solution (Radio-style checkboxes) */}
                <div className="question-group">
                  <div className="question-title">
                    <span className="question-number">6</span>
                    <span>Who would use this solution?</span>
                  </div>
                  <div className="question-subtitle">Select primary end-users of the proposed software.</div>
                  <div className="options-grid">
                    {userGroupOptions.map(option => (
                      <div 
                        key={option}
                        className={`option-card ${userGroup === option ? 'selected' : ''}`}
                        onClick={() => setUserGroup(option)}
                      >
                        <div className="radio-indicator"></div>
                        <span className="option-label">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q7: Description (Short Answer Box) */}
                <div className="question-group">
                  <div className="question-title">
                    <span className="question-number">7</span>
                    <span>Describe It</span>
                  </div>
                  <div className="question-subtitle">In a few lines, describe the problem and what you'd want the solution to do.</div>
                  <div className="textarea-wrapper">
                    <textarea 
                      className="feedback-textarea"
                      placeholder="Example: 'Our college is a forest, so there is no map and Google Maps can't navigate correctly. We need a mobile map app specifically for our campus trails...'"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Submit action */}
                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Log Feedback Response
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #f1f5f9',
            fontFamily: "'Outfit', sans-serif"
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#1e293b', fontWeight: 700 }}>Admin Login Required</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#64748b' }}>Enter the portal password to navigate to the Admin Dashboard.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (modalPassword === 'admin123') {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                window.location.href = '/admin';
              } else {
                setModalError('Invalid password. Please try again.');
              }
            }}>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="password" 
                  placeholder="Enter Password" 
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
                {modalError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '6px 0 0 0' }}>{modalError}</p>}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setModalPassword('');
                    setModalError('');
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                  }}
                >
                  Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
