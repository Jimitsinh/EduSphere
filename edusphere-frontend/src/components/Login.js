import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, X, Mail, Lock, EyeOff, Eye, User, ArrowLeft, Loader2, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 120;

export default function Login({ defaultSignUp = true }) {
  const [mode, setMode] = useState("email"); // "email" | "otp" | "password-login" | "password-signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { isAuthenticated, loginWithOtp, loginWithPassword, loginWithGoogle, requestOtp, register } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Email validation
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // ─── OTP INPUT HANDLERS ───
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    // Auto-focus next
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  };

  // ─── SEND OTP ───
  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await requestOtp(email);
      setMode("otp");
      setCooldown(COOLDOWN_SECONDS);

      // Dev mode: backend returns OTP in response — auto-fill the digit boxes
      if (res.otp) {
        const digits = res.otp.toString().split("").slice(0, OTP_LENGTH);
        const filledOtp = Array(OTP_LENGTH).fill("").map((_, i) => digits[i] || "");
        setOtp(filledOtp);
        setSuccess(`Your OTP is ${res.otp} (auto-filled)`);
      } else {
        setOtp(Array(OTP_LENGTH).fill(""));
        setSuccess("OTP sent to your email");
      }
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to send OTP";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── VERIFY OTP ───
  const handleVerifyOtp = async () => {
    const otpStr = otp.join("");
    if (otpStr.length !== OTP_LENGTH) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginWithOtp(email, otpStr);
      // AuthContext will set user, isAuthenticated triggers redirect
    } catch (err) {
      const msg = err.response?.data?.msg || "OTP verification failed";
      setError(msg);
      // Clear OTP on failure
      setOtp(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ─── RESEND OTP ───
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await requestOtp(email);
      setCooldown(COOLDOWN_SECONDS);

      // Dev mode: backend returns OTP in response — auto-fill the digit boxes
      if (res.otp) {
        const digits = res.otp.toString().split("").slice(0, OTP_LENGTH);
        const filledOtp = Array(OTP_LENGTH).fill("").map((_, i) => digits[i] || "");
        setOtp(filledOtp);
        setSuccess(`New OTP is ${res.otp} (auto-filled)`);
      } else {
        setOtp(Array(OTP_LENGTH).fill(""));
        setSuccess("New OTP sent to your email");
      }
      otpRefs.current[0]?.focus();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to resend OTP";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── PASSWORD LOGIN ───
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginWithPassword(email, password);
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── REGISTER ───
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(email, password, "student");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── GOOGLE LOGIN ───
  const handleGoogleLogin = useCallback(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google OAuth is not configured. Set REACT_APP_GOOGLE_CLIENT_ID in .env");
      return;
    }
    /* global google */
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true);
          setError("");
          try {
            await loginWithGoogle(response.credential);
          } catch (err) {
            setError(err.response?.data?.msg || "Google login failed");
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render button in modal
          const btnContainer = document.getElementById("google-btn-container");
          if (btnContainer) {
            btnContainer.innerHTML = "";
            window.google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              width: 340,
              text: "continue_with",
              shape: "pill",
            });
          }
        }
      });
    } else {
      setError("Google Sign-In library not loaded. Please refresh the page.");
    }
  }, [loginWithGoogle]);

  // Load Google Identity Services script
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    if (document.getElementById("google-gsi-script")) return;
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ─── SHARED STYLES ───
  const inputContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#eae5dd",
    borderRadius: "30px",
    padding: "14px 20px",
  };

  const inputStyle = {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "14px",
    color: "#1a1a1a",
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
  };

  const btnPrimaryStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "30px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    marginTop: "12px",
  };

  const formatCooldown = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ─── RENDER ───
  return (
    <div
      className="page-transition"
      style={{
        backgroundColor: "#f1ede4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 48px",
      }}
    >
      {/* Top Header Row */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1a1a1a" }}>
          <GraduationCap size={24} strokeWidth={2} />
          <span style={{ fontSize: "20px", fontWeight: "700", fontFamily: "var(--font-display)" }}>EduSphere</span>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{ color: "#7a7670", display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px" }}
        >
          <X size={20} />
        </button>
      </header>

      {/* Central Login Card */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, margin: "40px 0" }}>
        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: "480px",
            borderRadius: "48px",
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.03)",
            padding: "48px 40px",
            boxShadow: "0 10px 40px rgba(122, 118, 110, 0.06)",
            textAlign: "center",
          }}
        >
          {/* ──── EMAIL / OTP MODE ──── */}
          {(mode === "email" || mode === "otp") && (
            <>
              <h2
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  letterSpacing: "-0.02em",
                  marginBottom: "4px",
                }}
              >
                {mode === "email" ? "Welcome to EduSphere" : "Verify OTP"}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  fontFamily: "var(--font-display)",
                  marginBottom: "32px",
                }}
              >
                {mode === "email"
                  ? "Sign in with your email"
                  : `Enter the 6-digit code sent to ${email}`}
              </p>

              {/* Error / Success Messages */}
              {error && (
                <div
                  style={{
                    backgroundColor: "#fff0f0",
                    border: "1px solid #ffcccc",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    color: "#cc3333",
                    fontWeight: "500",
                  }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  style={{
                    backgroundColor: "#f0fff4",
                    border: "1px solid #bbf0c8",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    color: "#22863a",
                    fontWeight: "500",
                  }}
                >
                  {success}
                </div>
              )}

              {mode === "email" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Email Input */}
                  <div style={inputContainerStyle}>
                    <Mail size={18} style={{ color: "#7a7670" }} />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      style={inputStyle}
                      id="login-email"
                      autoFocus
                    />
                  </div>

                  {/* Send OTP Button */}
                  <button
                    type="button"
                    className="btn btn-red"
                    disabled={loading || !email}
                    onClick={handleSendOtp}
                    style={btnPrimaryStyle}
                    id="send-otp-btn"
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                        SENDING...
                      </span>
                    ) : (
                      <>
                        <Shield size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                        SEND OTP
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      margin: "8px 0",
                    }}
                  >
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#e0dbd2" }} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#a09a90", letterSpacing: "0.08em" }}>OR</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#e0dbd2" }} />
                  </div>

                  {/* Google Login */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: "30px",
                      fontSize: "12px",
                      fontWeight: "700",
                      letterSpacing: "0.04em",
                      backgroundColor: "#ffffff",
                      border: "1px solid var(--border)",
                      color: "#1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(122, 118, 110, 0.04)",
                    }}
                    id="google-login-btn"
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(122, 118, 110, 0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(122, 118, 110, 0.04)"; }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    CONTINUE WITH GOOGLE
                  </button>

                  {/* Google button fallback container */}
                  <div id="google-btn-container" style={{ display: "flex", justifyContent: "center" }}></div>

                  {/* Divider */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      margin: "4px 0",
                    }}
                  >
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#e0dbd2" }} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#a09a90", letterSpacing: "0.08em" }}>OR</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#e0dbd2" }} />
                  </div>

                  {/* Password Login Toggle */}
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
                    <span
                      onClick={() => { setMode("password-login"); setError(""); setSuccess(""); }}
                      style={{ color: "var(--primary-red)", fontWeight: "700", cursor: "pointer" }}
                    >
                      Sign in with password
                    </span>
                    {" · "}
                    <span
                      onClick={() => { setMode("password-signup"); setError(""); setSuccess(""); }}
                      style={{ color: "var(--primary-red)", fontWeight: "700", cursor: "pointer" }}
                    >
                      Create account
                    </span>
                  </div>
                </div>
              )}

              {/* ──── OTP ENTRY ──── */}
              {mode === "otp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* OTP digit boxes */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        id={`otp-digit-${i}`}
                        style={{
                          width: "48px",
                          height: "56px",
                          borderRadius: "14px",
                          border: digit ? "2px solid var(--primary-red)" : "2px solid #e0dbd2",
                          backgroundColor: digit ? "#fff8f7" : "#f8f5ef",
                          textAlign: "center",
                          fontSize: "22px",
                          fontWeight: "700",
                          fontFamily: "var(--font-body)",
                          color: "#1a1a1a",
                          outline: "none",
                          transition: "all 0.2s ease",
                          caretColor: "var(--primary-red)",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "var(--primary-red)"; e.target.style.boxShadow = "0 0 0 3px rgba(255, 90, 76, 0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = digit ? "var(--primary-red)" : "#e0dbd2"; e.target.style.boxShadow = "none"; }}
                      />
                    ))}
                  </div>

                  {/* Verify OTP Button */}
                  <button
                    type="button"
                    className="btn btn-red"
                    disabled={loading || otp.join("").length !== OTP_LENGTH}
                    onClick={handleVerifyOtp}
                    style={btnPrimaryStyle}
                    id="verify-otp-btn"
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                        VERIFYING...
                      </span>
                    ) : "VERIFY OTP"}
                  </button>

                  {/* Resend / Cooldown */}
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                    {cooldown > 0 ? (
                      <span>Resend OTP in <strong style={{ color: "var(--primary-red)" }}>{formatCooldown(cooldown)}</strong></span>
                    ) : (
                      <span
                        onClick={handleResendOtp}
                        style={{ color: "var(--primary-red)", fontWeight: "700", cursor: "pointer" }}
                        id="resend-otp-btn"
                      >
                        Resend OTP
                      </span>
                    )}
                  </div>

                  {/* Back to email */}
                  <div
                    onClick={() => { setMode("email"); setError(""); setSuccess(""); setOtp(Array(OTP_LENGTH).fill("")); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      marginTop: "4px",
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Change email</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ──── PASSWORD LOGIN ──── */}
          {mode === "password-login" && (
            <>
              <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: "4px" }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", fontStyle: "italic", fontFamily: "var(--font-display)", marginBottom: "32px" }}>
                Sign in with your password
              </p>

              {error && (
                <div style={{ backgroundColor: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "12px", padding: "10px 16px", marginBottom: "16px", fontSize: "13px", color: "#cc3333", fontWeight: "500" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={inputContainerStyle}>
                  <Mail size={18} style={{ color: "#7a7670" }} />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                </div>
                <div style={inputContainerStyle}>
                  <Lock size={18} style={{ color: "#7a7670" }} />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: "#7a7670", display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <button type="submit" className="btn btn-red" disabled={loading} style={btnPrimaryStyle}>
                  {loading ? "SIGNING IN..." : "SIGN IN"}
                </button>
              </form>
              <div style={{ marginTop: "20px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
                <span onClick={() => { setMode("email"); setError(""); }} style={{ color: "var(--primary-red)", fontWeight: "700", cursor: "pointer" }}>
                  ← Sign in with OTP
                </span>
                {" · "}
                <span onClick={() => { setMode("password-signup"); setError(""); }} style={{ color: "var(--primary-red)", fontWeight: "700", cursor: "pointer" }}>
                  Create account
                </span>
              </div>
            </>
          )}

          {/* ──── PASSWORD SIGNUP ──── */}
          {mode === "password-signup" && (
            <>
              <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: "4px" }}>
                Create Account
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", fontStyle: "italic", fontFamily: "var(--font-display)", marginBottom: "32px" }}>
                Let's get started
              </p>

              {error && (
                <div style={{ backgroundColor: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "12px", padding: "10px 16px", marginBottom: "16px", fontSize: "13px", color: "#cc3333", fontWeight: "500" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ ...inputContainerStyle, padding: "12px 18px", gap: "8px" }}>
                    <User size={16} style={{ color: "#7a7670" }} />
                    <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ ...inputStyle, fontSize: "13px" }} />
                  </div>
                  <div style={{ ...inputContainerStyle, padding: "12px 18px", gap: "8px" }}>
                    <User size={16} style={{ color: "#7a7670" }} />
                    <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ ...inputStyle, fontSize: "13px" }} />
                  </div>
                </div>
                <div style={inputContainerStyle}>
                  <Mail size={18} style={{ color: "#7a7670" }} />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                </div>
                <div style={inputContainerStyle}>
                  <Lock size={18} style={{ color: "#7a7670" }} />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: "#7a7670", display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <button type="submit" className="btn btn-red" disabled={loading} style={btnPrimaryStyle}>
                  {loading ? "CREATING..." : "CREATE ACCOUNT"}
                </button>
              </form>
              <div style={{ marginTop: "20px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
                Already have an account?{" "}
                <span onClick={() => { setMode("email"); setError(""); }} style={{ color: "var(--primary-red)", fontWeight: "700", cursor: "pointer" }}>
                  Sign in
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Row */}
      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0, 0, 0, 0.04)", paddingTop: "16px" }}>
        <div style={{ width: "36px", height: "2px", backgroundColor: "var(--primary-red)" }}></div>
        <span style={{ fontSize: "10px", fontWeight: "700", color: "#a09a90", letterSpacing: "0.05em" }}>
          EST. MMXXIV
        </span>
      </footer>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .page-transition { padding: 16px 20px !important; }
          .card { padding: 32px 24px !important; border-radius: 32px !important; }
        }
      `}</style>
    </div>
  );
}