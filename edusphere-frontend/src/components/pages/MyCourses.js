import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  BookOpen, 
  CheckCircle, 
  X, 
  Loader2, 
  Lock, 
  FileText, 
  Layers, 
  Award, 
  UploadCloud, 
  ChevronRight, 
  PlayCircle, 
  Sliders, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  Star, 
  Search, 
  Code, 
  Sparkles, 
  Printer, 
  Flame, 
  Zap,
  Play
} from "lucide-react";
import "../../App.css";
import "../../index.css";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState("dashboard"); // dashboard, flashcards, library, scorm, gradebook

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState(() => {
    const saved = localStorage.getItem("edusphere_bookmarked_courses");
    return saved ? JSON.parse(saved) : [];
  });

  // Flashcards & Customization State
  const [userXp, setUserXp] = useState(1450);
  const [xpToast, setXpToast] = useState(null);
  const [activeFlashcardDeck, setActiveFlashcardDeck] = useState("Compiler Design");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [certStudentName, setCertStudentName] = useState("Julian Vance");
  const [userNotes, setUserNotes] = useState(() => {
    return localStorage.getItem("edusphere_user_notes") || "# Compiler & Database Design Notes\n- Lexical analyzers convert character streams into token streams.\n- B+ Trees store data at leaf nodes for fast range scans.\n- Always enforce ACID properties in transactional DB engines.";
  });

  // Expanded Flashcard datasets (30 Comprehensive Academic Cards)
  const flashcardDecks = {
    "Compiler Design": [
      { question: "What is the primary role of a Lexical Analyzer (Lexer)?", hint: "Converts character streams to tokens.", answer: "The Lexer reads raw source code character streams, removes comments and whitespace, and groups characters into lexemes representing tokens (e.g. IDENTIFIER, ASSIGN, NUMBER) passed to the parser." },
      { question: "What is the difference between LL(1) and LR(1) parsers?", hint: "Top-down vs. Bottom-up parsing directions.", answer: "LL(1) is a top-down parser that scans Left-to-right constructing a Leftmost derivation using 1-token lookahead. LR(1) is a bottom-up parser scanning Left-to-right constructing a Reverse Rightmost derivation, capable of parsing a broader class of grammars." },
      { question: "What is an Abstract Syntax Tree (AST)?", hint: "Hierarchical representation minus syntax fluff.", answer: "An AST is a condensed tree representation of source code structure. Inner nodes represent operators and control structures, while leaf nodes represent operands and identifiers, abstracting away concrete syntax like parentheses and semicolons." },
      { question: "What is Type Checking in Semantic Analysis?", hint: "Validates operand data compatibility.", answer: "Type checking verifies that operators receive compatible operand data types according to language specification rules (e.g., ensuring a string is not multiplied by a memory pointer)." },
      { question: "What is the role of Register Allocation in code generation?", hint: "Maps infinite virtual variables to physical CPU registers.", answer: "Register allocation maps a potentially infinite set of virtual intermediate variables onto a limited set of physical CPU registers, using graph coloring algorithms to minimize memory spill instructions." },
      { question: "What is Static Single Assignment (SSA) form?", hint: "Every variable is assigned exactly once.", answer: "SSA is an intermediate representation (IR) property where every variable is assigned a value exactly once. This simplifies data-flow analysis, dead code elimination, and constant propagation optimization passes." }
    ],
    "Database Systems": [
      { question: "What are the 4 ACID properties of database transactions?", hint: "Atomicity, Consistency, Isolation, Durability.", answer: "Atomicity (all operations commit or all roll back), Consistency (transactions preserve schema invariants), Isolation (concurrent executions do not interfere), and Durability (committed changes persist despite crash failures)." },
      { question: "What is 3rd Normal Form (3NF)?", hint: "Eliminates transitive functional dependencies.", answer: "A database relation is in 3NF if it is in 2NF and every non-prime attribute is non-transitively dependent on every candidate key (i.e. 'every attribute depends on the key, the whole key, and nothing but the key')." },
      { question: "Why is a B+ Tree index preferred over a Hash index for general databases?", hint: "Range queries vs. exact match lookups.", answer: "B+ Trees store data items sequentially in linked leaf nodes, enabling efficient O(log N + K) range scans (e.g. WHERE age BETWEEN 20 AND 30). Hash indexes only support O(1) exact equality matches and fail on range queries." },
      { question: "What is the difference between INNER JOIN and LEFT OUTER JOIN?", hint: "Matched rows vs. all left-table rows.", answer: "INNER JOIN returns only rows where join predicate conditions match in both tables. LEFT OUTER JOIN returns all rows from the left table, padding right-table columns with NULL when no match exists." },
      { question: "What is the CAP Theorem in distributed databases?", hint: "Consistency, Availability, Partition Tolerance.", answer: "The CAP theorem states that a distributed data store can simultaneously guarantee at most two of three guarantees: Consistency (all nodes see same data), Availability (every request receives non-error response), and Partition Tolerance (system functions despite network drops)." },
      { question: "What is a Write-Ahead Logging (WAL) protocol?", hint: "Log changes to disk before updating data pages.", answer: "WAL requires that all log records describing data modifications be written to durable disk storage before the corresponding dirty data pages are flushed from buffer pool to disk, ensuring atomicity and durability." }
    ],
    "Operating Systems": [
      { question: "What is the difference between a Process and a Thread?", hint: "Independent address space vs. shared memory space.", answer: "A Process is an independent execution unit with its own private address space, file handles, and memory map. A Thread is a lightweight execution path within a process that shares memory and resources with sibling threads." },
      { question: "What are Coffman's 4 necessary conditions for Deadlock?", hint: "Mutual exclusion, Hold & wait, No preemption, Circular wait.", answer: "1. Mutual Exclusion (resources non-shareable), 2. Hold and Wait (process holding resource requests more), 3. No Preemption (resources cannot be forcibly taken), and 4. Circular Wait (closed chain of processes waiting for each other)." },
      { question: "What is Virtual Memory & Page Faulting?", hint: "Mapping virtual pages to physical frame buffers.", answer: "Virtual memory maps virtual address space to physical RAM frames via Page Tables. When a process accesses a page not currently loaded in physical RAM, the CPU hardware raises a Page Fault interrupt to let OS disk swap memory in." },
      { question: "What is the difference between a Counting Semaphore and a Mutex?", hint: "Resource count signaling vs. exclusive ownership lock.", answer: "A Mutex is a binary lock with ownership semantics (only the locking thread can unlock it). A Counting Semaphore maintains an integer counter tracking available resource slots and allows any thread to signal (V) or wait (P)." },
      { question: "How does Round-Robin (RR) CPU Scheduling function?", hint: "Preemptive time slicing queue.", answer: "Round-Robin assigns every ready process a fixed time quantum (e.g. 20ms). Processes execute sequentially in a FIFO ready queue; if a process runs past its quantum, it is preempted and moved to the queue tail." },
      { question: "What is Belady's Anomaly in Page Replacement?", hint: "FIFO replacement page fault counter-intuitive behavior.", answer: "Belady's Anomaly occurs when increasing the number of physical memory page frames causes the total number of page faults to increase for certain page replacement policies like FIFO." }
    ],
    "Advanced Macroeconomics": [
      { question: "What is the Keynesian Spending Multiplier formula?", hint: "1 / (1 - MPC).", answer: "Multiplier = 1 / (1 - MPC), where MPC is the Marginal Propensity to Consume. It quantifies how an initial autonomous increase in fiscal spending leads to a larger cumulative expansion of national income." },
      { question: "What causes Stagflation in macroeconomics?", hint: "Negative supply shock + persistent inflation.", answer: "Stagflation occurs when an economy suffers simultaneous high inflation and stagnant economic output/high unemployment, typically triggered by a negative supply shock (e.g. sudden global energy price surge)." },
      { question: "What is the short-run Phillips Curve trade-off?", hint: "Inverse relation between inflation and unemployment.", answer: "The short-run Phillips Curve demonstrates an empirical inverse relationship between inflation and unemployment rates: expansionary aggregate demand policies lower unemployment but accelerate inflation." },
      { question: "What is the IS-LM Model equilibrium?", hint: "Goods market (IS) and Money market (LM) intersection.", answer: "The IS-LM model determines equilibrium interest rates (r) and output (Y) where the Goods Market (Investment-Savings curve) intersects the Money Market (Liquidity Preference-Money Supply curve)." },
      { question: "What is Quantitative Easing (QE) by Central Banks?", hint: "Unconventional open market bond purchases.", answer: "QE is a monetary policy where central banks create money electronically to purchase long-term government bonds and financial assets, increasing commercial bank reserves and driving down long-term interest rates." },
      { question: "What is the Solow-Swan Steady-State Growth condition?", hint: "Investment equals capital depreciation + population growth.", answer: "In the Solow Growth Model, steady-state capital per worker occurs when gross savings/investment s*f(k) equals total capital dilution (n + g + δ)k, meaning capital per effective worker remains constant." }
    ],
    "AI & Machine Learning": [
      { question: "What is Gradient Descent and Learning Rate hyperparameter?", hint: "Iterative optimization along negative gradient slope.", answer: "Gradient Descent updates model weights in the direction of steepest loss decrease: W_new = W_old - α * ∇L. The learning rate α controls step size; too large causes divergence, too small causes slow convergence." },
      { question: "What is the trade-off between Bias and Variance (Overfitting)?", hint: "High bias = underfitting; High variance = overfitting.", answer: "High Bias models underfit by making overly simple assumptions. High Variance models overfit by fitting training noise. Generalization error is minimized at the optimal complexity balance." },
      { question: "What is Self-Attention in Transformer Neural Networks?", hint: "Computes query-key-value weighted dependencies across tokens.", answer: "Self-attention calculates pairwise token relationships across an input sequence using Query (Q), Key (K), and Value (V) projections: Attention(Q,K,V) = softmax(Q K^T / √d_k) V, capturing long-range context without sequential RNN recurrence." },
      { question: "What is the difference between Precision and Recall metrics?", hint: "False Positives vs. False Negatives emphasis.", answer: "Precision = TP / (TP + FP) measures exactness (of all positive predictions, how many were correct). Recall = TP / (TP + FN) measures completeness (of all actual true instances, how many were retrieved)." },
      { question: "What is L1 vs L2 Regularization (Lasso vs Ridge)?", hint: "L1 uses absolute weights (sparsity); L2 uses squared weights.", answer: "L1 (Lasso) adds a penalty proportional to ∑|w_i|, driving redundant feature weights to zero for automatic feature selection. L2 (Ridge) adds a penalty proportional to ∑w_i^2, shrinking weights evenly without absolute zeroing." },
      { question: "What is K-Fold Cross-Validation?", hint: "Splitting data into K subsets for robust evaluation.", answer: "K-Fold Cross-Validation divides dataset into K equal folds. Models train on K-1 folds and evaluate on the remaining fold, repeating K times to average performance across all data partitions and prevent evaluation leak." }
    ]
  };

  // Library States
  const [activePdf, setActivePdf] = useState(null);
  const [slidePage, setSlidePage] = useState(0);
  const [interactiveSqlQuery, setInteractiveSqlQuery] = useState("SELECT student_name, course_title, score FROM student_records WHERE score >= 90;");
  const [sqlResult, setSqlResult] = useState(null);
  const [ideTab, setIdeTab] = useState("sql"); // "sql" or "python"
  const [pythonCode, setPythonCode] = useState(`# Python Academic Playground
def calculate_gpa(grades):
    points = {'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0}
    return sum(points[g] for g in grades) / len(grades)

user_grades = ['A', 'A', 'B+', 'A-']
print(f"Cumulative GPA: {calculate_gpa(user_grades):.2f}")`);
  const [pythonOutput, setPythonOutput] = useState("");

  // SCORM States
  const [scormUploading, setScormUploading] = useState(false);
  const [scormProgress, setScormProgress] = useState(0);
  const [scormLog, setScormLog] = useState("");
  const [scormPackage, setScormPackage] = useState({
    title: "Academic Integrity & Proctored Standards 2026",
    schema: "SCORM 2004 4th Edition",
    scos: [
      { id: "sco-1", title: "Welcome & Academic Honor Code", completed: true },
      { id: "sco-2", title: "Code Theft & AST Plagiarism Rules", completed: true },
      { id: "sco-3", title: "Webcam & Gaze Security Standards", completed: true },
      { id: "sco-4", title: "Final Assessment & Verification", completed: false }
    ]
  });
  const [activeScormSco, setActiveScormSco] = useState({
    id: "sco-1",
    title: "Welcome & Academic Honor Code",
    content: "Welcome to the Academic Honesty training asset. This module details the code-integrity policies at EduSphere. You are required to submit zero-copy assignments, avoid tab exits during webcam assessments, and run standard validation checks on all external libraries. Proceed by reviewing successive stages."
  });
  const [scormScore, setScormScore] = useState(75);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Gradebook Target Calculator
  const [activeGradebookCourse, setActiveGradebookCourse] = useState(null);
  const [targetFinalExamScore, setTargetFinalExamScore] = useState(88);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5050/api/courses", {
        headers: { "x-auth-token": token }
      });
      setCourses(res.data);
      if (res.data.length > 0 && !activeGradebookCourse) {
        setActiveGradebookCourse(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Save bookmarks to localStorage
  const toggleBookmark = (courseId, e) => {
    e.stopPropagation();
    let updated;
    if (bookmarkedCourseIds.includes(courseId)) {
      updated = bookmarkedCourseIds.filter(id => id !== courseId);
    } else {
      updated = [...bookmarkedCourseIds, courseId];
    }
    setBookmarkedCourseIds(updated);
    localStorage.setItem("edusphere_bookmarked_courses", JSON.stringify(updated));
  };

  const handleOpenLesson = (courseId, lesson) => {
    setActiveCourseId(courseId);
    setActiveLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleCompleteLesson = async () => {
    if (!activeCourseId || !activeLesson) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5050/api/courses/complete-lesson",
        { courseId: activeCourseId, lessonId: activeLesson._id },
        { headers: { "x-auth-token": token } }
      );
      
      await fetchCourses();
      setActiveLesson(null);
    } catch (err) {
      console.error("Failed to complete lesson:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const isModuleLocked = (course, mIndex) => {
    if (mIndex === 0) return false;
    const prevModule = course.modules[mIndex - 1];
    return prevModule.lessons.some(l => !l.isCompleted);
  };

  // Simulated SQL Engine
  const runSimulatedSql = () => {
    const q = interactiveSqlQuery.trim().toLowerCase();
    if (q.includes("student_records") || q.includes("students")) {
      setSqlResult([
        { student_id: "STU-9021", student_name: "Julian (You)", course_title: "Compiler Design", score: "94%" },
        { student_id: "STU-9024", student_name: "Sarah Jenkins", course_title: "Database Systems", score: "96%" },
        { student_id: "STU-9028", student_name: "Marcus Thorne", course_title: "Operating Systems", score: "91%" }
      ]);
    } else if (q.includes("courses")) {
      setSqlResult([
        { code: "CS-301", title: "Compiler Design", credits: "4.0", modules: 2 },
        { code: "CS-302", title: "Database Systems", credits: "3.0", modules: 3 },
        { code: "CS-303", title: "Operating Systems", credits: "4.0", modules: 2 }
      ]);
    } else {
      setSqlResult([
        { error: "Query compiled successfully, but returned 0 rows. Try SELECT * FROM student_records or SELECT * FROM courses;" }
      ]);
    }
  };

  // Simulated Python Engine
  const runSimulatedPython = () => {
    setPythonOutput("Running Python script in sandbox...\n[SUCCESS] Execution time: 0.042s\nOutput:\nCumulative GPA: 3.68\n--------------------------------\nAll 4 course modules verified.");
  };

  // SCORM Import Simulator
  const handleImportScormZip = () => {
    setScormUploading(true);
    setScormProgress(15);
    setScormLog("Reading manifest structure: 'imsmanifest.xml' identified.");
    
    setTimeout(() => {
      setScormProgress(55);
      setScormLog("Binding SCORM 2004 4th Edition API Runtime connector.");
    }, 700);

    setTimeout(() => {
      setScormProgress(100);
      setScormLog("Manifest parsed. 4 SCO Objectives registered successfully.");
      setScormUploading(false);
      setScormPackage({
        title: "Advanced Data Science & Ethics Standard",
        schema: "SCORM 2004 4th Edition",
        scos: [
          { id: "sco-1", title: "1. Data Collection & Ethics Standard", completed: true },
          { id: "sco-2", title: "2. Privacy Preservation & Anonymization", completed: true },
          { id: "sco-3", title: "3. AI Model Transparency & Bias", completed: true },
          { id: "sco-4", title: "4. Final Standard Knowledge Verification", completed: true }
        ]
      });
      setScormScore(100);
    }, 1500);
  };

  const completeSco = (scoId) => {
    if (!scormPackage) return;
    const updatedScos = scormPackage.scos.map(s => {
      if (s.id === scoId) return { ...s, completed: true };
      return s;
    });
    
    setScormPackage({ ...scormPackage, scos: updatedScos });
    const completedCount = updatedScos.filter(s => s.completed).length;
    const calculatedScore = Math.round((completedCount / updatedScos.length) * 100);
    setScormScore(calculatedScore);
  };

  // Flashcards navigation
  const currentDeck = flashcardDecks[activeFlashcardDeck] || [];
  const currentCard = currentDeck[currentCardIndex] || currentDeck[0];

  const handleNextCard = (wasMastered) => {
    const cardKey = `${activeFlashcardDeck}_${currentCardIndex}`;
    if (wasMastered) {
      if (!masteredCards[cardKey]) {
        setUserXp(prev => prev + 10);
        setXpToast("+10 XP! Flashcard Concept Mastered 🎉");
        setTimeout(() => setXpToast(null), 3000);
      }
      setMasteredCards(prev => ({ ...prev, [cardKey]: true }));
    }
    setIsFlipped(false);
    setShowHint(false);
    if (currentCardIndex < currentDeck.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  // Filtered courses list
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === "All") return matchesSearch;
    if (selectedCategory === "Bookmarked") return matchesSearch && bookmarkedCourseIds.includes(course._id);
    if (selectedCategory === "In Progress") return matchesSearch && course.progress < 100;
    if (selectedCategory === "Completed") return matchesSearch && course.progress === 100;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 size={36} className="text-primary animate-spin" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* Category Subtitle & Page Heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <span className="page-category">ACADEMIC CURRICULUM</span>
          <h1 className="page-title" style={{ margin: "4px 0 0 0" }}>My Courses & Learning Hub</h1>
          <p className="page-description">Access course modules, review SCORM objects, practice interactive flashcards, and compute grade targets.</p>
        </div>

        {/* Global KPI Stats Bar */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <BookOpen size={18} style={{ color: "var(--primary-red)" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: "800" }}>{courses.length} Courses</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Enrolled</div>
            </div>
          </div>

          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
            <Flame size={18} style={{ color: "#E86358" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--primary-red)" }}>{userXp.toLocaleString()} XP</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Knowledge Rank</div>
            </div>
          </div>

          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Award size={18} style={{ color: "#8D6E53" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: "800" }}>2 Badges</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Certificates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating XP Toast Banner */}
      {xpToast && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          backgroundColor: "#1a1a1a",
          color: "#ffffff",
          padding: "14px 22px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "13px",
          fontWeight: "700",
          borderLeft: "4px solid #00e5a0",
          animation: "slideIn 0.3s ease"
        }}>
          <Zap size={20} style={{ color: "#00e5a0" }} />
          <span>{xpToast}</span>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 24px 0", borderBottom: "1px solid var(--border)", paddingBottom: "12px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "dashboard", label: "Course Hub", icon: <BookOpen size={16} /> },
            { id: "flashcards", label: "Flashcard Deck", icon: <Sparkles size={16} /> },
            { id: "library", label: "Resource Library & IDE", icon: <Code size={16} /> },
            { id: "scorm", label: "SCORM & Certificates", icon: <Award size={16} /> },
            { id: "gradebook", label: "Gradebook & Calculator", icon: <Sliders size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id)}
              className="btn"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                padding: "10px 18px", 
                borderRadius: "8px", 
                fontSize: "13px",
                fontWeight: currentSection === tab.id ? "700" : "600",
                color: currentSection === tab.id ? "#ffffff" : "var(--text-primary)",
                background: currentSection === tab.id ? "var(--primary-red)" : "var(--surface)",
                border: "1px solid",
                borderColor: currentSection === tab.id ? "var(--primary-red)" : "var(--border)",
                boxShadow: currentSection === tab.id ? "0 4px 12px rgba(255, 90, 76, 0.25)" : "var(--shadow-sm)",
                transition: "all 0.2s ease"
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Search Input */}
        <div style={{ position: "relative", width: "240px" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search modules & courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              backgroundColor: "#ffffff",
              fontSize: "12px",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* SECTION 1: COURSE HUB */}
      {currentSection === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          
          {/* Filter Pill Badges */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginRight: "8px" }}>Filter By:</span>
            {["All", "Bookmarked", "In Progress", "Completed"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedCategory === cat ? "var(--primary-red)" : "var(--border)",
                  backgroundColor: selectedCategory === cat ? "rgba(255, 90, 76, 0.1)" : "#ffffff",
                  color: selectedCategory === cat ? "var(--primary-red)" : "var(--text-muted)",
                  transition: "all 0.2s ease"
                }}
              >
                {cat} {cat === "Bookmarked" && `(${bookmarkedCourseIds.length})`}
              </button>
            ))}
          </div>

          {/* Active Featured Course Hero Section */}
          <div>
            {courses.filter(c => c._id === (activeCourseId || courses[0]?._id)).map(activeCourse => {
              const lessonVideoUrl = activeLesson?.videoUrl;
              const courseVideoUrl = activeCourse.modules.flatMap(m => m.lessons).find(l => l.videoUrl)?.videoUrl;
              const displayVideoUrl = lessonVideoUrl || courseVideoUrl;

              return (
                <div key={activeCourse._id} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  
                  {/* Hero Course Banner & Video Player */}
                  <div style={{ display: "flex", gap: "32px", alignItems: "stretch" }}>
                    
                    {/* Left: Video Player Thumbnail (Enlarged) */}
                    <div style={{ width: "720px", maxWidth: "62%", flexShrink: 0, overflow: "hidden", backgroundColor: "#141416", position: "relative", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                      {displayVideoUrl ? (
                        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
                          <iframe
                            src={displayVideoUrl}
                            title={`${activeCourse.title} Video`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                          ></iframe>
                        </div>
                      ) : (
                        <div style={{ padding: "80px 40px", background: "linear-gradient(135deg, #1a1a1a 0%, #2a1f1f 100%)", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingTop: "56.25%", position: "relative" }}>
                          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <PlayCircle size={48} style={{ color: "var(--primary-red)", marginBottom: "16px", opacity: 0.9 }} />
                            <h2 style={{ fontSize: "22px", fontFamily: "var(--font-display)", fontWeight: "700", marginBottom: "8px" }}>Select a lesson</h2>
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Click any module below to stream HD lecture</p>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "16px 20px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {activeLesson ? `Active: ${activeLesson.title}` : `Course: ${activeCourse.title}`}
                        </span>
                        <span style={{ fontSize: "11px", fontFamily: "monospace", opacity: 0.8, flexShrink: 0, marginLeft: "12px" }}>42:15 / 58:00</span>
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, height: "4px", backgroundColor: "var(--primary-red)", width: `${activeCourse.progress}%` }}></div>
                    </div>

                    {/* Right: Course Overview & Details Card */}
                    <div style={{ flex: 1, backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "var(--shadow-card)" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "0.08em", color: "var(--primary-red)", textTransform: "uppercase" }}>FEATURED ENROLLED COURSE</span>
                          
                          <button
                            onClick={(e) => toggleBookmark(activeCourse._id, e)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: bookmarkedCourseIds.includes(activeCourse._id) ? "#E86358" : "var(--text-muted)" }}
                            title="Bookmark Course"
                          >
                            <Star size={20} fill={bookmarkedCourseIds.includes(activeCourse._id) ? "#E86358" : "none"} />
                          </button>
                        </div>

                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "700", marginTop: 0, marginBottom: "8px", lineHeight: "1.2" }}>{activeCourse.title}</h2>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "20px" }}>{activeCourse.description}</p>
                      </div>

                      <div>
                        {/* Progress Bar & Badges */}
                        <div style={{ marginBottom: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
                            <span>Overall Syllabus Progress</span>
                            <span style={{ color: "var(--primary-red)" }}>{activeCourse.progress}% Completed</span>
                          </div>
                          <div style={{ height: "8px", backgroundColor: "#EAE3D5", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${activeCourse.progress}%`, height: "100%", backgroundColor: "var(--primary-red)", borderRadius: "4px" }}></div>
                          </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Layers size={16} style={{ color: "var(--primary-red)" }} />
                            <span style={{ fontSize: "12px", fontWeight: "600" }}>{activeCourse.modules.length} Modules</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircle size={16} style={{ color: "#00e5a0" }} />
                            <span style={{ fontSize: "12px", fontWeight: "600" }}>{activeCourse.modules.flatMap(m => m.lessons).filter(l => l.isCompleted).length} Lessons Done</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Zap size={16} style={{ color: "#8D6E53" }} />
                            <span style={{ fontSize: "12px", fontWeight: "600" }}>+200 XP Available</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Modules Accordion & Sticky Sidebar */}
                  <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
                    
                    {/* Modules Accordion */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Course Curriculum & Lessons</h3>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>{activeCourse.modules.length} Total Units</span>
                      </div>

                      {activeCourse.modules.map((m, mIndex) => {
                        const locked = isModuleLocked(activeCourse, mIndex);
                        const isExpanded = expandedModules[m._id] || mIndex === 0;
                        const moduleNumber = (mIndex + 1).toString().padStart(2, '0');
                        
                        return (
                          <div key={m._id} style={{ border: "1px solid var(--border)", borderRadius: "10px", backgroundColor: isExpanded ? "#FAF6EE" : "#ffffff", transition: "all 0.3s ease", overflow: "hidden" }}>
                            
                            {/* Accordion Header */}
                            <div 
                              onClick={() => !locked && toggleModule(m._id)}
                              style={{ 
                                padding: "20px 24px", 
                                cursor: locked ? "not-allowed" : "pointer", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                opacity: locked ? 0.6 : 1
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <div style={{ fontSize: "22px", fontFamily: "var(--font-display)", fontWeight: "800", color: isExpanded ? "var(--primary-red)" : "rgba(255, 90, 76, 0.4)" }}>
                                  {moduleNumber}
                                </div>
                                <div>
                                  <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 4px 0" }}>{m.title}</h4>
                                  <p style={{ fontSize: "12px", fontStyle: "italic", color: "var(--text-muted)", margin: 0, fontFamily: "var(--font-display)" }}>
                                    Comprehensive learning module with video & exercises.
                                  </p>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "12px", backgroundColor: locked ? "#DFD7C7" : "rgba(255, 90, 76, 0.1)", color: locked ? "var(--text-muted)" : "var(--primary-red)" }}>
                                  {locked ? "Locked" : `${m.lessons.length} Lessons`}
                                </span>
                                <div style={{ color: isExpanded ? "var(--primary-red)" : "var(--text-muted)" }}>
                                  {locked ? <Lock size={18} /> : (isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
                                </div>
                              </div>
                            </div>

                            {/* Accordion Body */}
                            {isExpanded && !locked && (
                              <div style={{ padding: "0 24px 24px 64px", display: "flex", gap: "24px" }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {m.lessons.map((lesson) => (
                                    <div 
                                      key={lesson._id}
                                      onClick={() => handleOpenLesson(activeCourse._id, lesson)}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        backgroundColor: activeLesson?._id === lesson._id ? "rgba(255, 90, 76, 0.08)" : "#ffffff",
                                        border: "1px solid",
                                        borderColor: activeLesson?._id === lesson._id ? "var(--primary-red)" : "var(--border)",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ color: lesson.isCompleted ? "#00e5a0" : (activeLesson?._id === lesson._id ? "var(--primary-red)" : "var(--text-muted)") }}>
                                          {lesson.isCompleted ? <CheckCircle size={18} /> : <PlayCircle size={18} />}
                                        </div>
                                        <div style={{ fontWeight: activeLesson?._id === lesson._id ? "700" : "500", fontSize: "13px" }}>
                                          {lesson.title}
                                        </div>
                                      </div>
                                      
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#8D6E53", backgroundColor: "rgba(141, 110, 83, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>+50 XP</span>
                                        {activeLesson?._id === lesson._id && (
                                          <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", textTransform: "uppercase" }}>Now Playing</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                    {/* Right Sticky Sidebar Stats */}
                    <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "20px", flexShrink: 0 }}>
                      
                      {/* Performance Card */}
                      <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                        <h4 style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "16px", textTransform: "uppercase" }}>Course Metrics</h4>
                        
                        <div style={{ marginBottom: "16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                            <span>SCORM Completion</span>
                            <span style={{ color: "var(--primary-red)" }}>{activeCourse.progress}%</span>
                          </div>
                          <div style={{ height: "6px", backgroundColor: "#EAE3D5", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${activeCourse.progress}%`, height: "100%", backgroundColor: "var(--primary-red)" }}></div>
                          </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                            <span>Quiz Average</span>
                            <span style={{ color: "#00e5a0" }}>94%</span>
                          </div>
                          <div style={{ height: "6px", backgroundColor: "#EAE3D5", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `94%`, height: "100%", backgroundColor: "#00e5a0" }}></div>
                          </div>
                        </div>

                        <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                          <Award size={24} style={{ color: "var(--primary-red)" }} />
                          <div>
                            <p style={{ fontSize: "12px", fontWeight: "700", margin: 0 }}>Status: Active Enrollment</p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Target Completion: Oct 2026</p>
                          </div>
                        </div>
                      </div>

                      {/* Instructor Card */}
                      <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                        <h4 style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase" }}>Lead Instructor</h4>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <img src="https://ui-avatars.com/api/?name=Alistair+Vance&background=1a1a1a&color=fff&size=96" alt="Instructor" style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }} />
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>Dr. Alistair Vance</p>
                            <p style={{ fontSize: "11px", fontStyle: "italic", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Senior Fellow, EduSphere Department</p>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          {/* All Enrolled Courses Grid */}
          <div style={{ marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Enrolled Course Catalog ({filteredCourses.length})</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {filteredCourses.map((c) => (
                <div 
                  key={c._id} 
                  onClick={() => setActiveCourseId(c._id)}
                  style={{ 
                    cursor: "pointer", 
                    backgroundColor: "#ffffff",
                    border: "1px solid",
                    borderColor: (activeCourseId || courses[0]?._id) === c._id ? "var(--primary-red)" : "var(--border)",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "24px",
                    boxShadow: "var(--shadow-card)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", textTransform: "uppercase" }}>MODULE {c.modules.length} UNITS</span>
                      <button
                        onClick={(e) => toggleBookmark(c._id, e)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: bookmarkedCourseIds.includes(c._id) ? "#E86358" : "var(--text-muted)" }}
                      >
                        <Star size={16} fill={bookmarkedCourseIds.includes(c._id) ? "#E86358" : "none"} />
                      </button>
                    </div>

                    <h4 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 8px 0" }}>{c.title}</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 20px 0", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.description}
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", marginBottom: "6px" }}>
                      <span>Syllabus Completed</span>
                      <span style={{ color: "var(--primary-red)" }}>{c.progress}%</span>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "#EAE3D5", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${c.progress}%`, height: "100%", backgroundColor: "var(--primary-red)" }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: FULL-PAGE 3D FLASHCARD STUDY DECK */}
      {currentSection === "flashcards" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          
          {/* Top Deck Selector Cards Grid */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Select Academic Study Deck ({Object.keys(flashcardDecks).length} Subjects)</h3>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>30 Total Cards Available</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
              {Object.keys(flashcardDecks).map((deckName) => {
                const deckCards = flashcardDecks[deckName];
                const isSelected = activeFlashcardDeck === deckName;
                const masteredCount = deckCards.filter((_, idx) => masteredCards[`${deckName}_${idx}`]).length;
                const progressPct = Math.round((masteredCount / deckCards.length) * 100);

                return (
                  <div
                    key={deckName}
                    onClick={() => {
                      setActiveFlashcardDeck(deckName);
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                      setShowHint(false);
                    }}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid",
                      borderColor: isSelected ? "var(--primary-red)" : "var(--border)",
                      borderRadius: "12px",
                      padding: "16px",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 4px 16px rgba(255, 90, 76, 0.15)" : "var(--shadow-card)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: isSelected ? "var(--primary-red)" : "var(--text-muted)", textTransform: "uppercase" }}>
                        {deckCards.length} CARDS
                      </span>
                      <Sparkles size={14} style={{ color: isSelected ? "var(--primary-red)" : "var(--border)" }} />
                    </div>

                    <h4 style={{ fontSize: "14px", fontWeight: "700", margin: "0 0 12px 0", color: "var(--text-primary)" }}>{deckName}</h4>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "700", marginBottom: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Mastery</span>
                        <span style={{ color: isSelected ? "var(--primary-red)" : "var(--text-muted)" }}>{progressPct}%</span>
                      </div>
                      <div style={{ height: "4px", backgroundColor: "#EAE3D5", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${progressPct}%`, height: "100%", backgroundColor: "var(--primary-red)" }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Workspace Split Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "28px", alignItems: "flex-start" }}>
            
            {/* Left: Taller, Page-Sized 3D Flip Card Arena */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)" }}>
              
              {/* Card Arena Header Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff", backgroundColor: "var(--primary-red)", padding: "4px 10px", borderRadius: "12px" }}>
                    CARD {currentCardIndex + 1} OF {currentDeck.length}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>
                    Subject: {activeFlashcardDeck}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {currentCard?.hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        border: "1px solid var(--border)",
                        backgroundColor: showHint ? "rgba(255, 90, 76, 0.1)" : "#FAF6EE",
                        color: showHint ? "var(--primary-red)" : "var(--text-primary)",
                        cursor: "pointer"
                      }}
                    >
                      {showHint ? "Hide Hint" : "💡 Show Hint"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                      setShowHint(false);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      border: "1px solid var(--border)",
                      backgroundColor: "#FAF6EE",
                      color: "var(--text-muted)",
                      cursor: "pointer"
                    }}
                  >
                    Reset Deck
                  </button>
                </div>
              </div>

              {/* 3D Page-Sized Flip Card */}
              <div 
                className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="flashcard-inner">
                  
                  {/* Front Side */}
                  <div className="flashcard-front">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary-red)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        CONCEPT QUESTION
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>
                        Click card to flip ⤹
                      </span>
                    </div>

                    <div style={{ fontSize: "22px", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: "1.5" }}>
                      {currentCard?.question}
                    </div>

                    {showHint && currentCard?.hint && (
                      <div style={{ padding: "12px 16px", backgroundColor: "#FAF6EE", borderLeft: "3px solid var(--primary-red)", borderRadius: "4px", fontSize: "12px", color: "var(--text-primary)" }}>
                        <strong>Hint:</strong> {currentCard.hint}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
                      <span>Course: {activeFlashcardDeck}</span>
                      <span style={{ fontStyle: "italic" }}>EduSphere Knowledge Assessment</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="flashcard-back">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#00e5a0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        ✓ OFFICIAL EXPLANATION
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>
                        Click card to flip back ⤸
                      </span>
                    </div>

                    <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", lineHeight: "1.7", backgroundColor: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                      {currentCard?.answer}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
                      <span>Verified Academic Solution</span>
                      <span style={{ fontStyle: "italic" }}>Press 'Mastered' to claim +10 XP</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Card Navigation & Response Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
                <button
                  className="btn"
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setShowHint(false);
                    setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  }}
                  style={{ padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", border: "1px solid var(--border)", backgroundColor: "#ffffff" }}
                >
                  ← Previous
                </button>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="btn"
                    onClick={() => handleNextCard(false)}
                    style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", border: "1px solid var(--border)", backgroundColor: "#FAF6EE" }}
                  >
                    Need Review
                  </button>

                  <button
                    className="btn"
                    onClick={() => handleNextCard(true)}
                    style={{ padding: "10px 22px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", border: "none", backgroundColor: "var(--primary-red)", color: "#ffffff", boxShadow: "0 4px 14px rgba(255, 90, 76, 0.25)" }}
                  >
                    <Check size={16} style={{ marginRight: "6px" }} />
                    Mastered (+10 XP)
                  </button>
                </div>

                <button
                  className="btn"
                  disabled={currentCardIndex === currentDeck.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setShowHint(false);
                    setCurrentCardIndex(prev => Math.min(currentDeck.length - 1, prev + 1));
                  }}
                  style={{ padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", border: "1px solid var(--border)", backgroundColor: "#ffffff" }}
                >
                  Next →
                </button>
              </div>

            </div>

            {/* Right: Deck Intelligence & Quick Card Jump Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Mastery Analytics Card */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-card)" }}>
                <h4 style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "16px" }}>
                  DECK MASTERY STATUS
                </h4>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary-red)", lineHeight: "1" }}>
                      {currentDeck.filter((_, idx) => masteredCards[`${activeFlashcardDeck}_${idx}`]).length} / {currentDeck.length}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Concepts Mastered</div>
                  </div>

                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(255, 90, 76, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-red)" }}>
                    <Zap size={28} />
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ height: "8px", backgroundColor: "#EAE3D5", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
                  <div style={{ width: `${Math.round((currentDeck.filter((_, idx) => masteredCards[`${activeFlashcardDeck}_${idx}`]).length / currentDeck.length) * 100)}%`, height: "100%", backgroundColor: "var(--primary-red)" }}></div>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  Mastering all 6 cards grants +60 XP to your global academic profile rank!
                </div>
              </div>

              {/* Quick Jump Matrix */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-card)" }}>
                <h4 style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "14px" }}>
                  QUICK CARD JUMP MATRIX
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {currentDeck.map((card, idx) => {
                    const isMastered = masteredCards[`${activeFlashcardDeck}_${idx}`];
                    const isCurrent = currentCardIndex === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentCardIndex(idx);
                          setIsFlipped(false);
                          setShowHint(false);
                        }}
                        style={{
                          padding: "12px 8px",
                          borderRadius: "8px",
                          border: "1px solid",
                          borderColor: isCurrent ? "var(--primary-red)" : (isMastered ? "#00e5a0" : "var(--border)"),
                          backgroundColor: isCurrent ? "rgba(255, 90, 76, 0.1)" : (isMastered ? "rgba(0, 229, 160, 0.08)" : "#FAF6EE"),
                          color: isCurrent ? "var(--primary-red)" : (isMastered ? "#00e5a0" : "var(--text-primary)"),
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {isMastered ? <Check size={14} /> : null}
                        Card {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SECTION 3: RESOURCE LIBRARY & FULL-PAGE CODE IDE WORKSPACE */}
      {currentSection === "library" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", alignItems: "flex-start" }}>
          
          {/* Left: Reference Files & Cheatsheet Hub */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Academic Resource Library</h3>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-red)", backgroundColor: "rgba(255, 90, 76, 0.1)", padding: "4px 10px", borderRadius: "12px" }}>
                3 Categories
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 20px 0" }}>Select a reference document paper, slide deck presentation, or launch the live multi-tab IDE sandbox.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { title: "Query Optimization in Distributed Databases.pdf", size: "2.4 MB", type: "pdf", author: "Dr. Alistair Vance", content: "Distributed database query optimization relies on semi-join operations to minimize network transfer costs across partitioned data nodes. Cost Equation: Execution Cost = I/O Access + CPU Time + Network Transits. Recommended strategy: Filter predicates early at edge nodes before executing cross-datacenter joins." },
                { title: "Lexers and AST Construction Principles.slideshow", size: "12 slides", type: "slide", author: "Prof. Miller", slides: [
                  "Slide 1: Compilation Pipeline Overview\nA compiler parses source code character streams. Lexical analyzers group characters into tokens (IDENTIFIER, ASSIGN, OPERATOR) passed directly to LL/LR parsers.",
                  "Slide 2: Deterministic Finite Automata (DFAs)\nDFAs navigate input symbols without backtracking. State transitions evaluate regular expressions to emit tokens upon reaching terminal states.",
                  "Slide 3: Abstract Syntax Trees (ASTs)\nASTs abstract concrete syntax fluff (like parentheses and semicolons), building operator hierarchy trees essential for SSA optimization passes."
                ]},
                { title: "Multi-Language SQL & Python Execution Engine.interactive", size: "Full Page IDE", type: "interactive", author: "EduSphere Compiler Engine" }
              ].map((file, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePdf(file);
                    if (file.type === "slide") setSlidePage(0);
                  }}
                  style={{
                    padding: "18px",
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: activePdf?.title === file.title ? "var(--primary-red)" : "var(--border)",
                    backgroundColor: activePdf?.title === file.title ? "rgba(255, 90, 76, 0.08)" : "#FAF6EE",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: file.type === "interactive" ? "rgba(255, 90, 76, 0.1)" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                      {file.type === "interactive" ? <Code size={20} style={{ color: "var(--primary-red)" }} /> : <FileText size={20} style={{ color: "#8D6E53" }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "700" }}>{file.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{file.size} • {file.author}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: activePdf?.title === file.title ? "var(--primary-red)" : "var(--text-muted)" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Multi-Tab Interactive IDE Console & Workspace */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)", minHeight: "480px" }}>
            {activePdf ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", textTransform: "uppercase" }}>ACTIVE RESOURCE WORKSPACE</span>
                    <h4 style={{ fontSize: "18px", fontWeight: "700", margin: "4px 0 0 0" }}>{activePdf.title}</h4>
                  </div>
                  <button onClick={() => setActivePdf(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <X size={20} />
                  </button>
                </div>

                {activePdf.type === "pdf" && (
                  <div style={{ padding: "24px", backgroundColor: "#FAF6EE", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "14px", lineHeight: "1.7", color: "var(--text-primary)" }}>
                    <h5 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px", color: "var(--primary-red)" }}>Research Summary Paper</h5>
                    <p style={{ margin: 0 }}>{activePdf.content}</p>
                  </div>
                )}

                {activePdf.type === "slide" && (
                  <div style={{ padding: "28px", backgroundColor: "#FAF6EE", borderRadius: "12px", border: "1px solid var(--border)", textAlign: "center" }}>
                    <div style={{ minHeight: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", lineHeight: "1.7", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                      {activePdf.slides[slidePage]}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                      <button className="btn" disabled={slidePage === 0} onClick={() => setSlidePage(p => p - 1)} style={{ padding: "8px 16px", fontSize: "12px", border: "1px solid var(--border)", backgroundColor: "#ffffff" }}>← Previous Slide</button>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>Slide {slidePage + 1} of {activePdf.slides.length}</span>
                      <button className="btn" disabled={slidePage === activePdf.slides.length - 1} onClick={() => setSlidePage(p => p + 1)} style={{ padding: "8px 16px", fontSize: "12px", border: "1px solid var(--border)", backgroundColor: "#ffffff" }}>Next Slide →</button>
                    </div>
                  </div>
                )}

                {activePdf.type === "interactive" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* IDE Sub-Tabs Switcher */}
                    <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                      {[
                        { id: "sql", label: "SQL Query Terminal" },
                        { id: "python", label: "Python Code Sandbox" },
                        { id: "notes", label: "Academic Notes Scratchpad" }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setIdeTab(tab.id)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            border: "none",
                            backgroundColor: ideTab === tab.id ? "var(--primary-red)" : "#FAF6EE",
                            color: ideTab === tab.id ? "#ffffff" : "var(--text-primary)",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* SQL Terminal */}
                    {ideTab === "sql" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>PostgreSQL / SQLite Query Editor</span>
                          <span style={{ fontSize: "11px", color: "#00e5a0", fontWeight: "700" }}>● Server Connected</span>
                        </div>

                        <textarea
                          value={interactiveSqlQuery}
                          onChange={(e) => setInteractiveSqlQuery(e.target.value)}
                          className="code-ide-editor"
                          style={{ width: "100%", height: "110px", border: "1px solid var(--border)", borderRadius: "8px", outline: "none", resize: "none", padding: "14px", fontFamily: "monospace", fontSize: "13px" }}
                        />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button className="btn" onClick={() => setInteractiveSqlQuery("SELECT * FROM student_records WHERE score >= 90;")} style={{ fontSize: "11px", padding: "6px 12px", border: "1px solid var(--border)", backgroundColor: "#FAF6EE" }}>Students &gt; 90%</button>
                            <button className="btn" onClick={() => setInteractiveSqlQuery("SELECT course_title, COUNT(*) FROM student_records GROUP BY course_title;")} style={{ fontSize: "11px", padding: "6px 12px", border: "1px solid var(--border)", backgroundColor: "#FAF6EE" }}>Course Aggregates</button>
                          </div>

                          <button className="btn" onClick={runSimulatedSql} style={{ fontSize: "13px", padding: "8px 20px", backgroundColor: "var(--primary-red)", color: "#ffffff", border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(255, 90, 76, 0.25)" }}>
                            <Play size={14} style={{ marginRight: "6px" }} />
                            Run Query
                          </button>
                        </div>

                        {sqlResult && (
                          <div style={{ marginTop: "20px", backgroundColor: "#141416", color: "#ffffff", borderRadius: "10px", padding: "16px", fontSize: "12px", overflowX: "auto", border: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px" }}>
                              <span>Query Output Result ({sqlResult.length} rows returned)</span>
                              <span>Execution time: 0.012s</span>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                                  {Object.keys(sqlResult[0]).map(k => <th key={k} style={{ padding: "8px", color: "var(--primary-red)" }}>{k}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {sqlResult.map((row, i) => (
                                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                    {Object.values(row).map((v, j) => <td key={j} style={{ padding: "8px" }}>{v}</td>)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Python Sandbox */}
                    {ideTab === "python" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Python 3.11 Academic Execution Console</span>
                          <span style={{ fontSize: "11px", color: "#00e5a0", fontWeight: "700" }}>● Ready</span>
                        </div>

                        <textarea
                          value={pythonCode}
                          onChange={(e) => setPythonCode(e.target.value)}
                          className="code-ide-editor"
                          style={{ width: "100%", height: "140px", border: "1px solid var(--border)", borderRadius: "8px", outline: "none", resize: "none", padding: "14px", fontFamily: "monospace", fontSize: "13px" }}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
                          <button className="btn" onClick={runSimulatedPython} style={{ fontSize: "13px", padding: "8px 20px", backgroundColor: "var(--primary-red)", color: "#ffffff", border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(255, 90, 76, 0.25)" }}>
                            <Play size={14} style={{ marginRight: "6px" }} />
                            Execute Python Script
                          </button>
                        </div>

                        {pythonOutput && (
                          <pre style={{ marginTop: "20px", backgroundColor: "#141416", color: "#00e5a0", borderRadius: "10px", padding: "16px", fontSize: "12px", fontFamily: "monospace", border: "1px solid var(--border)", lineHeight: "1.6" }}>
                            {pythonOutput}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Academic Scratchpad Notes */}
                    {ideTab === "notes" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Personal Course Scratchpad Notes</span>
                          <span style={{ fontSize: "11px", color: "var(--primary-red)", fontWeight: "700" }}>Auto-Saved to LocalStorage</span>
                        </div>

                        <textarea
                          value={userNotes}
                          onChange={(e) => {
                            setUserNotes(e.target.value);
                            localStorage.setItem("edusphere_user_notes", e.target.value);
                          }}
                          style={{ width: "100%", height: "220px", border: "1px solid var(--border)", borderRadius: "8px", outline: "none", resize: "vertical", padding: "16px", fontFamily: "sans-serif", fontSize: "13px", lineHeight: "1.6", backgroundColor: "#FAF6EE" }}
                        />
                      </div>
                    )}

                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "360px", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: "40px" }}>
                <Code size={48} style={{ color: "var(--primary-red)", opacity: 0.5, marginBottom: "16px" }} />
                <h4 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 8px 0" }}>Interactive Multi-Language IDE Sandbox</h4>
                <p style={{ fontSize: "13px", maxWidth: "420px", margin: "0 0 20px 0" }}>Select 'Multi-Language SQL & Python Execution Engine' on the left to launch the code terminal and scratchpad.</p>
                <button
                  className="btn"
                  onClick={() => setActivePdf({ title: "Multi-Language SQL & Python Execution Engine.interactive", size: "Full Page IDE", type: "interactive", author: "EduSphere Compiler Engine" })}
                  style={{ padding: "10px 22px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", backgroundColor: "var(--primary-red)", color: "#ffffff", border: "none", boxShadow: "0 4px 14px rgba(255, 90, 76, 0.25)" }}
                >
                  Launch IDE Workspace
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SECTION 4: FULL-PAGE SCORM & ACADEMIC CERTIFICATE WORKSPACE */}
      {currentSection === "scorm" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", alignItems: "flex-start" }}>
          
          {/* Left: Package Manager & Objectives Tree */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 6px 0" }}>SCORM Standard Package Inspector</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 20px 0" }}>Upload SCORM 1.2 / 2004 ZIP compliance packages to extract objectives and verify LMS runtime tracking.</p>

            <div 
              style={{
                border: "2px dashed var(--border)",
                borderRadius: "14px",
                padding: "36px 20px",
                textAlign: "center",
                backgroundColor: "#FAF6EE",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={handleImportScormZip}
            >
              {scormUploading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: "var(--primary-red)" }} />
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>Extracting Package Manifest {scormProgress}%</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{scormLog}</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <UploadCloud size={40} style={{ color: "var(--primary-red)" }} />
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>Import SCORM Package (.zip)</span>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>Click to extract imsmanifest.xml objectives & SCO assets</p>
                </div>
              )}
            </div>

            {scormPackage && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>{scormPackage.title}</span>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", backgroundColor: "rgba(255,90,76,0.1)", padding: "4px 10px", borderRadius: "12px" }}>{scormPackage.schema}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {scormPackage.scos.map((sco) => (
                    <div 
                      key={sco.id}
                      onClick={() => setActiveScormSco(sco)}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: activeScormSco?.id === sco.id ? "var(--primary-red)" : "var(--border)",
                        backgroundColor: activeScormSco?.id === sco.id ? "rgba(255, 90, 76, 0.08)" : "#FAF6EE",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {sco.completed ? <CheckCircle size={18} style={{ color: "#00e5a0" }} /> : <PlayCircle size={18} style={{ color: "var(--text-muted)" }} />}
                        <span style={{ fontSize: "13px", fontWeight: "600" }}>{sco.title}</span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: sco.completed ? "#00e5a0" : "var(--text-muted)" }}>
                        {sco.completed ? "COMPLETED" : "INCOMPLETE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: SCO Player & Verified Certificate Preview */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary-red)", textTransform: "uppercase" }}>SCO RUNTIME PLAYER</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#00e5a0" }}>LMS Compliance Score: {scormScore}%</span>
              </div>

              <h4 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 14px 0" }}>{activeScormSco?.title}</h4>
              
              <div style={{ backgroundColor: "#FAF6EE", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "14px", lineHeight: "1.7", marginBottom: "24px" }}>
                {activeScormSco?.content}
              </div>

              <button
                className="btn"
                onClick={() => completeSco(activeScormSco.id)}
                style={{ padding: "10px 20px", fontSize: "13px", fontWeight: "700", backgroundColor: "#00e5a0", color: "#ffffff", border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 229, 160, 0.25)" }}
              >
                <Check size={16} style={{ marginRight: "6px" }} />
                Mark SCO Objective Complete
              </button>
            </div>

            {/* Official Academic Certificate Generator Block */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h5 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Official Academic Parchment Certificate</h5>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Generated upon completing 100% of SCORM 2004 objectives</p>
                </div>
                <div className="certificate-seal" style={{ width: "48px", height: "48px" }}>
                  <Award size={26} />
                </div>
              </div>

              <button
                className="btn"
                onClick={() => setShowCertificateModal(true)}
                style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: "700", backgroundColor: "var(--primary-red)", color: "#ffffff", border: "none", borderRadius: "8px", boxShadow: "0 4px 14px rgba(255, 90, 76, 0.25)" }}
              >
                <Award size={18} style={{ marginRight: "8px" }} />
                Generate & View Official Parchment Certificate
              </button>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 5: FULL-PAGE DIGITAL GRADEBOOK & TARGET GRADE CALCULATOR */}
      {currentSection === "gradebook" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", alignItems: "flex-start" }}>
          
          {/* Left: Course Transcript Selector */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 6px 0" }}>Digital Gradebook Transcripts</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 20px 0" }}>Select an enrolled course to calculate grade weight projections and GPA targets.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => setActiveGradebookCourse(course)}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: activeGradebookCourse?._id === course._id ? "var(--primary-red)" : "var(--border)",
                    backgroundColor: activeGradebookCourse?._id === course._id ? "rgba(255, 90, 76, 0.08)" : "#FAF6EE",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700" }}>{course.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Institutional Transcript Grade</div>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--primary-red)" }}>{course.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Transcript & Interactive Goal Calculator */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)" }}>
            {activeGradebookCourse ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                
                {/* Header Grade Summary */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)", textTransform: "uppercase" }}>OFFICIAL TRANSCRIPT ANALYSIS</span>
                    <h3 style={{ fontSize: "22px", fontWeight: "700", margin: "4px 0 0 0" }}>{activeGradebookCourse.title}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "32px", fontWeight: "800", color: "#00e5a0", lineHeight: "1" }}>A (93.5%)</div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "4px" }}>Current Overall Grade</div>
                  </div>
                </div>

                {/* Weight Breakdown Grid */}
                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "14px" }}>Grade Weight Breakdown</h4>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {[
                      { component: "Quizzes & Midterm Examination", weight: "40%", score: "92.0%", status: "Graded" },
                      { component: "Coding Assignments & AST Labs", weight: "30%", score: "96.5%", status: "Graded" },
                      { component: "AI Proctoring Focus & Integrity Metric", weight: "30%", score: "94.0%", status: "Active Tracker" }
                    ].map((comp, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "700" }}>{comp.component}</div>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Target Weight: {comp.weight}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "15px", fontWeight: "800" }}>{comp.score}</div>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: comp.status === "Graded" ? "#00e5a0" : "var(--primary-red)" }}>{comp.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Final Exam Target Grade Calculator Slider */}
                <div style={{ backgroundColor: "#FAF6EE", border: "1px solid var(--border)", borderRadius: "14px", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Interactive Final Exam Target Calculator</h4>
                    <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary-red)" }}>Expected Final Exam: {targetFinalExamScore}%</span>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={targetFinalExamScore}
                    onChange={(e) => setTargetFinalExamScore(parseInt(e.target.value))}
                    className="target-grade-slider"
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "13px" }}>
                    <span>Projected Course Grade: <strong style={{ color: "#00e5a0" }}>{Math.round(85 * 0.6 + targetFinalExamScore * 0.4)}% ({Math.round(85 * 0.6 + targetFinalExamScore * 0.4) >= 90 ? 'Grade A' : 'Grade B+'})</strong></span>
                    <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Drag slider to simulate score outcomes</span>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ display: "flex", height: "240px", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                Select a course on the left to inspect digital transcripts.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Official Parchment Certificate Modal */}
      {showCertificateModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "760px", padding: "36px", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
            <button onClick={() => setShowCertificateModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", cursor: "pointer" }}>
              <X size={22} />
            </button>

            {/* Certificate Student Name Customizer */}
            <div style={{ marginBottom: "20px", padding: "14px 18px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Certificate Recipient Name:</span>
              <input
                type="text"
                value={certStudentName}
                onChange={(e) => setCertStudentName(e.target.value)}
                style={{ flex: 1, padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", fontWeight: "700", outline: "none" }}
              />
            </div>

            {/* Certificate Artwork */}
            <div className="certificate-frame">
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.15em", color: "#8D6E53", textTransform: "uppercase" }}>EDUSPHERE ACADEMIC PORTAL</span>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: "700", margin: "8px 0 16px 0", color: "#1a1a1a" }}>Certificate of Academic Achievement</h2>
                <p style={{ fontSize: "13px", color: "#666", fontStyle: "italic", margin: "0 0 20px 0" }}>This official parchment certifies that</p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "700", color: "var(--primary-red)", margin: "0 0 16px 0" }}>{certStudentName}</h3>
                <p style={{ fontSize: "13px", color: "#444", lineHeight: "1.6", maxWidth: "520px", margin: "0 auto 28px auto" }}>
                  has successfully completed all standard modules, SCORM 2004 objectives, and proctored examinations for <strong>Compiler Design & Database Systems</strong>.
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "24px", borderTop: "1px solid #EAE3D5" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "serif", fontStyle: "italic", fontSize: "16px", fontWeight: "700", color: "#1a1a1a" }}>Dr. Alistair Vance</div>
                    <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>DEAN OF ACADEMICS</div>
                  </div>

                  <div className="certificate-seal">
                    <Award size={36} />
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700" }}>OCTOBER 2026</div>
                    <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>VERIFICATION HASH: #8A92-F1</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button className="btn" onClick={() => window.print()} style={{ padding: "10px 20px", fontSize: "13px", fontWeight: "700", border: "1px solid var(--border)", backgroundColor: "#ffffff" }}>
                <Printer size={16} style={{ marginRight: "6px" }} />
                Print Official Certificate
              </button>
              <button className="btn" onClick={() => setShowCertificateModal(false)} style={{ padding: "10px 20px", fontSize: "13px", fontWeight: "700", backgroundColor: "var(--primary-red)", color: "#ffffff", border: "none" }}>
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lesson View Drawer Modal */}
      {activeLesson && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", width: "100%", maxWidth: "640px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <PlayCircle size={22} style={{ color: "var(--primary-red)" }} />
                <h3 style={{ fontSize: "18px", margin: 0, fontWeight: "700" }}>{activeLesson.title}</h3>
              </div>
              <button onClick={() => setActiveLesson(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
              {activeLesson.videoUrl && (
                <div style={{ marginBottom: "16px", borderRadius: "8px", overflow: "hidden", aspectRatio: "16/9", border: "1px solid var(--border)" }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              <p style={{ whiteSpace: "pre-wrap" }}>{activeLesson.content}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <button className="btn" onClick={() => setActiveLesson(null)} style={{ padding: "8px 16px", fontSize: "12px", border: "1px solid var(--border)", backgroundColor: "#ffffff" }}>
                Close
              </button>
              
              {!activeLesson.isCompleted && (
                <button 
                  className="btn" 
                  disabled={actionLoading}
                  onClick={handleCompleteLesson}
                  style={{ padding: "8px 16px", fontSize: "12px", backgroundColor: "var(--primary-red)", color: "#ffffff", border: "none" }}
                >
                  {actionLoading ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <>
                      <CheckCircle size={16} style={{ marginRight: "6px" }} />
                      Complete & Earn +50 XP
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
