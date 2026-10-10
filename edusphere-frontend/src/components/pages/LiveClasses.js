import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Video, MessageSquare, Hand, Mic, MicOff, Camera, CameraOff, X, Send,
  PlayCircle, Users, Clock, BookOpen, Download, ChevronLeft, ChevronRight,
  Calendar, Star, Bell, BellOff, FileText, Wifi, WifiOff, BarChart2,
  CheckCircle, AlertCircle, Volume2, VolumeX, Maximize2, Settings,
  ThumbsUp, Share2, Pin, Search, Filter, Radio, Award, Zap,
  PenTool, StickyNote, Layers, Globe, TrendingUp, Plus
} from "lucide-react";
import "../../index.css";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050';

/* ─── Data ─────────────────────────────────────────── */
const ALL_CLASSES = [
  {
    id: 1,
    code: "OS-301",
    title: "Operating Systems: Kernel Architectures & Virtual Memory",
    prof: "Dr. Aris Thorne",
    profRole: "Head of Systems Dept.",
    avatar: "/avatar_thorne.png",
    time: "14:00 — 15:30",
    date: "TODAY",
    duration: "90 min",
    status: "LIVE",
    attendees: 47,
    maxAttendees: 60,
    rating: 4.9,
    tags: ["Kernel", "Memory", "Paging"],
    desc: "Live breakdown of monolithic vs. microkernel designs, demand paging, and TLB miss handler trace.",
    slides: 12,
    recordings: 3,
    color: "#FF5A4C"
  },
  {
    id: 2,
    code: "COMP-501",
    title: "Compiler Design: LLVM IR Generation & Optimisation Passes",
    prof: "Dr. Aris Thorne",
    profRole: "Head of Systems Dept.",
    avatar: "/avatar_thorne.png",
    time: "10:00 — 11:30",
    date: "Tomorrow",
    duration: "90 min",
    status: "UPCOMING",
    attendees: 38,
    maxAttendees: 60,
    rating: 4.8,
    tags: ["LLVM", "IR", "SSA Form"],
    desc: "Building LLVM transformation passes: constant folding, dead code elimination, and loop invariant motion.",
    slides: 8,
    recordings: 5,
    color: "#7C5CBF"
  },
  {
    id: 3,
    code: "HCI-202",
    title: "Human Computer Interaction: Eye-Gaze Heuristics & Accessibility",
    prof: "Prof. Sarah Jenkins",
    profRole: "UX & Ergonomics Lead",
    avatar: "/avatar_sarah.png",
    time: "09:00 — 10:00",
    date: "Thursday",
    duration: "60 min",
    status: "UPCOMING",
    attendees: 29,
    maxAttendees: 40,
    rating: 4.7,
    tags: ["UX", "Eye-Tracking", "A11y"],
    desc: "Heuristic evaluation methods, eye-gaze attention heatmaps, and WCAG 2.2 accessibility standards.",
    slides: 10,
    recordings: 2,
    color: "#00B4D8"
  },
  {
    id: 4,
    code: "ECON-401",
    title: "Macroeconomics: Central Bank Rate Models & QE Simulations",
    prof: "Dr. Alistair Vance",
    profRole: "Dean of Economics",
    avatar: "/avatar_vance.png",
    time: "14:00 — 15:30",
    date: "Friday",
    duration: "90 min",
    status: "UPCOMING",
    attendees: 51,
    maxAttendees: 80,
    rating: 4.6,
    tags: ["Monetary Policy", "IS-LM", "QE"],
    desc: "Monetary policy transmission, quantitative easing models, and real business cycle simulations.",
    slides: 14,
    recordings: 4,
    color: "#2EC4B6"
  },
  {
    id: 5,
    code: "DB-402",
    title: "Database Systems: B+ Tree Concurrency & MVCC Protocols",
    prof: "Dr. Aris Thorne",
    profRole: "Head of Systems Dept.",
    avatar: "/avatar_thorne.png",
    time: "11:00 — 12:30",
    date: "Monday",
    duration: "90 min",
    status: "COMPLETED",
    attendees: 44,
    maxAttendees: 60,
    rating: 5.0,
    tags: ["B+ Tree", "MVCC", "Locking"],
    desc: "Thread-safe concurrent B+ tree insertions, latch crabbing protocol, and snapshot isolation.",
    slides: 11,
    recordings: 1,
    color: "#F77F00"
  }
];

const RECORDINGS = [
  { id: 1, code: "OS-301", title: "Kernel Memory Management — Lecture 6", prof: "Dr. Aris Thorne", duration: "1h 28m", date: "Jul 14, 2026", views: 132, thumbnail: "📺", rating: 4.9 },
  { id: 2, code: "DB-402", title: "B+ Tree Concurrency Protocols — Lecture 5", prof: "Dr. Aris Thorne", duration: "1h 22m", date: "Jul 12, 2026", views: 98, thumbnail: "🗄", rating: 5.0 },
  { id: 3, code: "COMP-501", title: "LLVM IR & SSA Form — Lecture 4", prof: "Dr. Aris Thorne", duration: "1h 31m", date: "Jul 10, 2026", views: 87, thumbnail: "⚙️", rating: 4.8 },
  { id: 4, code: "ECON-401", title: "IS-LM Equilibrium Models — Lecture 3", prof: "Dr. Alistair Vance", duration: "1h 18m", date: "Jul 8, 2026", views: 74, thumbnail: "📊", rating: 4.6 },
  { id: 5, code: "HCI-202", title: "Eye-Gaze Heatmaps — Lecture 2", prof: "Prof. Sarah Jenkins", duration: "58m", date: "Jul 6, 2026", views: 61, thumbnail: "👁", rating: 4.7 },
  { id: 6, code: "OS-301", title: "Process Scheduling Algorithms — Lecture 5", prof: "Dr. Aris Thorne", duration: "1h 35m", date: "Jul 4, 2026", views: 115, thumbnail: "🖥", rating: 4.9 },
];

const COURSE_MATERIALS = [
  { code: "OS-301", name: "Lecture 6 — Kernel Memory Slides", type: "PDF", size: "3.2 MB", icon: "📄" },
  { code: "COMP-501", name: "LLVM IR Cheatsheet & Pass API Reference", type: "PDF", size: "1.8 MB", icon: "📋" },
  { code: "DB-402", name: "B+ Tree Concurrency Lab Starter Code", type: "ZIP", size: "840 KB", icon: "📦" },
  { code: "ECON-401", name: "IS-LM Python Simulation Notebook", type: "IPYNB", size: "1.1 MB", icon: "📓" },
  { code: "HCI-202", name: "WCAG 2.2 Quick Reference Guide", type: "PDF", size: "2.4 MB", icon: "♿" },
  { code: "OS-301", name: "Paging & TLB Demo C++ Source", type: "ZIP", size: "560 KB", icon: "💾" },
];

const ATTENDANCE = [
  { date: "Jul 21", attended: true, class: "OS-301 Kernel Architectures" },
  { date: "Jul 18", attended: true, class: "DB-402 B+ Tree Concurrency" },
  { date: "Jul 16", attended: false, class: "COMP-501 LLVM IR Generation" },
  { date: "Jul 14", attended: true, class: "OS-301 Process Scheduling" },
  { date: "Jul 11", attended: true, class: "ECON-401 IS-LM Models" },
  { date: "Jul 9", attended: true, class: "HCI-202 Eye-Gaze Methods" },
  { date: "Jul 7", attended: false, class: "DB-402 MVCC Protocols" },
  { date: "Jul 4", attended: true, class: "COMP-501 SSA Form" },
];

const SLIDES = [
  { num: 1, title: "Monolithic Kernel Architecture Overview", content: "Linux kernel design: unified address space, device drivers in kernel mode, syscall interface." },
  { num: 2, title: "Microkernel vs Monolithic: Trade-offs", content: "Minix, QNX, seL4: IPC overhead vs isolation guarantees. L4 microkernel benchmark comparisons." },
  { num: 3, title: "Virtual Memory & Address Translation", content: "Multi-level page tables, TLB structure, CR3 register, page walk in x86-64 4-level hierarchy." },
  { num: 4, title: "Demand Paging & Page Fault Handler", content: "Minor vs major faults, copy-on-write optimization, mmap anonymous regions, OOM killer policy." },
  { num: 5, title: "Page Replacement Algorithms", content: "LRU, Clock-hand (2nd chance), ARC, CLOCK-Pro. Belady's anomaly in FIFO. Working set model." },
  { num: 6, title: "Memory-Mapped Files & Shared Memory", content: "mmap() system call internals, file-backed vs anonymous mappings, POSIX shared memory segments." },
];

/* ─── Main Component ─────────────────────────────── */
export default function LiveClasses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("schedule");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [apiClasses, setApiClasses] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [remindedIds, setRemindedIds] = useState(new Set());

  // Faculty Create Class Form
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCourseName, setNewCourseName] = useState("Operating Systems OS-301");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  // Fetch Live Classes from API
  useEffect(() => {
    async function fetchLiveClasses() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_BASE}/api/live-classes`, {
          headers: { 'x-auth-token': token }
        });
        if (res.data && Array.isArray(res.data)) {
          const mapped = res.data.map(cls => ({
            id: cls._id,
            meetingId: cls.meetingId,
            code: cls.courseName || 'SYS-101',
            title: cls.title,
            prof: cls.faculty?.name || cls.facultyName || 'Faculty',
            profRole: 'Course Instructor',
            time: cls.scheduledStart ? new Date(cls.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live Now',
            date: cls.status === 'live' ? 'TODAY' : 'Scheduled',
            duration: '90 min',
            status: cls.status.toUpperCase(),
            attendees: cls.activeParticipantsCount || 1,
            maxAttendees: 60,
            rating: 4.9,
            tags: ['Lecture', 'Live'],
            desc: cls.description || cls.topic || 'EduSphere Interactive Virtual Session',
            slides: 10,
            recordings: 0,
            color: '#FF5A4C'
          }));
          setApiClasses(mapped);
        }
      } catch (err) {
        console.warn('API live classes fetch error:', err.message);
      }
    }

    fetchLiveClasses();
    const interval = setInterval(fetchLiveClasses, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateLiveClass = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/api/live-classes`, {
        title: newTitle.trim(),
        topic: newTopic.trim(),
        description: newDesc.trim(),
        courseName: newCourseName,
        scheduledStart: new Date(),
        scheduledEnd: new Date(Date.now() + 90 * 60 * 1000)
      }, {
        headers: { 'x-auth-token': token }
      });

      showToast('Live class created successfully!');
      setShowCreateModal(false);
      setNewTitle('');
      setNewTopic('');
      setNewDesc('');

      // Auto start class and navigate
      if (res.data && res.data.meetingId) {
        await axios.post(`${API_BASE}/api/live-classes/${res.data.meetingId}/start`, {}, {
          headers: { 'x-auth-token': token }
        });
        navigate(`/live-class/${res.data.meetingId}`);
      }
    } catch (err) {
      console.error('Create live class error:', err);
      showToast(err.response?.data?.msg || 'Failed to create live class');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Classroom controls
  const [handRaised, setHandRaised] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { sender: "Prof. Thorne", text: "Welcome class! Today we examine monolithic kernel memory mapping.", time: "14:02", role: "prof" },
    { sender: "Elena R.", text: "Are we covering virtual memory page replacement first?", time: "14:04", role: "student" },
    { sender: "Marcus K.", text: "Slide 3 TLB explanation is super clear!", time: "14:06", role: "student" },
    { sender: "Prof. Thorne", text: "Great question Elena! Yes, we start with LRU replacement.", time: "14:07", role: "prof" },
    { sender: "Julianne S.", text: "Will there be a live demo with the paging simulator?", time: "14:09", role: "you" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollVote, setPollVote] = useState(null);
  const [pollVotes, setPollVotes] = useState({ a: 18, b: 12, c: 7, d: 10 });
  const [classNotes, setClassNotes] = useState("");
  const [activeClassroomTab, setActiveClassroomTab] = useState("chat");
  const [liveTime, setLiveTime] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (showClassroomModal) {
      const t = setInterval(() => setLiveTime(p => p + 1), 1000);
      return () => clearInterval(t);
    }
  }, [showClassroomModal]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatMessages(prev => [...prev, { sender: "Julianne S. (You)", text: newMessage, time, role: "you" }]);
    setNewMessage("");
  };

  const handleVote = (opt) => {
    if (pollVote) return;
    setPollVote(opt);
    setPollVotes(prev => ({ ...prev, [opt]: prev[opt] + 1 }));
    showToast("Vote recorded!");
  };

  const toggleReminder = (id) => {
    setRemindedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      showToast(next.has(id) ? "Reminder set! You'll be notified 15 min before." : "Reminder cancelled.");
      return next;
    });
  };

  const liveMin = String(Math.floor(liveTime / 60)).padStart(2, "0");
  const liveSec = String(liveTime % 60).padStart(2, "0");

  const filteredClasses = ALL_CLASSES.filter(c => {
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prof.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPollVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);
  const attendanceRate = Math.round((ATTENDANCE.filter(a => a.attended).length / ATTENDANCE.length) * 100);

  const NAV_SECTIONS = [
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "recordings", label: "Recordings", icon: PlayCircle },
    { id: "materials", label: "Materials", icon: FileText },
    { id: "attendance", label: "Attendance", icon: CheckCircle },
  ];

  /* ─── Live Classroom Modal ─── */
  const ClassroomModal = () => (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "#0d0d0f", borderRadius: "20px", width: "100%", maxWidth: isFullscreen ? "100%" : "1100px", height: isFullscreen ? "100vh" : "85vh", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #2a2a2e" }}>

        {/* Modal Top Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", backgroundColor: "#141416", borderBottom: "1px solid #2a2a2e", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FF5A4C", animation: "pulse 1s infinite" }} />
            <span style={{ color: "#ffffff", fontWeight: "700", fontSize: "14px" }}>{activeClass?.title?.slice(0, 48)}…</span>
            <span style={{ fontSize: "11px", color: "#8b8b9a", backgroundColor: "#1a1a1e", padding: "2px 8px", borderRadius: "8px" }}>{activeClass?.code}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#FF5A4C", fontSize: "12px", fontWeight: "700" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#FF5A4C" }} />
              LIVE · {liveMin}:{liveSec}
            </div>
            <span style={{ fontSize: "11px", color: "#8b8b9a" }}>{activeClass?.attendees} attending</span>
            <button onClick={() => setIsFullscreen(!isFullscreen)} style={{ background: "none", border: "none", color: "#8b8b9a", cursor: "pointer" }}>
              <Maximize2 size={16} />
            </button>
            <button onClick={() => { setShowClassroomModal(false); setLiveTime(0); }} style={{ background: "#FF5A4C22", border: "1px solid #FF5A4C44", color: "#FF5A4C", cursor: "pointer", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "700" }}>
              EXIT
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", flex: 1, overflow: "hidden" }}>

          {/* Left: Slides + Controls */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Slide View */}
            <div style={{ flex: 1, backgroundColor: "#08080a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
              {/* Slide Counter */}
              <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "#1a1a1e", color: "#8b8b9a", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "8px", border: "1px solid #2a2a2e" }}>
                {activeSlide + 1} / {SLIDES.length}
              </div>

              {/* Slide Content */}
              <div style={{ width: "100%", maxWidth: "680px", backgroundColor: "#141416", borderRadius: "16px", border: "1px solid #2a2a2e", padding: "40px 48px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "#FF5A4C", letterSpacing: "0.1em", marginBottom: "16px" }}>SLIDE {activeSlide + 1}</div>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#ffffff", marginBottom: "20px", lineHeight: "1.3", fontFamily: "'Georgia', serif" }}>
                  {SLIDES[activeSlide].title}
                </h3>
                <p style={{ fontSize: "14px", color: "#9a9aaa", lineHeight: "1.7" }}>{SLIDES[activeSlide].content}</p>
              </div>

              {/* Prof Camera Bubble */}
              <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "120px", height: "90px", backgroundColor: "#1a1a1e", borderRadius: "12px", border: "2px solid #FF5A4C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#2a2a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👨‍🏫</div>
                <span style={{ fontSize: "9px", color: "#8b8b9a", fontWeight: "700" }}>Prof. Thorne</span>
                <span style={{ fontSize: "8px", color: "#00e5a0" }}>● Live</span>
              </div>

              {/* Navigation Arrows */}
              <button onClick={() => setActiveSlide(p => Math.max(0, p - 1))} disabled={activeSlide === 0} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", background: "#1a1a1e", border: "1px solid #2a2a2e", color: activeSlide === 0 ? "#3a3a4a" : "#ffffff", cursor: activeSlide === 0 ? "not-allowed" : "pointer", borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setActiveSlide(p => Math.min(SLIDES.length - 1, p + 1))} disabled={activeSlide === SLIDES.length - 1} style={{ position: "absolute", right: "152px", top: "50%", transform: "translateY(-50%)", background: "#1a1a1e", border: "1px solid #2a2a2e", color: activeSlide === SLIDES.length - 1 ? "#3a3a4a" : "#ffffff", cursor: activeSlide === SLIDES.length - 1 ? "not-allowed" : "pointer", borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={18} />
              </button>

              {/* Slide Dots */}
              <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" }}>
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setActiveSlide(i)} style={{ width: i === activeSlide ? "20px" : "6px", height: "6px", borderRadius: "3px", backgroundColor: i === activeSlide ? "#FF5A4C" : "#2a2a2e", border: "none", cursor: "pointer", transition: "all 0.2s" }} />
                ))}
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", backgroundColor: "#141416", borderTop: "1px solid #2a2a2e", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { icon: isMicOn ? Mic : MicOff, label: isMicOn ? "Mute" : "Unmute", active: isMicOn, action: () => { setIsMicOn(!isMicOn); showToast(isMicOn ? "Mic muted" : "Mic on"); } },
                  { icon: isCamOn ? Camera : CameraOff, label: isCamOn ? "Stop Video" : "Start Video", active: isCamOn, action: () => { setIsCamOn(!isCamOn); showToast(isCamOn ? "Camera off" : "Camera on"); } },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: btn.active ? "#1a1a1e" : "#FF5A4C22", border: `1px solid ${btn.active ? "#2a2a2e" : "#FF5A4C44"}`, borderRadius: "8px", padding: "8px 14px", cursor: "pointer", color: btn.active ? "#ffffff" : "#FF5A4C" }}>
                    <btn.icon size={16} />
                    <span style={{ fontSize: "9px", fontWeight: "700" }}>{btn.label}</span>
                  </button>
                ))}
                <button onClick={() => { setHandRaised(!handRaised); showToast(handRaised ? "Hand lowered" : "✋ Hand raised!"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: handRaised ? "rgba(245,166,35,0.15)" : "#1a1a1e", border: `1px solid ${handRaised ? "#f5a623" : "#2a2a2e"}`, borderRadius: "8px", padding: "8px 14px", cursor: "pointer", color: handRaised ? "#f5a623" : "#8b8b9a" }}>
                  <Hand size={16} />
                  <span style={{ fontSize: "9px", fontWeight: "700" }}>{handRaised ? "✋ Raised" : "Raise Hand"}</span>
                </button>
                <button onClick={() => { setShowPoll(!showPoll); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: showPoll ? "rgba(0,229,160,0.1)" : "#1a1a1e", border: `1px solid ${showPoll ? "#00e5a0" : "#2a2a2e"}`, borderRadius: "8px", padding: "8px 14px", cursor: "pointer", color: showPoll ? "#00e5a0" : "#8b8b9a" }}>
                  <BarChart2 size={16} />
                  <span style={{ fontSize: "9px", fontWeight: "700" }}>Poll</span>
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8b8b9a", fontSize: "11px" }}>
                  <Users size={12} />
                  <span>{activeClass?.attendees} live</span>
                </div>
              </div>
            </div>

            {/* Live Poll */}
            {showPoll && (
              <div style={{ backgroundColor: "#141416", borderTop: "1px solid #2a2a2e", padding: "16px 20px", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#00e5a0" }}>⚡ LIVE POLL — Which replacement policy has best real-world performance?</span>
                  {pollVote && <span style={{ fontSize: "10px", color: "#00e5a0", fontWeight: "700" }}>✓ Voted</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { key: "a", label: "A. LRU (Least Recently Used)" },
                    { key: "b", label: "B. ARC (Adaptive Replacement)" },
                    { key: "c", label: "C. FIFO (First In, First Out)" },
                    { key: "d", label: "D. Clock-Pro Algorithm" }
                  ].map(opt => {
                    const pct = Math.round((pollVotes[opt.key] / totalPollVotes) * 100);
                    const isVoted = pollVote === opt.key;
                    return (
                      <button key={opt.key} onClick={() => handleVote(opt.key)} style={{ position: "relative", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${isVoted ? "#00e5a0" : "#2a2a2e"}`, backgroundColor: "transparent", cursor: pollVote ? "default" : "pointer", textAlign: "left", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: pollVote ? `${pct}%` : "0%", backgroundColor: isVoted ? "rgba(0,229,160,0.15)" : "rgba(255,255,255,0.04)", transition: "width 0.6s ease" }} />
                        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: isVoted ? "#00e5a0" : "#8b8b9a", fontWeight: isVoted ? "700" : "500" }}>{opt.label}</span>
                          {pollVote && <span style={{ fontSize: "11px", color: "#4a4a5a", fontWeight: "700" }}>{pct}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: "8px", fontSize: "10px", color: "#4a4a5a" }}>{totalPollVotes} total votes</div>
              </div>
            )}
          </div>

          {/* Right: Chat / Notes Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid #2a2a2e", backgroundColor: "#0d0d0f", overflow: "hidden" }}>
            {/* Sidebar Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #2a2a2e", flexShrink: 0 }}>
              {[
                { id: "chat", label: "Chat", icon: MessageSquare },
                { id: "notes", label: "Notes", icon: PenTool },
                { id: "people", label: "People", icon: Users },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveClassroomTab(tab.id)} style={{ flex: 1, padding: "12px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: "none", border: "none", borderBottom: activeClassroomTab === tab.id ? "2px solid #FF5A4C" : "2px solid transparent", cursor: "pointer", color: activeClassroomTab === tab.id ? "#FF5A4C" : "#4a4a5a" }}>
                  <tab.icon size={14} />
                  <span style={{ fontSize: "9px", fontWeight: "700" }}>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Chat */}
            {activeClassroomTab === "chat" && (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: msg.role === "you" ? "flex-end" : "flex-start" }}>
                      <span style={{ fontSize: "9px", color: "#4a4a5a", fontWeight: "700" }}>{msg.sender} · {msg.time}</span>
                      <div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: msg.role === "you" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", backgroundColor: msg.role === "you" ? "#FF5A4C" : msg.role === "prof" ? "#1a2a3a" : "#1a1a1e", color: "#ffffff", fontSize: "12px", lineHeight: "1.4" }}>
                        {msg.text}
                      </div>
                      {msg.role === "prof" && (
                        <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a5a", fontSize: "10px", display: "flex", alignItems: "center", gap: "2px" }}>
                            <ThumbsUp size={10} /> Like
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: "12px", borderTop: "1px solid #2a2a2e", flexShrink: 0, display: "flex", gap: "8px" }}>
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Message the class…" style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #2a2a2e", backgroundColor: "#1a1a1e", color: "#ffffff", fontSize: "12px", outline: "none" }} />
                  <button type="submit" style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "#FF5A4C", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", flexShrink: 0 }}>
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}

            {/* Notes */}
            {activeClassroomTab === "notes" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#8b8b9a" }}>MY LECTURE NOTES</span>
                  <button onClick={() => showToast("Notes saved!")} style={{ fontSize: "10px", color: "#00e5a0", background: "none", border: "none", cursor: "pointer", fontWeight: "700" }}>SAVE ✓</button>
                </div>
                <textarea value={classNotes} onChange={e => setClassNotes(e.target.value)} placeholder={`Notes for Slide ${activeSlide + 1}:\n\n• `} style={{ flex: 1, backgroundColor: "#141416", border: "1px solid #2a2a2e", borderRadius: "8px", color: "#c8d6f0", fontSize: "12px", lineHeight: "1.6", padding: "12px", outline: "none", resize: "none", fontFamily: "monospace" }} />
                <div style={{ fontSize: "10px", color: "#3a3a4a" }}>{classNotes.length} characters</div>
              </div>
            )}

            {/* People */}
            {activeClassroomTab === "people" && (
              <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#8b8b9a", marginBottom: "10px" }}>IN LECTURE ({activeClass?.attendees})</div>
                {["Dr. Aris Thorne (Host)", "Elena Rostova", "Marcus K.", "Julianne S. (You)", "James O.", "Priya M.", "Raj S.", "Chen L.", "Maya A.", "Tom B."].map((name, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #1a1a1e" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: i === 0 ? "#FF5A4C" : "#1a1a1e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#ffffff", fontWeight: "700" }}>
                      {name[0]}
                    </div>
                    <span style={{ flex: 1, fontSize: "12px", color: i === 0 ? "#FF5A4C" : "#8b8b9a", fontWeight: i === 0 ? "700" : "400" }}>{name}</span>
                    {i === 0 && <span style={{ fontSize: "9px", color: "#FF5A4C", fontWeight: "800" }}>HOST</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Main Page ─── */
  return (
    <div className="page-transition">

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: "32px", right: "32px", backgroundColor: "#141416", color: "#ffffff", padding: "14px 22px", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999, border: "1px solid #FF5A4C" }}>
          <CheckCircle size={16} style={{ color: "#00e5a0" }} />
          <span style={{ fontSize: "13px", fontWeight: "700" }}>{toastMsg}</span>
        </div>
      )}

      {/* ── Create Class Modal for Faculty ── */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#141416", borderRadius: "20px", width: "100%", maxWidth: "540px", padding: "32px", border: "1px solid #2a2a2e", color: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>Create & Start Live Class</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "#8b8b9a", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLiveClass} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#8b8b9a", marginBottom: "6px", fontWeight: "700" }}>Select Course</label>
                <select value={newCourseName} onChange={e => setNewCourseName(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#1a1a1e", border: "1px solid #2a2a2e", color: "#ffffff", fontSize: "13px" }}>
                  <option value="Operating Systems OS-301">Operating Systems (OS-301)</option>
                  <option value="Compiler Design COMP-501">Compiler Design (COMP-501)</option>
                  <option value="Database Systems DB-402">Database Systems (DB-402)</option>
                  <option value="Macroeconomics ECON-401">Macroeconomics (ECON-401)</option>
                  <option value="HCI HCI-202">Human Computer Interaction (HCI-202)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#8b8b9a", marginBottom: "6px", fontWeight: "700" }}>Lecture Title *</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Distributed Systems & Consensus Protocols" style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#1a1a1e", border: "1px solid #2a2a2e", color: "#ffffff", fontSize: "13px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#8b8b9a", marginBottom: "6px", fontWeight: "700" }}>Topic / Module</label>
                <input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="e.g. Raft Consensus Algorithm" style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#1a1a1e", border: "1px solid #2a2a2e", color: "#ffffff", fontSize: "13px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#8b8b9a", marginBottom: "6px", fontWeight: "700" }}>Description</label>
                <textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Brief outline of lecture objectives..." style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#1a1a1e", border: "1px solid #2a2a2e", color: "#ffffff", fontSize: "13px", resize: "none" }} />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", backgroundColor: "transparent", border: "1px solid #2a2a2e", color: "#8b8b9a", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "12px", borderRadius: "10px", backgroundColor: "var(--primary-red)", border: "none", color: "#ffffff", fontWeight: "800", cursor: "pointer" }}>
                  {isSubmitting ? 'Creating...' : 'CREATE & START'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <p className="page-category" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Radio size={12} style={{ color: "var(--primary-red)" }} /> LIVE ACADEMIC SESSIONS
          </p>
          <h1 className="page-title" style={{ fontSize: "36px", fontWeight: "700", fontFamily: "var(--font-display)", margin: "4px 0 0 0" }}>Live Virtual Classrooms</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>Join live lectures, access recordings, download materials, and track your attendance.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {isFaculty && (
            <button className="btn btn-red" onClick={() => setShowCreateModal(true)} style={{ padding: "10px 18px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={16} /> CREATE LIVE CLASS
            </button>
          )}
          <button className="btn btn-outline" onClick={() => showToast("Calendar exported!")} style={{ padding: "10px 18px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={15} /> EXPORT SCHEDULE
          </button>
        </div>
      </div>

      {/* ── Live Class Hero Banner ── */}
      {ALL_CLASSES.filter(c => c.status === "LIVE").map(liveClass => (
        <div key={liveClass.id} style={{ marginBottom: "32px", borderRadius: "20px", overflow: "hidden", border: "2px solid rgba(255,90,76,0.3)", background: "linear-gradient(135deg, #1a0a08 0%, #0d0d0f 60%, #0a1a10 100%)", position: "relative" }}>
          {/* Animated pulse border */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "20px", border: "2px solid rgba(255,90,76,0.15)", animation: "pulse 2s infinite" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "0" }}>
            <div style={{ padding: "36px 40px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#FF5A4C", backgroundColor: "rgba(255,90,76,0.15)", padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(255,90,76,0.3)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#FF5A4C" }} /> LIVE NOW
                </span>
                <span style={{ fontSize: "11px", color: "#8b8b9a", backgroundColor: "#1a1a1e", padding: "4px 10px", borderRadius: "8px", border: "1px solid #2a2a2e" }}>{liveClass.code}</span>
                <span style={{ fontSize: "11px", color: "#8b8b9a", backgroundColor: "#1a1a1e", padding: "4px 10px", borderRadius: "8px", border: "1px solid #2a2a2e" }}>{liveClass.attendees}/{liveClass.maxAttendees} attending</span>
              </div>
              <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#ffffff", lineHeight: "1.3", marginBottom: "12px", fontFamily: "var(--font-display)" }}>{liveClass.title}</h2>
              <p style={{ fontSize: "14px", color: "#8b8b9a", lineHeight: "1.6", marginBottom: "20px" }}>{liveClass.desc}</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
                {liveClass.tags.map(tag => (
                  <span key={tag} style={{ fontSize: "11px", color: "#c8d6f0", backgroundColor: "rgba(200,214,240,0.1)", padding: "3px 10px", borderRadius: "8px" }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <button onClick={() => navigate(`/live-class/${liveClass.meetingId || 'meet_lexer101'}`)} style={{ padding: "14px 32px", borderRadius: "12px", backgroundColor: "#FF5A4C", color: "#ffffff", fontWeight: "800", fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 28px rgba(255,90,76,0.4)" }}>
                  <Video size={18} /> JOIN LIVE CLASSROOM
                </button>
                <button onClick={() => showToast("Sharing link copied!")} style={{ padding: "14px 20px", borderRadius: "12px", backgroundColor: "transparent", color: "#8b8b9a", fontWeight: "700", fontSize: "13px", border: "1px solid #2a2a2e", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
            <div style={{ backgroundColor: "#141416", borderLeft: "1px solid #2a2a2e", padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "#4a4a5a", letterSpacing: "0.1em", marginBottom: "16px" }}>LECTURE DETAILS</div>
                {[
                  { label: "Instructor", value: liveClass.prof, sub: liveClass.profRole },
                  { label: "Session Duration", value: liveClass.duration },
                  { label: "Time Slot", value: liveClass.time },
                  { label: "Avg. Rating", value: `⭐ ${liveClass.rating}/5.0` },
                  { label: "Total Slides", value: `${liveClass.slides} slides` },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #2a2a2e" }}>
                    <div style={{ fontSize: "10px", color: "#4a4a5a", fontWeight: "700", marginBottom: "2px" }}>{item.label.toUpperCase()}</div>
                    <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: "700" }}>{item.value}</div>
                    {item.sub && <div style={{ fontSize: "11px", color: "#8b8b9a" }}>{item.sub}</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#8b8b9a" }}>Seats Filled</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#FF5A4C" }}>{liveClass.attendees}/{liveClass.maxAttendees}</span>
                </div>
                <div style={{ height: "6px", backgroundColor: "#2a2a2e", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: `${(liveClass.attendees / liveClass.maxAttendees) * 100}%`, backgroundColor: "#FF5A4C", borderRadius: "3px" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "ENROLLED COURSES", value: "5", icon: BookOpen, color: "var(--primary-red)" },
          { label: "HOURS ATTENDED", value: "64h", icon: Clock, color: "#7C5CBF" },
          { label: "ATTENDANCE RATE", value: `${attendanceRate}%`, icon: CheckCircle, color: "#00e5a0" },
          { label: "RECORDINGS SAVED", value: "18", icon: PlayCircle, color: "#f5a623" },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "800" }}>{s.value}</div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Navigation ── */}
      <div style={{ display: "flex", gap: "4px", backgroundColor: "#ffffff", padding: "6px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "28px", width: "fit-content" }}>
        {NAV_SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={{ padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", backgroundColor: activeSection === sec.id ? "var(--primary-red)" : "transparent", color: activeSection === sec.id ? "#ffffff" : "var(--text-muted)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}>
            <sec.icon size={14} />
            {sec.label}
          </button>
        ))}
      </div>

      {/* ════════ SCHEDULE SECTION ════════ */}
      {activeSection === "schedule" && (
        <>
          {/* Filter Row */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "0 0 260px" }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search classes, profs, topics…" style={{ width: "100%", paddingLeft: "36px", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {["All", "LIVE", "UPCOMING", "COMPLETED"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid", borderColor: filterStatus === s ? "var(--primary-red)" : "var(--border)", backgroundColor: filterStatus === s ? "var(--primary-red)" : "#ffffff", color: filterStatus === s ? "#ffffff" : "var(--text-muted)", cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Class Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredClasses.map(cls => (
              <div key={cls.id} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: `1px solid ${cls.status === "LIVE" ? "rgba(255,90,76,0.3)" : "var(--border)"}`, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr auto" }}>
                <div style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", backgroundColor: cls.status === "LIVE" ? "rgba(255,90,76,0.1)" : cls.status === "COMPLETED" ? "rgba(0,229,160,0.1)" : "#FAF6EE", color: cls.status === "LIVE" ? "#FF5A4C" : cls.status === "COMPLETED" ? "#00a372" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {cls.status === "LIVE" && <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#FF5A4C" }} />}
                      {cls.status}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", backgroundColor: "#FAF6EE", padding: "3px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>{cls.code}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>📅 {cls.date} · {cls.time}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>⏱ {cls.duration}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>⭐ {cls.rating}</span>
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 6px 0", fontFamily: "var(--font-display)" }}>{cls.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 12px 0", lineHeight: "1.5" }}>{cls.desc}</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {cls.tags.map(tag => (
                      <span key={tag} style={{ fontSize: "10px", color: "var(--text-muted)", backgroundColor: "#FAF6EE", padding: "2px 8px", borderRadius: "8px", border: "1px solid var(--border)" }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Right action column */}
                <div style={{ backgroundColor: "#FAF6EE", borderLeft: "1px solid var(--border)", padding: "22px 20px", display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center", minWidth: "200px", alignItems: "stretch" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e8dfcf", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>👨‍🏫</div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700" }}>{cls.prof.split(" ").slice(-1)[0]}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{cls.profRole.split(" ")[0]}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span>👥 {cls.attendees}/{cls.maxAttendees}</span>
                    <span>📑 {cls.slides} slides</span>
                  </div>
                  <div style={{ height: "4px", backgroundColor: "var(--border)", borderRadius: "2px" }}>
                    <div style={{ height: "100%", width: `${(cls.attendees / cls.maxAttendees) * 100}%`, backgroundColor: cls.status === "LIVE" ? "#FF5A4C" : "#A07D60", borderRadius: "2px" }} />
                  </div>

                  {cls.status === "LIVE" ? (
                    <button onClick={() => navigate(`/live-class/${cls.meetingId || 'meet_lexer101'}`)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#FF5A4C", color: "#ffffff", fontWeight: "800", fontSize: "12px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <Video size={14} /> JOIN LIVE
                    </button>
                  ) : isFaculty ? (
                    <button onClick={async () => {
                      const token = localStorage.getItem('token');
                      await axios.post(`${API_BASE}/api/live-classes/${cls.meetingId || cls.id}/start`, {}, { headers: { 'x-auth-token': token } });
                      navigate(`/live-class/${cls.meetingId || cls.id}`);
                    }} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "var(--primary-red)", color: "#ffffff", fontWeight: "800", fontSize: "12px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <Video size={14} /> START CLASS
                    </button>
                  ) : cls.status === "UPCOMING" || cls.status === "SCHEDULED" ? (
                    <button onClick={() => toggleReminder(cls.id)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: remindedIds.has(cls.id) ? "rgba(0,229,160,0.1)" : "#ffffff", color: remindedIds.has(cls.id) ? "#00a372" : "var(--text-muted)", fontWeight: "700", fontSize: "12px", border: `1px solid ${remindedIds.has(cls.id) ? "rgba(0,229,160,0.3)" : "var(--border)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      {remindedIds.has(cls.id) ? <BellOff size={14} /> : <Bell size={14} />}
                      {remindedIds.has(cls.id) ? "REMIND OFF" : "SET REMINDER"}
                    </button>
                  ) : (
                    <button onClick={() => showToast("Opening recording…")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#ffffff", color: "var(--text-muted)", fontWeight: "700", fontSize: "12px", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <PlayCircle size={14} /> VIEW RECORDING
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════ RECORDINGS SECTION ════════ */}
      {activeSection === "recordings" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>Past Session Recordings</h3>
            <div style={{ display: "flex", gap: "8px" }}>
              {["All", "OS-301", "COMP-501", "DB-402"].map(f => (
                <button key={f} onClick={() => {}} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid var(--border)", backgroundColor: "#ffffff", color: "var(--text-muted)", cursor: "pointer" }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {RECORDINGS.map(rec => (
              <div key={rec.id} style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
                {/* Thumbnail */}
                <div style={{ height: "120px", backgroundColor: "#141416", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <span style={{ fontSize: "48px" }}>{rec.thumbnail}</span>
                  <button onClick={() => showToast(`Playing: ${rec.title}`)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <PlayCircle size={40} style={{ color: "#ffffff" }} />
                  </button>
                  <span style={{ position: "absolute", bottom: "8px", right: "8px", fontSize: "11px", fontWeight: "700", color: "#ffffff", backgroundColor: "rgba(0,0,0,0.7)", padding: "2px 8px", borderRadius: "4px" }}>{rec.duration}</span>
                  <span style={{ position: "absolute", top: "8px", left: "8px", fontSize: "10px", fontWeight: "800", color: "#FF5A4C", backgroundColor: "rgba(255,90,76,0.15)", padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(255,90,76,0.3)" }}>{rec.code}</span>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", margin: "0 0 6px 0", lineHeight: "1.3" }}>{rec.title}</h4>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>{rec.prof} · {rec.date}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>👁 {rec.views} views</span>
                      <span style={{ fontSize: "11px", color: "#f5a623" }}>⭐ {rec.rating}</span>
                    </div>
                    <button onClick={() => showToast(`Downloading ${rec.title}…`)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ MATERIALS SECTION ════════ */}
      {activeSection === "materials" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>Course Materials & Resources</h3>
            <button onClick={() => showToast("Downloading all materials…")} className="btn btn-outline" style={{ padding: "8px 18px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <Download size={15} /> DOWNLOAD ALL
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {COURSE_MATERIALS.map((mat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "28px" }}>{mat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>{mat.name}</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", backgroundColor: "#fdf1f1", padding: "2px 8px", borderRadius: "4px" }}>{mat.code}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{mat.type} · {mat.size}</span>
                  </div>
                </div>
                <button onClick={() => showToast(`Downloading ${mat.name}…`)} style={{ padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", backgroundColor: "#FAF6EE", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Download size={14} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ ATTENDANCE SECTION ════════ */}
      {activeSection === "attendance" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "28px" }}>
            {[
              { label: "Classes Attended", value: `${ATTENDANCE.filter(a => a.attended).length}/${ATTENDANCE.length}`, color: "#00e5a0" },
              { label: "Attendance Rate", value: `${attendanceRate}%`, color: attendanceRate >= 80 ? "#00e5a0" : "#f5a623" },
              { label: "Absences", value: ATTENDANCE.filter(a => !a.attended).length, color: "#FF5A4C" }
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: "#ffffff", padding: "22px 24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "32px", fontWeight: "800", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
                <div style={{ marginTop: "12px", height: "6px", backgroundColor: "var(--border)", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: typeof s.value === "string" && s.value.includes("%") ? s.value : "100%", backgroundColor: s.color, borderRadius: "3px", maxWidth: "100%" }} />
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", fontFamily: "var(--font-display)" }}>Attendance History</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ATTENDANCE.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", backgroundColor: "#ffffff", borderRadius: "12px", border: `1px solid ${a.attended ? "rgba(0,229,160,0.2)" : "rgba(255,90,76,0.15)"}` }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: a.attended ? "rgba(0,229,160,0.1)" : "rgba(255,90,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {a.attended ? <CheckCircle size={18} style={{ color: "#00a372" }} /> : <X size={18} style={{ color: "#FF5A4C" }} />}
                </div>
                <div style={{ width: "80px", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>{a.date}</div>
                <div style={{ flex: 1, fontSize: "13px", fontWeight: "600" }}>{a.class}</div>
                <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", backgroundColor: a.attended ? "rgba(0,229,160,0.1)" : "rgba(255,90,76,0.1)", color: a.attended ? "#00a372" : "#FF5A4C" }}>
                  {a.attended ? "Present" : "Absent"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
