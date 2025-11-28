'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Zap, Crown, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import './pricing.css';

export default function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returnTo, setReturnTo] = useState('/generate');

  useEffect(() => {
    const returnPath =
      searchParams.get('returnTo') ||
      localStorage.getItem('pricingReturnPath') ||
      '/generate';

    setReturnTo(returnPath);
  }, [searchParams]);

  const formatTokenDisplay = (tokens) => {
    const displayValue = tokens / 1000;
    return displayValue.toString();
  };

  const tokenPackages = [
    {
      id: 'starter',
      name: 'Starter',
      tokens: 100000,
      displayTokens: '100',
      price: 0,
      icon: Sparkles,
      color: 'blue',
      features: ['Generate 2-3 websites', 'Basic support', 'Valid forever'],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Professional',
      tokens: 500000,
      displayTokens: '500',
      price: 0,
      icon: Zap,
      color: 'purple',
      features: ['Generate 10-15 websites', 'Priority support', 'Valid forever'],
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      tokens: 1000000,
      displayTokens: '1000',
      price: 0,
      icon: Crown,
      color: 'gold',
      features: ['Generate 30+ websites', 'Premium support', 'Valid forever'],
      popular: false,
    },
  ];

  const handlePurchase = async (packageData) => {
    setLoading(packageData.id);
    setError('');
    setSuccess('');

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(storedUser);

      const response = await fetch(`${process.env.BACKEND_URL}/api/tokens/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          tokens: packageData.tokens,
          packageName: packageData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase tokens');
      }

      setSuccess(
        `Successfully added ${formatTokenDisplay(packageData.tokens)} tokens to your account!`
      );

      setTimeout(() => {
        localStorage.removeItem('pricingReturnPath');
        router.push(returnTo);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const getIconComponent = (IconComponent) => {
    return <IconComponent className="package-icon" />;
  };

  return (
    <div className="pricing-page">
      {/* Back Button */}
      <button
        onClick={() => {
          localStorage.removeItem('pricingReturnPath');
          router.push(returnTo);
        }}
        className="btn-back-top"
      >
        <ArrowLeft className="icon-sm" />
        Back
      </button>

      <div className="pricing-container">
        {/* Header */}
        <header className="pricing-header">
          <div className="pricing-badge">
            <Sparkles className="badge-icon" />
            <span>Pricing Plans</span>
          </div>
          <h1 className="pricing-title">Choose the Perfect Plan for You</h1>
          <p className="pricing-subtitle">
            Get started with AI-powered website generation. Choose a package suitable for your project needs.
          </p>
        </header>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success">
            <Check className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {tokenPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`pricing-card ${pkg.popular ? 'popular-card' : ''} card-${pkg.color}`}
            >
              {pkg.popular && (
                <div className="popular-badge">
                  <Sparkles className="badge-icon-sm" />
                  <span>Most Popular</span>
                </div>
              )}

              <div className="card-content">
                <div className="card-header">
                  <div className={`icon-wrapper icon-${pkg.color}`}>
                    {getIconComponent(pkg.icon)}
                  </div>
                  <h3 className="package-name">{pkg.name}</h3>
                </div>

                <div className="card-body">
                  <div className="token-display">
                    <div className="token-amount">
                      <span className="token-number">{pkg.displayTokens}</span>
                      <span className="token-label">AI Tokens</span>
                    </div>
                  </div>

                  <div className="price-display">
                    <span className="price-amount">FREE</span>
                    <span className="price-note">Limited time offer</span>
                  </div>

                  <ul className="features-list">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <div className="feature-check">
                          <Check className="check-icon" />
                        </div>
                        <span className="feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-footer">
                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={loading !== null}
                    className={`btn-purchase ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {loading === pkg.id ? (
                      <>
                        <div className="spinner"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Free</span>
                        <ArrowRight className="btn-icon" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="info-section">
          <h3 className="info-title">How It Works</h3>
          <p className="info-description">Get started in three simple steps</p>

          <div className="info-grid">
            <div className="info-card">
              <div className="info-number">1</div>
              <h4 className="info-card-title">Choose Your Package</h4>
              <p className="info-card-text">Select the token package that best fits your project needs</p>
            </div>

            <div className="info-card">
              <div className="info-number">2</div>
              <h4 className="info-card-title">Instant Activation</h4>
              <p className="info-card-text">Tokens are immediately added to your account balance</p>
            </div>

            <div className="info-card">
              <div className="info-number">3</div>
              <h4 className="info-card-title">Start Creating</h4>
              <p className="info-card-text">Generate professional websites with AI in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
