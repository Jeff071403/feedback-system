import React, { useState, useEffect } from 'react';
import { initialMockResponses } from './mockData';

// Platform emoji icons for the solutions directory
const platformIcon = (type) => {
  const icons = {
    'Mobile App': '📱',
    'Website Portal': '🌐',
    'Chatbot / Helpdesk': '🤖',
    'Notification / Alert System': '🔔',
    'Booking / Scheduling System': '📅',
    'QR-based System': '📷',
    'Other': '⚙️'
  };
  return icons[type] || '💡';
};

// Map solution status to CSS modifier class
const solutionCardClass = (status) => {
  if (status === 'Deployed') return 'is-deployed';
  if (status === 'In Development') return 'is-in-development';
  return 'is-ideation';
};

// Option lists for the questionnaire
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
  const [view, setView] = useState('user'); // 'user' or 'admin'
  const [userSubView, setUserSubView] = useState('report'); // 'report' or 'directory' (Campus Digital Tools Directory)
  
  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem('campus_feedbacks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading feedbacks from localStorage", e);
      }
    }
    localStorage.setItem('campus_feedbacks', JSON.stringify(initialMockResponses));
    return initialMockResponses;
  });

  // User form states
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [frequency, setFrequency] = useState('');
  const [affected, setAffected] = useState('');
  const [toolHelp, setToolHelp] = useState('');
  const [selectedToolTypes, setSelectedToolTypes] = useState([]);
  const [userGroup, setUserGroup] = useState('');
  const [description, setDescription] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Admin filter & selection states
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Admin Developer Console form states (for building solutions linked to feedback)
  const [solName, setSolName] = useState('');
  const [solType, setSolType] = useState('Mobile App');
  const [solStatus, setSolStatus] = useState('Ideation');
  const [solDesc, setSolDesc] = useState('');

  // Synchronize localStorage whenever feedbacks state changes
  useEffect(() => {
    localStorage.setItem('campus_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Synchronize dev console input when a feedback is clicked
  useEffect(() => {
    if (selectedFeedback) {
      if (selectedFeedback.solution) {
        setSolName(selectedFeedback.solution.name || '');
        setSolType(selectedFeedback.solution.type || 'Mobile App');
        setSolStatus(selectedFeedback.solution.status || 'Ideation');
        setSolDesc(selectedFeedback.solution.description || '');
      } else {
        setSolName('');
        setSolType('Mobile App');
        setSolStatus('Ideation');
        setSolDesc('');
      }
    }
  }, [selectedFeedback]);

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Auto-calculate default priority based on frequency and affected scope
    let priority = "Low";
    if (frequency === "Daily" || affected === "Everyone") {
      priority = "High";
    } else if (frequency === "Weekly" || affected === "Students" || affected === "Faculty") {
      priority = "Medium";
    }

    const newFeedback = {
      id: "fb-" + Date.now(),
      timestamp: new Date().toISOString(),
      problems: selectedProblems.length > 0 ? selectedProblems : ["Other"],
      frequency: frequency || "Occasionally",
      affected: affected || "Everyone",
      digitalToolHelp: toolHelp || "Not sure",
      digitalToolTypes: selectedToolTypes,
      userGroup: userGroup || "Both",
      description: description.trim() || "No detailed description provided.",
      priority,
      status: "Pending",
      solution: null // Added by Admin later
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    setFormSubmitted(true);
  };

  // Reset form inputs for next submission
  const resetForm = () => {
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

  // Update status or priority of a feedback item (Admin role)
  const updateFeedbackStatus = (id, newStatus) => {
    const updated = feedbacks.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    );
    setFeedbacks(updated);
    if (selectedFeedback && selectedFeedback.id === id) {
      setSelectedFeedback({ ...selectedFeedback, status: newStatus });
    }
  };

  const updateFeedbackPriority = (id, newPriority) => {
    const updated = feedbacks.map(item => 
      item.id === id ? { ...item, priority: newPriority } : item
    );
    setFeedbacks(updated);
    if (selectedFeedback && selectedFeedback.id === id) {
      setSelectedFeedback({ ...selectedFeedback, priority: newPriority });
    }
  };

  // Update or delete digital solutions linked to a feedback ticket
  const handleSaveSolution = (id) => {
    if (!solName.trim()) {
      alert("Please provide a name for this digital solution app/system.");
      return;
    }
    
    const newSolutionObj = {
      name: solName.trim(),
      type: solType,
      status: solStatus,
      description: solDesc.trim() || "No description provided."
    };

    // Auto-align feedback ticket status:
    // If solution is Deployed -> Resolve ticket
    // If solution is In Development -> In Progress ticket
    let targetTicketStatus = "Pending";
    if (solStatus === "Deployed") {
      targetTicketStatus = "Resolved";
    } else if (solStatus === "In Development") {
      targetTicketStatus = "In Progress";
    }

    const updated = feedbacks.map(item => 
      item.id === id ? { ...item, solution: newSolutionObj, status: targetTicketStatus } : item
    );

    setFeedbacks(updated);
    setSelectedFeedback(prev => ({ ...prev, solution: newSolutionObj, status: targetTicketStatus }));
    alert("Digital Solution saved and synced to the public directory!");
  };

  const handleRemoveSolution = (id) => {
    if (window.confirm("Remove this digital solution? It will be deleted from the directory.")) {
      const updated = feedbacks.map(item => 
        item.id === id ? { ...item, solution: null } : item
      );
      setFeedbacks(updated);
      setSelectedFeedback(prev => ({ ...prev, solution: null }));
      setSolName('');
      setSolDesc('');
      alert("Digital Solution removed.");
    }
  };

  const deleteFeedback = (id) => {
    if (window.confirm("Are you sure you want to delete this response?")) {
      setFeedbacks(feedbacks.filter(item => item.id !== id));
      setSelectedFeedback(null);
    }
  };

  const resetDatabase = () => {
    if (window.confirm("Reset dashboard data back to initial mock responses?")) {
      setFeedbacks(initialMockResponses);
      localStorage.setItem('campus_feedbacks', JSON.stringify(initialMockResponses));
      setSelectedFeedback(null);
    }
  };

  // Calculate Metrics
  const totalResponses = feedbacks.length;
  const todayResponses = feedbacks.filter(item => isToday(item.timestamp)).length;
  const resolvedResponses = feedbacks.filter(item => item.status === "Resolved").length;
  const activeSolutionsCount = feedbacks.filter(item => item.solution && item.solution.status === 'Deployed').length;

  // Calculate separate count for problems (e.g. Canteen, Infra, etc.)
  const categoryCounts = problemOptions.reduce((acc, cat) => {
    acc[cat] = feedbacks.filter(item => item.problems.includes(cat)).length;
    return acc;
  }, {});

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Filter feedbacks for the feed
  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.problems.includes(categoryFilter);
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.problems.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesPriority && matchesSearch;
  });

  // Extract all feedbacks that have active or in-development digital solutions
  const deployedSolutions = feedbacks.filter(item => item.solution && item.solution.name);

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">C</div>
          <div className="logo-text">
            <h1>Campus Feedback & Solution Hub</h1>
            <p>Voice Your Problems. We Develop Digital Solutions.</p>
          </div>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${view === 'user' ? 'active' : ''}`}
            onClick={() => { setView('user'); resetForm(); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
            </svg>
            Submit Feedback
          </button>
          <button 
            className={`nav-tab ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView('admin')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
            </svg>
            Admin Dashboard
          </button>
        </nav>
      </header>

      {/* Main Pages */}
      <main className="page-fade-in">
        {view === 'user' ? (
          <div className="user-page">
            {/* Secondary navigation for reporting vs viewing active apps */}
            <div className="user-nav-container">
              <div className="user-submenu-tabs">
                <button 
                  className={`user-submenu-tab ${userSubView === 'report' ? 'active' : ''}`}
                  onClick={() => setUserSubView('report')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Report a Problem
                </button>
                <button 
                  className={`user-submenu-tab ${userSubView === 'directory' ? 'active' : ''}`}
                  onClick={() => setUserSubView('directory')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  Active Campus Apps ({deployedSolutions.length})
                </button>
              </div>
            </div>

            {userSubView === 'report' ? (
              formSubmitted ? (
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
                    <h2>Campus Voice Portal</h2>
                    <p>Report physical, academic, or administrative friction. We develop software to solve them.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="questionnaire-card">
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
              )
            ) : (
              /* Public Digital Solutions Directory */
              <div className="directory-view page-fade-in" style={{ textAlign: 'center' }}>
                <div className="form-hero">
                  <h2>Active Campus Digital Tools</h2>
                  <p>Check out the software programs, dashboards, and apps deployed in response to user feedback.</p>
                </div>

                {deployedSolutions.length === 0 ? (
                  <div className="no-records" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    No digital tools have been developed yet. Submit feedback and report campus friction to initiate app builds!
                  </div>
                ) : (
                  <div className="solutions-grid">
                    {deployedSolutions.map(item => (
                      <div key={item.id} className={`solution-card ${solutionCardClass(item.solution.status)}`}>
                        <div className="solution-card-header">
                          <div className="solution-card-header-inner">
                            <div className="solution-platform-icon">{platformIcon(item.solution.type)}</div>
                            <h3 className="solution-card-title">{item.solution.name}</h3>
                          </div>
                          <span className="solution-card-type">{item.solution.type}</span>
                        </div>
                        <span className={`solution-status-badge ${item.solution.status.toLowerCase().replace(/ /g, '-')}`}>
                          {item.solution.status === 'Deployed' && <span className="live-dot"></span>}
                          {item.solution.status}
                        </span>
                        <p className="solution-card-description">{item.solution.description}</p>
                        
                        <div className="solution-card-problem-ref">
                          <strong>Solving User Report:</strong>
                          <span className="solution-card-problem-desc">"{item.description}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <p>Review campus feedback, prioritise issues, and launch digital solutions to resolve them.</p>
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
                  <div className="metric-label">Deployed Apps / Solutions</div>
                  <div className="metric-value">{activeSolutionsCount}</div>
                  <div className="metric-change">
                    {deployedSolutions.length} total solutions designed
                  </div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.05)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
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
                    const percent = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
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

                  <div className="filter-group">
                    <span className="filter-label">Status:</span>
                    <select 
                      className="select-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <span className="filter-label">Solution:</span>
                    <select 
                      className="select-filter"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="All">All Priorities</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  {(categoryFilter !== 'All' || statusFilter !== 'All' || priorityFilter !== 'All' || searchQuery) && (
                    <button 
                      className="reset-filters-btn"
                      onClick={() => {
                        setCategoryFilter('All');
                        setStatusFilter('All');
                        setPriorityFilter('All');
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
                      >
                        <div className="response-header">
                          <div className="tags-row">
                            <span className={`badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span>
                            <span className={`badge status-${item.status.toLowerCase().replace(/ /g, '-')}`}>{item.status}</span>
                            {item.problems.map(prob => (
                              <span key={prob} className="badge problem-tag">{prob.split(" (")[0]}</span>
                            ))}
                            {item.solution && (
                              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.3)' }}>
                                🛠️ {item.solution.name}
                              </span>
                            )}
                          </div>
                          <span className="date-badge">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>

                        <p className="response-card-description">{item.description}</p>

                        <div className="response-footer">
                          <div className="response-footer-left">
                            <span><strong>Frequency:</strong> {item.frequency}</span>
                            <span><strong>Target Users:</strong> {item.userGroup}</span>
                          </div>
                          <span className="view-details-link">
                            View Console
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
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

      {/* Details Modal (with integrated Admin Solution Developer Console) */}
      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Problem Details & Solution Console</h3>
              <button className="close-modal-btn" onClick={() => setSelectedFeedback(null)}>&times;</button>
            </div>
            
            <div className="modal-body">
              {/* Timestamp and Meta */}
              <div className="modal-section" style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <div>
                  <span className="modal-section-label">Submitted On</span>
                  <div className="modal-section-content" style={{ fontWeight: 600 }}>{new Date(selectedFeedback.timestamp).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="modal-section-label">Ticket ID</span>
                  <div className="modal-section-content" style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{selectedFeedback.id}</div>
                </div>
              </div>

              {/* Problem categories */}
              <div className="modal-section">
                <span className="modal-section-label">Selected Categories</span>
                <div className="modal-pills">
                  {selectedFeedback.problems.map(prob => (
                    <span key={prob} className="badge problem-tag" style={{ fontSize: '12px', padding: '4px 10px' }}>{prob}</span>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="modal-section">
                  <span className="modal-section-label">Occurs</span>
                  <div className="modal-section-content" style={{ fontWeight: 500 }}>{selectedFeedback.frequency}</div>
                </div>
                <div className="modal-section">
                  <span className="modal-section-label">Who is Affected</span>
                  <div className="modal-section-content" style={{ fontWeight: 500 }}>{selectedFeedback.affected}</div>
                </div>
                <div className="modal-section">
                  <span className="modal-section-label">Can software help?</span>
                  <div className="modal-section-content" style={{ fontWeight: 500 }}>{selectedFeedback.digitalToolHelp}</div>
                </div>
              </div>

              {/* Description */}
              <div className="modal-section">
                <span className="modal-section-label">User Reported Description</span>
                <div className="modal-desc-box">{selectedFeedback.description}</div>
              </div>

              {/* Basic Admin controls (priority & generic status) */}
              <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="admin-action-block" style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px' }}>Ticket Priority</label>
                  <select 
                    className="admin-select"
                    value={selectedFeedback.priority}
                    onChange={(e) => updateFeedbackPriority(selectedFeedback.id, e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="admin-action-block" style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px' }}>Ticket Status</label>
                  <select 
                    className="admin-select"
                    value={selectedFeedback.status}
                    onChange={(e) => updateFeedbackStatus(selectedFeedback.id, e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Admin Digital Solution Developer Console */}
              <div className="modal-developer-console">
                <h4>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  Software Developer Console
                </h4>
                <div className="console-grid">
                  <div className="console-field">
                    <label>Solution App Name</label>
                    <input 
                      type="text" 
                      className="console-input" 
                      placeholder="e.g. Forest Trax Mobile Map"
                      value={solName}
                      onChange={(e) => setSolName(e.target.value)}
                    />
                  </div>
                  <div className="console-field">
                    <label>Solution Platform/Type</label>
                    <select 
                      className="console-input"
                      value={solType}
                      onChange={(e) => setSolType(e.target.value)}
                    >
                      <option value="Mobile App">Mobile App</option>
                      <option value="Website Portal">Website Portal</option>
                      <option value="Chatbot / Helpdesk">Chatbot / Helpdesk</option>
                      <option value="Notification / Alert System">Notification / Alert System</option>
                      <option value="Booking / Scheduling System">Booking / Scheduling System</option>
                      <option value="QR-based System">QR-based System</option>
                      <option value="Other">Other System</option>
                    </select>
                  </div>
                  <div className="console-field">
                    <label>Deployment Status</label>
                    <select 
                      className="console-input"
                      value={solStatus}
                      onChange={(e) => setSolStatus(e.target.value)}
                    >
                      <option value="Ideation">Ideation / Under Review</option>
                      <option value="In Development">In Development</option>
                      <option value="Deployed">Deployed & Active</option>
                    </select>
                  </div>
                  <div className="console-field" style={{ justifyContent: 'center', paddingTop: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      * Setting status to <strong>Deployed</strong> auto-resolves this feedback ticket.
                    </span>
                  </div>
                  <div className="console-field full-width">
                    <label>Developer Technical Scope</label>
                    <textarea 
                      className="console-input console-textarea"
                      placeholder="Outline what features this software builds to resolve the user's issue..."
                      value={solDesc}
                      onChange={(e) => setSolDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="console-actions">
                  {selectedFeedback.solution && (
                    <button 
                      className="remove-solution-btn"
                      onClick={() => handleRemoveSolution(selectedFeedback.id)}
                    >
                      Delete Solution
                    </button>
                  )}
                  <button 
                    className="save-console-btn"
                    onClick={() => handleSaveSolution(selectedFeedback.id)}
                  >
                    Save & Deploy Solution
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <button 
                  className="delete-action-btn"
                  onClick={() => deleteFeedback(selectedFeedback.id)}
                >
                  Delete Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
