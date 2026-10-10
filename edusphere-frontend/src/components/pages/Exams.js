import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Calendar, ArrowRight, CheckCircle, Cpu, Eye, Volume2,
  Clock, AlertTriangle, Lock, Unlock, Star, BarChart2, TrendingUp,
  FileText, BookOpen, Target, Award, ChevronRight, Bell, Zap,
  AlertCircle, Users, Timer, ShieldCheck, Radio, X, Info,
  ChevronDown, ChevronUp, Layers, Download
} from "lucide-react";
import axios from "axios";
import "../../index.css";

/* ─── Static Exam Data ─────────────────────────────── */
const STATIC_EXAMS = [
  {
    id: "static_01", code: "OS-301",
    title: "Operating Systems Comprehensive Examination",
    subject: "Operating Systems",
    prof: "Dr. Aris Thorne",
    status: "open",
    date: "2026-08-10", time: "14:00",
    duration: "90 min", totalMarks: 100,
    passMark: 55, questions: 25,
    syllabus: ["Kernel Architecture", "Memory Management", "Paging & TLB", "Process Scheduling", "IPC & Semaphores"],
    proctoring: ["AI Face Detection", "Eye Tracking", "Tab Switch Monitor", "Audio Analysis"],
    color: "#FF5A4C", difficulty: "Hard",
    countdown: { days: 19, hours: 3, mins: 0 }
  },
  {
    id: "static_02", code: "COMP-501",
    title: "Compiler Design: LLVM & Parsing Theory Exam",
    subject: "Compiler Design",
    prof: "Dr. Aris Thorne",
    status: "open",
    date: "2026-08-15", time: "10:00",
    duration: "120 min", totalMarks: 100,
    passMark: 50, questions: 30,
    syllabus: ["Lexical Analysis", "CFG & LL(1) Parsing", "LLVM IR", "Optimization Passes", "Code Generation"],
    proctoring: ["AI Face Detection", "Eye Tracking", "Tab Switch Monitor"],
    color: "#7C5CBF", difficulty: "Hard",
    countdown: { days: 24, hours: 10, mins: 0 }
  },
  {
    id: "static_03", code: "DB-402",
    title: "Database Systems: Concurrency & Query Optimisation",
    subject: "Database Systems",
    prof: "Dr. Aris Thorne",
    status: "upcoming",
    date: "2026-08-22", time: "09:00",
    duration: "90 min", totalMarks: 100,
    passMark: 55, questions: 20,
    syllabus: ["B+ Tree Indexing", "MVCC & 2PL", "Query Planner", "Transaction Isolation", "WAL Protocol"],
    proctoring: ["AI Face Detection", "Tab Switch Monitor"],
    color: "#2EC4B6", difficulty: "Medium",
    countdown: { days: 31, hours: 9, mins: 0 }
  },
  {
    id: "static_04", code: "ECON-401",
    title: "Advanced Macroeconomics IV & Systems Exam",
    subject: "Macroeconomics",
    prof: "Dr. Alistair Vance",
    status: "open",
    date: "2026-07-25", time: "14:00",
    duration: "90 min", totalMarks: 100,
    passMark: 50, questions: 22,
    syllabus: ["IS-LM Model", "Monetary Policy", "Fiscal Multiplier", "Phillips Curve", "QE Mechanisms"],
    proctoring: ["AI Face Detection", "Eye Tracking", "Tab Switch Monitor", "Audio Analysis"],
    color: "#F77F00", difficulty: "Medium",
    countdown: { days: 3, hours: 14, mins: 0 }
  },
  {
    id: "static_05", code: "HCI-202",
    title: "Human Computer Interaction Mid-Semester Assessment",
    subject: "HCI & UX Design",
    prof: "Prof. Sarah Jenkins",
    status: "completed",
    date: "2026-07-10", time: "09:00",
    duration: "60 min", totalMarks: 100,
    passMark: 50, questions: 18,
    grade: 88, passed: true,
    syllabus: ["Heuristic Evaluation", "WCAG 2.2", "Eye-Gaze Methods", "Fitts' Law", "Cognitive Load"],
    proctoring: ["AI Face Detection", "Tab Switch Monitor"],
    color: "#00B4D8", difficulty: "Easy",
    countdown: { days: 0, hours: 0, mins: 0 }
  }
];

const EXAM_TIPS = [
  "📖 Review your notes at least 48 hours before the exam.",
  "🎯 Focus on high-weight topics first — check the syllabus outline.",
  "💤 Get 7–8 hours of sleep the night before for peak cognitive performance.",
  "📷 Test your webcam & microphone before joining the exam.",
  "🧘 Take a 5-minute breathing exercise to reduce exam anxiety.",
  "⏱ Allocate time per question — don't spend more than 3 min per MCQ.",
];

const RECENT_SCORES = [
  { subject: "HCI-202", score: 88, date: "Jul 10", color: "#00B4D8" },
  { subject: "OS-301 Mock", score: 74, date: "Jul 5", color: "#FF5A4C" },
  { subject: "ECON-401 Quiz", score: 91, date: "Jun 28", color: "#F77F00" },
  { subject: "DB-402 Lab Exam", score: 82, date: "Jun 20", color: "#2EC4B6" },
];

/* ─── Live Countdown Hook ─────────────────────────── */
function useCountdown(targetDate, targetTime) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date(`${targetDate}T${targetTime}:00`).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { setRemaining({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining({ days, hours, mins, secs });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [targetDate, targetTime]);

  return remaining;
}

/* ─── News Ticker ─────────────────────────────────── */
function NewsTicker({ exams }) {
  const urgentExams = exams.filter(e => e.status === "open" && e.countdown.days <= 5);
  const messages = [
    ...urgentExams.map(e => `🚨 EXAM ALERT: ${e.code} — "${e.title}" starts in ${e.countdown.days}d ${e.countdown.hours}h!`),
    "📢 NOTICE: AI proctoring is active for all secure exams — ensure camera & mic are working.",
    "📅 REMINDER: Complete all pending assignments before exam week.",
    "🔒 SECURITY: Do not share exam content — violations result in immediate disqualification.",
    "🎓 TIP: Review flashcards on the Study page to reinforce key concepts before exams.",
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % messages.length); setVisible(true); }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div style={{ backgroundColor: "rgba(255,90,76,0.06)", border: "1px solid rgba(255,90,76,0.2)", borderRadius: "12px", padding: "12px 18px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "14px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <Radio size={14} style={{ color: "#FF5A4C" }} />
        <span style={{ fontSize: "10px", fontWeight: "900", color: "#FF5A4C", letterSpacing: "0.08em", backgroundColor: "rgba(255,90,76,0.12)", padding: "2px 8px", borderRadius: "6px" }}>LIVE</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", opacity: visible ? 1 : 0, transition: "opacity 0.4s ease", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {messages[idx]}
        </span>
      </div>
    </div>
  );
}

/* ─── Single Exam Countdown Card ─────────────────── */
function ExamCountdownCard({ exam }) {
  const { days, hours, mins, secs } = useCountdown(exam.date, exam.time);
  const isToday = days === 0;
  const isUrgent = days <= 3;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
      {[
        { val: days, label: "DAYS" },
        { val: hours, label: "HRS" },
        { val: mins, label: "MIN" },
        { val: secs, label: "SEC" }
      ].map((item, i) => (
        <div key={i} style={{ textAlign: "center", padding: "10px 8px", backgroundColor: isUrgent ? "rgba(255,90,76,0.08)" : "#FAF6EE", borderRadius: "10px", border: `1px solid ${isUrgent ? "rgba(255,90,76,0.2)" : "var(--border)"}` }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: isUrgent ? "#FF5A4C" : "var(--text-primary)", fontFamily: "monospace", lineHeight: 1 }}>{String(item.val).padStart(2, "0")}</div>
          <div style={{ fontSize: "8px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.08em", marginTop: "3px" }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */
export default function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [tipIdx, setTipIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5050/api/exams", { headers: { "x-auth-token": token } });
        setExams(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % EXAM_TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartExam = (exam) => {
    if (exam) {
      const live = exams.find(e => e.title === exam.title);
      if (live) navigate(`/exam?id=${live._id}`);
      else if (exams.length > 0) navigate(`/exam?id=${exams[0]._id}`);
      else navigate(`/exam?id=demo_exam_id`);
    } else {
      const macroExam = exams.find(e => e.title === "Advanced Macroeconomics IV");
      if (macroExam) navigate(`/exam?id=${macroExam._id}`);
      else if (exams.length > 0) navigate(`/exam?id=${exams[0]._id}`);
      else navigate(`/exam?id=demo_exam_id`);
    }
  };

  const allExams = STATIC_EXAMS;
  const filteredExams = allExams.filter(e =>
    activeFilter === "All" || e.status === activeFilter.toLowerCase()
  );
  const openExams = allExams.filter(e => e.status === "open");
  const upcomingExams = allExams.filter(e => e.status === "upcoming");
  const completedExams = allExams.filter(e => e.status === "completed");
  const nextExam = [...openExams].sort((a, b) => a.countdown.days - b.countdown.days)[0];

  /* ─── Specs Modal ─── */
  const SpecsModal = () => (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "560px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", marginBottom: "4px" }}>EXAM REQUIREMENTS</div>
            <h3 style={{ margin: 0, fontWeight: "700", fontSize: "18px" }}>{selectedExam?.title}</h3>
          </div>
          <button onClick={() => setShowSpecsModal(false)} style={{ background: "#FAF6EE", border: "1px solid var(--border)", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { icon: Cpu, color: "#7C5CBF", title: "AI Face Detection", desc: "Your face must be visible at all times. Multiple faces trigger violations." },
            { icon: Eye, color: "#00B4D8", title: "Eye-Gaze Tracking", desc: "WebGazer.js monitors where your eyes look. Extended off-screen gaze triggers alerts." },
            { icon: Volume2, color: "#F77F00", title: "Audio Monitoring", desc: "Ambient noise beyond 60dB for 3+ seconds will be logged as a potential violation." },
            { icon: Shield, color: "#FF5A4C", title: "Tab / Window Lock", desc: "Switching tabs or windows immediately flags a security violation." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "2px" }}>{item.title}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ backgroundColor: "#fdf1f1", border: "1px solid rgba(255,90,76,0.2)", borderRadius: "10px", padding: "12px 14px", display: "flex", gap: "10px" }}>
            <AlertTriangle size={16} style={{ color: "#FF5A4C", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>3 or more violations will automatically lock and terminate your exam session with a failing grade recorded.</div>
          </div>
          <button onClick={() => { setShowSpecsModal(false); handleStartExam(selectedExam); }} style={{ padding: "14px", borderRadius: "12px", backgroundColor: "var(--primary-red)", color: "#ffffff", fontWeight: "800", fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Shield size={16} /> I UNDERSTAND — BEGIN EXAM
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-transition">

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "32px", right: "32px", backgroundColor: "#141416", color: "#ffffff", padding: "14px 22px", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999, border: "1px solid var(--primary-red)" }}>
          <CheckCircle size={16} style={{ color: "#00e5a0" }} />
          <span style={{ fontSize: "13px", fontWeight: "700" }}>{toast}</span>
        </div>
      )}

      {showSpecsModal && selectedExam && <SpecsModal />}

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <p className="page-category" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={12} style={{ color: "var(--primary-red)" }} /> CURRICULUM CERTIFICATION
          </p>
          <h1 className="page-title" style={{ fontSize: "36px", fontWeight: "700", fontFamily: "var(--font-display)", margin: "4px 0 0 0" }}>Proctored Examinations</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>Secure AI-proctored exams with live countdowns, result tracking, and performance analytics.</p>
        </div>
        <button onClick={() => showToast("Exam schedule exported!")} className="btn btn-outline" style={{ padding: "10px 18px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
          <Download size={15} /> EXPORT SCHEDULE
        </button>
      </div>

      {/* ── Live News Ticker ── */}
      <NewsTicker exams={allExams} />

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "TOTAL EXAMS", value: allExams.length, icon: Layers, color: "var(--primary-red)" },
          { label: "OPEN / AVAILABLE", value: openExams.length, icon: Unlock, color: "#00e5a0" },
          { label: "UPCOMING", value: upcomingExams.length, icon: Calendar, color: "#7C5CBF" },
          { label: "COMPLETED", value: completedExams.length, icon: Award, color: "#f5a623" },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "800" }}>{s.value}</div>
              <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>

        {/* ─ Left: Exam List ─ */}
        <div>
          {/* Next Exam Hero */}
          {nextExam && (
            <div style={{ marginBottom: "24px", borderRadius: "20px", overflow: "hidden", border: "2px solid rgba(255,90,76,0.25)", background: "linear-gradient(135deg, #1a0a08 0%, #0d0d0f 70%)", position: "relative" }}>
              <div style={{ padding: "32px 36px" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#FF5A4C", backgroundColor: "rgba(255,90,76,0.15)", padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(255,90,76,0.3)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Zap size={11} /> NEXT EXAM
                  </span>
                  <span style={{ fontSize: "11px", color: "#8b8b9a", backgroundColor: "#1a1a1e", padding: "4px 10px", borderRadius: "8px", border: "1px solid #2a2a2e" }}>{nextExam.code}</span>
                  <span style={{ fontSize: "11px", color: "#8b8b9a", backgroundColor: "#1a1a1e", padding: "4px 10px", borderRadius: "8px", border: "1px solid #2a2a2e" }}>⏱ {nextExam.duration}</span>
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#ffffff", lineHeight: "1.3", margin: "0 0 20px 0", fontFamily: "var(--font-display)" }}>{nextExam.title}</h2>

                {/* Live Countdown */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "800", color: "#4a4a5a", letterSpacing: "0.1em", marginBottom: "10px" }}>EXAM STARTS IN</div>
                  <ExamCountdownCard exam={nextExam} />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => { setSelectedExam(nextExam); setShowSpecsModal(true); }} style={{ padding: "12px 28px", borderRadius: "12px", backgroundColor: "#FF5A4C", color: "#ffffff", fontWeight: "800", fontSize: "13px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 6px 22px rgba(255,90,76,0.4)" }}>
                    <Shield size={16} /> START EXAM
                  </button>
                  <button onClick={() => showToast("Syllabus downloaded!")} style={{ padding: "12px 20px", borderRadius: "12px", backgroundColor: "transparent", color: "#8b8b9a", fontWeight: "700", fontSize: "13px", border: "1px solid #2a2a2e", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <BookOpen size={16} /> View Syllabus
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "#ffffff", padding: "4px", borderRadius: "10px", border: "1px solid var(--border)", marginBottom: "18px", width: "fit-content" }}>
            {["All", "Open", "Upcoming", "Completed"].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "7px 16px", borderRadius: "7px", fontSize: "11px", fontWeight: "700", border: "none", backgroundColor: activeFilter === f ? "var(--primary-red)" : "transparent", color: activeFilter === f ? "#ffffff" : "var(--text-muted)", cursor: "pointer", transition: "all 0.2s" }}>
                {f}
              </button>
            ))}
          </div>

          {/* Exam Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredExams.map(exam => {
              const isExpanded = expandedId === exam.id;
              const statusColor = exam.status === "open" ? "#00e5a0" : exam.status === "completed" ? "#A07D60" : "#7C5CBF";
              const statusLabel = exam.status === "open" ? "✅ OPEN" : exam.status === "completed" ? "🎓 COMPLETED" : "📅 UPCOMING";

              return (
                <div key={exam.id} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: `1px solid ${exam.status === "open" && exam.countdown.days <= 3 ? "rgba(255,90,76,0.25)" : "var(--border)"}`, overflow: "hidden", boxShadow: isExpanded ? "0 6px 24px rgba(0,0,0,0.07)" : "none" }}>
                  <div style={{ height: "4px", backgroundColor: exam.color }} />

                  <div style={{ padding: "20px 24px", cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : exam.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", backgroundColor: "#fdf1f1", padding: "3px 8px", borderRadius: "4px" }}>{exam.code}</span>
                          <span style={{ fontSize: "10px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", backgroundColor: `${statusColor}18`, color: statusColor }}>{statusLabel}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>⏱ {exam.duration}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>📝 {exam.questions} Qs</span>
                          <span style={{ fontSize: "10px", color: exam.difficulty === "Hard" ? "#FF5A4C" : exam.difficulty === "Medium" ? "#f5a623" : "#00a372", fontWeight: "700" }}>● {exam.difficulty}</span>
                          {exam.status !== "completed" && (
                            <span style={{ fontSize: "10px", color: exam.countdown.days <= 3 ? "#FF5A4C" : "var(--text-muted)", fontWeight: exam.countdown.days <= 3 ? "800" : "400" }}>
                              <Clock size={10} style={{ display: "inline", marginRight: "3px" }} />
                              {exam.countdown.days}d {exam.countdown.hours}h
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 4px 0", fontFamily: "var(--font-display)" }}>{exam.title}</h3>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📅 {exam.date} · {exam.time} · {exam.prof}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                        {exam.grade && <div style={{ fontSize: "28px", fontWeight: "800", color: exam.grade >= 85 ? "#00a372" : "#f5a623" }}>{exam.grade}<span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "400" }}>%</span></div>}
                        {isExpanded ? <ChevronUp size={18} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border)", backgroundColor: "#FAFAF8", padding: "20px 24px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        {/* Syllabus */}
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "10px" }}>📚 SYLLABUS TOPICS</div>
                          {exam.syllabus.map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: i < exam.syllabus.length - 1 ? "1px dashed var(--border)" : "none" }}>
                              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: exam.color, flexShrink: 0 }} />
                              <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{s}</span>
                            </div>
                          ))}
                        </div>

                        {/* Proctoring */}
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "10px" }}>🔒 PROCTORING</div>
                          {exam.proctoring.map((p, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: i < exam.proctoring.length - 1 ? "1px dashed var(--border)" : "none" }}>
                              <ShieldCheck size={12} style={{ color: "#00a372" }} />
                              <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{p}</span>
                            </div>
                          ))}
                          <div style={{ marginTop: "12px", fontSize: "11px", color: "var(--text-muted)", fontWeight: "700" }}>Pass Mark: {exam.passMark}/{exam.totalMarks}</div>
                        </div>

                        {/* Countdown + Action */}
                        <div>
                          {exam.status !== "completed" ? (
                            <>
                              <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "10px" }}>⏱ COUNTDOWN</div>
                              <ExamCountdownCard exam={exam} />
                              <button onClick={() => { setSelectedExam(exam); setShowSpecsModal(true); }} style={{ marginTop: "14px", width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: exam.status === "open" ? "var(--primary-red)" : "#FAF6EE", color: exam.status === "open" ? "#ffffff" : "var(--text-muted)", fontWeight: "800", fontSize: "13px", border: `1px solid ${exam.status === "open" ? "var(--primary-red)" : "var(--border)"}`, cursor: exam.status === "open" ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                {exam.status === "open" ? <><Shield size={14} /> START EXAM</> : <><Lock size={14} /> NOT YET OPEN</>}
                              </button>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "10px" }}>📊 RESULT</div>
                              <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid var(--border)" }}>
                                <div style={{ fontSize: "48px", fontWeight: "800", color: exam.grade >= 85 ? "#00a372" : "#f5a623" }}>{exam.grade}%</div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{exam.passed ? "✅ PASSED" : "❌ FAILED"}</div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Pass mark: {exam.passMark}%</div>
                              </div>
                              <button onClick={() => showToast("Downloading certificate…")} style={{ marginTop: "12px", width: "100%", padding: "10px", borderRadius: "10px", backgroundColor: "#FAF6EE", color: "var(--text-muted)", fontWeight: "700", fontSize: "12px", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                <Award size={14} /> Download Certificate
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─ Right Sidebar ─ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px" }}>

          {/* Upcoming Countdown List */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.04em" }}>⏳ EXAM COUNTDOWN</span>
            </div>
            <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {allExams.filter(e => e.status !== "completed").slice(0, 4).map(exam => {
                const urgency = exam.countdown.days <= 3;
                return (
                  <div key={exam.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)" }}>{exam.code}</span>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-primary)" }}>{exam.title.slice(0, 30)}…</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: urgency ? "#FF5A4C" : "var(--text-primary)" }}>{exam.countdown.days}d</div>
                        <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{exam.countdown.hours}h left</div>
                      </div>
                    </div>
                    <div style={{ height: "4px", backgroundColor: "#F0EAE0", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${Math.max(5, 100 - (exam.countdown.days / 60) * 100)}%`, backgroundColor: urgency ? "#FF5A4C" : exam.color, borderRadius: "2px", transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Scores */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.04em" }}>📊 RECENT SCORES</span>
            </div>
            <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {RECENT_SCORES.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                    <BarChart2 size={16} style={{ color: s.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700" }}>{s.subject}</span>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: s.score >= 85 ? "#00a372" : s.score >= 70 ? "#f5a623" : "#FF5A4C" }}>{s.score}%</span>
                    </div>
                    <div style={{ height: "4px", backgroundColor: "#F0EAE0", borderRadius: "2px", marginTop: "4px" }}>
                      <div style={{ height: "100%", width: `${s.score}%`, backgroundColor: s.color, borderRadius: "2px" }} />
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px" }}>{s.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rotating Exam Tips */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.04em" }}>💡 EXAM TIPS</span>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.6", minHeight: "48px", transition: "opacity 0.3s" }}>
                {EXAM_TIPS[tipIdx]}
              </div>
              <div style={{ display: "flex", gap: "4px", marginTop: "12px" }}>
                {EXAM_TIPS.map((_, i) => (
                  <button key={i} onClick={() => setTipIdx(i)} style={{ width: i === tipIdx ? "16px" : "6px", height: "6px", borderRadius: "3px", backgroundColor: i === tipIdx ? "var(--primary-red)" : "#E8DFCF", border: "none", cursor: "pointer", transition: "all 0.2s" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Proctoring Checklist */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.04em" }}>✅ PRE-EXAM CHECKLIST</span>
            </div>
            <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Camera positioned at eye level",
                "Microphone tested and clear",
                "Stable internet connection",
                "Room well-lit, no glare",
                "All notes & tabs closed",
                "Government ID ready for verification",
                "Water bottle only (no food)",
              ].map((item, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" style={{ accentColor: "var(--primary-red)", width: "14px", height: "14px" }} />
                  <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{item}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
