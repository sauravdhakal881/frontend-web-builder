'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Copy, ArrowLeft, Code2, Eye, Plus, Maximize2, Check, Edit3, Sparkles, X, Loader2, User, LogOut, Menu, Zap } from 'lucide-react';
import './preview.css';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // ⭐ Add success message state
  const dropdownRef = useRef(null);

  // Helper function to format token display (divide by 1000)
  const formatTokenDisplay = (tokens) => {
    const displayValue = tokens / 1000;
    return displayValue.toFixed(1);
  };

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Fetch token balance
      fetchTokenBalance(parsedUser.id);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to fetch token balance
  const fetchTokenBalance = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tokens/balance/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setTokenBalance(data.data.tokenBalance);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/website/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load website');
        }

        setWebsiteData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchWebsite();
    }
  }, [params.id]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleImageError = (e) => {
    setImageLoadError(true);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
  };

  const handleDownload = () => {
    if (!websiteData) return;
    const blob = new Blob([websiteData.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-${params.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (!websiteData) return;
    navigator.clipboard.writeText(websiteData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleEditClick = () => {
    // Check minimum token requirement before opening modal
    const MINIMUM_TOKENS = 35000;
    if (tokenBalance < MINIMUM_TOKENS) {
      setError(`Insufficient tokens. You need at least ${formatTokenDisplay(MINIMUM_TOKENS)} tokens to edit a website. You currently have ${formatTokenDisplay(tokenBalance)} tokens. Please purchase more tokens.`);
      return;
    }
    setShowEditModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditPrompt('');
    setError('');
  };

  const handleApplyEdit = async () => {
    if (!editPrompt.trim()) {
      setError('Please describe the changes you want to make');
      return;
    }

    // Check minimum token requirement
    const MINIMUM_TOKENS = 35000;
    if (tokenBalance < MINIMUM_TOKENS) {
      setError(`Insufficient tokens. You need at least ${formatTokenDisplay(MINIMUM_TOKENS)} tokens to edit a website. You currently have ${formatTokenDisplay(tokenBalance)} tokens. Please purchase more tokens.`);
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      const userData = JSON.parse(storedUser);

      // Call backend API to apply AI edits
      const response = await fetch('http://localhost:5000/api/edit-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentCode: websiteData.code,
          editPrompt: editPrompt,
          plan: websiteData.plan,
          websiteId: params.id,
          userId: userData.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply changes');
      }

      // Update website data with edited code
      setWebsiteData({
        ...websiteData,
        code: data.updatedCode
      });

      // ⭐ Save edited code to backend/database
      try {
        await fetch(`http://localhost:5000/api/website/${params.id}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: data.updatedCode
          }),
        });
      } catch (saveError) {
        console.error('Error saving edited code:', saveError);
      }

      // Refresh token balance after edit
      fetchTokenBalance(userData.id);

      // ⭐ Close modal and show success message
      setShowEditModal(false);
      setEditPrompt('');
      setError('');
      
      // ⭐ Show success message
      setShowSuccessMessage(true);
      
      // ⭐ Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const navigateToPricing = () => {
    localStorage.setItem('pricingReturnPath', window.location.pathname);
    router.push(`/Pricing?returnTo=${encodeURIComponent(window.location.pathname)}`);
  };

  const exampleEdits = [
    "Change the primary color to blue",
    "Add a newsletter signup section",
    "Make the hero text larger and bold",
    "Change the background to dark theme"
  ];

  if (loading) {
    return (
      <div className="preview-page loading-state">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (error && !websiteData) {
    return (
      <div className="preview-page error-state">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button onClick={() => router.push('/generate')} className="btn btn-primary">
            Back to Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-page">
      {/* ⭐ Success Message Toast */}
      {showSuccessMessage && (
        <div className="success-toast">
          <div className="success-toast-content">
            <Check className="success-icon" />
            <span className="success-text">✨ Edited Successfully!</span>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Edit3 className="icon-sm" />
                Edit Your Website with AI
              </h2>
              <button onClick={handleCloseModal} className="modal-close">
                <X className="icon-sm" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="label">
                  Describe the changes you want to make
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Example: Change the primary color to blue and make the hero section background darker"
                  className="textarea"
                  rows={6}
                  disabled={isGenerating}
                />
                <div className="input-footer">
                  <span className="char-count">{editPrompt.length} characters</span>
                  <span className="hint">Be specific for best results</span>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {/* Example Edits */}
              <div className="examples-section">
                <h3 className="examples-title">Quick Examples:</h3>
                <div className="examples-grid">
                  {exampleEdits.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setEditPrompt(example)}
                      className="example-chip"
                      disabled={isGenerating}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={handleCloseModal} 
                className="btn btn-secondary"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button 
                onClick={handleApplyEdit} 
                className="btn btn-primary"
                disabled={isGenerating || !editPrompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="icon-sm icon-spin" />
                    Applying Changes...
                  </>
                ) : (
                  <>
                    <Sparkles className="icon-sm" />
                    Apply Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fullscreen-overlay">
          <button onClick={closeFullscreen} className="fullscreen-close">
            ✕ Close Fullscreen
          </button>
          <iframe
            srcDoc={websiteData?.code}
            className="fullscreen-iframe"
            title="Website Fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      )}

      {/* Header */}
      <header className="preview-header">
        {/* Top Navigation Bar */}
        <div className="header-top">

          {/* Single Token Card - Clickable */}
          <div className="token-card-clickable" onClick={navigateToPricing}>
            <Plus className="token-icon-new" />
            <div className="token-info">
              <span className="token-count">{formatTokenDisplay(tokenBalance)}</span>
              <span className="token-label">tokens</span>
            </div>
            <div className="token-hover-text">Get more →</div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="user-profile-container" ref={dropdownRef}>
              <button className="user-profile-btn" onClick={toggleDropdown}>
                {user.picture && !imageLoadError ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="user-avatar"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    <User className="icon-sm" />
                  </div>
                )}
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-info">
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <button className="user-dropdown-item logout-btn" onClick={handleLogout}>
                    <LogOut className="icon-sm" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="icon-sm" />
          </button>
        </div>

        {/* Low Token Warning */}
        {user && tokenBalance < 35000 && (
          <div className="low-token-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h4 className="warning-title">Insufficient Tokens for Editing</h4>
              <p className="warning-message">
                You need at least <strong>35.0 tokens</strong> to edit websites. 
                You currently have <strong>{formatTokenDisplay(tokenBalance)} tokens</strong>.
              </p>
              <button onClick={navigateToPricing} className="btn-warning-action">
                Get More Tokens →
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons - Desktop */}
        <div className="header-actions">
          <button onClick={handleEditClick} className="btn btn-edit">
            <Edit3 className="icon-sm" />
            <span>Edit with AI</span>
          </button>
          <button onClick={handleCopyCode} className="btn btn-secondary">
            {copied ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button onClick={handleDownload} className="btn btn-download">
            <Download className="icon-sm" />
            <span>Download</span>
          </button>
          <button onClick={() => router.push('/generate')} className="back-btn">
            <Plus className="icon-sm" />
            <span>Create new</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <button onClick={handleEditClick} className="mobile-menu-item">
            <Edit3 className="icon-sm" />
            <span>Edit with AI</span>
          </button>
          <button onClick={handleCopyCode} className="mobile-menu-item">
            {copied ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button onClick={handleDownload} className="mobile-menu-item">
            <Download className="icon-sm" />
            <span>Download HTML</span>
          </button>
          <button onClick={() => router.push('/generate')} className="mobile-menu-item">
            <ArrowLeft className="icon-sm" />
            <span>Back</span>
          </button>
          <button onClick={() => router.push('/generate')} className="mobile-menu-item">
            <Plus className="icon-sm" />
            <span>Create new</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
          >
            <Eye className="icon-sm" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`tab ${activeTab === 'code' ? 'tab-active' : ''}`}
          >
            <Code2 className="icon-sm" />
            View Code
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="preview-content">
        {activeTab === 'preview' ? (
          <div className="preview-container">
            <div className="preview-card">
              <div className="preview-toolbar">
                <div className="browser-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="preview-url">
                  <span>🌐 website-preview</span>
                </div>
                <button onClick={handleFullscreen} className="fullscreen-btn" title="View in fullscreen">
                  <Maximize2 className="icon-sm" />
                  Fullscreen
                </button>
              </div>
              <div className="iframe-container">
                <iframe
                  srcDoc={websiteData?.code}
                  className="preview-iframe"
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="code-container">
            <div className="code-card">
              <div className="code-header">
                <div className="code-filename">
                  <Code2 className="icon-sm" />
                  website.html
                </div>
                <div className="code-actions">
                  <button onClick={handleCopyCode} className="code-btn">
                    {copied ? <Check className="icon-xs" /> : <Copy className="icon-xs" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleDownload} className="code-btn">
                    <Download className="icon-xs" />
                    Download
                  </button>
                </div>
              </div>
              <div className="code-content">
                <pre className="code-pre">
                  <code className="code-block">{websiteData?.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Info Banner */}
      <div className="infobanner">
        <div className="infocontent22">
          <div className="infoicon">💡</div>
          <div className="infotext">
            <h3 className="infotitle">Single File Architecture</h3>
            <p className="infodescription">
              Your website is a complete, self-contained HTML file with all CSS and JavaScript inline. 
              Simply download and open in any browser - no dependencies, no setup required!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}