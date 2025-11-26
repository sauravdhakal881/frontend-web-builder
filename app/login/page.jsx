"use client";
import { useEffect } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  useEffect(() => {
    console.log("🔧 Setting up Google Sign-In...");
    console.log("📍 Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log("🔑 Google Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

    // Load Google script dynamically
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log("✅ Google script loaded");
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "filled_blue", size: "large", text: "continue_with", width: 250 }
        );
        console.log("✅ Google Sign-In button rendered");
      }
    };

    function handleCredentialResponse(response) {
      console.log("🔐 Google sign-in successful");
      const id_token = response.credential;
      console.log("🔑 Token received:", id_token ? "Yes" : "No");

      // Use port 5001 for auth server
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log("📡 Sending to backend:", `${backendUrl}/api/auth/google`);

      // Send the token to backend for verification
      fetch(`${backendUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token }),
      })
        .then((res) => {
          console.log("📡 Response status:", res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("📦 Full response data:", data);
          
          if (data.ok && data.user) {
            console.log("✅ Login successful!");
            console.log("👤 User data received:", data.user);
            console.log("🖼️ Picture URL from backend:", data.user.picture);
            
            // ✅ Store token
            console.log("💾 Saving token...");
            localStorage.setItem("token", data.token);
            console.log("✅ Token saved:", localStorage.getItem("token") ? "Yes" : "No");
            
            // ✅ Store user data
            const userData = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              picture: data.user.picture,
            };
            console.log("💾 Saving user data:", userData);
            localStorage.setItem("user", JSON.stringify(userData));
            
            // Verify it was saved
            const savedUser = localStorage.getItem("user");
            console.log("✅ User saved:", savedUser ? "Yes" : "No");
            console.log("📦 Saved user data:", savedUser);
            
            if (savedUser) {
              const parsed = JSON.parse(savedUser);
              console.log("✅ Parsed saved user:", parsed);
              console.log("🖼️ Picture in localStorage:", parsed.picture);
            }
            
            // Delay redirect to ensure localStorage is saved
            console.log("⏳ Waiting 500ms before redirect...");
            setTimeout(() => {
              console.log("🔄 Redirecting to /generate...");
              window.location.href = "/generate";
            }, 500);
          } else {
            console.error("❌ Login failed - invalid response:", data);
            alert("Login failed: " + (data.error || "Invalid response from server"));
          }
        })
        .catch((err) => {
          console.error("❌ Fetch error:", err);
          console.error("Error stack:", err.stack);
          alert("Network error: " + err.message + ". Check if backend is running on port 5001");
        });
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>

      {/* Login Card */}
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <rect width="60" height="60" rx="12" fill="url(#gradient)" />
              <path d="M20 30L27 37L40 23" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="60" y2="60">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className={styles.title}>Let's start</h1>
          <p className={styles.subtitle}>Sign in to continue building amazing websites</p>
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerText}>Continue with</span>
        </div>

        <div className={styles.buttonContainer}>
          <div id="googleSignInDiv" className={styles.googleButton}></div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            By continuing, you agree to our{" "}
            <a href="/terms" className={styles.link}>Terms of Service</a> and{" "}
            <a href="/privacy" className={styles.link}>Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.featuresSection}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🚀</div>
          <h3 className={styles.featureTitle}>Fast & Easy</h3>
          <p className={styles.featureText}>Build websites in minutes</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🎨</div>
          <h3 className={styles.featureTitle}>Beautiful Design</h3>
          <p className={styles.featureText}>Professional templates</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>⚡</div>
          <h3 className={styles.featureTitle}>AI Powered</h3>
          <p className={styles.featureText}>Smart suggestions</p>
        </div>
      </div>
    </div>
  );
}