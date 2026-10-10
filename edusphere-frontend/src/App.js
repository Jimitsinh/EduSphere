import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Proctoring from "./components/Proctoring";
import AppShell from "./components/layout/AppShell";
import MyCourses from "./components/pages/MyCourses";
import LiveClasses from "./components/pages/LiveClasses";
import Assignments from "./components/pages/Assignments";
import Exams from "./components/pages/Exams";
import Analytics from "./components/pages/Analytics";
import Settings from "./components/pages/Settings";
import LiveClassRoom from "./components/LiveClassRoom";

// Global response interceptor to handle invalid/expired tokens (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/" && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * RequireAuth – redirects to login if not authenticated.
 * While auth is loading (checking token on refresh), shows nothing to avoid flicker.
 */
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

/**
 * RequireRole – checks if the user's role is in the allowed list.
 * Falls back to /dashboard if unauthorized.
 */
function RequireRole({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/**
 * RedirectIfAuth – sends authenticated users to dashboard.
 */
function RedirectIfAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

/**
 * Simple loading screen to avoid flicker during auth check.
 */
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1ede4",
        fontFamily: "var(--font-display)",
        color: "var(--text-muted)",
        fontSize: "16px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e0dbd2",
            borderTopColor: "var(--primary-red)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        Loading...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes – redirect to dashboard if already logged in */}
          <Route path="/" element={<RedirectIfAuth><Login defaultSignUp={true} /></RedirectIfAuth>} />
          <Route path="/signup" element={<RedirectIfAuth><Login defaultSignUp={true} /></RedirectIfAuth>} />
          <Route path="/login" element={<RedirectIfAuth><Login defaultSignUp={false} /></RedirectIfAuth>} />

          {/* Authenticated routes – wrapped in AppShell */}
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            {/* All roles can access these */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route path="/live" element={<LiveClasses />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/settings" element={<Settings />} />

            {/* Analytics – available to all but content varies by role in the component */}
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          {/* Standalone Live Classroom Page */}
          <Route
            path="/live-class/:meetingId"
            element={
              <RequireAuth>
                <LiveClassRoom />
              </RequireAuth>
            }
          />

          {/* Proctoring – standalone auth-required page */}
          <Route
            path="/exam"
            element={
              <RequireAuth>
                <Proctoring />
              </RequireAuth>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}