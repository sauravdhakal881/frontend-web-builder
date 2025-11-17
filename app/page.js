'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        // User is logged in, redirect to generate page
        router.push('/generate');
      } else {
        // User is not logged in, show landing page
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show nothing while checking auth (prevents flash of landing page)
  if (isChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e8edf5 100%)'
      }}>
        <div style={{
          fontSize: '1.25rem',
          color: '#64748b'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          overflow-x: hidden;
        }

        .landing-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e8edf5 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        /* Logo */
        .logo {
          position: fixed;
          top: 2rem;
          left: 2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 50px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          opacity: 0;
          animation: fadeInDown 0.8s forwards;
          z-index: 10;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
        }

        .logo-text {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
        }

        /* Animated Background Circles */
        .background-circles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.08;
          filter: blur(60px);
        }

        .circle-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: -200px;
          left: -150px;
          animation: float1 25s infinite ease-in-out;
        }

        .circle-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: -150px;
          right: -100px;
          animation: float2 30s infinite ease-in-out;
        }

        .circle-3 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 50%;
          right: 10%;
          animation: float3 28s infinite ease-in-out;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(50px, -50px) rotate(120deg); }
          66% { transform: translate(-30px, 30px) rotate(240deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, 40px) rotate(-120deg); }
          66% { transform: translate(30px, -30px) rotate(-240deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 50px) scale(1.1); }
        }

        /* Hero Section */
        .hero {
          max-width: 1000px;
          width: 100%;
          text-align: center;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
        }

        /* Main Content */
        .hero-content {
          max-width: 900px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border: 1px solid #667eea30;
          border-radius: 50px;
          color: #667eea;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 2rem;
          opacity: 0;
          animation: fadeInUp 0.8s 0.1s forwards;
        }

        .badge-icon {
          font-size: 1rem;
        }

        .main-title {
          font-size: 4.5rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          letter-spacing: -0.03em;
          opacity: 0;
          animation: fadeInUp 0.8s 0.2s forwards;
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }

        .subtitle {
          font-size: 1.375rem;
          color: #64748b;
          margin-bottom: 2.5rem;
          line-height: 1.7;
          font-weight: 400;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          opacity: 0;
          animation: fadeInUp 0.8s 0.3s forwards;
        }

        /* CTA Button */
        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-decoration: none;
          padding: 1.25rem 3rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: fadeInUp 0.8s 0.4s forwards;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.45);
        }

        /* Feature Cards */
        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          width: 100%;
          max-width: 900px;
          margin-top: 1rem;
          opacity: 0;
          animation: fadeInUp 0.8s 0.5s forwards;
        }

        .feature-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          cursor: default;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(102, 126, 234, 0.15);
          border-color: #cbd5e1;
        }

        .feature-icon {
          font-size: 1rem;
          line-height: 1;
          display: block;
          color: #0f172a;
        }

        .feature-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.4;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .landing-container {
            padding: 1.5rem 1rem;
          }

          .logo {
            top: 1.5rem;
            left: 1rem;
            padding: 0.625rem 1.25rem;
          }

          .logo-icon {
            width: 28px;
            height: 28px;
          }

          .logo-text {
            font-size: 1rem;
          }

          .main-title {
            font-size: 2.75rem;
          }
          
          .subtitle {
            font-size: 1.125rem;
            margin-bottom: 2rem;
          }
          
          .cta-button {
            padding: 1.125rem 2.5rem;
            font-size: 1.125rem;
          }

          .features {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .feature-card {
            padding: 1.75rem 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 2.25rem;
          }
          .hero {
            margin-top: 4rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .badge {
            font-size: 0.8125rem;
            padding: 0.5rem 1rem;
          }

          .cta-button {
            font-size: 1rem;
            padding: 1rem 2rem;
            width: 100%;
            max-width: 320px;
          }

          .feature-card {
            padding: 1.5rem 1.25rem;
          }

          .feature-icon {
            font-size: 1rem;
          }

          .feature-title {
            font-size: 1rem;
          }
        }
      `}} />

      <div className="landing-container">
        {/* Logo */}
        <div className="logo">
          <span className="logo-text">ChatRock AI</span>
        </div>

        {/* Animated Background */}
        <div className="background-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>

        {/* Hero Section */}
        <div className="hero">
          {/* Main Content */}
          <div className="hero-content">
            <div className="badge">
              <span className="badge-icon">✨</span>
              <span>AI-Powered Website Generation</span>
            </div>

            <h1 className="main-title">
              Build Stunning Websites<br />
              <span className="gradient-text">in Seconds with AI</span>
            </h1>
            
            <p className="subtitle">
              Transform your ideas into beautiful, professional websites instantly. No coding required, no design skills needed. Just describe what you want and watch the magic happen.
            </p>

            {/* CTA Button */}
            <Link href="/login" className="cta-button">
              Get Started Free →
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="features">
            <div className="feature-card">
              <span className="feature-icon">✓ AI powered</span>
            </div>

            <div className="feature-card">
              <span className="feature-icon">✓ Free to start</span>
            </div>

            <div className="feature-card">
              <span className="feature-icon">✓ No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}