import React, { useState, useRef, useEffect } from "react";
import {
  Hourglass, CheckCircle, UploadCloud, FileText, X,
  ShieldCheck, Star, MessageSquare, Award, ChevronDown, ChevronUp,
  Calendar, Download, AlertCircle, BookOpen, Zap, Clock,
  PaperclipIcon, Send, BarChart2, TrendingUp, Filter, Search,
  AlertTriangle, Layers, Cpu, Edit3, Eye, Target, Bell, ChevronRight
} from "lucide-react";
import "../../index.css";

/* ─── Data ─────────────────────────────────────────── */
const ALL_ASSIGNMENTS = [
  {
    id: 1, code: "COMP-501", subject: "Compiler Design",
    title: "LLVM Pass Architecture & AST Tokenizer Implementation",
    status: "pending", priority: "high",
    dueDate: "2026-08-05", daysLeft: 15,
    weight: "30%", totalPoints: 100, submitted: false,
    progress: 60,
    desc: "Implement a custom LLVM transformation pass in C++ performing constant folding, dead-code elimination, and AST loop unrolling.",
    rubric: [
      { criteria: "LLVM Pass Structure & Registration", points: 25 },
      { criteria: "AST Traversal & Token Classification", points: 25 },
      { criteria: "Constant Folding Correctness", points: 20 },
      { criteria: "Dead-Code Elimination Tests", points: 20 },
      { criteria: "Report Documentation & Code Style", points: 10 }
    ],
    color: "#7C5CBF", attachments: ["llvm_starter.zip", "rubric_comp501.pdf"]
  },
  {
    id: 2, code: "DB-402", subject: "Database Systems",
    title: "B+ Tree Index Concurrency & Two-Phase Locking Protocol",
    status: "pending", priority: "high",
    dueDate: "2026-07-28", daysLeft: 7,
    weight: "25%", totalPoints: 100, submitted: false,
    progress: 30,
    desc: "Design an in-memory B+ Tree with latch crabbing for thread-safe concurrent insertions and range queries.",
    rubric: [
      { criteria: "B+ Tree Node Split/Merge Correctness", points: 30 },
      { criteria: "Latch Crabbing Implementation", points: 25 },
      { criteria: "Concurrent Transaction Tests (50+ threads)", points: 25 },
      { criteria: "Performance Benchmark Report", points: 20 }
    ],
    color: "#FF5A4C", attachments: ["btree_starter.cpp", "test_suite.zip"]
  },
  {
    id: 3, code: "HCI-202", subject: "Human Computer Interaction",
    title: "Eye-Gaze Heatmap & WCAG 2.2 Accessibility Audit",
    status: "pending", priority: "medium",
    dueDate: "2026-08-12", daysLeft: 22,
    weight: "20%", totalPoints: 100, submitted: false,
    progress: 10,
    desc: "Conduct a full WCAG 2.2 accessibility audit on two production websites using eye-tracking simulation tools.",
    rubric: [
      { criteria: "Heatmap Analysis & Interpretation", points: 35 },
      { criteria: "WCAG 2.2 Compliance Checklist", points: 35 },
      { criteria: "Remediation Recommendations", points: 20 },
      { criteria: "Report Presentation Quality", points: 10 }
    ],
    color: "#00B4D8", attachments: ["audit_template.xlsx"]
  },
  {
    id: 4, code: "OS-301", subject: "Operating Systems",
    title: "Kernel Virtual Memory Paging & LRU Page Replacement",
    status: "completed", priority: "low",
    dueDate: "2026-07-14", daysLeft: 0,
    weight: "20%", totalPoints: 100, submitted: true,
    progress: 100, grade: 98, graded: true,
    desc: "Simulate a demand-paging virtual memory manager with clock-hand and 2-chance LRU page replacement algorithm.",
    rubric: [
      { criteria: "Page Table Walk Simulation", points: 30, earned: 30 },
      { criteria: "LRU Clock-Hand Algorithm", points: 30, earned: 29 },
      { criteria: "TLB Miss Handler Correctness", points: 25, earned: 25 },
      { criteria: "Memory Allocation Report", points: 15, earned: 14 }
    ],
    aiComments: [
      "Outstanding implementation — clock-hand 2-chance algorithm with dirty bit handled correctly.",
      "Minor: Page walk doesn't account for 4-level paging in x86-64 (−1pt).",
      "Report is well-structured with clear benchmark diagrams."
    ],
    color: "#00e5a0", attachments: ["os301_submission.zip", "report_paging.pdf"]
  },
  {
    id: 5, code: "ECON-401", subject: "Macroeconomics",
    title: "IS-LM Model: Interest Rate & Output Equilibrium Simulation",
    status: "completed", priority: "low",
    dueDate: "2026-07-07", daysLeft: 0,
    weight: "15%", totalPoints: 100, submitted: true,
    progress: 100, grade: 91, graded: true,
    desc: "Build an interactive Python simulation of the IS-LM equilibrium model under fiscal and monetary shocks.",
    rubric: [
      { criteria: "IS Curve Derivation & Graphing", points: 25, earned: 24 },
      { criteria: "LM Curve & Money Market Equilibrium", points: 25, earned: 23 },
      { criteria: "Shock Simulation (Fiscal & Monetary)", points: 30, earned: 28 },
      { criteria: "Written Analysis & Policy Interpretation", points: 20, earned: 16 }
    ],
    aiComments: [
      "Strong analytical framework with correct IS and LM derivations.",
      "Fiscal shock simulation output was accurate; monetary shock slightly underspecified.",
      "Policy interpretation section needed more depth — recommend expanding next time."
    ],
    color: "#2EC4B6", attachments: ["islm_notebook.ipynb", "econ_report.pdf"]
  },
  {
    id: 6, code: "COMP-501", subject: "Compiler Design",
    title: "Lexer & Parser: Context-Free Grammar & LL(1) Table Construction",
    status: "upcoming", priority: "medium",
    dueDate: "2026-08-20", daysLeft: 30,
    weight: "15%", totalPoints: 100, submitted: false,
    progress: 0,
    desc: "Construct an LL(1) parse table from a given CFG. Implement a recursive-descent parser in Python.",
    rubric: [
      { criteria: "CFG First & Follow Set Computation", points: 30 },
      { criteria: "LL(1) Table Construction", points: 30 },
      { criteria: "Recursive-Descent Parser Implementation", points: 30 },
      { criteria: "Test Coverage (≥20 test cases)", points: 10 }
    ],
    color: "#F77F00", attachments: ["cfg_starter.py"]
  }
];

const ACTIVITY_LOG = [
  { time: "2h ago", action: "Dr. Thorne graded OS-301 Assignment", type: "grade" },
  { time: "5h ago", action: "Feedback posted on ECON-401 IS-LM submission", type: "feedback" },
  { time: "Yesterday", action: "Reminder: DB-402 B+ Tree due in 7 days", type: "reminder" },
  { time: "2 days ago", action: "COMP-501 LLVM rubric updated by Prof. Thorne", type: "update" },
  { time: "3 days ago", action: "HCI-202 assignment guidelines posted", type: "info" },
];

export default function Assignments() {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [filterPriority, setFilterPriority] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [submittedIds, setSubmittedIds] = useState(new Set([4, 5]));
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const [activeSubmitId, setActiveSubmitId] = useState(null);
  const [progressMap, setProgressMap] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleFileSelect = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [id]: file.name }));
      showToast(`📎 "${file.name}" attached to assignment.`);
    }
  };

  const handleSubmit = (id) => {
    if (!uploadedFiles[id]) { showToast("Please attach a file first!", "warn"); return; }
    setSubmittedIds(prev => new Set([...prev, id]));
    showToast(`✅ Assignment #${id} submitted successfully!`);
  };

  const handleProgress = (id, val) => {
    setProgressMap(prev => ({ ...prev, [id]: val }));
  };

  const pending = ALL_ASSIGNMENTS.filter(a => a.status === "pending");
  const completed = ALL_ASSIGNMENTS.filter(a => a.status === "completed");
  const upcoming = ALL_ASSIGNMENTS.filter(a => a.status === "upcoming");

  const filtered = ALL_ASSIGNMENTS.filter(a => {
    const matchTab = activeTab === "all" || a.status === activeTab;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === "All" || a.priority === filterPriority.toLowerCase();
    return matchTab && matchSearch && matchPriority;
  });

  const overallProgress = Math.round(
    ALL_ASSIGNMENTS.reduce((sum, a) => sum + (progressMap[a.id] !== undefined ? progressMap[a.id] : a.progress), 0) / ALL_ASSIGNMENTS.length
  );

  const urgentAssignments = pending.filter(a => a.daysLeft <= 10);

  /* ─── Card ─── */
  const AssignmentCard = ({ a }) => {
    const isExpanded = expandedId === a.id;
    const isSubmitted = submittedIds.has(a.id);
    const currentProgress = progressMap[a.id] !== undefined ? progressMap[a.id] : a.progress;

    const statusColor = {
      pending: a.daysLeft <= 7 ? "#FF5A4C" : a.daysLeft <= 14 ? "#f5a623" : "#7C5CBF",
      completed: "#00e5a0",
      upcoming: "#A07D60"
    }[a.status];

    const statusLabel = {
      pending: a.daysLeft <= 7 ? "🔴 URGENT" : a.daysLeft <= 14 ? "🟡 DUE SOON" : "🔵 IN PROGRESS",
      completed: isSubmitted ? "✅ SUBMITTED & GRADED" : "✅ SUBMITTED",
      upcoming: "📅 UPCOMING"
    }[a.status];

    return (
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: `1px solid ${a.status === "pending" && a.daysLeft <= 7 ? "rgba(255,90,76,0.3)" : "var(--border)"}`, overflow: "hidden", transition: "box-shadow 0.2s", boxShadow: isExpanded ? "0 8px 30px rgba(0,0,0,0.08)" : "none" }}>

        {/* Colored top strip */}
        <div style={{ height: "4px", backgroundColor: a.color }} />

        {/* Card Header */}
        <div style={{ padding: "20px 24px", cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : a.id)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", backgroundColor: "#fdf1f1", padding: "3px 8px", borderRadius: "4px", border: "1px solid rgba(255,90,76,0.15)" }}>{a.code}</span>
                <span style={{ fontSize: "10px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", backgroundColor: `${statusColor}18`, color: statusColor }}>{statusLabel}</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", backgroundColor: "#FAF6EE", padding: "2px 8px", borderRadius: "8px" }}>⚖️ Weight: {a.weight}</span>
                {a.daysLeft > 0 && <span style={{ fontSize: "10px", fontWeight: "700", color: statusColor }}><Clock size={10} style={{ display: "inline", marginRight: "3px" }} />{a.daysLeft}d left</span>}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 6px 0", fontFamily: "var(--font-display)", lineHeight: "1.3" }}>{a.title}</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>{a.desc}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Due Date</div>
                <div style={{ fontSize: "13px", fontWeight: "700" }}>{a.dueDate}</div>
              </div>
              {a.grade && <div style={{ fontSize: "24px", fontWeight: "800", color: a.grade >= 90 ? "#00a372" : a.grade >= 75 ? "#f5a623" : "#FF5A4C" }}>{a.grade}<span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "400" }}>/{a.totalPoints}</span></div>}
              {isExpanded ? <ChevronUp size={18} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>COMPLETION</span>
              <span style={{ fontSize: "10px", fontWeight: "800", color: a.color }}>{currentProgress}%</span>
            </div>
            <div style={{ height: "6px", backgroundColor: "#F0EAE0", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${currentProgress}%`, backgroundColor: a.color, borderRadius: "3px", transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div style={{ borderTop: "1px solid var(--border)", backgroundColor: "#FAFAF8" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>

              {/* Left: Rubric */}
              <div style={{ padding: "20px 24px", borderRight: "1px solid var(--border)" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "12px" }}>📋 MARKING RUBRIC</div>
                {a.rubric.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < a.rubric.length - 1 ? "1px dashed var(--border)" : "none" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", flex: 1 }}>{r.criteria}</span>
                    <span style={{ fontSize: "12px", fontWeight: "800", marginLeft: "12px", color: r.earned !== undefined ? (r.earned === r.points ? "#00a372" : "#f5a623") : "var(--text-muted)" }}>
                      {r.earned !== undefined ? `${r.earned}/` : ""}{r.points}pts
                    </span>
                  </div>
                ))}
                {a.totalPoints && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", padding: "8px 0", borderTop: "2px solid var(--border)" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>Total</span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--primary-red)" }}>
                      {a.grade ? `${a.grade}/` : ""}{a.totalPoints}pts
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Actions / AI Feedback */}
              <div style={{ padding: "20px 24px" }}>
                {/* Attachments */}
                <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "10px" }}>📎 ATTACHMENTS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                  {a.attachments.map((file, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <FileText size={12} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "12px", flex: 1 }}>{file}</span>
                      <button onClick={() => showToast(`Downloading ${file}…`)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><Download size={12} /></button>
                    </div>
                  ))}
                </div>

                {/* AI Feedback (if graded) */}
                {a.aiComments && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "10px" }}>🤖 AI FEEDBACK</div>
                    {a.aiComments.map((c, i) => (
                      <div key={i} style={{ padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "6px", fontSize: "12px", color: "var(--text-primary)", lineHeight: "1.5", borderLeft: `3px solid ${i === 0 ? "#00e5a0" : i === 1 ? "#f5a623" : "var(--border)"}` }}>
                        {c}
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Section */}
                {a.status === "pending" && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "10px" }}>📤 SUBMIT WORK</div>

                    {/* Progress Slider */}
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>MY PROGRESS</span>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: a.color }}>{progressMap[a.id] !== undefined ? progressMap[a.id] : a.progress}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={progressMap[a.id] !== undefined ? progressMap[a.id] : a.progress} onChange={e => handleProgress(a.id, Number(e.target.value))} style={{ width: "100%", accentColor: a.color }} />
                    </div>

                    {isSubmitted ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", backgroundColor: "rgba(0,229,160,0.08)", borderRadius: "8px", border: "1px solid rgba(0,229,160,0.3)" }}>
                        <CheckCircle size={16} style={{ color: "#00a372" }} />
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#00a372" }}>Submitted: {uploadedFiles[a.id] || "Your file"}</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={e => handleFileSelect(a.id, e)} />
                        <button onClick={() => { setActiveSubmitId(a.id); fileInputRef.current?.click(); }} style={{ padding: "10px", borderRadius: "8px", border: "1px dashed var(--primary-red)", backgroundColor: "#fdf1f1", color: "var(--primary-red)", cursor: "pointer", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <UploadCloud size={14} /> {uploadedFiles[a.id] ? `📎 ${uploadedFiles[a.id]}` : "Attach File (ZIP/PDF)"}
                        </button>
                        <button onClick={() => handleSubmit(a.id)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "var(--primary-red)", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <Send size={14} /> SUBMIT ASSIGNMENT
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-transition">

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "32px", right: "32px", backgroundColor: "#141416", color: "#ffffff", padding: "14px 22px", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999, border: "1px solid var(--primary-red)", animation: "fadeIn 0.3s" }}>
          <CheckCircle size={16} style={{ color: "#00e5a0" }} />
          <span style={{ fontSize: "13px", fontWeight: "700" }}>{toast.msg}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <p className="page-category" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <BookOpen size={12} style={{ color: "var(--primary-red)" }} /> ACADEMIC SUBMISSIONS
          </p>
          <h1 className="page-title" style={{ fontSize: "36px", fontWeight: "700", fontFamily: "var(--font-display)", margin: "4px 0 0 0" }}>Assignments & Coursework</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>Track deadlines, submit work, review rubrics, and read AI-powered feedback.</p>
        </div>
      </div>

      {/* ── Urgent Warning Banner ── */}
      {urgentAssignments.length > 0 && (
        <div style={{ backgroundColor: "rgba(255,90,76,0.06)", border: "1px solid rgba(255,90,76,0.25)", borderRadius: "14px", padding: "16px 22px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "rgba(255,90,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={20} style={{ color: "#FF5A4C" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#FF5A4C", marginBottom: "3px" }}>⚡ URGENT — {urgentAssignments.length} Assignment{urgentAssignments.length > 1 ? "s" : ""} Due Within 10 Days</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {urgentAssignments.map(a => `${a.code}: "${a.title.slice(0, 40)}…" (${a.daysLeft}d left)`).join("  ·  ")}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "TOTAL", value: ALL_ASSIGNMENTS.length, icon: Layers, color: "var(--primary-red)" },
          { label: "PENDING", value: pending.length, icon: Hourglass, color: "#f5a623" },
          { label: "COMPLETED", value: completed.length, icon: CheckCircle, color: "#00e5a0" },
          { label: "UPCOMING", value: upcoming.length, icon: Calendar, color: "#7C5CBF" },
          { label: "OVERALL PROGRESS", value: `${overallProgress}%`, icon: TrendingUp, color: "#2EC4B6" },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "800" }}>{s.value}</div>
              <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Layout: Assignments + Sidebar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

        {/* ─ Left: Filter + Cards ─ */}
        <div>
          {/* Filter Row */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "4px", backgroundColor: "#ffffff", padding: "4px", borderRadius: "10px", border: "1px solid var(--border)" }}>
              {[
                { id: "all", label: `All (${ALL_ASSIGNMENTS.length})` },
                { id: "pending", label: `Pending (${pending.length})` },
                { id: "completed", label: `Completed (${completed.length})` },
                { id: "upcoming", label: `Upcoming (${upcoming.length})` },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "7px 14px", borderRadius: "7px", fontSize: "11px", fontWeight: "700", border: "none", backgroundColor: activeTab === tab.id ? "var(--primary-red)" : "transparent", color: activeTab === tab.id ? "#ffffff" : "var(--text-muted)", cursor: "pointer", transition: "all 0.2s" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ position: "relative", flex: "0 0 220px" }}>
              <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search assignments…" style={{ width: "100%", paddingLeft: "32px", padding: "9px 10px 9px 32px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", outline: "none", backgroundColor: "#ffffff", fontWeight: "600", cursor: "pointer" }}>
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)" }}>
                <BookOpen size={32} style={{ marginBottom: "12px", opacity: 0.4 }} />
                <p style={{ margin: 0, fontWeight: "700" }}>No assignments match your filter.</p>
              </div>
            ) : (
              filtered.map(a => <AssignmentCard key={a.id} a={a} />)
            )}
          </div>
        </div>

        {/* ─ Right: Sidebar ─ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px" }}>

          {/* Pending Tracker */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.04em" }}>⏳ PENDING TRACKER</span>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", backgroundColor: "#fdf1f1", padding: "2px 8px", borderRadius: "8px" }}>{pending.length} active</span>
            </div>
            <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {pending.map(a => (
                <div key={a.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", flex: 1 }}>{a.code} — {a.title.slice(0, 28)}…</span>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: a.daysLeft <= 7 ? "#FF5A4C" : "#f5a623", backgroundColor: a.daysLeft <= 7 ? "#fdf1f1" : "#fffaf0", padding: "2px 6px", borderRadius: "4px" }}>{a.daysLeft}d</span>
                  </div>
                  <div style={{ height: "5px", backgroundColor: "#F0EAE0", borderRadius: "3px" }}>
                    <div style={{ height: "100%", width: `${progressMap[a.id] !== undefined ? progressMap[a.id] : a.progress}%`, backgroundColor: a.color, borderRadius: "3px", transition: "width 0.3s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Progress: {progressMap[a.id] !== undefined ? progressMap[a.id] : a.progress}%</span>
                    <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Due: {a.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Breakdown */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.04em" }}>📊 SUBJECT BREAKDOWN</span>
            </div>
            <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {["COMP-501", "DB-402", "OS-301", "ECON-401", "HCI-202"].map(code => {
                const count = ALL_ASSIGNMENTS.filter(a => a.code === code).length;
                const done = ALL_ASSIGNMENTS.filter(a => a.code === code && a.status === "completed").length;
                const pct = Math.round((done / count) * 100);
                const color = ALL_ASSIGNMENTS.find(a => a.code === code)?.color || "#999";
                return (
                  <div key={code}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700" }}>{code}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{done}/{count} done</span>
                    </div>
                    <div style={{ height: "5px", backgroundColor: "#F0EAE0", borderRadius: "3px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.04em" }}>🔔 RECENT ACTIVITY</span>
            </div>
            <div style={{ padding: "10px 18px", display: "flex", flexDirection: "column", gap: "0" }}>
              {ACTIVITY_LOG.map((log, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < ACTIVITY_LOG.length - 1 ? "1px dashed var(--border)" : "none", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: log.type === "grade" ? "#00e5a0" : log.type === "reminder" ? "#FF5A4C" : "#A07D60", marginTop: "5px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: "1.4" }}>{log.action}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
