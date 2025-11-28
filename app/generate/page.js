'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Wand2, Check, Loader2, ArrowRight, RefreshCw, LogOut, User, Plus } from 'lucide-react';
import './generate.css';

export default function GeneratePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('input');
  const [sessionId, setSessionId] = useState('');
  const [plan, setPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const dropdownRef = useRef(null);
  const [tokenBalance, setTokenBalance] = useState(0);

  // Helper function to format token display (divide by 1000)
  const formatTokenDisplay = (tokens) => {
    const displayValue = tokens / 1000;
    return displayValue.toFixed(1);
  };

  useEffect(() => {
    const fetchTokenBalance = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/api/tokens/balance/${userData.id}`);
          const data = await response.json();
          
          if (data.success) {
            setTokenBalance(data.data.tokenBalance);
          }
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      }
    };

    fetchTokenBalance();
    
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchTokenBalance, 35000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
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

  const handleTokenCardClick = () => {
    localStorage.setItem('pricingReturnPath', '/generate');
    router.push('/Pricing?returnTo=/generate');
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('Please login first');
      return;
    }
    const userData = JSON.parse(storedUser);

    // Check minimum token requirement (30,000 actual tokens = 30.0 display)
    const MINIMUM_TOKENS = 35000;
    if (tokenBalance < MINIMUM_TOKENS) {
      setError(`Insufficient tokens. You need at least ${formatTokenDisplay(MINIMUM_TOKENS)} tokens to generate a website. You currently have ${formatTokenDisplay(tokenBalance)} tokens. Please purchase more tokens.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          userId: userData.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze prompt');
      }

      // Refresh token balance after analyze
      const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/api/tokens/balance/${userData.id}`);
      const balanceData = await balanceResponse.json();
      if (balanceData.success) {
        setTokenBalance(balanceData.data.tokenBalance);
      }

      setSessionId(data.sessionId);
      setPlan(data.plan);
      setStep('plan');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    // Check minimum token requirement before generating
    const MINIMUM_TOKENS = 35000;
    if (tokenBalance < MINIMUM_TOKENS) {
      setError(`Insufficient tokens. You need at least ${formatTokenDisplay(MINIMUM_TOKENS)} tokens to generate a website. You currently have ${formatTokenDisplay(tokenBalance)} tokens. Please purchase more tokens.`);
      return;
    }

    setLoading(true);
    setError('');
    setStep('generating');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate website');
      }

      // Refresh token balance after generation
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/api/tokens/balance/${userData.id}`);
        const balanceData = await balanceResponse.json();
        if (balanceData.success) {
          setTokenBalance(balanceData.data.tokenBalance);
        }
      }
      
      // Navigate to preview page
      router.push(`/preview/${data.websiteId}`);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
      setLoading(false);
      setStep('plan');
    }
  };

  const handleReset = () => {
    setStep('input');
    setPrompt('');
    setPlan(null);
    setSessionId('');
    setError('');
  };

  const examplePrompts = [
    "Modern tech startup landing page with sleek design",
    "Cozy coffee shop website with menu showcase",
    "Fitness gym website with class schedules",
    "Luxury hotel website with booking system"
  ];

  return (
    <div className="generate-page">
      <div className="container">
        {/* Header */}
        <header className="header">
          {/* User Profile - Top Left */}
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

          {/* Token Balance - Top Right */}
          {user && (
            <div className="token-balance-container">
              <button 
                onClick={handleTokenCardClick}
                className="token-balance-card"
              >
                <div className="token-icon">
                  <Plus />
                </div>
                <div className="token-info">
                  <span className="token-count">{formatTokenDisplay(tokenBalance)}</span>
                  <span className="token-label">Tokens Available</span>
                </div>
              </button>
            </div>
          )}
          
          <div className="badge">
            <Sparkles className="icon-sm" />
            <span>AI-Powered Website Generation</span>
          </div>
          <h1 className="title">Build Your Dream Website</h1>
          <p className="subtitle">
            Describe your vision, and watch AI craft a stunning website in seconds
          </p>
        </header>

        {/* Main Content */}
        <main className="main-content">
          
          {/* INPUT STEP */}
          {step === 'input' && (
            <div className="step-container">
              <div className="card">
                <div className="form-group">
                  <label className="label">
                    <Wand2 className="icon-sm" />
                    Describe Your Website
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a modern landing page for a tech startup with hero section, features, testimonials, and contact form. Use vibrant blue and purple gradients with a futuristic feel."
                    className="textarea"
                    rows={8}
                    disabled={loading}
                  />
                  <div className="input-footer">
                    <span className="char-count">{prompt.length} characters</span>
                    <span className="hint">Be specific for best results</span>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !prompt.trim()}
                  className="btn btn-primary btn-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="icon-spin" />
                      Analyzing Your Vision...
                    </>
                  ) : (
                    <>
                      <Sparkles className="icon-sm" />
                      Analyze & Create Design Plan
                      <ArrowRight className="icon-sm" />
                    </>
                  )}
                </button>
              </div>

              {/* Example Prompts */}
              <div className="card">
                <h3 className="card-title">Need Inspiration? Try These:</h3>
                <div className="examples-grid">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="example-btn"
                    >
                      → {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PLAN STEP */}
          {step === 'plan' && plan && (
            <div className="step-container">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-heading">
                    <div className="icon-badge">
                      <Check className="icon-sm" />
                    </div>
                    Your Design Blueprint
                  </h2>
                </div>

                {/* Key Info */}
                <div className="info-grid">
                  <div className="infocard">
                    <p className="infolabel">Website Type</p>
                    <p className="infovalue">{plan.websiteType}</p>
                  </div>
                  <div className="infocard">
                    <p className="infolabel">Design Style</p>
                    <p className="infovalue">{plan.designStyle}</p>
                  </div>
                  <div className="infocard">
                    <p className="infolabel">Target Audience</p>
                    <p className="infovalue">{plan.targetAudience}</p>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="section">
                  <h3 className="section-title">Color Palette</h3>
                  <div className="colors-grid">
                    {Object.entries(plan.colorPalette).map(([name, color]) => (
                      <div key={name} className="color-item">
                        <div 
                          className="color-swatch"
                          style={{ backgroundColor: color }}
                        ></div>
                        <div className="color-info">
                          <span className="color-name">{name}</span>
                          <span className="color-code">{color}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="section">
                  <h3 className="section-title">Typography</h3>
                  <div className="typography-list">
                    <div className="typography-item">
                      <span className="typography-label">Headings:</span>
                      <span className="typography-value">{plan.typography.headingFont}</span>
                    </div>
                    <div className="typography-item">
                      <span className="typography-label">Body:</span>
                      <span className="typography-value">{plan.typography.bodyFont}</span>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="section">
                  <div className="section-header">
                    <h3 className="section-title">Website Sections</h3>
                    <span className="badge-count">{plan.sections.length} sections</span>
                  </div>
                  <div className="tags-container">
                    {plan.sections.map((section) => (
                      <span key={section} className="tag">
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn btn-success btn-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="icon-spin" />
                    Building Your Masterpiece...
                  </>
                ) : (
                  <>
                    <Sparkles className="icon-sm" />
                    Generate My Website
                    <ArrowRight className="icon-sm" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* GENERATING STEP */}
          {step === 'generating' && (
            <div className="step-container">
              <div className="card card-center">
                {/* Loader */}
                <div className="loader-container">
                  <div className="loader">
                    <Sparkles className="loader-icon" />
                  </div>
                </div>

                <h2 className="generating-title">Crafting Your Masterpiece</h2>
                <p className="generating-subtitle">
                  Our AI is generating your stunning website
                </p>
                <p className="generating-time">This typically takes 20-40 seconds</p>

                {/* Progress Steps */}
                <div className="progress-list">
                  <div className="progress-item progress-complete">
                    <div className="progress-icon progress-icon-complete">
                      <Check className="icon-xs" />
                    </div>
                    <span>Analyzing design requirements</span>
                  </div>
                  
                  <div className="progress-item progress-active">
                    <div className="progress-icon progress-icon-active">
                      <Loader2 className="icon-xs icon-spin" />
                    </div>
                    <span>Generating HTML structure, Creating beautiful CSS styles and adding interactivity</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <Sparkles className="icon-xs" />
            <span>Powered by ChatRock AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}