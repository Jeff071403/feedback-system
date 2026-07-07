import React, { useState, useEffect } from 'react';
import mccLogo from './assets/mcc logo .png';
import html2pdf from 'html2pdf.js';

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

const isToday = (dateString) => {
  const d = new Date(dateString);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

function Admin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTimeoutId, setDeleteTimeoutId] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Security check on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuth) {
      window.location.href = '/';
      return;
    }

    // Load feedbacks on mount
    fetch(`${API_BASE_URL}/api/feedbacks/`)
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

  // Calculate Metrics
  const totalResponses = feedbacks.length;
  const todayResponses = feedbacks.filter(item => isToday(item.timestamp)).length;
  const uniqueDepartmentsCount = new Set(feedbacks.map(item => item.department).filter(d => d && d !== 'N/A')).size;

  const categoryCounts = problemOptions.reduce((acc, cat) => {
    acc[cat] = feedbacks.filter(item => item.problems.includes(cat)).length;
    return acc;
  }, {});
  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.problems.includes(categoryFilter);
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.problems.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const deleteFeedback = (id) => {
    if (deletingId === id) {
      if (deleteTimeoutId) {
        clearTimeout(deleteTimeoutId);
        setDeleteTimeoutId(null);
      }
      setDeletingId(null);

      const dbId = typeof id === 'string' && id.startsWith('fb-') ? id.replace('fb-', '') : id;
      fetch(`${API_BASE_URL}/api/feedbacks/${dbId}/`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error("Server error");
          setFeedbacks(feedbacks.filter(item => item.id !== id));
        })
        .catch(err => console.error("Error deleting feedback:", err));
    } else {
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
      fetch(`${API_BASE_URL}/api/feedbacks/reset/`, {
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

  const downloadResponsePDF = (item) => {
    generatePDFDirectly(item);
  };

  const generatePDFDirectly = (item) => {
    const formattedProblems = Array.isArray(item.problems) ? item.problems.join(', ') : item.problems;
    const formattedToolTypes = Array.isArray(item.digitalToolTypes) ? item.digitalToolTypes.join(', ') : item.digitalToolTypes;

    // Create container element styled specifically for A4 layout rendering
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '0';
    tempDiv.style.top = '0';
    tempDiv.style.zIndex = '-9999'; // Places it underneath everything so the user doesn't see it
    tempDiv.style.pointerEvents = 'none'; // Avoid block clicks

    tempDiv.innerHTML = `
      <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; line-height: 1.5; font-size: 13px; width: 790px; box-sizing: border-box; padding: 24px; background: #ffffff;">
        <!-- Header -->
        <div style="display: flex; justify-content: center; align-items: center; padding: 18px 20px; background-color: #eef2ff; border-radius: 18px; margin-bottom: 24px; border: 1px solid #dbeafe; position: relative;">
          <div style="display: flex; align-items: center; gap: 14px; justify-content: center; text-align: center;">
            <img src="${mccLogo}" alt="MCC Logo" style="width: 78px; height: auto; object-fit: contain;" />
            <div style="display: flex; flex-direction: column; font-family: 'Times New Roman', Times, serif; color: #0f2d59; align-items: center;">
              <span style="font-size: 20px; font-weight: 700; line-height: 1.1;">Madras Christian College</span>
              <span style="font-size: 14px; color: #475569; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; margin-top: 4px;">Review Report</span>
              <span style="font-size: 11px; color: #475569; margin-top: 6px;">Individual Submitter Q&amp;A Summary</span>
            </div>
          </div>
          <div style="position: absolute; right: 18px; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f2d59; padding: 6px 14px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; white-space: nowrap;">
            ${item.id}
          </div>
        </div>

        <!-- Meta Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1;">
          <div style="font-size: 12px; color: #475569;"><strong>Submitter Name:</strong> <span style="color: #0f2d59; font-weight: 600;">${item.name || 'Anonymous'}</span></div>
          <div style="font-size: 12px; color: #475569;"><strong>Department/Branch:</strong> <span style="color: #0f2d59; font-weight: 600;">${item.department || 'N/A'}</span></div>
          <div style="font-size: 12px; color: #475569; grid-column: span 2;"><strong>Submission Date:</strong> <span style="color: #0f2d59; font-weight: 600;">${new Date(item.timestamp).toLocaleString()}</span></div>
        </div>

        <!-- Details Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="text-align: left; padding: 10px 12px; color: #0f2d59; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; font-size: 11px; border-bottom: 1.5px solid #cbd5e1; border-right: 1px solid #cbd5e1; width: 45%;">Question</th>
              <th style="text-align: left; padding: 10px 12px; color: #0f2d59; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; font-size: 11px; border-bottom: 1.5px solid #cbd5e1; width: 55%;">Answer</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 10px 12px; vertical-align: top; border-right: 1px solid #cbd5e1; font-weight: 500;"><span style="background: #0f2d59; color: #fff; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; margin-right: 8px;">1</span> What type of problem is this?</td>
              <td style="padding: 10px 12px; vertical-align: top; color: #1e293b; font-weight: 500;">${formattedProblems || 'None selected'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 10px 12px; vertical-align: top; border-right: 1px solid #cbd5e1; font-weight: 500;"><span style="background: #0f2d59; color: #fff; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; margin-right: 8px;">2</span> How often does this problem occur?</td>
              <td style="padding: 10px 12px; vertical-align: top; color: #1e293b; font-weight: 500;">${item.frequency}</td>
            </tr>
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 10px 12px; vertical-align: top; border-right: 1px solid #cbd5e1; font-weight: 500;"><span style="background: #0f2d59; color: #fff; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; margin-right: 8px;">3</span> Who is most affected by it?</td>
              <td style="padding: 10px 12px; vertical-align: top; color: #1e293b; font-weight: 500;">${item.affected}</td>
            </tr>
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 10px 12px; vertical-align: top; border-right: 1px solid #cbd5e1; font-weight: 500;"><span style="background: #0f2d59; color: #fff; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; margin-right: 8px;">4</span> Could a digital tool help solve it?</td>
              <td style="padding: 10px 12px; vertical-align: top; color: #1e293b; font-weight: 500;">${item.digitalToolHelp}</td>
            </tr>
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 10px 12px; vertical-align: top; border-right: 1px solid #cbd5e1; font-weight: 500;"><span style="background: #0f2d59; color: #fff; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; margin-right: 8px;">5</span> What kind of digital tool would help?</td>
              <td style="padding: 10px 12px; vertical-align: top; color: #1e293b; font-weight: 500;">${formattedToolTypes || 'None selected'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; vertical-align: top; border-right: 1px solid #cbd5e1; font-weight: 500;"><span style="background: #0f2d59; color: #fff; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; margin-right: 8px;">6</span> Who would use this solution?</td>
              <td style="padding: 10px 12px; vertical-align: top; color: #1e293b; font-weight: 500;">${item.userGroup}</td>
            </tr>
          </tbody>
        </table>

        <!-- Description Box -->
        <div style="background: #f8fafc; border-left: 4px solid #0f2d59; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px; border-top: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
          <div style="font-size: 12px; font-weight: 700; color: #0f2d59; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Question 7: Description of the Problem</div>
          <div style="font-size: 12px; color: #1e293b; white-space: pre-wrap; line-height: 1.5;">${item.description}</div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 32px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 12px;">
          Generated automatically by Review Hub Solutions System on ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;

    document.body.appendChild(tempDiv);

    const pdfOptions = {
      margin: 12,
      filename: `Review_Report_${item.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, letterRendering: true, windowWidth: 790 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .from(tempDiv.firstElementChild)
      .set(pdfOptions)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
        alert(`Report ${item.id} downloaded successfully!`);
      })
      .catch((err) => {
        console.error("PDF download failed: ", err);
        document.body.removeChild(tempDiv);
      });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    window.location.href = '/';
  };

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
          <img src={mccLogo} alt="MCC Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.3px', marginBottom: '6px' }}>Review Hub</h2>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>Connecting to database...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-section" style={{ userSelect: 'none' }}>
          <div className="logo-icon" style={{ background: 'none', boxShadow: 'none', overflow: 'visible' }}>
            <img src={mccLogo} alt="MCC Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </div>
          <div className="logo-text">
            <h1>Review Hub</h1>
            <p>Feedback & Digital Solution System</p>
          </div>
        </div>

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
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🔒 Log Out
          </button>
        </nav>
      </header>

      {/* Main Pages */}
      <main className="page-fade-in">
        <div className="admin-page page-fade-in">
          {/* Admin Section Hero */}
          <div className="admin-section-hero">
            <div>
              <h2>Admin Analytics Dashboard</h2>
              <p>Review community feedback, prioritize issues, and deploy digital solutions.</p>
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
                <div className="metric-change">
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
                <div className="metric-change">From all feedback records</div>
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
                  let displayLabel = cat.split(" (")[0];

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
                      onClick={() => setSelectedFeedback(item)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderLeft: '4px solid transparent'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderLeftColor = '#6366f1';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderLeftColor = 'transparent';
                      }}
                    >
                      <div className="response-header">
                        <div className="tags-row">
                          {item.problems.map(prob => (
                            <span key={prob} className="badge problem-tag">{prob.split(" (")[0]}</span>
                          ))}
                        </div>
                        <span className="date-badge">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>

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
                              border: deletingId === item.id ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
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
                            {deletingId === item.id ? 'Confirm Delete?' : 'Delete'}
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
      </main>

      {/* Details Modal */}
      {selectedFeedback && (
        <div
          style={{
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
            zIndex: 99999,
            padding: '16px',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f1f5f9',
              fontFamily: "'Outfit', sans-serif",
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f2d59', fontWeight: 700 }}>Review Details</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Response ID: {selectedFeedback.id}</p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: '#334155' }}>
              {/* Profile info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div><strong>Name:</strong> {selectedFeedback.name || 'Anonymous'}</div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}><strong>Department:</strong> {selectedFeedback.department || 'N/A'}</div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}><strong>Date Logged:</strong> {new Date(selectedFeedback.timestamp).toLocaleString()}</div>
              </div>

              {/* Problems Tags */}
              <div>
                <strong style={{ display: 'block', marginBottom: '6px', color: '#0f2d59' }}>Problem Type(s):</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedFeedback.problems.map(prob => (
                    <span key={prob} className="badge problem-tag" style={{ margin: 0 }}>{prob}</span>
                  ))}
                </div>
              </div>

              {/* Grid of properties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div>
                  <strong style={{ color: '#0f2d59' }}>Recurrence:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#475569' }}>{selectedFeedback.frequency}</p>
                </div>
                <div>
                  <strong style={{ color: '#0f2d59' }}>Who is Affected:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#475569' }}>{selectedFeedback.affected}</p>
                </div>
                <div>
                  <strong style={{ color: '#0f2d59' }}>End Users:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#475569' }}>{selectedFeedback.userGroup}</p>
                </div>
                <div>
                  <strong style={{ color: '#0f2d59' }}>Digital Tool Help:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#475569' }}>{selectedFeedback.digitalToolHelp || 'N/A'}</p>
                </div>
              </div>

              {selectedFeedback.digitalToolTypes && selectedFeedback.digitalToolTypes.length > 0 && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <strong style={{ color: '#0f2d59', display: 'block', marginBottom: '4px' }}>Suggested Systems:</strong>
                  <span style={{ color: '#6366f1', fontWeight: 600 }}>{selectedFeedback.digitalToolTypes.join(', ')}</span>
                </div>
              )}

              {/* Description */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <strong style={{ color: '#0f2d59', display: 'block', marginBottom: '6px' }}>Problem Description:</strong>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #0f2d59', borderTop: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#1e293b' }}>
                  {selectedFeedback.description}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
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
                Close
              </button>
              <button
                type="button"
                onClick={() => downloadResponsePDF(selectedFeedback)}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
