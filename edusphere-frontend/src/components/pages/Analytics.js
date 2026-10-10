import React, { useState, useEffect } from "react";
import {
  Flame, TrendingUp, Star, Zap, Award, FileText, CheckCircle,
  Download, Clock, BookOpen, Target, BarChart2, Calendar,
  AlertCircle, Users, Brain, Cpu, Eye, ChevronUp, ChevronDown,
  Activity, Layers, Radio, Shield
} from "lucide-react";
import "../../index.css";

/* ─── All data uses coral red (#FF5A4C) as accent, green only for "done" ─── */

const RED = "#FF5A4C";
const GREEN = "#00a372";
const GREEN_LIGHT = "#00e5a0";
const BROWN = "#A07D60";

const SUBJECTS = [
  { code: "COMP-501", name: "Compiler Design",     score: 88, assignments: 4, done: 2, attendance: 92, trend: "+5" },
  { code: "DB-402",   name: "Database Systems",    score: 82, assignments: 3, done: 1, attendance: 88, trend: "+3" },
  { code: "OS-301",   name: "Operating Systems",   score: 95, assignments: 3, done: 2, attendance: 96, trend: "+8" },
  { code: "ECON-401", name: "Macroeconomics",      score: 74, assignments: 2, done: 1, attendance: 80, trend: "-2" },
  { code: "HCI-202",  name: "Human-Computer Int.", score: 91, assignments: 2, done: 2, attendance: 94, trend: "+4" },
];

const WEEK_HOURS = [
  { label: "Mon", hours: 4.2 }, { label: "Tue", hours: 6.1 }, { label: "Wed", hours: 3.0 },
  { label: "Thu", hours: 7.2 }, { label: "Fri", hours: 4.0 }, { label: "Sat", hours: 2.1 }, { label: "Sun", hours: 1.5 },
];
const MONTH_HOURS = [
  { label: "Jul 1–7",  hours: 26 }, { label: "Jul 8–14", hours: 32 },
  { label: "Jul 15–21", hours: 28 }, { label: "Jul 22–28", hours: 22 },
];
const SEM_HOURS = [
  { label: "Jan", hours: 38 }, { label: "Feb", hours: 44 }, { label: "Mar", hours: 52 },
  { label: "Apr", hours: 48 }, { label: "May", hours: 60 }, { label: "Jun", hours: 55 },
  { label: "Jul", hours: 67 },
];

const EXAM_SCORES = [
  { subject: "HCI-202", exam: "Mid-Sem", score: 88, date: "Jul 10" },
  { subject: "OS-301",  exam: "Quiz 2",  score: 74, date: "Jul 5" },
  { subject: "ECON-401",exam: "Quiz 1",  score: 91, date: "Jun 28" },
  { subject: "DB-402",  exam: "Lab Exam",score: 82, date: "Jun 20" },
  { subject: "COMP-501",exam: "Mid-Sem", score: 79, date: "Jun 12" },
  { subject: "OS-301",  exam: "Quiz 1",  score: 95, date: "Jun 5" },
];

const ATTENDANCE_GRID = [
  // true = present, false = absent, null = no class
  [true, true, false, true, true, null, null],
  [true, true, true, true, false, null, null],
  [false, true, true, true, true, null, null],
  [true, true, true, false, true, null, null],
];

const ACTIVITY_FEED = [
  { icon: CheckCircle, color: GREEN, text: "OS-301 assignment graded — 98/100", time: "2h ago" },
  { icon: AlertCircle, color: RED, text: "DB-402 B+ Tree due in 7 days", time: "5h ago" },
  { icon: Star, color: RED, text: "New study streak record — 12 days!", time: "Yesterday" },
  { icon: FileText, color: BROWN, text: "COMP-501 LLVM rubric updated", time: "2 days ago" },
  { icon: Award, color: GREEN, text: "HCI-202 mid-sem exam passed (88%)", time: "Jul 10" },
  { icon: BookOpen, color: RED, text: "Enrolled in ECON-401 new module", time: "Jul 8" },
];

const AI_INSIGHTS = [
  { type: "warning", icon: "⚠️", text: "ECON-401 score trending down (−2%). Recommend reviewing IS-LM chapter before next exam." },
  { type: "tip",     icon: "💡", text: "You study best on Thursday (7.2h avg). Schedule complex topics on Thursdays." },
  { type: "praise",  icon: "🎯", text: "OS-301 attendance is 96% — top 5% of your cohort. Keep it up!" },
  { type: "tip",     icon: "📚", text: "Assignment completion rate is 60%. Submit DB-402 before the deadline to avoid grade drop." },
];

const TIME_ALLOC = [
  { subject: "OS-301",   pct: 28 },
  { subject: "COMP-501", pct: 24 },
  { subject: "DB-402",   pct: 20 },
  { subject: "ECON-401", pct: 16 },
  { subject: "HCI-202",  pct: 12 },
];

/* ─── Mini bar chart component ─── */
function BarChart({ data, maxVal, color }) {
  const max = maxVal || Math.max(...data.map(d => d.hours));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
      {data.map((d, i) => {
        const pct = (d.hours / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700" }}>{d.hours}h</span>
            <div style={{ width: "100%", height: "96px", display: "flex", alignItems: "flex-end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${pct}%`,
                  backgroundColor: color || RED,
                  borderRadius: "4px 4px 0 0",
                  minHeight: "6px",
                  transition: "height 0.5s ease",
                  opacity: 0.85
                }}
              />
            </div>
            <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700", whiteSpace: "nowrap" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Circular Progress ─── */
function CircleProgress({ value, max = 100, size = 80, stroke = 8, color, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (value / max);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EAE0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || RED} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ marginTop: "-60px", fontSize: "16px", fontWeight: "800", color: color || RED, textAlign: "center" }}>{value}{max !== 100 ? "" : "%"}</div>
      {label && <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.06em", marginTop: "44px", textAlign: "center" }}>{label}</div>}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Analytics() {
  const [timeframe, setTimeframe] = useState("week");
  const [activeSection, setActiveSection] = useState("overview");
  const [toast, setToast] = useState(null);
  const [streakDay, setStreakDay] = useState(12);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const chartData = timeframe === "week" ? WEEK_HOURS : timeframe === "month" ? MONTH_HOURS : SEM_HOURS;
  const totalHours = chartData.reduce((s, d) => s + d.hours, 0);
  const avgGPA = (SUBJECTS.reduce((s, c) => s + c.score, 0) / SUBJECTS.length / 10).toFixed(2);
  const avgAttendance = Math.round(SUBJECTS.reduce((s, c) => s + c.attendance, 0) / SUBJECTS.length);
  const assignmentsDone = SUBJECTS.reduce((s, c) => s + c.done, 0);
  const assignmentsTotal = SUBJECTS.reduce((s, c) => s + c.assignments, 0);

  const SECTIONS = [
    { id: "overview",    label: "Overview",    icon: BarChart2 },
    { id: "subjects",    label: "Subjects",    icon: BookOpen },
    { id: "exams",       label: "Exam Scores", icon: Award },
    { id: "attendance",  label: "Attendance",  icon: Calendar },
    { id: "insights",    label: "AI Insights", icon: Brain },
  ];

  return (
    <div className="page-transition">

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "32px", right: "32px", backgroundColor: "#141416", color: "#ffffff", padding: "14px 22px", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999, border: `1px solid ${RED}` }}>
          <CheckCircle size={16} style={{ color: GREEN_LIGHT }} />
          <span style={{ fontSize: "13px", fontWeight: "700" }}>{toast}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <p className="page-category" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={12} style={{ color: RED }} /> PERFORMANCE DASHBOARD
          </p>
          <h1 className="page-title" style={{ fontSize: "36px", fontWeight: "700", fontFamily: "var(--font-display)", margin: "4px 0 0 0" }}>
            Academic Analytics
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>
            Your overall mastery is up <strong style={{ color: RED }}>+14%</strong> this period. Top performance in OS-301 and HCI-202.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Timeframe Toggle */}
          <div style={{ display: "flex", backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px", gap: "2px" }}>
            {["week", "month", "semester"].map(t => (
              <button key={t} onClick={() => setTimeframe(t)} style={{ padding: "7px 14px", borderRadius: "7px", fontSize: "11px", fontWeight: "700", border: "none", backgroundColor: timeframe === t ? RED : "transparent", color: timeframe === t ? "#ffffff" : "var(--text-muted)", cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize" }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => showToast("PDF report generated and saved!")} style={{ padding: "10px 18px", borderRadius: "10px", backgroundColor: RED, color: "#ffffff", fontWeight: "700", fontSize: "12px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: `0 4px 14px rgba(255,90,76,0.3)` }}>
            <Download size={15} /> EXPORT REPORT
          </button>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "CUMULATIVE GPA",     value: avgGPA,              sub: "out of 10.0",   icon: Star,         up: true  },
          { label: "STUDY HOURS",        value: `${totalHours}h`,    sub: timeframe,        icon: Clock,        up: true  },
          { label: "LEARNING STREAK",    value: `${streakDay} days`, sub: "personal best",  icon: Flame,        up: true  },
          { label: "ASSIGNMENTS DONE",   value: `${assignmentsDone}/${assignmentsTotal}`, sub: "submitted", icon: FileText, up: true },
          { label: "AVG ATTENDANCE",     value: `${avgAttendance}%`, sub: "across courses", icon: CheckCircle,  up: avgAttendance >= 85 },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: "#ffffff", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: `rgba(255,90,76,0.1)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={18} style={{ color: RED }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: "700", color: s.up ? GREEN : RED }}>
                {s.up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.06em", marginTop: "4px", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Section Nav ── */}
      <div style={{ display: "flex", gap: "4px", backgroundColor: "#ffffff", padding: "4px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "28px", width: "fit-content" }}>
        {SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "none", backgroundColor: activeSection === sec.id ? RED : "transparent", color: activeSection === sec.id ? "#ffffff" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}>
            <sec.icon size={13} />
            {sec.label}
          </button>
        ))}
      </div>

      {/* ════════ OVERVIEW ════════ */}
      {activeSection === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Study Hours Chart */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em" }}>STUDY HOURS</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: RED, marginTop: "2px" }}>{totalHours.toFixed(1)}h <span style={{ fontSize: "12px", color: GREEN, fontWeight: "700" }}>↑ +14%</span></div>
                </div>
                <div style={{ padding: "6px 14px", borderRadius: "20px", backgroundColor: "rgba(255,90,76,0.08)", border: "1px solid rgba(255,90,76,0.15)", fontSize: "11px", fontWeight: "700", color: RED }}>{timeframe.toUpperCase()}</div>
              </div>
              <BarChart data={chartData} color={RED} />
            </div>

            {/* Subject Performance Bars */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", padding: "24px 28px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "18px" }}>SUBJECT PERFORMANCE SCORES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {SUBJECTS.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: RED, backgroundColor: "rgba(255,90,76,0.08)", padding: "2px 8px", borderRadius: "4px" }}>{s.code}</span>
                        <span style={{ fontSize: "12px", fontWeight: "600" }}>{s.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: s.trend.startsWith("+") ? GREEN : "#FF5A4C" }}>{s.trend}%</span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: s.score >= 85 ? GREEN : s.score >= 70 ? RED : "#d32f2f" }}>{s.score}%</span>
                      </div>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#F0EAE0", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.score}%`, backgroundColor: s.score >= 85 ? GREEN : RED, borderRadius: "4px", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Allocation */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", padding: "24px 28px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "18px" }}>TIME ALLOCATION BY SUBJECT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {TIME_ALLOC.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", width: "80px", flexShrink: 0 }}>{t.subject}</span>
                    <div style={{ flex: 1, height: "20px", backgroundColor: "#F0EAE0", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${t.pct}%`, backgroundColor: RED, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "6px", transition: "width 0.6s" }}>
                        <span style={{ fontSize: "9px", fontWeight: "800", color: "#ffffff" }}>{t.pct}%</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "32px", textAlign: "right" }}>{t.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px" }}>

            {/* Circle Metrics */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", padding: "20px 24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "18px" }}>KEY METRICS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <CircleProgress value={Math.round(avgGPA * 10)} label="GPA SCORE" color={RED} />
                <CircleProgress value={avgAttendance} label="ATTENDANCE" color={avgAttendance >= 85 ? GREEN : RED} />
                <CircleProgress value={Math.round((assignmentsDone / assignmentsTotal) * 100)} label="ASSIGNMENTS" color={RED} />
                <CircleProgress value={78} label="EXAM READY" color={RED} />
              </div>
            </div>

            {/* Streak Calendar */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em" }}>🔥 STUDY STREAK</div>
                <span style={{ fontSize: "14px", fontWeight: "800", color: RED }}>{streakDay} days</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {Array.from({ length: 28 }).map((_, i) => {
                  const studied = i < 12 || (i >= 14 && i < 20) || i === 22;
                  return (
                    <div key={i} style={{ width: "100%", paddingBottom: "100%", position: "relative", borderRadius: "3px", backgroundColor: studied ? RED : "#F0EAE0" }}>
                      <div style={{ position: "absolute", inset: 0 }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#F0EAE0" }} />
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>No study</span>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: RED }} />
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Studied</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em" }}>RECENT ACTIVITY</span>
              </div>
              <div style={{ padding: "10px 20px", display: "flex", flexDirection: "column" }}>
                {ACTIVITY_FEED.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px 0", borderBottom: i < ACTIVITY_FEED.length - 1 ? "1px dashed var(--border)" : "none" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "8px", backgroundColor: `${a.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <a.icon size={12} style={{ color: a.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-primary)", lineHeight: "1.4" }}>{a.text}</div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px" }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ SUBJECTS ════════ */}
      {activeSection === "subjects" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {SUBJECTS.map((s, i) => {
            const assignPct = Math.round((s.done / s.assignments) * 100);
            const allDone = s.done === s.assignments;
            return (
              <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ height: "5px", backgroundColor: allDone ? GREEN : RED }} />
                <div style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: RED, backgroundColor: "rgba(255,90,76,0.08)", padding: "2px 8px", borderRadius: "4px" }}>{s.code}</span>
                      <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "6px 0 0 0" }}>{s.name}</h3>
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: "800", color: s.score >= 85 ? GREEN : RED }}>{s.score}%</div>
                  </div>

                  {/* Score bar */}
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>SCORE</span>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: s.score >= 85 ? GREEN : RED }}>{s.score}%</span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#F0EAE0", borderRadius: "4px" }}>
                      <div style={{ height: "100%", width: `${s.score}%`, backgroundColor: s.score >= 85 ? GREEN : RED, borderRadius: "4px" }} />
                    </div>
                  </div>

                  {/* Assignment bar */}
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>ASSIGNMENTS ({s.done}/{s.assignments})</span>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: allDone ? GREEN : RED }}>{assignPct}%</span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#F0EAE0", borderRadius: "4px" }}>
                      <div style={{ height: "100%", width: `${assignPct}%`, backgroundColor: allDone ? GREEN : RED, borderRadius: "4px" }} />
                    </div>
                  </div>

                  {/* Attendance bar */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>ATTENDANCE</span>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: s.attendance >= 85 ? GREEN : RED }}>{s.attendance}%</span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#F0EAE0", borderRadius: "4px" }}>
                      <div style={{ height: "100%", width: `${s.attendance}%`, backgroundColor: s.attendance >= 85 ? GREEN : RED, borderRadius: "4px" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { label: "Score", val: `${s.score}%` },
                      { label: "Attendance", val: `${s.attendance}%` },
                      { label: "Trend", val: s.trend + "%", ok: s.trend.startsWith("+") },
                    ].map((stat, j) => (
                      <div key={j} style={{ flex: 1, textAlign: "center", padding: "8px", backgroundColor: "#FAF6EE", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: stat.ok !== undefined ? (stat.ok ? GREEN : RED) : RED }}>{stat.val}</div>
                        <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700", marginTop: "2px" }}>{stat.label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════ EXAM SCORES ════════ */}
      {activeSection === "exams" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
          <div>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", padding: "24px 28px", marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "20px" }}>EXAM SCORE HISTORY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {EXAM_SCORES.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: "1px solid var(--border)" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: e.score >= 85 ? "rgba(0,163,114,0.1)" : "rgba(255,90,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Award size={20} style={{ color: e.score >= 85 ? GREEN : RED }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "800", color: RED, marginRight: "8px" }}>{e.subject}</span>
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>{e.exam}</span>
                        </div>
                        <span style={{ fontSize: "20px", fontWeight: "800", color: e.score >= 85 ? GREEN : RED }}>{e.score}%</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "#E8DFCF", borderRadius: "3px" }}>
                        <div style={{ height: "100%", width: `${e.score}%`, backgroundColor: e.score >= 85 ? GREEN : RED, borderRadius: "3px" }} />
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>{e.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score Summary Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", padding: "20px 22px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "16px" }}>SCORE DISTRIBUTION</div>
              {[
                { range: "90–100%", count: EXAM_SCORES.filter(e => e.score >= 90).length, label: "Distinction" },
                { range: "75–89%",  count: EXAM_SCORES.filter(e => e.score >= 75 && e.score < 90).length, label: "Merit" },
                { range: "50–74%",  count: EXAM_SCORES.filter(e => e.score >= 50 && e.score < 75).length, label: "Pass" },
                { range: "Below 50", count: EXAM_SCORES.filter(e => e.score < 50).length, label: "Fail" },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < 3 ? "1px dashed var(--border)" : "none" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: i === 0 ? "rgba(0,163,114,0.1)" : i < 3 ? "rgba(255,90,76,0.1)" : "rgba(211,47,47,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: i === 0 ? GREEN : RED }}>{d.count}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700" }}>{d.range}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{d.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", padding: "20px 22px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "14px" }}>AVERAGE BY SUBJECT</div>
              {SUBJECTS.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < SUBJECTS.length - 1 ? "1px dashed var(--border)" : "none" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700" }}>{s.code}</span>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: s.score >= 85 ? GREEN : RED }}>{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════ ATTENDANCE ════════ */}
      {activeSection === "attendance" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>
          <div>
            {/* Per-subject attendance */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", padding: "24px 28px", marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "20px" }}>ATTENDANCE BY SUBJECT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {SUBJECTS.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: RED, backgroundColor: "rgba(255,90,76,0.08)", padding: "2px 8px", borderRadius: "4px" }}>{s.code}</span>
                        <span style={{ fontSize: "13px", fontWeight: "600" }}>{s.name}</span>
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: "800", color: s.attendance >= 85 ? GREEN : RED }}>{s.attendance}%</span>
                    </div>
                    <div style={{ height: "10px", backgroundColor: "#F0EAE0", borderRadius: "5px", overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${s.attendance}%`, backgroundColor: s.attendance >= 85 ? GREEN : RED, borderRadius: "5px", transition: "width 0.6s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{Math.round(s.attendance / 100 * 20)}/20 classes attended</span>
                      {s.attendance < 85 && <span style={{ fontSize: "9px", color: RED, fontWeight: "700" }}>⚠ Below 85% threshold</span>}
                      {s.attendance >= 85 && <span style={{ fontSize: "9px", color: GREEN, fontWeight: "700" }}>✓ Good standing</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Attendance Heatmap */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", padding: "24px 28px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "16px" }}>WEEKLY ATTENDANCE HEATMAP (LAST 4 WEEKS)</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                  <div key={d} style={{ flex: 1, textAlign: "center", fontSize: "9px", fontWeight: "700", color: "var(--text-muted)" }}>{d}</div>
                ))}
              </div>
              {ATTENDANCE_GRID.map((week, wi) => (
                <div key={wi} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  {week.map((day, di) => (
                    <div key={di} style={{ flex: 1, height: "32px", borderRadius: "6px", backgroundColor: day === null ? "#FAF6EE" : day ? "rgba(0,163,114,0.15)" : "rgba(255,90,76,0.12)", border: `1px solid ${day === null ? "var(--border)" : day ? "rgba(0,163,114,0.3)" : "rgba(255,90,76,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {day !== null && (
                        day
                          ? <CheckCircle size={14} style={{ color: GREEN }} />
                          : <span style={{ fontSize: "12px", color: RED, fontWeight: "700" }}>✕</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "rgba(0,163,114,0.15)", border: "1px solid rgba(0,163,114,0.3)" }} /><span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Present</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "rgba(255,90,76,0.12)", border: "1px solid rgba(255,90,76,0.25)" }} /><span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Absent</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#FAF6EE", border: "1px solid var(--border)" }} /><span style={{ fontSize: "10px", color: "var(--text-muted)" }}>No Class</span></div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", padding: "20px 22px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "14px" }}>OVERALL ATTENDANCE</div>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <CircleProgress value={avgAttendance} size={100} stroke={10} color={avgAttendance >= 85 ? GREEN : RED} />
              </div>
              <div style={{ marginTop: "16px", padding: "10px", backgroundColor: avgAttendance >= 85 ? "rgba(0,163,114,0.06)" : "rgba(255,90,76,0.06)", borderRadius: "8px", border: `1px solid ${avgAttendance >= 85 ? "rgba(0,163,114,0.2)" : "rgba(255,90,76,0.2)"}` }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: avgAttendance >= 85 ? GREEN : RED, textAlign: "center" }}>
                  {avgAttendance >= 85 ? "✅ Good Standing" : "⚠ Below Threshold"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "3px" }}>Minimum required: 85%</div>
              </div>
            </div>

            {SUBJECTS.map((s, i) => (
              <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid var(--border)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: "800", color: RED }}>{s.code}</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", marginTop: "2px" }}>{s.name.split(" ")[0]}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: s.attendance >= 85 ? GREEN : RED }}>{s.attendance}%</div>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{Math.round(s.attendance / 100 * 20)}/20 classes</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ AI INSIGHTS ════════ */}
      {activeSection === "insights" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
          <div>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", padding: "28px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "rgba(255,90,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Brain size={22} style={{ color: RED }} />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700" }}>AI Performance Coach</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Personalised insights based on your academic data</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {AI_INSIGHTS.map((ins, i) => (
                  <div key={i} style={{ padding: "16px 20px", backgroundColor: "#FAF6EE", borderRadius: "12px", border: "1px solid var(--border)", borderLeft: `4px solid ${ins.type === "praise" ? GREEN : RED}` }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "20px", flexShrink: 0 }}>{ins.icon}</span>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.6" }}>{ins.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--border)", padding: "24px 28px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "16px" }}>📋 RECOMMENDED ACTIONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { action: "Review IS-LM Chapter 4–6 before ECON-401 exam", urgent: true, done: false },
                  { action: "Submit DB-402 B+ Tree assignment (due in 7 days)", urgent: true, done: false },
                  { action: "Complete COMP-501 LLVM pass implementation (60% done)", urgent: false, done: false },
                  { action: "Download HCI-202 lecture materials for Week 5", urgent: false, done: false },
                  { action: "OS-301 exam preparation — attend office hours", urgent: false, done: false },
                  { action: "OS-301 Assignment submitted and graded ✓", urgent: false, done: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", backgroundColor: item.done ? "rgba(0,163,114,0.06)" : item.urgent ? "rgba(255,90,76,0.05)" : "#FAF6EE", borderRadius: "10px", border: `1px solid ${item.done ? "rgba(0,163,114,0.2)" : item.urgent ? "rgba(255,90,76,0.15)" : "var(--border)"}` }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: item.done ? "rgba(0,163,114,0.15)" : item.urgent ? "rgba(255,90,76,0.12)" : "#F0EAE0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {item.done
                        ? <CheckCircle size={12} style={{ color: GREEN }} />
                        : <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: item.urgent ? RED : BROWN, display: "block" }} />
                      }
                    </div>
                    <span style={{ fontSize: "13px", color: item.done ? GREEN : "var(--text-primary)", textDecoration: item.done ? "line-through" : "none", flex: 1 }}>{item.action}</span>
                    {item.urgent && !item.done && <span style={{ fontSize: "9px", fontWeight: "800", color: RED, backgroundColor: "rgba(255,90,76,0.1)", padding: "2px 8px", borderRadius: "8px" }}>URGENT</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", padding: "22px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "16px" }}>ACADEMIC HEALTH SCORE</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "64px", fontWeight: "800", color: RED, lineHeight: 1 }}>78</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>out of 100</div>
                <div style={{ height: "8px", backgroundColor: "#F0EAE0", borderRadius: "4px", margin: "14px 0", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "78%", backgroundColor: RED, borderRadius: "4px" }} />
                </div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>Grade: <span style={{ color: RED }}>B+ (Good)</span></div>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", padding: "20px 22px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "14px" }}>STRENGTHS</div>
              {["OS-301 Attendance (96%)", "Consistent study streak", "HCI-202 score (91%)"].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "6px 0", borderBottom: i < 2 ? "1px dashed var(--border)" : "none" }}>
                  <CheckCircle size={13} style={{ color: GREEN, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px" }}>{s}</span>
                </div>
              ))}
              <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", marginTop: "16px", marginBottom: "10px" }}>AREAS TO IMPROVE</div>
              {["ECON-401 score (74%)", "Assignment completion (60%)", "Weekend study hours low"].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "6px 0", borderBottom: i < 2 ? "1px dashed var(--border)" : "none" }}>
                  <AlertCircle size={13} style={{ color: RED, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
