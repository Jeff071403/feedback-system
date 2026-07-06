import React, { useState, useEffect } from 'react';






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

// Helper to check if a date is today
const isToday = (dateString) => {
  const d = new Date(dateString);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

function App() {
  const view = window.location.pathname === '/admin' ? 'admin' : 'user';
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load feedbacks from database on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/feedbacks/')
      .then(res => {
        if (!res.ok) throw new Error("Could not fetch feedbacks");
        return res.json();
      })
      .then(data => {
        setFeedbacks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading feedbacks:", err);
        setLoading(false);
      });
  }, []);

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

  // Admin access control & routing states
  const currentPath = window.location.pathname;
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin filter & selection states
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTimeoutId, setDeleteTimeoutId] = useState(null);

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

    fetch('http://localhost:8000/api/feedbacks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(newFeedback => {
        setFeedbacks([newFeedback, ...feedbacks]);
        setFormSubmitted(true);
      })
      .catch(err => {
        console.error("Error submitting feedback:", err);
        alert("Failed to submit feedback. Make sure the backend server is running.");
      });
  };

  // Reset form inputs for next submission
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

  // Toggle selection lists
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

  const downloadResponsePDF = (item) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert("Please allow popups to print/download the response report.");
      return;
    }

    const formattedProblems = Array.isArray(item.problems) ? item.problems.join(', ') : item.problems;
    const formattedToolTypes = Array.isArray(item.digitalToolTypes) ? item.digitalToolTypes.join(', ') : item.digitalToolTypes;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Campus Feedback Response - ${item.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Outfit', 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 24px;
            font-size: 13px;
            line-height: 1.4;
            background-color: #fff;
          }
          .header {
            border-bottom: 2px solid #6366f1;
            padding-bottom: 10px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header-left h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .header-left p {
            margin: 4px 0 0 0;
            font-size: 11px;
            color: #64748b;
          }
          .ticket-badge {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #334155;
            padding: 4px 8px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            font-weight: 600;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            background: #f8fafc;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
          }
          .meta-item {
            font-size: 12px;
            color: #475569;
          }
          .meta-item strong {
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          th, td {
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 12px;
          }
          th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .q-num {
            background: #6366f1;
            color: #fff;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 700;
            margin-right: 6px;
          }
          .answer-cell {
            color: #334155;
            font-weight: 500;
          }
          .desc-section {
            background: #fafafa;
            border-left: 3px solid #6366f1;
            padding: 10px 14px;
            border-radius: 0 6px 6px 0;
            margin-bottom: 16px;
          }
          .desc-title {
            font-size: 12px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .desc-content {
            font-size: 12px;
            color: #334155;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 10px;
            }
            .meta-grid, th {
              background: #f8fafc !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .q-num {
              background: #6366f1 !important;
              color: #fff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .desc-section {
              background: #fafafa !important;
              border-left-color: #6366f1 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>Campus Feedback Report</h1>
            <p>Individual Submitter Q&A Summary</p>
          </div>
          <div class="header-right">
            <div class="ticket-badge">${item.id}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><strong>Submitter Name:</strong> ${item.name || 'Anonymous'}</div>
          <div class="meta-item"><strong>Department/Branch:</strong> ${item.department || 'N/A'}</div>
          <div class="meta-item"><strong>Submission Date:</strong> ${new Date(item.timestamp).toLocaleString()}</div>
          <div class="meta-item"><strong>Document Type:</strong> One-Page Report</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Question</th>
              <th style="width: 50%;">Answer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="q-num">1</span> What type of problem is this?</td>
              <td class="answer-cell">${formattedProblems || 'None selected'}</td>
            </tr>
            <tr>
              <td><span class="q-num">2</span> How often does this problem occur?</td>
              <td class="answer-cell">${item.frequency}</td>
            </tr>
            <tr>
              <td><span class="q-num">3</span> Who is most affected by it?</td>
              <td class="answer-cell">${item.affected}</td>
            </tr>
            <tr>
              <td><span class="q-num">4</span> Could a digital tool help solve it?</td>
              <td class="answer-cell">${item.digitalToolHelp}</td>
            </tr>
            <tr>
              <td><span class="q-num">5</span> What kind of digital tool would help?</td>
              <td class="answer-cell">${formattedToolTypes || 'None selected'}</td>
            </tr>
            <tr>
              <td><span class="q-num">6</span> Who would use this solution?</td>
              <td class="answer-cell">${item.userGroup}</td>
            </tr>
          </tbody>
        </table>

        <div class="desc-section">
          <div class="desc-title">Question 7: Description of the Problem</div>
          <div class="desc-content">${item.description}</div>
        </div>

        <div class="footer">
          Generated automatically by Smart Campus Feedback System on ${new Date().toLocaleDateString()}
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const deleteFeedback = (id) => {
    if (deletingId === id) {
      if (deleteTimeoutId) {
        clearTimeout(deleteTimeoutId);
        setDeleteTimeoutId(null);
      }
      setDeletingId(null);

      const dbId = typeof id === 'string' && id.startsWith('fb-') ? id.replace('fb-', '') : id;
      fetch(`http://localhost:8000/api/feedbacks/${dbId}/`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error("Server error");
          setFeedbacks(feedbacks.filter(item => item.id !== id));
        })
        .catch(err => console.error("Error deleting feedback:", err));
    } else {
      // Clear existing timeout if clicking a different item before timeout
      if (deleteTimeoutId) {
        clearTimeout(deleteTimeoutId);
      }
      setDeletingId(id);
      const tId = setTimeout(() => {
        setDeletingId(null);
      }, 3000);
      setDeleteTimeoutId(tId);
    }
  };

  const resetDatabase = () => {
    if (window.confirm("Reset dashboard data back to initial mock responses?")) {
      fetch('http://localhost:8000/api/feedbacks/reset/', {
        method: 'POST',
      })
        .then(res => {
          if (!res.ok) throw new Error("Server error");
          return res.json();
        })
        .then(data => {
          setFeedbacks(data);
          alert("Database reset successfully.");
        })
        .catch(err => console.error("Error resetting database:", err));
    }
  };

  // Calculate Metrics
  const totalResponses = feedbacks.length;
  const todayResponses = feedbacks.filter(item => isToday(item.timestamp)).length;

  // Calculate Unique Departments count
  const uniqueDeptsList = feedbacks.map(item => item.department).filter(dept => dept && dept !== 'N/A');
  const uniqueDepartmentsCount = new Set(uniqueDeptsList).size;

  // Calculate separate count for problems (e.g. Canteen, Infra, etc.)
  const categoryCounts = problemOptions.reduce((acc, cat) => {
    acc[cat] = feedbacks.filter(item => item.problems.includes(cat)).length;
    return acc;
  }, {});

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Filter feedbacks for the feed
  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.problems.includes(categoryFilter);
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.problems.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.06), transparent), #f4f6fb',
        color: '#1e293b',
        fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif"
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2); }
            50% { transform: scale(1.05); box-shadow: 0 12px 32px rgba(99, 102, 241, 0.25); }
          }
        `}</style>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.3px', marginBottom: '6px' }}>Campus Feedback Portal</h2>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>Connecting to university database...</p>
      </div>
    );
  }

  // Password-protected gate for /admin path
  if (currentPath === '/admin' && !isAdminAuthenticated) {
    const handleAdminLogin = (e) => {
      e.preventDefault();
      if (adminPassword === 'admin123') {
        setIsAdminAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError('Invalid password. Please try again.');
      }
    };

    return (
      <div className="login-page-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.06), transparent), #f4f6fb',
        fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
        padding: '20px'
      }}>
        <form onSubmit={handleAdminLogin} style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: '24px',
          padding: '44px 40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.08), 0 0 40px rgba(99, 102, 241, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #6366f1, #a78bfa, #14b8a6)' }}></div>
          <div className="login-icon" style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '18px', background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2))' }}></div>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h2 style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.3px' }}>Admin Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '28px', lineHeight: 1.5 }}>Authorized personnel only. Enter credentials to access the analytics dashboard.</p>
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '22px' }}>
            <label htmlFor="admin-pass" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input 
              type="password" 
              id="admin-pass"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '13px 16px',
                background: '#fff',
                border: loginError ? '1px solid #ef4444' : '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
                color: '#1e293b',
                outline: 'none',
                fontSize: '1rem',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color 0.25s, box-shadow 0.25s'
              }}
              onFocus={(e) => { if (!loginError) { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.08)'; }}}
              onBlur={(e) => { e.target.style.borderColor = loginError ? '#ef4444' : 'rgba(0, 0, 0, 0.08)'; e.target.style.boxShadow = 'none'; }}
              autoFocus
            />
            {loginError && (
              <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {loginError}
              </span>
            )}
          </div>
          
          <button type="submit" style={{
            width: '100%',
            padding: '13px',
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.25)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.2)'; }}
          >
            Access Dashboard
          </button>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '20px' }}>Protected by institutional security</p>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="logo-text">
            <h1>Campus Feedback Portal</h1>
            <p>Institutional Feedback & Digital Solution System</p>
          </div>
        </div>

        {currentPath === '/admin' && isAdminAuthenticated && (
          <nav className="nav-tabs">
            <button 
              className="nav-tab"
              onClick={() => { window.location.href = '/'; }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Go to Submit Form
            </button>
            <button 
              className="nav-tab active"
              onClick={() => setIsAdminAuthenticated(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🔒 Log Out
            </button>
          </nav>
        )}
      </header>

      {/* Main Pages */}
      <main className="page-fade-in">
        {view === 'user' ? (
          <div className="user-page">
            {formSubmitted ? (
              /* Encouraging confirmation screen */
              <div className="confirmation-card page-fade-in">
                <div className="success-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <h2>Feedback Logged!</h2>
                <p>
                  Thank you for speaking up. We take campus issues seriously. 
                  Our developers evaluate each report to build and deploy custom digital tools.
                </p>
                <div className="encouragement-alert">
                  <strong>We can deal with these problems!</strong> Administrators have received this request and are prioritizing the deployment of a custom app/portal to resolve it.
                </div>
                <button className="submit-btn" style={{ margin: '0 auto' }} onClick={resetForm}>
                  Submit Another Response
                </button>
              </div>
            ) : (
              /* User Questionnaire Page */
              <div className="questionnaire-view page-fade-in">
                <div className="form-hero">
                  <h2>Share Your Campus Experience</h2>
                  <p>Help us improve your college experience. Report infrastructure, academic, or administrative issues — and suggest digital solutions that can make a difference.</p>
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
                          placeholder="e.g. Computer Science & Engineering"
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
                          required
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

                  {/* Q3: Who is affected (Radio-style checkboxes) */}
                  <div className="question-group">
                    <div className="question-title">
                      <span className="question-number">3</span>
                      <span>Who is most affected by it?</span>
                    </div>
                    <div className="question-subtitle">Who feels the direct impact of this issue?</div>
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

                  {/* Q4: Can digital tools help (Radio-style checkboxes) */}
                  <div className="question-group">
                    <div className="question-title">
                      <span className="question-number">4</span>
                      <span>Could a digital tool help solve this?</span>
                    </div>
                    <div className="question-subtitle">Could automation, websites, apps, or smart notifications solve/ease this?</div>
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

                  {/* Q5: Kind of digital tool (Checkboxes) */}
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
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      Submit Response
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* ====================================================================
             ADMIN DASHBOARD PAGE
             ==================================================================== */
          <div className="admin-page page-fade-in">
            {/* Admin Section Hero */}
            <div className="admin-section-hero">
              <div>
                <h2>Admin Analytics Dashboard</h2>
                <p>Review institutional feedback, prioritize campus issues, and deploy digital solutions.</p>
              </div>
            </div>
            {/* Top Metrics Row */}
            <div className="metrics-row">
              <div className="metric-card">
                <div>
                  <div className="metric-label">Total Responses</div>
                  <div className="metric-value">{totalResponses}</div>
                  <div className="metric-change">All logs accumulated</div>
                </div>
                <div className="metric-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
              </div>

              <div className="metric-card today">
                <div>
                  <div className="metric-label">Today's Responses</div>
                  <div className="metric-value">{todayResponses}</div>
                  <div className="metric-change {todayResponses > 0 ? '' : 'neutral'}">
                    {todayResponses > 0 ? `+${todayResponses} submission(s) today` : 'No submissions today'}
                  </div>
                </div>
                <div className="metric-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>

              <div className="metric-card solved">
                <div>
                  <div className="metric-label">Unique Departments</div>
                  <div className="metric-value">{uniqueDepartmentsCount}</div>
                  <div className="metric-change">
                    From all feedback records
                  </div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="dashboard-grid">
              {/* Left Bar: Categories Breakdown */}
              <div className="category-card">
                <div className="section-header">
                  <h3>Problem Categories</h3>
                  <button className="reset-filters-btn" onClick={resetDatabase}>
                    Reset Mocks
                  </button>
                </div>
                <div className="category-list">
                  {problemOptions.map(cat => {
                    const count = categoryCounts[cat] || 0;

                    // Short label for cleaner view
                    let displayLabel = cat.split(" (")[0]; // infra split

                    return (
                      <div key={cat} className="category-bar-item">
                        <div className="category-bar-label">
                          <span className="category-name" title={cat}>{displayLabel}</span>
                          <span className="category-count">{count}</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${(count / maxCategoryCount) * 100}%`,
                              background: cat.includes("Food") ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 
                                          cat.includes("Infra") ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 
                                          cat.includes("Internet") ? 'linear-gradient(90deg, #06b6d4, #3b82f6)' : 
                                          cat.includes("Safety") ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 
                                          'linear-gradient(90deg, var(--primary), var(--accent-purple))'
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Feed of Submissions */}
              <div className="feed-column">
                <div className="feed-filters-bar">
                  <div className="filter-group">
                    <span className="filter-label">Search:</span>
                    <input 
                      type="text" 
                      className="select-filter" 
                      placeholder="Search description..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '150px' }}
                    />
                  </div>

                  <div className="filter-group">
                    <span className="filter-label">Category:</span>
                    <select 
                      className="select-filter"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      {problemOptions.map(cat => (
                        <option key={cat} value={cat}>{cat.split(" (")[0]}</option>
                      ))}
                    </select>
                  </div>

                  {(categoryFilter !== 'All' || searchQuery) && (
                    <button 
                      className="reset-filters-btn"
                      onClick={() => {
                        setCategoryFilter('All');
                        setSearchQuery('');
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Submissions Cards */}
                <div className="responses-feed">
                  {filteredFeedbacks.length === 0 ? (
                    <div className="no-records">
                      No response logs match the current filters. Try relaxing filters or submitting a response!
                    </div>
                  ) : (
                    filteredFeedbacks.map(item => (
                      <div 
                        key={item.id} 
                        className="response-feed-card"
                        style={{ cursor: 'default' }}
                      >
                        <div className="response-header">
                          <div className="tags-row">
                            {item.problems.map(prob => (
                              <span key={prob} className="badge problem-tag">{prob.split(" (")[0]}</span>
                            ))}
                          </div>
                          <span className="date-badge">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>

                        {/* Submitter Name & Department Row */}
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 10px 0', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            👤 <strong>{item.name || 'Anonymous'}</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🏢 {item.department || 'N/A'}
                          </span>
                        </div>

                        <p className="response-card-description">{item.description}</p>

                        <div className="response-footer">
                          <div className="response-footer-left">
                            <span><strong>Frequency:</strong> {item.frequency}</span>
                            <span><strong>Target Users:</strong> {item.userGroup}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadResponsePDF(item);
                              }}
                              className="reset-filters-btn"
                              style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#818cf8',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#6366f1';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                e.currentTarget.style.color = '#818cf8';
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              Print / PDF
                            </button>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFeedback(item.id);
                              }}
                              className="reset-filters-btn"
                              style={{
                                background: deletingId === item.id ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: deletingId === item.id ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.2)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseOut={(e) => {
                                if (deletingId === item.id) {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                  e.currentTarget.style.color = '#ef4444';
                                } else {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                  e.currentTarget.style.color = '#ef4444';
                                }
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              {deletingId === item.id ? 'Confirm Delete?' : 'Delete Response'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
