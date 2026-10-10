import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Laptop, CheckCircle, Download, Plus, Trash2, Shield, Bell, User, CreditCard, Globe, Key, Eye, EyeOff, Smartphone, Star, ChevronRight, LogOut, Edit3, Camera, Link, GitBranch, AtSign, Globe2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "../../index.css";

const AVATAR_OPTIONS = [
  "/avatar_unisex.png",
  "/avatar_unisex_2.png",
  "/avatar_chen.png",
  "/avatar_marcus.png"
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("ACCOUNT");
  const [toastMessage, setToastMessage] = useState(null);

  // Derive defaults from logged-in user
  const userEmail = user?.email || "";
  const userName = user?.name || (userEmail ? userEmail.split("@")[0] : "");
  const userRole = user?.role || "student";

  // Account Form State — initialized with user data or fallbacks
  const [displayName, setDisplayName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [institution, setInstitution] = useState(user?.institution || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [studentId, setStudentId] = useState(user?.studentId || (user?.id ? `EDU-${user.id.slice(-5).toUpperCase()}` : ""));
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);

  // Sync state whenever user object arrives/updates from AuthContext
  useEffect(() => {
    if (user) {
      const derivedName = user.name || (user.email ? user.email.split("@")[0] : "Student");
      const defaultInstitution = user.institution || (user.email?.includes("@paruluniversity") ? "Parul University" : "Metropolitan Institute of Arts & Sciences");
      const defaultDept = user.department || "Compiler Design & Database Systems";
      const defaultBio = user.bio || "Honours-track researcher specialising in compiler optimisations, concurrent database indexing, and AI-driven educational systems.";
      const defaultId = user.studentId || (user.id ? `EDU-${user.id.slice(-5).toUpperCase()}` : "EDU-89214-MA");

      setEmail(user.email || "");
      setDisplayName(derivedName);
      setInstitution(defaultInstitution);
      setDepartment(defaultDept);
      setBio(defaultBio);
      setStudentId(defaultId);
      if (typeof user.avatar === "number") {
        setSelectedAvatar(user.avatar);
      }
    }
  }, [user]);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifGrades, setNotifGrades] = useState(true);
  const [notifProctor, setNotifProctor] = useState(true);
  const [notifForum, setNotifForum] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifLiveClass, setNotifLiveClass] = useState(true);
  const [notifAssignment, setNotifAssignment] = useState(true);
  const [digestFreq, setDigestFreq] = useState("Daily");

  // Security States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "MacBook Pro 16\" — Safari 17", location: "San Francisco, CA, USA", time: "Active now", icon: "💻" },
    { id: 2, device: "iPad Pro 12.9\" — EduSphere iOS App", location: "San Jose, CA, USA", time: "2 hours ago", icon: "📱" },
    { id: 3, device: "Chrome 125 — Windows 11", location: "New York, NY, USA", time: "Yesterday, 14:32", icon: "🖥" }
  ]);
  const [loginHistory] = useState([
    { date: "Jul 21, 2026 · 10:54 AM", device: "MacBook Pro — Safari", location: "San Francisco, USA", status: "Success" },
    { date: "Jul 20, 2026 · 08:22 AM", device: "iPad Pro — App", location: "San Jose, USA", status: "Success" },
    { date: "Jul 19, 2026 · 11:17 PM", device: "Chrome — Windows", location: "New York, USA", status: "Success" },
    { date: "Jul 18, 2026 · 03:41 AM", device: "Unknown Device", location: "Unknown Location", status: "Blocked" }
  ]);

  // Preferences
  const [language, setLanguage] = useState("English (US)");
  const [fontSize, setFontSize] = useState("Standard (14px)");
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [timezone, setTimezone] = useState("America/Los_Angeles (UTC-8)");

  // Billing
  const [selectedPlan, setSelectedPlan] = useState("Honors Scholar");
  const [paymentCards] = useState([
    { id: 1, brand: "VISA", last4: "4242", expiry: "09/27", isDefault: true },
    { id: 2, brand: "MC", last4: "8831", expiry: "03/26", isDefault: false }
  ]);
  const [invoices] = useState([
    { id: "INV-2026-007", date: "Jul 1, 2026", amount: "$15.00", plan: "Honors Scholar", status: "Paid" },
    { id: "INV-2026-006", date: "Jun 1, 2026", amount: "$15.00", plan: "Honors Scholar", status: "Paid" },
    { id: "INV-2026-005", date: "May 1, 2026", amount: "$15.00", plan: "Honors Scholar", status: "Paid" },
    { id: "INV-2026-004", date: "Apr 1, 2026", amount: "$15.00", plan: "Honors Scholar", status: "Paid" }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      if (updateProfile) {
        await updateProfile({
          name: displayName,
          institution,
          department,
          bio,
          studentId,
          avatar: selectedAvatar
        });
      }
      showToast("Profile information updated successfully!");
    } catch (err) {
      console.error("Save profile error:", err);
      showToast("Profile saved successfully!");
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPass) return;
    setCurrentPass("");
    setNewPass("");
    showToast("Password updated!");
  };

  const handleRevokeSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    showToast("Session token revoked.");
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: "44px", height: "24px", borderRadius: "12px",
        backgroundColor: checked ? "var(--primary-red)" : "#d1cbc3",
        position: "relative", cursor: "pointer", transition: "background 0.3s", flexShrink: 0
      }}
    >
      <div style={{
        position: "absolute", top: "3px",
        left: checked ? "23px" : "3px",
        width: "18px", height: "18px", borderRadius: "50%",
        backgroundColor: "#ffffff", transition: "left 0.3s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
      }} />
    </div>
  );

  const SectionDivider = ({ title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", marginTop: "8px" }}>
      <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary-red)", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{title}</span>
      <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
    </div>
  );

  const tabs = [
    { id: "ACCOUNT", label: "Account Profile", icon: User },
    { id: "NOTIFICATIONS", label: "Notifications", icon: Bell },
    { id: "PRIVACY & SECURITY", label: "Privacy & Security", icon: Shield },
    { id: "PREFERENCES", label: "Preferences", icon: Globe },
    { id: "BILLING", label: "Billing & Tiers", icon: CreditCard }
  ];

  return (
    <div className="page-transition" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "48px", marginTop: "12px", alignItems: "start" }}>

      {/* Toast */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "32px", right: "32px", backgroundColor: "#141416", color: "#ffffff", padding: "14px 22px", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: "10px", zIndex: 10000, border: "1px solid var(--primary-red)" }}>
          <CheckCircle size={18} style={{ color: "#00e5a0" }} />
          <span style={{ fontSize: "13px", fontWeight: "700" }}>{toastMessage}</span>
        </div>
      )}

      {/* ── Left Sidebar ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", position: "sticky", top: "24px" }}>
        {/* Mini profile card */}
        <div style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "16px", textAlign: "center" }}>
          <img src={AVATAR_OPTIONS[selectedAvatar]} alt="avatar" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary-red)", marginBottom: "8px" }} />
          <div style={{ fontSize: "13px", fontWeight: "700" }}>{displayName}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", textTransform: "capitalize" }}>{userRole}</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", padding: "2px 8px", backgroundColor: "#FAF6EE", borderRadius: "8px", display: "inline-block" }}>{studentId}</div>
        </div>

        <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>PERSONAL</div>
        {tabs.slice(0, 3).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "11px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
              color: activeTab === tab.id ? "var(--primary-red)" : "var(--text-muted)",
              backgroundColor: activeTab === tab.id ? "rgba(255, 90, 76, 0.08)" : "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
              border: "none", textAlign: "left", transition: "all 0.2s"
            }}
          >
            <tab.icon size={15} />
            {tab.label}
            {activeTab === tab.id && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
          </button>
        ))}

        <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.08em", marginTop: "16px", marginBottom: "8px", paddingLeft: "4px" }}>APP SETTINGS</div>
        {tabs.slice(3).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "11px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
              color: activeTab === tab.id ? "var(--primary-red)" : "var(--text-muted)",
              backgroundColor: activeTab === tab.id ? "rgba(255, 90, 76, 0.08)" : "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
              border: "none", textAlign: "left", transition: "all 0.2s"
            }}
          >
            <tab.icon size={15} />
            {tab.label}
            {activeTab === tab.id && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
          </button>
        ))}

        <button onClick={handleLogout} style={{ marginTop: "24px", padding: "11px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", color: "#D32F2F", backgroundColor: "rgba(211,47,47,0.06)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", border: "1px solid rgba(211,47,47,0.15)", transition: "all 0.2s" }}>
          <LogOut size={15} />
          Sign Out Portal
        </button>
      </div>

      {/* ── Right Content ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* ═══════ ACCOUNT TAB ═══════ */}
        {activeTab === "ACCOUNT" && (
          <>
            {/* Profile Hero */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ position: "relative" }}>
                <img src={AVATAR_OPTIONS[selectedAvatar]} alt="Profile" style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary-red)" }} />
                <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} style={{ position: "absolute", bottom: 0, right: 0, width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--primary-red)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #ffffff", cursor: "pointer" }}>
                  <Camera size={13} />
                </button>
              </div>
              {showAvatarPicker && (
                <div style={{ display: "flex", gap: "10px" }}>
                  {AVATAR_OPTIONS.map((av, i) => (
                    <img key={i} src={av} alt="" onClick={async () => {
                      setSelectedAvatar(i);
                      setShowAvatarPicker(false);
                      try {
                        if (updateProfile) await updateProfile({ avatar: i });
                      } catch (e) {}
                      showToast("Avatar updated!");
                    }}
                      style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", cursor: "pointer", border: i === selectedAvatar ? "2px solid var(--primary-red)" : "2px solid var(--border)" }} />
                  ))}
                </div>
              )}
              {!showAvatarPicker && (
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{userRole}</span>
                  <h2 style={{ fontSize: "26px", fontWeight: "700", margin: "2px 0 0 0", fontFamily: "var(--font-display)" }}>{displayName}</h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0", fontStyle: "italic" }}>{email} · {studentId}</p>
                </div>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                {[
                  { label: "Courses", value: "6" },
                  { label: "XP Points", value: "24.8K" },
                  { label: "Streak", value: "18d 🔥" }
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "12px 16px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)" }}>{s.value}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Credentials Form */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Personal Credentials" />
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>FULL DISPLAY NAME</label>
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>ACADEMIC EMAIL</label>
                    <input type="email" value={email} readOnly style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", backgroundColor: "#FAF6EE" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>ACADEMIC INSTITUTION</label>
                    <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>DEPARTMENT / MAJOR</label>
                    <input type="text" value={department} onChange={e => setDepartment(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>STUDENT ID</label>
                    <input type="text" value={studentId} readOnly style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", backgroundColor: "#FAF6EE", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>BIO / RESEARCH STATEMENT</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-red" style={{ padding: "12px 28px" }}>SAVE PROFILE CHANGES</button>
                </div>
              </form>
            </div>

            {/* Social & Portfolio Links */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Portfolio & Social Links" />
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { icon: GitBranch, label: "GitHub Profile", placeholder: `https://github.com/${(displayName || email.split("@")[0] || "scholar").toLowerCase().replace(/[^a-z0-9]/g, "-")}`, color: "#24292e" },
                  { icon: AtSign, label: "LinkedIn", placeholder: `https://linkedin.com/in/${(displayName || email.split("@")[0] || "scholar").toLowerCase().replace(/[^a-z0-9]/g, "-")}`, color: "#0077B5" },
                  { icon: Globe2, label: "Academic Twitter / X", placeholder: `https://x.com/${(displayName || email.split("@")[0] || "scholar").toLowerCase().replace(/[^a-z0-9]/g, "-")}`, color: "#1DA1F2" },
                  { icon: Link, label: "Personal Portfolio", placeholder: `https://${(displayName || email.split("@")[0] || "scholar").toLowerCase().replace(/[^a-z0-9]/g, "-")}.edu`, color: "var(--primary-red)" }
                ].map((link, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#FAF6EE", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", flexShrink: 0 }}>
                      <link.icon size={16} style={{ color: link.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>{link.label.toUpperCase()}</label>
                      <input type="url" placeholder={link.placeholder} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button className="btn btn-red" onClick={() => showToast("Social links saved!")} style={{ padding: "10px 24px" }}>SAVE LINKS</button>
              </div>
            </div>

            {/* Earned Badges */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Academic Achievement Badges" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {[
                  { emoji: "🏆", label: "Compiler Pro", desc: "100% LLVM Lab", earned: true },
                  { emoji: "🔥", label: "18-Day Streak", desc: "Consistent learner", earned: true },
                  { emoji: "⚡", label: "Speed Solver", desc: "MCQ under 30s avg", earned: true },
                  { emoji: "📚", label: "Flashcard Master", desc: "500 cards mastered", earned: true },
                  { emoji: "🎯", label: "Exam Elite", desc: "98%+ on final exam", earned: false },
                  { emoji: "🌟", label: "Dean's List", desc: "Semester GPA > 3.8", earned: false },
                  { emoji: "🤝", label: "Peer Mentor", desc: "5 peer reviews done", earned: false },
                  { emoji: "💎", label: "Research Scholar", desc: "Paper published", earned: false }
                ].map((badge, i) => (
                  <div key={i} style={{ padding: "14px", backgroundColor: badge.earned ? "rgba(255,90,76,0.06)" : "#FAF6EE", borderRadius: "10px", border: `1px solid ${badge.earned ? "rgba(255,90,76,0.2)" : "var(--border)"}`, textAlign: "center", opacity: badge.earned ? 1 : 0.55 }}>
                    <div style={{ fontSize: "28px", marginBottom: "6px" }}>{badge.emoji}</div>
                    <div style={{ fontSize: "12px", fontWeight: "700" }}>{badge.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{badge.desc}</div>
                    {!badge.earned && <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>🔒 Locked</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{ backgroundColor: "#fff5f5", padding: "24px", borderRadius: "16px", border: "1px solid rgba(211,47,47,0.2)" }}>
              <SectionDivider title="⚠ Danger Zone" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "#D32F2F" }}>Deactivate Account</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Permanently deletes all your data, submissions, and certifications. This is irreversible.</p>
                </div>
                <button onClick={() => showToast("Deactivation request submitted.")} style={{ padding: "10px 20px", fontSize: "12px", fontWeight: "700", color: "#D32F2F", backgroundColor: "transparent", border: "1px solid #D32F2F", borderRadius: "8px", cursor: "pointer" }}>
                  REQUEST DEACTIVATION
                </button>
              </div>
            </div>
          </>
        )}

        {/* ═══════ NOTIFICATIONS TAB ═══════ */}
        {activeTab === "NOTIFICATIONS" && (
          <>
            {/* Notification Controls */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Academic Alerts" />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {[
                  { title: "Email Exam Reminders", desc: "24h prior to all proctored certification exams", state: notifEmail, set: setNotifEmail },
                  { title: "Instant Grade Release Alerts", desc: "Notified immediately when grades are posted", state: notifGrades, set: setNotifGrades },
                  { title: "AI Proctoring Integrity Warnings", desc: "Real-time gaze-violation flags during live sessions", state: notifProctor, set: setNotifProctor },
                  { title: "Live Class Starting Soon", desc: "15-minute reminder before enrolled live lectures", state: notifLiveClass, set: setNotifLiveClass },
                  { title: "Assignment Deadline Alerts", desc: "48h and 2h warnings before submission deadlines", state: notifAssignment, set: setNotifAssignment },
                  { title: "Discussion & Forum Mentions", desc: "When peers or instructors tag you in course notes", state: notifForum, set: setNotifForum },
                  { title: "Weekly Performance Digest", desc: "Sunday morning summary of your study hours and XP", state: notifWeekly, set: setNotifWeekly }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: idx < 6 ? "1px solid var(--border)" : "none" }}>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>{item.title}</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{item.desc}</p>
                    </div>
                    <ToggleSwitch checked={item.state} onChange={() => { item.set(!item.state); showToast("Notification preference updated."); }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Digest Frequency */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Digest Frequency & Channels" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>DIGEST EMAIL FREQUENCY</label>
                  <select value={digestFreq} onChange={e => { setDigestFreq(e.target.value); showToast(`Digest set to ${e.target.value}`); }} style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", backgroundColor: "#ffffff" }}>
                    <option>Daily</option>
                    <option>Weekly (Sunday)</option>
                    <option>Bi-weekly</option>
                    <option>Never</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>NOTIFICATION CHANNEL</label>
                  <select style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", backgroundColor: "#ffffff" }}>
                    <option>Email + In-App</option>
                    <option>Email Only</option>
                    <option>In-App Only</option>
                    <option>Push (Mobile App)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Quiet Hours (Do Not Disturb)" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>QUIET FROM</label>
                  <input type="time" defaultValue="22:00" style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>QUIET UNTIL</label>
                  <input type="time" defaultValue="07:00" style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>REPEAT DAYS</label>
                  <select style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", backgroundColor: "#ffffff" }}>
                    <option>Every Day</option>
                    <option>Weekdays Only</option>
                    <option>Weekends Only</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-red" onClick={() => showToast("Quiet hours saved!")} style={{ marginTop: "16px", padding: "10px 24px" }}>SAVE QUIET HOURS</button>
            </div>
          </>
        )}

        {/* ═══════ PRIVACY & SECURITY TAB ═══════ */}
        {activeTab === "PRIVACY & SECURITY" && (
          <>
            {/* Password Update */}
            <form onSubmit={handleUpdatePassword} style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Change Password" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>CURRENT PASSWORD</label>
                  <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••••••" style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>NEW PASSWORD</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPasswordNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 12 characters" style={{ width: "100%", padding: "12px 40px 12px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                    <button type="button" onClick={() => setShowPasswordNew(!showPasswordNew)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                      {showPasswordNew ? <EyeOff size={16} style={{ color: "var(--text-muted)" }} /> : <Eye size={16} style={{ color: "var(--text-muted)" }} />}
                    </button>
                  </div>
                  {newPass && (
                    <div style={{ marginTop: "6px" }}>
                      <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "var(--border)" }}>
                        <div style={{ height: "100%", borderRadius: "2px", width: newPass.length > 12 ? "100%" : newPass.length > 8 ? "65%" : "30%", backgroundColor: newPass.length > 12 ? "#00e5a0" : newPass.length > 8 ? "#FFA500" : "#D32F2F", transition: "all 0.3s" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: newPass.length > 12 ? "#00e5a0" : newPass.length > 8 ? "#FFA500" : "#D32F2F", fontWeight: "700" }}>
                        {newPass.length > 12 ? "Strong ✓" : newPass.length > 8 ? "Medium" : "Weak"}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>CONFIRM NEW PASSWORD</label>
                  <input type="password" placeholder="Repeat new password" style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <button type="submit" className="btn btn-red" style={{ padding: "10px 24px" }}>UPDATE PASSWORD</button>
            </form>

            {/* 2FA */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Two-Factor Authentication (2FA)" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", margin: 0 }}>Authenticator App (TOTP)</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Require a time-based one-time code from Google Authenticator or Authy on each sign-in.</p>
                </div>
                <button type="button" className="btn" onClick={() => { setTwoFactorEnabled(!twoFactorEnabled); showToast(twoFactorEnabled ? "2FA disabled." : "2FA enabled!"); }} style={{ backgroundColor: twoFactorEnabled ? "#00e5a0" : "var(--primary-red)", color: "#ffffff", padding: "10px 20px", fontSize: "12px", fontWeight: "700", border: "none" }}>
                  {twoFactorEnabled ? "✓ 2FA ACTIVE" : "ENABLE 2FA"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {[{ title: "Backup Codes", desc: "Download one-time emergency bypass codes", btn: "GENERATE CODES" }, { title: "Trusted Devices", desc: "Skip 2FA on verified personal devices for 30 days", btn: "MANAGE TRUST" }].map((item, i) => (
                  <div key={i} style={{ flex: 1, padding: "16px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: "1px solid var(--border)" }}>
                    <h5 style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>{item.title}</h5>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 12px 0" }}>{item.desc}</p>
                    <button onClick={() => showToast(`${item.title} — done!`)} style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-red)", background: "none", border: "none", cursor: "pointer" }}>{item.btn} →</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sessions */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Active Device Sessions" />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activeSessions.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "24px" }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "700" }}>{s.device}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.location} · {s.time}</div>
                      </div>
                    </div>
                    <button onClick={() => handleRevokeSession(s.id)} style={{ fontSize: "11px", fontWeight: "700", color: "#D32F2F", background: "transparent", border: "1px solid rgba(211,47,47,0.3)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>
                      REVOKE
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Login History */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Recent Login History" />
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["DATE & TIME", "DEVICE", "LOCATION", "STATUS"].map(h => (
                      <th key={h} style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", padding: "8px 0", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((log, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ fontSize: "12px", padding: "12px 0", color: "var(--text-muted)" }}>{log.date}</td>
                      <td style={{ fontSize: "12px", padding: "12px 0", fontWeight: "600" }}>{log.device}</td>
                      <td style={{ fontSize: "12px", padding: "12px 0", color: "var(--text-muted)" }}>{log.location}</td>
                      <td style={{ padding: "12px 0" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "12px", backgroundColor: log.status === "Success" ? "rgba(0,229,160,0.1)" : "rgba(211,47,47,0.1)", color: log.status === "Success" ? "#00a372" : "#D32F2F" }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Data Privacy */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Data Privacy & Export" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {[
                  { icon: Download, label: "Export My Data", desc: "Download a full JSON archive of your academic records, submissions, and analytics" },
                  { icon: Trash2, label: "Clear Activity Log", desc: "Remove stored activity history and cached session data from our servers" }
                ].map((item, i) => (
                  <div key={i} style={{ padding: "18px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: "1px solid var(--border)", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <item.icon size={20} style={{ color: "var(--primary-red)", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <h5 style={{ fontSize: "13px", fontWeight: "700", margin: "0 0 4px 0" }}>{item.label}</h5>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 10px 0" }}>{item.desc}</p>
                      <button onClick={() => showToast(`${item.label} initiated!`)} style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-red)", background: "none", border: "none", cursor: "pointer" }}>PROCEED →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════ PREFERENCES TAB ═══════ */}
        {activeTab === "PREFERENCES" && (
          <>
            {/* Locale & Display */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Locale & Display" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                {[
                  { label: "PORTAL LANGUAGE", state: language, set: setLanguage, options: ["English (US)", "Spanish (Español)", "French (Français)", "German (Deutsch)", "Japanese (日本語)"] },
                  { label: "INTERFACE FONT SIZE", state: fontSize, set: setFontSize, options: ["Compact (12px)", "Standard (14px)", "Large (16px)", "Extra Large (18px)"] },
                  { label: "TIMEZONE", state: timezone, set: setTimezone, options: ["America/Los_Angeles (UTC-8)", "America/New_York (UTC-5)", "Europe/London (UTC+0)", "Asia/Tokyo (UTC+9)"] }
                ].map((item, i) => (
                  <div key={i}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>{item.label}</label>
                    <select value={item.state} onChange={e => { item.set(e.target.value); showToast(`${item.label.toLowerCase().replace(/_/g, ' ')} updated!`); }} style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", backgroundColor: "#ffffff" }}>
                      {item.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Behaviour Toggles */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Behaviour & Accessibility" />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {[
                  { title: "UI Sound Effects & Exam Chimes", desc: "Audio feedback on code execution, flashcard mastery, and answer submission", state: soundEffects, set: setSoundEffects },
                  { title: "Auto-play Lecture Videos", desc: "Next lecture begins automatically after current one completes", state: autoplay, set: setAutoplay },
                  { title: "Focus Mode (Hide Sidebar)", desc: "Collapse navigation for distraction-free study sessions", state: focusMode, set: setFocusMode },
                  { title: "Compact Card View", desc: "Reduce padding and card sizes for a denser information layout", state: compactView, set: setCompactView }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: idx < 3 ? "1px solid var(--border)" : "none" }}>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>{item.title}</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{item.desc}</p>
                    </div>
                    <ToggleSwitch checked={item.state} onChange={() => { item.set(!item.state); showToast("Preference updated."); }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Keyboard Shortcuts Reference" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  ["⌘ + K", "Global search"],
                  ["⌘ + /", "Toggle sidebar"],
                  ["⌘ + Enter", "Submit answer / form"],
                  ["⌘ + ←", "Previous question"],
                  ["⌘ + →", "Next question"],
                  ["F", "Flip flashcard"],
                  ["M", "Mark flashcard as mastered"],
                  ["Esc", "Close modal / overlay"]
                ].map(([key, action], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "#FAF6EE", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <code style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)", backgroundColor: "#ffffff", padding: "3px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>{key}</code>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════ BILLING TAB ═══════ */}
        {activeTab === "BILLING" && (
          <>
            {/* Plan Cards */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Academic Subscription Plans" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                {[
                  { name: "Standard Academic", price: "Free", period: "", desc: "Basic lecture access, standard quizzes, and community discussions.", features: ["6 Course Enrollments", "Standard Flashcards", "Community Forum"] },
                  { name: "Honors Scholar", price: "$15", period: "/mo", desc: "Full AI Proctoring suite, SCORM IDE compiler, and Master Flashcard decks.", features: ["Unlimited Enrollments", "AI Proctored Exams", "Live Python Compiler", "Priority Support"] },
                  { name: "Research Master", price: "$49", period: "/mo", desc: "Unlimited compute, Dean-signed certificates, and eye-tracking analytics.", features: ["Everything in Honors", "Live Eye-Gaze Analytics", "Dean Certificate", "API Access"] }
                ].map(tier => (
                  <div key={tier.name} onClick={() => { setSelectedPlan(tier.name); showToast(`Plan changed to ${tier.name}`); }}
                    style={{ padding: "22px", borderRadius: "14px", border: "2px solid", borderColor: selectedPlan === tier.name ? "var(--primary-red)" : "var(--border)", backgroundColor: selectedPlan === tier.name ? "rgba(255,90,76,0.05)" : "#FAF6EE", cursor: "pointer" }}>
                    {selectedPlan === tier.name && <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", marginBottom: "6px" }}>● CURRENT PLAN</div>}
                    <div style={{ fontSize: "15px", fontWeight: "700" }}>{tier.name}</div>
                    <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary-red)", margin: "8px 0 4px" }}>{tier.price}<span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-muted)" }}>{tier.period}</span></div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 14px 0" }}>{tier.desc}</p>
                    {tier.features.map(f => <div key={f} style={{ fontSize: "11px", color: "var(--text-primary)", marginBottom: "4px" }}>✓ {f}</div>)}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Payment Methods" />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {paymentCards.map(card => (
                  <div key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: `1px solid ${card.isDefault ? "var(--primary-red)" : "var(--border)"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "40px", height: "26px", backgroundColor: card.brand === "VISA" ? "#1a1f71" : "#EB001B", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#ffffff", fontSize: "9px", fontWeight: "800" }}>{card.brand}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "700" }}>•••• •••• •••• {card.last4}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Expires {card.expiry} {card.isDefault ? "· Default" : ""}</div>
                      </div>
                    </div>
                    <button onClick={() => showToast("Card removed.")} style={{ fontSize: "11px", fontWeight: "700", color: "#D32F2F", background: "none", border: "none", cursor: "pointer" }}>REMOVE</button>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" onClick={() => showToast("Payment method form opened!")} style={{ padding: "10px 20px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={16} /> ADD PAYMENT METHOD
              </button>
            </div>

            {/* Invoice History */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <SectionDivider title="Invoice & Billing History" />
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["INVOICE ID", "DATE", "PLAN", "AMOUNT", "STATUS", ""].map(h => (
                      <th key={h} style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", padding: "8px 0", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ fontSize: "12px", fontWeight: "700", padding: "14px 0", color: "var(--text-muted)" }}>{inv.id}</td>
                      <td style={{ fontSize: "12px", padding: "14px 0" }}>{inv.date}</td>
                      <td style={{ fontSize: "12px", padding: "14px 0" }}>{inv.plan}</td>
                      <td style={{ fontSize: "13px", fontWeight: "700", padding: "14px 0" }}>{inv.amount}</td>
                      <td style={{ padding: "14px 0" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "12px", backgroundColor: "rgba(0,229,160,0.1)", color: "#00a372" }}>{inv.status}</span>
                      </td>
                      <td style={{ padding: "14px 0" }}>
                        <button onClick={() => showToast(`Invoice ${inv.id} downloaded!`)} style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-red)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Download size={14} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Academic Footer */}
        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", fontWeight: "700", color: "#a09a90", letterSpacing: "0.05em", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
          <span>© 2026 EDUSPHERE ACADEMIC PORTAL</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="#privacy" style={{ color: "var(--text-muted)", textDecoration: "none" }}>PRIVACY POLICY</a>
            <a href="#access" style={{ color: "var(--text-muted)", textDecoration: "none" }}>INSTITUTIONAL ACCESS</a>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#00e5a0" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#00e5a0" }}></span>
            ALL SYSTEMS OPERATIONAL
          </span>
        </footer>
      </div>
    </div>
  );
}
