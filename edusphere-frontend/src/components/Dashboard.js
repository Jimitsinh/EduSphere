import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { 
  Flame, 
  Award, 
  Video, 
  CheckCircle, 
  MoreVertical, 
  Code, 
  Database,
  Calendar,
  Shield,
  Clock,
  CheckSquare,
  Plus,
  Trash2,
  TrendingUp,
  Brain,
  Sliders,
  UserCheck,
  BarChart2,
  Volume2
} from "lucide-react";
import "../index.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);

  // Gamified XP Claim state
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("student_xp") || "2450"));
  const [streak, setStreak] = useState(12);

  // Interactive To-Do List States (Persisted via localStorage)
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("dashboard_todos");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Revise Lexical Analysis for Compiler Design", completed: false },
      { id: 2, text: "Read Chapter 4: Paging in Operating Systems", completed: true },
      { id: 3, text: "Prepare notes for Advanced Macroeconomics IV", completed: false }
    ];
  });
  const [newTodoText, setNewTodoText] = useState("");

  // Save To-dos on update
  useEffect(() => {
    localStorage.setItem("dashboard_todos", JSON.stringify(todos));
  }, [todos]);

  // Fetch Exams from local API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5050/api/exams", {
          headers: { "x-auth-token": token }
        });
        setExams(res.data);
      } catch (err) {
        console.error("Failed to fetch exams in dashboard:", err);
      } finally {
        setExamsLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleStartExam = (examId) => {
    navigate(`/exam?id=${examId}`);
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setTodos([
      ...todos,
      { id: Date.now(), text: newTodoText.trim(), completed: false }
    ]);
    setNewTodoText("");
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const claimDailyStreakBonus = () => {
    if (localStorage.getItem("xp_claimed_today") === "true") {
      alert("You have already claimed today's XP reward! Come back tomorrow.");
      return;
    }
    const newXp = xp + 150;
    setXp(newXp);
    localStorage.setItem("student_xp", newXp.toString());
    localStorage.setItem("xp_claimed_today", "true");
    alert("🎉 150 XP claimed! Your learning streak is active.");
  };

  // Find the primary exam
  const mainExam = exams.find(e => e.title === "Advanced Macroeconomics IV") || exams[0];

  // Dummy calendar contribution grid data (Level 0 to 3)
  const contributionGrid = [
    2, 1, 0, 3, 2, 1, 1,
    0, 2, 1, 0, 0, 3, 2,
    1, 2, 2, 1, 0, 1, 3,
    2, 1, 0, 1, 2, 0, 2,
    3, 1, 2, 0, 1, 1, 2,
    1, 0, 3, 2, 1, 2, 3
  ];

  const getDotColor = (level) => {
    if (level === 3) return "var(--primary-red)";
    if (level === 2) return "var(--accent-wood)";
    if (level === 1) return "#d8d0c3";
    return "#eae5dd"; // empty
  };

  // Weekly study hours data
  const studyHours = [
    { day: "Mon", hrs: 4.5, pct: 45 },
    { day: "Tue", hrs: 6.2, pct: 62 },
    { day: "Wed", hrs: 3.8, pct: 38 },
    { day: "Thu", hrs: 8.0, pct: 80 },
    { day: "Fri", hrs: 5.5, pct: 55 }
  ];

  return (
    <div className="page-transition" style={{ height: "calc(100vh - 118px)", overflowY: "auto", paddingRight: "8px" }}>
      {/* Dashboard Grid */}
      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1.7fr 1.1fr", gap: "24px" }}>
        
        {/* Left Column: Main Dashboard Content */}
        <div className="dashboard-main" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Greeting Header Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 className="page-title" style={{ fontSize: "32px", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>
                Welcome back, {user?.name || (user?.email ? user.email.split('@')[0] : 'Scholar')}! 👋
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                Role: <strong style={{ textTransform: "capitalize", color: "var(--primary-red)" }}>{user?.role || "student"}</strong> · You have {todos.filter(t => !t.completed).length} pending tasks and {exams.filter(e => e.status === "Available").length} active assessments.
              </p>
            </div>

            {/* Streak & XP Badges */}
            <div style={{ display: "flex", gap: "12px" }}>
              <div 
                onClick={claimDailyStreakBonus}
                className="badge-pill" 
                style={{ 
                  backgroundColor: "#fdf1f1", 
                  border: "1px solid var(--border)", 
                  padding: "10px 18px", 
                  borderRadius: "999px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(232, 99, 88, 0.1)"
                }}
              >
                <Flame size={16} style={{ color: "var(--primary-red)" }} fill="currentColor" />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>{streak} Day Streak (Claim)</span>
              </div>
              <div className="badge-pill" style={{ backgroundColor: "#f6f3ed", border: "1px solid var(--border)", padding: "10px 18px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={16} style={{ color: "var(--accent-wood)" }} />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>{xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          {/* Core Curriculum Exam Card */}
          {examsLoading ? (
            <div className="card" style={{ padding: "32px", minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Loading active certifications...</span>
            </div>
          ) : mainExam ? (
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px", position: "relative", minHeight: "220px", background: "linear-gradient(135deg, #fbfaf8 0%, #f2ece4 100%)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", backgroundColor: "rgba(232, 99, 88, 0.1)", color: "var(--primary-red)", fontSize: "9px", fontWeight: "700", borderRadius: "4px", letterSpacing: "0.05em", marginBottom: "16px" }}>
                    ● AVAILABLE NOW (PROCTORED)
                  </span>

                  <h2 style={{ fontSize: "32px", fontWeight: "700", lineHeight: "1.1", marginBottom: "6px", fontFamily: "var(--font-display)" }}>
                    {mainExam.title}
                  </h2>
                  
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                    {mainExam.courseName} • Duration: {mainExam.durationMins} Mins • 10 Marks
                  </p>
                </div>

                <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Shield size={14} style={{ color: "var(--primary-red)" }} />
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>AI Face & Eye Proctor</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={14} style={{ color: "var(--accent-wood)" }} />
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>Strict Limit</span>
                  </div>
                </div>
              </div>

              {mainExam.status === "Completed" ? (
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#2ecc71", display: "block", marginBottom: "8px" }}>✓ COMPLETED</span>
                  <Link to="/exams" className="btn btn-outline" style={{ padding: "10px 20px" }}>Exams Log</Link>
                </div>
              ) : mainExam.status === "Locked" ? (
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary-red)", display: "block", marginBottom: "8px" }}>🔒 LOCKED OUT</span>
                  <Link to="/exams" className="btn btn-outline" style={{ padding: "10px 20px" }}>Request Reset</Link>
                </div>
              ) : (
                <button 
                  onClick={() => handleStartExam(mainExam._id)} 
                  className="btn btn-red" 
                  style={{ padding: "14px 28px", borderRadius: "30px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(232, 99, 88, 0.2)" }}
                >
                  <Video size={16} /> Start Session
                </button>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: "32px", minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>No current assessments found.</span>
            </div>
          )}

          {/* Interactive Personal Task Planner / To-Do Card */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckSquare size={18} style={{ color: "var(--primary-red)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-display)" }}>Personal Task Planner</h3>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>
                {todos.filter(t => t.completed).length}/{todos.length} Tasks Finished
              </span>
            </div>

            <form onSubmit={handleAddTodo} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input 
                type="text" 
                placeholder="Add assignment topic, lecture chapter..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: "10px 14px", 
                  borderRadius: "8px", 
                  border: "1px solid var(--border)", 
                  fontSize: "13px",
                  background: "#ffffff",
                  outline: "none"
                }}
              />
              <button 
                type="submit" 
                className="btn btn-red" 
                style={{ padding: "10px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Plus size={16} /> Add
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "150px", overflowY: "auto" }}>
              {todos.map((todo) => (
                <div 
                  key={todo.id} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "10px 14px", 
                    borderRadius: "8px", 
                    border: "1px solid var(--border)",
                    backgroundColor: todo.completed ? "rgba(0,0,0,0.01)" : "#ffffff"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={todo.completed} 
                      onChange={() => toggleTodo(todo.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ 
                      fontSize: "13px", 
                      color: todo.completed ? "var(--text-muted)" : "var(--text-primary)",
                      textDecoration: todo.completed ? "line-through" : "none",
                      fontWeight: todo.completed ? "500" : "600"
                    }}>
                      {todo.text}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    style={{ color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", border: "none", background: "none" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {todos.length === 0 && (
                <div style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)", fontSize: "12px" }}>
                  All clear! Add a task above to get started.
                </div>
              )}
            </div>
          </div>

          {/* Analytics Visual Chart Widget */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart2 size={18} style={{ color: "var(--primary-red)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-display)" }}>Weekly Study Hours</h3>
              </div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-wood)" }}>Daily Avg: 5.6h</span>
            </div>

            {/* Custom SVG/CSS Bar Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", height: "130px", gap: "12px", padding: "0 8px", borderBottom: "1px solid var(--border)", marginBottom: "8px" }}>
              {studyHours.map((sh, idx) => (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "flex-end" }}>
                  <div className="chart-bar" style={{ height: `${sh.pct}%`, backgroundColor: "var(--sidebar-bg)" }}>
                    <div className="chart-bar-tooltip">{sh.hrs} hrs</div>
                  </div>
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div style={{ display: "flex", justifyBetween: "space-between", padding: "0 8px" }}>
              {studyHours.map((sh, idx) => (
                <span key={idx} style={{ flex: 1, textCenter: "center", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", fontWeight: "700" }}>{sh.day}</span>
              ))}
            </div>
          </div>

          {/* Current Courses Grid */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", fontFamily: "var(--font-display)" }}>Current Semester Courses</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Card 1: Compiler Design (Premium Blue Gradient Card) */}
              <div className="card gradient-card-blue" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "160px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "6px", backgroundColor: "rgba(208, 231, 255, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e88e5" }}>
                    <Code size={18} />
                  </div>
                  <button style={{ color: "var(--text-muted)", border: "none", background: "none" }}>
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div style={{ margin: "20px 0" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Compiler Design</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Module 4: Lexical Analysis</p>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "700", marginBottom: "8px", color: "var(--text-muted)" }}>
                    <span>Overall Progress</span>
                    <span style={{ color: "var(--text-primary)" }}>65%</span>
                  </div>
                  <div className="skill-bar-bg" style={{ height: "4px" }}>
                    <div className="skill-bar-fill" style={{ width: "65%", backgroundColor: "var(--primary-red)" }}></div>
                  </div>
                </div>
              </div>

              {/* Card 2: Database Systems (Premium Green Gradient Card) */}
              <div className="card gradient-card-green" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "160px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "6px", backgroundColor: "rgba(194, 238, 213, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2e7d32" }}>
                    <Database size={18} />
                  </div>
                  <button style={{ color: "var(--text-muted)", border: "none", background: "none" }}>
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div style={{ margin: "20px 0" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Database Systems</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Module 3: Normalization</p>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "700", marginBottom: "8px", color: "var(--text-muted)" }}>
                    <span>Overall Progress</span>
                    <span style={{ color: "var(--text-primary)" }}>42%</span>
                  </div>
                  <div className="skill-bar-bg" style={{ height: "4px" }}>
                    <div className="skill-bar-fill" style={{ width: "42%", backgroundColor: "var(--primary-red)" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Daily Planner & Dynamic Proctoring Analytics */}
        <div className="dashboard-sidebar" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Proctoring AI Analytics Status Widget (Premium Gauge) */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Brain size={18} style={{ color: "var(--primary-red)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-display)" }}>Proctoring AI Health</h3>
              </div>
              
              {/* Waveform decorator */}
              <div className="waveform-container">
                <div className="waveform-bar" style={{ animationDelay: "0.1s" }}></div>
                <div className="waveform-bar" style={{ animationDelay: "0.3s" }}></div>
                <div className="waveform-bar" style={{ animationDelay: "0.2s" }}></div>
                <div className="waveform-bar" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Circular Gauge Score */}
              <div style={{ position: "relative", width: "70px", height: "70px", flexShrink: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#eae5dd" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2ecc71" strokeWidth="3" strokeDasharray="98 2" strokeDashoffset="0" strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800" }}>
                  98%
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#2ecc71" }}>Attention Secure</span>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>No anomalies detected in last 24h.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
              <div style={{ padding: "8px 12px", background: "#f6f3ed", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>EYE CALIBRATION</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-primary)" }}>✓ CALIBRATED</span>
              </div>
              <div style={{ padding: "8px 12px", background: "#f6f3ed", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>AUDIO LEVELS</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-primary)" }}>✓ 0% NOISE</span>
              </div>
            </div>
          </div>

          {/* GitHub-style Study Consistency grid map */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Study Consistency</h3>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Last 6 weeks</span>
            </div>

            <div className="contribution-grid">
              {contributionGrid.map((level, idx) => (
                <div 
                  key={idx} 
                  className="contribution-dot" 
                  style={{ backgroundColor: getDotColor(level) }}
                  title={`Activity level: ${level}`}
                />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "10px", color: "var(--text-muted)" }}>
              <span>Less</span>
              <div style={{ width: "8px", height: "8px", backgroundColor: "#eae5dd", borderRadius: "1px" }}></div>
              <div style={{ width: "8px", height: "8px", backgroundColor: "#d8d0c3", borderRadius: "1px" }}></div>
              <div style={{ width: "8px", height: "8px", backgroundColor: "var(--accent-wood)", borderRadius: "1px" }}></div>
              <div style={{ width: "8px", height: "8px", backgroundColor: "var(--primary-red)", borderRadius: "1px" }}></div>
              <span>More</span>
            </div>
          </div>

          {/* Academic Schedule Planner Calendar */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} style={{ color: "var(--accent-wood)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-display)" }}>Today's Agenda</h3>
              </div>
              <span style={{ fontSize: "10px", padding: "2px 8px", background: "#f6f3ed", borderRadius: "10px", fontWeight: "700" }}>OCT 25</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Event 1 */}
              <div style={{ display: "flex", gap: "12px", borderLeft: "3px solid var(--primary-red)", paddingLeft: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", width: "55px", flexShrink: 0 }}>
                  09:00 AM
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>Operating Systems Lecture</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>CS401 • Room 302</p>
                </div>
              </div>

              {/* Event 2 */}
              <div style={{ display: "flex", gap: "12px", borderLeft: "3px solid var(--accent-wood)", paddingLeft: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", width: "55px", flexShrink: 0 }}>
                  11:30 AM
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>Advanced Macroeconomics IV</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>Online Term Exam (AI Proctored)</p>
                </div>
              </div>

              {/* Event 3 */}
              <div style={{ display: "flex", gap: "12px", borderLeft: "3px solid var(--accent-gray)", paddingLeft: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", width: "55px", flexShrink: 0 }}>
                  02:00 PM
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>Compiler Design Lab</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>Practical Session 5 • Lab B</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gamified Stand Leaderboard */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <TrendingUp size={18} style={{ color: "var(--accent-wood)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-display)" }}>Class Leaderboard</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-wood)", width: "18px" }}>1st</span>
                <span style={{ fontSize: "13px", fontWeight: "600", flex: 1 }}>Sarah Jenkins</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginLeft: "auto" }}>2,890 XP</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "10px", padding: "6px 8px", background: "rgba(232, 99, 88, 0.05)", borderRadius: "6px", border: "1px solid rgba(232, 99, 88, 0.1)" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary-red)", width: "18px" }}>2nd</span>
                <span style={{ fontSize: "13px", fontWeight: "700", flex: 1, color: "var(--text-primary)" }}>Julian (You)</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary-red)", marginLeft: "auto" }}>{xp.toLocaleString()} XP</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)", width: "18px" }}>3rd</span>
                <span style={{ fontSize: "13px", fontWeight: "600", flex: 1 }}>Marcus Thorne</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginLeft: "auto" }}>2,120 XP</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Recent Activity</h3>
              <a href="#activity" style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-red)" }}>View All</a>
            </div>

            {/* Timeline Wrapper */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
              {/* Vertical line connector */}
              <div style={{ position: "absolute", left: "18px", top: "18px", bottom: "18px", width: "1px", backgroundColor: "var(--border)", zIndex: 0 }}></div>

              {/* Item 1 */}
              <div style={{ display: "flex", gap: "16px", position: "relative", zIndex: 1 }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#ffffff", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2e7d32", flexShrink: 0 }}>
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Completed Quiz: Tree Traversal</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>Data Structures • Scored 95%</p>
                  <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>2 hours ago</span>
                </div>
              </div>

              {/* Item 2 */}
              <div style={{ display: "flex", gap: "16px", position: "relative", zIndex: 1 }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#ffffff", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-red)", flexShrink: 0 }}>
                  <Award size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Earned Badge: Code Ninja</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>Submitted 5 flawless assignments.</p>
                  <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>Yesterday</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}