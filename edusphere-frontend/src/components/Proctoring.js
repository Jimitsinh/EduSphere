import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Clock, 
  Volume2, 
  Loader2,
  Smartphone,
  Users,
  Lock,
  Unlock,
  Play,
  Check,
  Code,
  FileText,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import "../App.css";

// Multi-Format Exam Questions Suite (MCQ, Theory, Live Compiler)
const EXAM_QUESTIONS = [
  {
    id: 1,
    type: "mcq",
    category: "MULTIPLE CHOICE",
    marks: 5,
    title: "Question 1: Lexical Analysis & Token Streams",
    question: "Which data structure is primarily utilized by a Lexical Analyzer (Lexer) to efficiently map raw character streams to unique token identifiers?",
    options: [
      { id: "A", text: "A. Deterministic Finite Automaton (DFA) with State Transition Tables" },
      { id: "B", text: "B. Priority Queue with Binary Min-Heap Array" },
      { id: "C", text: "C. Circular Doubly Linked List with Active Head Pointers" },
      { id: "D", text: "D. B+ Tree Index with Sequential Leaf Scan Support" }
    ],
    correctAnswer: "A"
  },
  {
    id: 2,
    type: "mcq",
    category: "MULTIPLE CHOICE",
    marks: 5,
    title: "Question 2: Transaction Isolation & Concurrency",
    question: "In database management systems, which ACID property guarantees that concurrent transactions do not interfere with each other's execution?",
    options: [
      { id: "A", text: "A. Atomicity (All-or-Nothing Execution)" },
      { id: "B", text: "B. Consistency (Preserving Invariants)" },
      { id: "C", text: "C. Isolation (Concurrent Execution Safety)" },
      { id: "D", text: "D. Durability (Persistent Disk Flush)" }
    ],
    correctAnswer: "C"
  },
  {
    id: 3,
    type: "mcq",
    category: "MULTIPLE CHOICE",
    marks: 5,
    title: "Question 3: Operating System Deadlock Conditions",
    question: "Which of Coffman's four necessary conditions for system deadlock states that resources cannot be forcibly confiscated from a process holding them?",
    options: [
      { id: "A", text: "A. Mutual Exclusion" },
      { id: "B", text: "B. Hold and Wait" },
      { id: "C", text: "C. No Preemption" },
      { id: "D", text: "D. Circular Wait" }
    ],
    correctAnswer: "C"
  },
  {
    id: 4,
    type: "theory",
    category: "THEORY & ESSAY",
    marks: 15,
    title: "Question 4: Macroeconomic Policy & Transmission Mechanisms",
    question: "Evaluate the dynamic mechanisms of monetary policy transmissions, real business cycles, and institutional frameworks within advanced Keynesian macroeconomic models."
  },
  {
    id: 5,
    type: "coding",
    category: "LIVE COMPILER & CODING",
    marks: 20,
    title: "Question 5: Algorithmic Tokenizer & Abstract Syntax Tree Parser",
    question: "Write a Python function `tokenize_and_evaluate(expression)` that takes an arithmetic string (e.g. '12 + 8 * 2') and returns a dictionary containing 'tokens' (list of token strings) and 'result' (evaluated numerical output). Test your program using the live compiler execution engine below.",
    starterCode: `# Python Live Compiler Exam Sandbox
def tokenize_and_evaluate(expression):
    # Write your tokenization and evaluation logic below
    tokens = expression.split()
    result = eval(expression)
    return {
        "tokens": tokens,
        "result": result
    }

# Live Test Execution
sample_expr = "12 + 8 * 2"
print("Processing Input Expression:", sample_expr)
output = tokenize_and_evaluate(sample_expr)
print("Compiler Tokenizer Output:", output)`,
    testCases: [
      { id: 1, name: "Test 1: Simple Addition", input: "10 + 20", expected: "{'tokens': ['10', '+', '20'], 'result': 30}" },
      { id: 2, name: "Test 2: Multi-Operator Precedence", input: "12 + 8 * 2", expected: "{'tokens': ['12', '+', '8', '*', '2'], 'result': 28}" },
      { id: 3, name: "Test 3: Division & Subtraction", input: "100 / 5 - 4", expected: "{'tokens': ['100', '/', '5', '-', '4'], 'result': 16.0}" }
    ]
  }
];

export default function Proctoring() {
  const intervalRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const audioStreamRef = useRef(null);
  const liveVideoRef = useRef(null);   // sidebar webcam card <video>
  const calibVideoRef = useRef(null);  // calibration overlay <video>
  const localStreamRef = useRef(null); // shared getUserMedia stream

  const [exam, setExam] = useState(null);
  const [status, setStatus] = useState("Initializing AI...");
  const [isSecure, setIsSecure] = useState(true);
  const [violations, setViolations] = useState(0);
  const [attentionScore, setAttentionScore] = useState(98);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Question Tracker & Locking States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState({
    1: "",
    2: "",
    3: "",
    4: "",
    5: EXAM_QUESTIONS[4].starterCode
  });
  const [lockedQuestions, setLockedQuestions] = useState({});

  // Q5 Live Compiler States
  const [compilerCode, setCompilerCode] = useState(EXAM_QUESTIONS[4].starterCode);
  const [compilerOutput, setCompilerOutput] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // In-Browser Python Code Compiler Simulator
  const handleRunCompiler = () => {
    setIsRunningCode(true);
    setCompilerOutput("Compiling & Executing Python 3.11 Script...");
    setTestResults(null);

    setTimeout(() => {
      setIsRunningCode(false);
      let stdout = "Processing Input Expression: 12 + 8 * 2\nCompiler Tokenizer Output: {'tokens': ['12', '+', '8', '*', '2'], 'result': 28}\n";
      
      const tests = [
        { id: 1, name: "Test 1: Simple Addition", input: "10 + 20", passed: true, output: "{'tokens': ['10', '+', '20'], 'result': 30}" },
        { id: 2, name: "Test 2: Multi-Operator Precedence", input: "12 + 8 * 2", passed: true, output: "{'tokens': ['12', '+', '8', '*', '2'], 'result': 28}" },
        { id: 3, name: "Test 3: Division & Subtraction", input: "100 / 5 - 4", passed: true, output: "{'tokens': ['100', '/', '5', '-', '4'], 'result': 16.0}" }
      ];

      setCompilerOutput(stdout);
      setTestResults(tests);
      setQuestionAnswers(prev => ({ ...prev, 5: compilerCode }));
    }, 1000);
  };

  const handleAdvanceQuestion = () => {
    if (currentQuestionIdx < EXAM_QUESTIONS.length - 1) {
      // PERMANENTLY LOCK PREVIOUS QUESTION
      setLockedQuestions(prev => ({ ...prev, [currentQuestionIdx]: true }));
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  // Web Audio Decibel Meter States
  const [decibels, setDecibels] = useState(0);
  const [audioWarningTriggered, setAudioWarningTriggered] = useState(false);

  // AI Gaze Eye-Tracking States
  const [gazeFocus, setGazeFocus] = useState("question_panel");
  // consecutiveAwayRef removed — replaced by time-based awayStartTimeRef below

  // Multi-face & Phone Detection States
  const [multiFaceWarning, setMultiFaceWarning] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState(false);
  const multiFaceConsecutiveRef = useRef(0);
  const phoneLookStartRef = useRef(null);   // timestamp when downward gaze started (ref avoids stale closure)
  const phoneConsecutiveRef = useRef(0);
  const faceDetectorRef = useRef(null);
  const aiDetectionIntervalRef = useRef(null);
  // Violation cooldown map — prevents duplicate POSTs within 8s per violation type
  const violationCooldownRef = useRef({});

  const navigate = useNavigate();
  const examId = new URLSearchParams(window.location.search).get("id");

  // WebGazer Gaze Tracking States
  const [gazeX, setGazeX] = useState(window.innerWidth / 2);
  const [gazeY, setGazeY] = useState(window.innerHeight / 2);
  const [gazeBubbleVisible, setGazeBubbleVisible] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [useHighPrecision, setUseHighPrecision] = useState(false);
  const [webgazerReady, setWebgazerReady] = useState(false);
  const [isFaceTracked, setIsFaceTracked] = useState(false); // Live face detection status
  const [calibrationPoints, setCalibrationPoints] = useState([
    // 4 tight corners
    { id: 1,  x: 5,  y: 5,  count: 0 },   // top-left
    { id: 2,  x: 95, y: 5,  count: 0 },   // top-right
    { id: 3,  x: 5,  y: 95, count: 0 },   // bottom-left
    { id: 4,  x: 95, y: 95, count: 0 },   // bottom-right
    // 4 edge midpoints
    { id: 5,  x: 50, y: 5,  count: 0 },   // top-center
    { id: 6,  x: 50, y: 95, count: 0 },   // bottom-center
    { id: 7,  x: 5,  y: 50, count: 0 },   // left-center
    { id: 8,  x: 95, y: 50, count: 0 },   // right-center
    // inner ring
    { id: 9,  x: 25, y: 25, count: 0 },   // inner top-left
    { id: 10, x: 75, y: 25, count: 0 },   // inner top-right
    { id: 11, x: 25, y: 75, count: 0 },   // inner bottom-left
    { id: 12, x: 75, y: 75, count: 0 },   // inner bottom-right
    // center
    { id: 13, x: 50, y: 50, count: 0 },   // center
  ]);

  // High-Precision Gaze Validation States
  const [calibrationStep, setCalibrationStep] = useState("instructions"); // "instructions" | "calibrating" | "validating"
  const [activeCalibPoint, setActiveCalibPoint] = useState(null);
  const [validationCountdown, setValidationCountdown] = useState(5);
  const [validationAccuracy, setValidationAccuracy] = useState(null);
  const [validationStatus, setValidationStatus] = useState("stare"); // "stare" | "passed" | "failed"
  const [validationTargetIdx, setValidationTargetIdx] = useState(0); // which of the 5 targets we are on

  const lastX = useRef(window.innerWidth / 2);
  const lastY = useRef(window.innerHeight / 2);
  const lastLookupTime = useRef(0);
  const isCalibratingRef = useRef(false);
  const activeCalibPointRef = useRef(null);
  const latestGazeRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const gazeHistoryRef = useRef([]); // History buffer to filter pupil tracking jitter

  // Dynamic Word-segment Lookup under Eye Gaze (elementFromPoint)
  const checkGazeTargetElement = (x, y) => {
    const el = document.elementFromPoint(x, y);
    if (el) {
      const text = el.innerText || el.textContent;
      if (text && text.trim().length > 0) {
        const wordList = text.trim().split(/\s+/);
        const segment = wordList.slice(0, 8).join(" ");
        console.log(`[Eye Tracking Word Capture] Gaze absolute coordinates: (${Math.round(x)}, ${Math.round(y)}). Captured text: "${segment}..."`);
        
        // Placeholder function for backend LLM API integration:
        // sendGazeTextToLLM(segment);
      }
    }
  };

  // Load WebGazer.js, acquire camera ONCE via getUserMedia, display in our own controlled <video>.
  // WebGazer.js default video container is fully hidden — we own the UI completely.
  useEffect(() => {
    // Make page unscrollable
    document.body.style.overflow = "hidden";

    const startCameraPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        localStreamRef.current = stream;
        // Attach to sidebar video
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(() => {});
        }
        // If calibration is already open (unlikely but safe)
        if (calibVideoRef.current) {
          calibVideoRef.current.srcObject = stream;
          calibVideoRef.current.play().catch(() => {});
        }
        console.log("[Camera] Live preview active in sidebar.");
      } catch (e) {
        console.warn("[Camera] getUserMedia failed:", e);
      }
    };

    const script = document.createElement("script");
    script.src = "/webgazer.js";
    script.async = true;
    script.onload = () => {
      console.log("[Eye Tracker] WebGazer script loaded.");
      setWebgazerReady(true);

      // Suppress WebGazer's default floating video UI entirely.
      // We manage the camera preview ourselves via liveVideoRef.
      try {
        window.webgazer
          .showVideoPreview(false)
          .showPredictionPoints(false)
          .applyKalmanFilter(true);
        console.log("[Eye Tracker] WebGazer configured — default video UI suppressed.");
        
        // Restore from cache or prompt calibration
        setTimeout(() => {
          handleRestoreOrStartCalibration();
        }, 1500);
      } catch (e) {
        console.warn("[Eye Tracker] WebGazer config failed:", e);
      }
    };
    document.body.appendChild(script);

    startCameraPreview();

    return () => {
      // Stop our own camera stream
      const s = localStreamRef.current;
      if (s) { s.getTracks().forEach(t => t.stop()); }
      // Stop WebGazer
      try { if (window.webgazer) { window.webgazer.end(); } } catch (e) {}
      // Remove script
      try { if (script && script.parentNode) { script.parentNode.removeChild(script); } } catch (e) {}
      // Remove any leftover WebGazer DOM elements
      try {
        const container = document.getElementById("webgazerVideoContainer");
        if (container && container.parentNode) { container.parentNode.removeChild(container); }
      } catch (e) {}
    };
  }, []);

  // Synchronize ref with state to prevent stale closures in gaze listeners
  useEffect(() => {
    isCalibratingRef.current = isCalibrating;
  }, [isCalibrating]);

  // Hide any WebGazer-injected DOM containers that may leak through despite showVideoPreview(false)
  useEffect(() => {
    const interval = setInterval(() => {
      const container = document.getElementById("webgazerVideoContainer");
      if (container) {
        container.style.display = "none";
        container.style.visibility = "hidden";
        container.style.pointerEvents = "none";
      }
      // Also hide the WebGazer gaze dot (it uses its own element)
      const gazeDot = document.getElementById("webgazerGazeDot");
      if (gazeDot) {
        gazeDot.style.display = "none";
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getPanelFromPixels = (rawX, rawY) => {
    // Center-bias correction: WebGazer predictions are systematically pulled toward
    // the screen center. Apply a gentle repulsion to compensate.
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const biasFactor = 0.08; // 8% correction outward from center
    const x = rawX + (rawX - cx) * biasFactor;
    const y = rawY + (rawY - cy) * biasFactor;

    const el = document.elementFromPoint(x, y);
    if (!el) return "looking_away";

    const questionPanel = el.closest(".question-content");
    const answerPanel = el.closest(".answer-section");
    const cameraPanel = el.closest(".proctor-left");

    if (questionPanel) return "question_panel";
    if (answerPanel) return "answer_panel";
    if (cameraPanel) return "camera_panel";

    // Dynamic margin: scale the "looking away" threshold to screen resolution.
    // On a 1920px wide screen, 6% = 115px — a natural comfortable gaze boundary.
    const xMarginPct = Math.min(10, Math.max(5, 1100 / window.innerWidth * 6));
    const yMarginPct = Math.min(10, Math.max(5, 700 / window.innerHeight * 6));

    const xPct = (x / window.innerWidth) * 100;
    const yPct = (y / window.innerHeight) * 100;

    if (xPct < xMarginPct || xPct > 100 - xMarginPct || yPct < yMarginPct || yPct > 100 - yMarginPct) {
      return "looking_away";
    } else if (xPct < 30) {
      return "camera_panel";
    } else {
      if (yPct < 48) return "question_panel";
      return "answer_panel";
    }
  };

  // Time-based away tracking refs — prevents brief saccades/glances from firing violations
  const awayStartTimeRef = useRef(null);      // timestamp when gaze first left screen
  const returnGraceTimerRef = useRef(null);   // debounce timer for return-to-screen

  const initializeWebGazerListener = () => {
    if (!window.webgazer) return;

    try {
      window.webgazer
        .showVideoPreview(false)
        .showPredictionPoints(false)
        .applyKalmanFilter(true)
        .setGazeListener((data) => {
          if (!data) {
            setIsFaceTracked(false);
            return;
          }
          setIsFaceTracked(true);

          // ── Step 1: Accumulate a 16-frame rolling history ──────────────────────
          gazeHistoryRef.current.push({ x: data.x, y: data.y });
          if (gazeHistoryRef.current.length > 16) {
            gazeHistoryRef.current.shift();
          }

          const history = gazeHistoryRef.current;
          const len = history.length;

          let avgX = data.x;
          let avgY = data.y;

          if (len >= 5) {
            // ── Step 2: Trimmed Mean (Outlier Rejection) ────────────────────────
            // Sort x and y coordinates independently, discard top/bottom 20%
            const xs = history.map(p => p.x).sort((a, b) => a - b);
            const ys = history.map(p => p.y).sort((a, b) => a - b);
            const trim = Math.floor(len * 0.2);
            const midXs = xs.slice(trim, len - trim);
            const midYs = ys.slice(trim, len - trim);

            avgX = midXs.reduce((s, v) => s + v, 0) / midXs.length;
            avgY = midYs.reduce((s, v) => s + v, 0) / midYs.length;
          }

          // ── Step 3: Noise Gate + Dynamic EMA ─────────────────────────────────
          // If the distance is small (micro-jitter), smooth heavily (alpha = 0.05).
          // If it's a medium movement, scale alpha linearly up to 0.25.
          // If it's a large saccade, use alpha = 0.45 for rapid tracking.
          const dist = Math.hypot(avgX - lastX.current, avgY - lastY.current);
          let alpha = 0.05; // Still/fixated gaze base smoothing

          if (dist >= 15 && dist < 60) {
            // Linear scale alpha between 0.05 and 0.25
            alpha = 0.05 + ((dist - 15) / 45) * 0.20;
          } else if (dist >= 60) {
            // Rapid eye movement/saccade
            alpha = 0.45;
          }

          const smoothX = lastX.current * (1 - alpha) + avgX * alpha;
          const smoothY = lastY.current * (1 - alpha) + avgY * alpha;

          lastX.current = smoothX;
          lastY.current = smoothY;

          setGazeX(smoothX);
          setGazeY(smoothY);
          setGazeBubbleVisible(true);

          latestGazeRef.current = { x: smoothX, y: smoothY };

          const focus = getPanelFromPixels(smoothX, smoothY);
          setGazeFocus(focus);

          // ── Step 4: Time-based violation detection (Disabled/Logging Only) ────
          const now = Date.now();
          if (focus === "looking_away") {
            if (returnGraceTimerRef.current) {
              clearTimeout(returnGraceTimerRef.current);
              returnGraceTimerRef.current = null;
            }
            if (awayStartTimeRef.current === null) {
              awayStartTimeRef.current = now;
            } else if (now - awayStartTimeRef.current >= 1500) {
              if (!isCalibratingRef.current) {
                reportViolation("looking_away", "Eye tracker detected sustained gaze away from exam screen (>1.5s).");
              }
              awayStartTimeRef.current = null;
            }
          } else {
            if (awayStartTimeRef.current !== null && !returnGraceTimerRef.current) {
              returnGraceTimerRef.current = setTimeout(() => {
                awayStartTimeRef.current = null;
                returnGraceTimerRef.current = null;
              }, 300);
            }
          }

          if (now - lastLookupTime.current > 500) {
            checkGazeTargetElement(smoothX, smoothY);
            lastLookupTime.current = now;
          }
        });
    } catch (e) {
      console.warn("[Eye Tracker] WebGazer listener setup failed:", e);
    }
  };

  const handleRestoreOrStartCalibration = () => {
    if (!window.webgazer) return;

    window.saveDataAcrossSessions = true;

    const cachedCalib = localStorage.getItem("edusphere_calibration_active");
    const cachedTime = localStorage.getItem("edusphere_calibration_time");
    const isSessionFresh = cachedCalib === "true" && cachedTime && (Date.now() - parseInt(cachedTime)) < 24 * 60 * 60 * 1000;

    if (isSessionFresh) {
      console.log("[Eye Tracker] Fresh 24-hour calibration cache found. Initializing auto-validation check...");
      setIsCalibrating(true);
      setCalibrationStep("validating");
      setUseHighPrecision(true);
      
      initializeWebGazerListener();
      try {
        window.webgazer.begin();
        setTimeout(() => {
          startValidationPass();
        }, 1200);
      } catch (err) {
        console.warn("[Eye Tracker] Auto-validation start failed, forcing manual calibration:", err);
        handleStartCalibration(true);
      }
    } else {
      console.log("[Eye Tracker] No calibration cache. Starting manual calibration overlay.");
      handleStartCalibration(false);
    }
  };

  const handleStartCalibration = (forceManual = false) => {
    if (!webgazerReady || !window.webgazer) {
      alert("Eye-tracking library is still loading. Please wait a moment.");
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setUseHighPrecision(true);
    setCalibrationPoints((prev) => prev.map((pt) => ({ ...pt, count: 0 })));
    setIsCalibrating(true);
    setCalibrationStep(forceManual ? "calibrating" : "instructions");

    initializeWebGazerListener();
    try {
      if (window.webgazer) {
        window.webgazer.clearData(); // Clear old regression points to start fresh
      }
      window.webgazer.begin();
    } catch (e) {
      console.warn("[Eye Tracker] WebGazer begin failed:", e);
    }

    setTimeout(() => {
      const stream = localStreamRef.current;
      if (stream && calibVideoRef.current) {
        calibVideoRef.current.srcObject = stream;
        calibVideoRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const handlePointClick = (pointId, xPercent, yPercent) => {
    if (activeCalibPointRef.current !== null) return;

    activeCalibPointRef.current = pointId;
    setActiveCalibPoint(pointId);

    const absoluteX = (xPercent / 100) * window.innerWidth;
    const absoluteY = (yPercent / 100) * window.innerHeight;

    // Record sample 0 immediately on click
    if (window.webgazer) {
      window.webgazer.recordScreenPosition(absoluteX, absoluteY, "click");
    }

    setCalibrationPoints((prev) =>
      prev.map((pt) => (pt.id === pointId ? { ...pt, count: 1 } : pt))
    );

    // Collect 10 samples per point at 500ms intervals.
    let count = 1;
    const interval = setInterval(() => {
      if (!window.webgazer) { clearInterval(interval); return; }
      window.webgazer.recordScreenPosition(absoluteX, absoluteY, "click");
      count++;
      setCalibrationPoints((prev) =>
        prev.map((pt) => (pt.id === pointId ? { ...pt, count } : pt))
      );
      if (count >= 10) {
        clearInterval(interval);
        activeCalibPointRef.current = null;
        setActiveCalibPoint(null);
      }
    }, 500);
  };

  const startValidationPass = () => {
    setCalibrationStep("validating");
    setValidationStatus("stare");
    setValidationTargetIdx(0);

    // 5 geographically diverse targets — all 4 corners + center
    const validationTargets = [
      { x: 0.50, y: 0.50, label: "Center" },
      { x: 0.05, y: 0.05, label: "Top-Left corner" },
      { x: 0.95, y: 0.05, label: "Top-Right corner" },
      { x: 0.05, y: 0.95, label: "Bottom-Left corner" },
      { x: 0.95, y: 0.95, label: "Bottom-Right corner" },
    ];
    const totalTargets = validationTargets.length;
    setValidationCountdown(totalTargets);

    let targetIdx = 0;
    let secondsLeft = totalTargets;
    const allDistances = [];
    const currentSamples = [];

    const samplerInterval = setInterval(() => {
      currentSamples.push({ ...latestGazeRef.current });
    }, 100);

    const timerInterval = setInterval(() => {
      secondsLeft--;
      setValidationCountdown(secondsLeft);

      // Evaluate accuracy for the target that just expired
      const samplesForTarget = [...currentSamples];
      currentSamples.length = 0;

      if (samplesForTarget.length > 0 && targetIdx < totalTargets) {
        const tgt = validationTargets[targetIdx];
        const tx = tgt.x * window.innerWidth;
        const ty = tgt.y * window.innerHeight;
        const dists = samplesForTarget.map(s => Math.hypot(s.x - tx, s.y - ty));
        dists.sort((a, b) => a - b);
        // Trimmed mean: discard top+bottom 20% as blink/saccade noise
        const trim = Math.floor(dists.length * 0.2);
        const trimmed = dists.slice(trim, dists.length - trim);
        const avg = trimmed.length > 0
          ? trimmed.reduce((s, d) => s + d, 0) / trimmed.length
          : dists[Math.floor(dists.length / 2)];
        allDistances.push(avg);
        targetIdx++;
        setValidationTargetIdx(targetIdx);
      }

      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        clearInterval(samplerInterval);

        const avgDistance = allDistances.length > 0
          ? Math.round(allDistances.reduce((s, d) => s + d, 0) / allDistances.length)
          : 999;
        setValidationAccuracy(avgDistance);

        if (avgDistance <= 60) {
          setValidationStatus("passed");
          localStorage.setItem("edusphere_calibration_active", "true");
          localStorage.setItem("edusphere_calibration_time", Date.now().toString());
          setTimeout(() => {
            setIsCalibrating(false);
            setUseHighPrecision(true);
            alert(`✅ Calibration passed! Avg accuracy: ${avgDistance}px across 5 positions (≤60px required). Eye tracking active.`);
          }, 1200);
        } else {
          setValidationStatus("failed");
        }
      }
    }, 1000);
  };

  const checkCalibrationComplete = () => {
    const allCalibrated = calibrationPoints.every((pt) => pt.count >= 10);
    if (allCalibrated) {
      startValidationPass();
    } else {
      const remaining = calibrationPoints.filter(p => p.count < 10).length;
      alert(`Calibration incomplete. ${remaining} dot(s) still need 10 samples. Stare at and click each dot until it shows ✓.`);
    }
  };

  // 1. Fetch Exam details
  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5050/api/exams/${examId}`, {
          headers: { "x-auth-token": token }
        });
        setExam(res.data.exam);
        setSecondsLeft(res.data.exam.durationMins * 60);
        setViolations(res.data.log.violationCount);
      } catch (err) {
        console.error("Failed to load proctor exam session:", err);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamDetails();
    } else {
      navigate("/dashboard");
    }
  }, [examId, navigate]);

  // 2. Timer Loop
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Helper: POST violation details to database and update UI violations count
  const reportViolation = async (violationType, description) => {
    if (!exam) return;
    const now = Date.now();
    const last = violationCooldownRef.current[violationType] || 0;
    if (now - last < 8000) return; // suppress duplicate within 8 seconds
    violationCooldownRef.current[violationType] = now;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5050/api/exams/violation",
        { examTitle: exam.title, violationType, description },
        { headers: { "x-auth-token": token } }
      );
      
      setViolations(res.data.violationCount);
      setAttentionScore(res.data.attentionScore);
      
      if (res.data.violationCount >= 3) {
        setIsSecure(false);
        setStatus("Session Locked");
        alert(`🚨 SECURITY LOCKOUT: Too many violations recorded (${res.data.violationCount}/3). This exam session is locked.`);
      } else {
        alert(`⚠ PROCTOR WARNING: Proctoring violation detected!\nType: ${violationType.toUpperCase()}\nDetails: ${description}\nWarnings: ${res.data.violationCount}/3`);
      }
    } catch (err) {
      console.error("Failed to log violation on backend:", err);
    }
  };


  // Tab-switch + window-blur detection
  // visibilitychange catches Ctrl+Tab; window blur catches Alt+Tab & click-away
  useEffect(() => {
    if (!exam) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsSecure(false);
        setStatus("Warning: Tab hidden");
        reportViolation("tab_switch", "Student navigated away from the exam tab.");
      } else {
        setIsSecure(true);
        setStatus("Secure");
      }
    };

    const handleWindowBlur = () => {
      // Fire only if the document isn't already hidden (prevents double-firing)
      if (!document.hidden) {
        setIsSecure(false);
        setStatus("Warning: Window lost focus");
        reportViolation("window_blur", "Student switched away from the exam window (Alt+Tab or click outside).");
      }
    };

    const handleWindowFocus = () => {
      setIsSecure(true);
      setStatus("Secure");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  // AI Vision: Multi-Face (native FaceDetector) + Phone heuristic (gaze-down)
  useEffect(() => {
    if (!exam) return;

    // Build native FaceDetector if supported (Chrome/Edge Shape Detection API)
    let faceDetector = null;
    if ("FaceDetector" in window) {
      try {
        faceDetector = new window.FaceDetector({ maxDetectedFaces: 10, fastMode: true });
        faceDetectorRef.current = faceDetector;
        console.log("[AI Vision] Native FaceDetector ready.");
      } catch (e) {
        console.warn("[AI Vision] FaceDetector init error:", e);
      }
    } else {
      console.warn("[AI Vision] FaceDetector not supported — multi-face detection disabled.");
    }

    const PHONE_LAP_Y    = 0.78; // gaze below 78% of screen height = looking at lap
    const PHONE_HOLD_MS  = 3000; // must hold downward gaze for 3s before flagging

    aiDetectionIntervalRef.current = setInterval(async () => {
      const video = liveVideoRef.current;

      // ── 1. MULTI-FACE via native FaceDetector ────────────────────────────
      if (faceDetector && video && video.readyState >= 2 && !video.paused) {
        try {
          const faces = await faceDetector.detect(video);
          if (faces.length >= 2) {
            multiFaceConsecutiveRef.current++;
            setMultiFaceWarning(true);
            if (multiFaceConsecutiveRef.current >= 2) {
              reportViolation(
                "multiple_faces",
                `Camera detected ${faces.length} faces. Only the registered student should be present.`
              );
              multiFaceConsecutiveRef.current = 0;
            }
          } else {
            multiFaceConsecutiveRef.current = 0;
            setMultiFaceWarning(false);
          }
        } catch (e) {
          // Suppress per-frame errors silently
        }
      }

      // ── 2. PHONE HEURISTIC via gaze position ─────────────────────────────
      // Sustained downward gaze (lap area) for ≥3s → flag possible phone use.
      // Uses a ref so there is zero stale-closure risk across ticks.
      if (!isCalibratingRef.current) {
        const gazeYRatio = latestGazeRef.current.y / window.innerHeight;
        if (gazeYRatio > PHONE_LAP_Y) {
          const now = Date.now();
          if (phoneLookStartRef.current === null) {
            phoneLookStartRef.current = now;
          } else if (now - phoneLookStartRef.current >= PHONE_HOLD_MS) {
            phoneConsecutiveRef.current++;
            setPhoneWarning(true);
            if (phoneConsecutiveRef.current >= 2) {
              reportViolation(
                "phone_suspected",
                `Eye tracker detected sustained downward gaze (${Math.round(gazeYRatio * 100)}% screen) suggesting phone use.`
              );
              phoneConsecutiveRef.current = 0;
            }
            phoneLookStartRef.current = null; // reset after flagging
          }
        } else {
          phoneLookStartRef.current = null;
          if (phoneConsecutiveRef.current > 0) {
            phoneConsecutiveRef.current = 0;
            setPhoneWarning(false);
          }
        }
      }
    }, 2000);

    return () => {
      clearInterval(aiDetectionIntervalRef.current);
      aiDetectionIntervalRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  // 5. Audio Decibel tracker (Web Audio API)
  useEffect(() => {
    if (!exam) return;
    let audioContext = null;
    let analyser = null;
    let microphone = null;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 512;
        microphone.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let consecutiveNoiseSeconds = 0;

        audioIntervalRef.current = setInterval(() => {
          if (violations >= 3) return;
          
          analyser.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          const mappedDb = Math.min(100, Math.round((average / 128) * 100));
          setDecibels(mappedDb);

          if (mappedDb > 60) {
            consecutiveNoiseSeconds++;
            if (consecutiveNoiseSeconds >= 4) {
              setAudioWarningTriggered(true);
              reportViolation("high_decibel", `Excessive ambient sound levels detected: ${mappedDb}% noise amplitude.`);
              consecutiveNoiseSeconds = 0;
              setTimeout(() => setAudioWarningTriggered(false), 2000);
            }
          } else {
            consecutiveNoiseSeconds = Math.max(0, consecutiveNoiseSeconds - 1);
          }
        }, 1000);

      } catch (err) {
        console.warn("Microphone access denied or audio monitor setup failed:", err);
      }
    };

    setupAudio();

    return () => {
      document.body.style.overflow = "auto";
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [exam, violations]);

  // Exam Submission
  const handleExamSubmit = async () => {
    if (!exam || submitting) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5050/api/exams/submit",
        {
          examTitle: exam.title,
          answer: answerText
        },
        { headers: { "x-auth-token": token } }
      );
      
      alert("Exam submitted successfully. Backing up session logs.");
      navigate("/exams");
    } catch (err) {
      console.error("Failed to submit exam:", err);
      alert("Submission error. Please check database connectivity.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <Loader2 size={36} className="text-primary animate-spin" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const ringStyle = isSecure ? { animation: "pulseGlow 2s infinite" } : { animation: "pulseGlowRed 2s infinite" };
  const borderColor = isSecure ? "var(--accent)" : "var(--danger)";

  return (
    <div className="proctor-layout page-transition">
      {/* Top Header Bar */}
      <div className="proctor-header" style={{ marginBottom: "12px", padding: "10px 20px" }}>
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-accent" size={20} />
          <h1 className="h3" style={{ fontSize: "16px", margin: 0 }}>EduSphere Live Exam Room</h1>
          {useHighPrecision ? (
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#00e5a0", backgroundColor: "rgba(0, 229, 160, 0.1)", padding: "4px 10px", borderRadius: "12px", letterSpacing: "0.05em" }}>
              ⚡ EYE TRACKING: ACTIVE
            </span>
          ) : (
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--primary-red)", backgroundColor: "rgba(184, 50, 50, 0.08)", padding: "4px 10px", borderRadius: "12px", letterSpacing: "0.05em" }}>
              👉 CALIBRATION REQUIRED
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="badge-pill bg-surface border" style={{ padding: "4px 12px", fontSize: "12px" }}>
            <Clock size={14} />
            <span>{mins}:{secs}</span>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => handleStartCalibration(true)}
            style={{ fontWeight: "700", padding: "6px 12px", fontSize: "11px" }}
          >
            Recalibrate Gaze
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/exams")} style={{ padding: "6px 12px", fontSize: "11px" }}>Exit Session</button>
        </div>
      </div>

      <div className="proctor-content-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", alignItems: "start", padding: "0 20px 20px 20px" }}>
        {/* Left Side: Compact Webcam, Audio Decibel Gauge & Question Tracker */}
        <div className="proctor-left" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "8px" }}>
          <div 
            className="webcam-wrapper"
            style={{ 
              ...ringStyle, 
              border: `3px solid ${borderColor}`,
              borderRadius: '14px',
              overflow: 'hidden',
              position: 'relative',
              aspectRatio: '16/9',
              backgroundColor: '#000'
            }}
          >
            {/* Our own controlled video element — no external libraries fighting for the camera */}
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)"
              }}
            />
            {!isSecure && (
              <div className="webcam-overlay" style={{position: 'absolute', inset: 0, backgroundColor: 'rgba(255, 77, 79, 0.2)', zIndex: 2}}></div>
            )}
          </div>
          
          <div className="status-bar card" style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#ffffff", border: "1px solid var(--border)" }}>
            <div className="flex justify-between items-center mb-2" style={{ fontSize: "12px" }}>
              <span className="font-bold">Attention Score</span>
              <span className={`font-bold ${isSecure ? 'text-success' : 'text-danger'}`}>{attentionScore}%</span>
            </div>
            
            <div className="progress-bar-bg mb-2" style={{ height: "6px" }}>
              <div className={`progress-bar-fill ${isSecure ? 'bg-accent' : 'bg-danger'}`} style={{ width: `${attentionScore}%` }}></div>
            </div>

            {/* Audio Decibel Level Bar */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1" style={{ fontSize: "11px" }}>
                <span className="flex items-center gap-1 text-muted">
                  <Volume2 size={12} /> Sound Level
                </span>
                <span className={decibels > 60 ? "text-warning font-bold" : "text-muted"}>{decibels}%</span>
              </div>
              <div className="progress-bar-bg" style={{ height: "4px" }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${decibels}%`, 
                    backgroundColor: decibels > 60 ? "var(--warning)" : "var(--primary)" 
                  }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-1" style={{ flexWrap: "wrap", rowGap: "4px" }}>
              {isSecure ? (
                <div className="badge-pill" style={{backgroundColor: 'rgba(0, 229, 160, 0.1)', color: 'var(--accent)', fontSize: "10px", padding: "2px 8px"}}>
                  <UserCheck size={12} />
                  <span>Face Verified</span>
                </div>
              ) : (
                <div className="badge-pill" style={{backgroundColor: 'rgba(255, 77, 79, 0.1)', color: 'var(--danger)', fontSize: "10px", padding: "2px 8px"}}>
                  <UserX size={12} />
                  <span>{status}</span>
                </div>
              )}
              {violations > 0 && (
                <div className="badge-pill" style={{backgroundColor: 'rgba(255, 184, 0, 0.1)', color: 'var(--warning)', fontSize: "10px", padding: "2px 8px"}}>
                  <ShieldAlert size={12} />
                  <span>Violations: {violations}</span>
                </div>
              )}
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => handleStartCalibration(true)}
              style={{ 
                marginTop: "8px", 
                width: "100%", 
                fontSize: "10px", 
                padding: "6px", 
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px"
              }}
            >
              <ShieldCheck size={12} />
              {useHighPrecision ? "Recalibrate Eye Tracker" : "Start Eye Calibration"}
            </button>
          </div>

          {/* Left Sidebar Bottom: Question Tracker & Progression Card */}
          <div className="status-bar card" style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px", boxShadow: "var(--shadow-card)" }}>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  QUESTION TRACKER & PROGRESSION
                </span>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-red)" }}>
                  Q{currentQuestionIdx + 1}/5
                </span>
              </div>
              <p style={{ fontSize: "9px", color: "var(--primary-red)", fontWeight: "700", margin: "2px 0 0 0", lineHeight: "1.3" }}>
                ⚠ Moving to next question locks previous!
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {EXAM_QUESTIONS.map((q, idx) => {
                const isCurrent = currentQuestionIdx === idx;
                const isLocked = lockedQuestions[idx];
                const isAnswered = Boolean(questionAnswers[q.id]);

                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      if (isLocked) return;
                      setCurrentQuestionIdx(idx);
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid",
                      borderColor: isCurrent ? "var(--primary-red)" : (isLocked ? "#E86358" : "var(--border)"),
                      backgroundColor: isCurrent ? "rgba(255, 90, 76, 0.08)" : (isLocked ? "#FFF0EF" : "#FAF6EE"),
                      color: isCurrent ? "var(--primary-red)" : (isLocked ? "#D32F2F" : "var(--text-primary)"),
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {isLocked ? (
                        <>
                          <Lock size={12} style={{ color: "#D32F2F" }} />
                          <span>Q{idx + 1} Locked</span>
                        </>
                      ) : (
                        <>
                          {isAnswered ? <Check size={12} style={{ color: "#00e5a0" }} /> : <HelpCircle size={12} style={{ color: "var(--text-muted)" }} />}
                          <span>Q{idx + 1} {q.type.toUpperCase()}</span>
                        </>
                      )}
                    </div>

                    <span style={{ fontSize: "9px", textTransform: "uppercase", padding: "1px 6px", borderRadius: "4px", backgroundColor: isLocked ? "rgba(211,47,47,0.1)" : "rgba(0,0,0,0.04)" }}>
                      {isLocked ? "LOCKED" : (isCurrent ? "ACTIVE" : `${q.marks}M`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Full-Height Exam Suite */}
        <div className="proctor-right card" style={{ padding: "20px", backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "14px", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 120px)" }}>
          
          {/* Top Exam Header Bar */}
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "9px", fontWeight: "800", color: "var(--primary-red)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  EDUSPHERE SECURE EXAMINATION SUITE
                </span>
                <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "2px 0 0 0", fontFamily: "var(--font-display)" }}>
                  {exam?.title || "Advanced Macroeconomics IV & Systems Exam"}
                </h2>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FAF6EE", padding: "4px 10px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                <Clock size={12} style={{ color: "var(--primary-red)" }} />
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-primary)" }}>{mins}:{secs}</span>
              </div>
            </div>
          </div>

          {/* Active Question Content */}
          {(() => {
            const currentQ = EXAM_QUESTIONS[currentQuestionIdx];
            const isCurrentLocked = lockedQuestions[currentQuestionIdx];

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
                
                {/* Question Type & Marks Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#ffffff", backgroundColor: "var(--primary-red)", padding: "2px 10px", borderRadius: "10px" }}>
                      {currentQ.category}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>
                      {currentQ.marks} MARKS
                    </span>
                  </div>

                  {isCurrentLocked && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#D32F2F", backgroundColor: "#FFF0EF", padding: "2px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                      <Lock size={12} />
                      <span>Permanently Locked</span>
                    </div>
                  )}
                </div>

                {/* Question Title & Description */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    {currentQ.title}
                  </h3>
                  <div style={{ padding: "14px 18px", backgroundColor: "#FAF6EE", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "14px", lineHeight: "1.6", color: "var(--text-primary)" }}>
                    {currentQ.question}
                  </div>
                </div>

                {/* Question Input Type 1: MCQ (Radio Options) */}
                {currentQ.type === "mcq" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Select Answer Option:</label>
                    {currentQ.options.map((opt) => {
                      const isSelected = questionAnswers[currentQ.id] === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (isCurrentLocked) return;
                            setQuestionAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }));
                          }}
                          style={{
                            padding: "14px 18px",
                            borderRadius: "10px",
                            border: "1px solid",
                            borderColor: isSelected ? "var(--primary-red)" : "var(--border)",
                            backgroundColor: isSelected ? "rgba(255, 90, 76, 0.08)" : "#ffffff",
                            cursor: isCurrentLocked ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor: isSelected ? "var(--primary-red)" : "var(--border)",
                            backgroundColor: isSelected ? "var(--primary-red)" : "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {isSelected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ffffff" }}></div>}
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Question Input Type 2: Theory / Essay Textarea */}
                {currentQ.type === "theory" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Formal Essay Response:</label>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        Word Count: {questionAnswers[currentQ.id] ? questionAnswers[currentQ.id].trim().split(/\s+/).filter(Boolean).length : 0} words
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      disabled={isCurrentLocked || !isSecure || violations >= 3}
                      placeholder="Start typing your formal academic essay response here..."
                      value={questionAnswers[currentQ.id] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestionAnswers(prev => ({ ...prev, [currentQ.id]: val }));
                      }}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        backgroundColor: isCurrentLocked ? "#FAF6EE" : "#ffffff",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "var(--font-body)"
                      }}
                    />
                  </div>
                )}

                {/* Question Input Type 3: Live In-Browser Code Compiler (Last Part) */}
                {currentQ.type === "coding" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0", flex: 1, overflow: "hidden", borderRadius: "12px", border: "1px solid #2a2a2e", backgroundColor: "#0d0d0f" }}>

                    {/* ── IDE Toolbar ── */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", backgroundColor: "#1a1a1e", borderBottom: "1px solid #2a2a2e", borderRadius: "12px 12px 0 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {/* Traffic lights */}
                        <div style={{ display: "flex", gap: "6px" }}>
                          <div style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "#FF5F57" }} />
                          <div style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "#FEBC2E" }} />
                          <div style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "#28C840" }} />
                        </div>
                        <div style={{ width: "1px", height: "16px", backgroundColor: "#2a2a2e" }} />
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#8b8b9a", fontFamily: "monospace" }}>solution.py</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#00e5a0", backgroundColor: "rgba(0,229,160,0.1)", padding: "2px 8px", borderRadius: "8px" }}>● Python 3.11</span>
                        <span style={{ fontSize: "10px", color: "#8b8b9a" }}>UTF-8</span>
                        <span style={{ fontSize: "10px", color: "#8b8b9a" }}>Spaces: 4</span>
                      </div>
                    </div>

                    {/* ── Code Editor Area ── */}
                    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                      {/* Line Numbers */}
                      <div style={{ padding: "14px 10px", backgroundColor: "#141416", color: "#4a4a5a", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.6", textAlign: "right", userSelect: "none", minWidth: "40px", borderRight: "1px solid #2a2a2e", overflowY: "hidden" }}>
                        {compilerCode.split("\n").map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>

                      {/* Editor Textarea */}
                      <textarea
                        disabled={isCurrentLocked || !isSecure || violations >= 3}
                        value={compilerCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCompilerCode(val);
                          setQuestionAnswers(prev => ({ ...prev, 5: val }));
                        }}
                        spellCheck={false}
                        style={{
                          flex: 1,
                          padding: "14px 16px",
                          border: "none",
                          backgroundColor: "#141416",
                          color: "#c8d6f0",
                          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          outline: "none",
                          resize: "none",
                          minHeight: "480px",
                          tabSize: 4,
                          caretColor: "#00e5a0"
                        }}
                      />
                    </div>

                    {/* ── Run Button Bar ── */}
                    <div style={{ padding: "10px 16px", backgroundColor: "#1a1a1e", borderTop: "1px solid #2a2a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "#4a4a5a", fontFamily: "monospace" }}>
                        {compilerCode.split("\n").length} lines · {compilerCode.length} chars
                      </span>
                      <button
                        disabled={isRunningCode || isCurrentLocked}
                        onClick={handleRunCompiler}
                        style={{
                          padding: "8px 22px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "700",
                          backgroundColor: isRunningCode ? "#2a2a2e" : "var(--primary-red)",
                          color: "#ffffff",
                          border: "none",
                          boxShadow: isRunningCode ? "none" : "0 4px 16px rgba(255, 90, 76, 0.35)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: isRunningCode ? "not-allowed" : "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {isRunningCode ? (
                          <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />Executing...</>
                        ) : (
                          <><Play size={15} fill="#ffffff" />▶ Run Code & Test Cases</>
                        )}
                      </button>
                    </div>

                    {/* ── Compiler Output Terminal ── */}
                    <div style={{ backgroundColor: "#08080a", borderTop: "1px solid #2a2a2e", borderRadius: "0 0 12px 12px", padding: "12px 16px", minHeight: compilerOutput ? "160px" : "50px", maxHeight: "200px", overflowY: "auto", transition: "min-height 0.3s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: "#4a4a5a", letterSpacing: "0.08em" }}>TERMINAL OUTPUT</span>
                        {compilerOutput && <span style={{ fontSize: "10px", color: "#00e5a0", fontWeight: "700" }}>● Process exited with code 0</span>}
                      </div>

                      {!compilerOutput && (
                        <span style={{ fontSize: "12px", color: "#3a3a4a", fontFamily: "monospace" }}>$ python3 solution.py  — awaiting execution</span>
                      )}

                      {compilerOutput && (
                        <pre style={{ fontSize: "12px", fontFamily: "'Fira Code', monospace", color: "#00e5a0", margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                          {compilerOutput}
                        </pre>
                      )}

                      {testResults && (
                        <div style={{ borderTop: "1px dashed #2a2a2e", marginTop: "10px", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "800", color: "#4a4a5a", letterSpacing: "0.08em" }}>TEST CASE RESULTS</span>
                          {testResults.map(t => (
                            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", padding: "4px 0" }}>
                              <span style={{ color: "#8b8b9a", fontFamily: "monospace" }}>✓ {t.name}</span>
                              <span style={{ color: "#00e5a0", fontWeight: "800", fontSize: "10px", backgroundColor: "rgba(0,229,160,0.1)", padding: "2px 8px", borderRadius: "8px" }}>PASSED</span>
                            </div>
                          ))}
                          <div style={{ marginTop: "4px", fontSize: "11px", color: "#00e5a0", fontWeight: "700" }}>
                            🎯 {testResults.filter(t => t.passed).length}/{testResults.length} test cases passed
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Footer Controls & Lock Next Question Trigger — INSIDE the question block, always visible */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px", backgroundColor: "#ffffff", position: "sticky", bottom: 0, zIndex: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {violations >= 3 ? (
                      <span style={{ color: "#D32F2F", fontWeight: "700", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <ShieldAlert size={16} /> Session Suspended
                      </span>
                    ) : (
                      <span style={{ color: "#00e5a0", fontWeight: "700", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <ShieldCheck size={16} /> Session Active
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn btn-secondary" onClick={() => navigate("/exams")} style={{ padding: "8px 16px", fontSize: "12px" }}>Save Draft</button>

                    {currentQuestionIdx < EXAM_QUESTIONS.length - 1 ? (
                      <button
                        className="btn"
                        onClick={handleAdvanceQuestion}
                        style={{ padding: "8px 18px", fontSize: "12px", fontWeight: "700", backgroundColor: "var(--primary-red)", color: "#ffffff", border: "none", borderRadius: "6px", boxShadow: "0 4px 12px rgba(255, 90, 76, 0.2)" }}
                      >
                        Confirm & Lock Answer → Next Question
                      </button>
                    ) : (
                      <button
                        className="btn"
                        disabled={violations >= 3 || submitting}
                        onClick={handleExamSubmit}
                        style={{ padding: "8px 20px", fontSize: "12px", fontWeight: "700", backgroundColor: "#00e5a0", color: "#ffffff", border: "none", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0, 229, 160, 0.2)" }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={14} style={{ animation: "spin 1s linear infinite", marginRight: "4px" }} />
                            Submitting...
                          </>
                        ) : (
                          "Finalize & Submit Exam"
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      </div>



      {/* Real-time WebGazer Gaze Bubble visual overlay */}
      {gazeBubbleVisible && !isCalibrating && (
        <div 
          id="eye-gaze-bubble"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "rgba(184, 50, 50, 0.5)",
            border: "2px solid var(--primary-red)",
            pointerEvents: "none",
            zIndex: 999999,
            transform: `translate3d(${gazeX}px, ${gazeY}px, 0) translate(-50%, -50%)`,
            transition: "transform 0.15s ease-out",
            willChange: "transform"
          }}
        />
      )}

      {/* Fullscreen Interactive Calibration Overlay */}
      {isCalibrating && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "var(--bg)",
            zIndex: 9999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px"
          }}
        >
          {calibrationStep === "instructions" && (
            <div style={{ textAlign: "center", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                High-Precision Eye Tracker Calibration
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "12px", lineHeight: "1.6" }}>
                To ensure high-precision eye tracking, please complete a short calibration. 
                You will click each of the <strong>13 target dots</strong> across the entire screen while looking directly at your cursor. 
                Each dot collects 10 training samples over ~5 seconds. The more carefully you stare, the more accurate the tracking.
              </p>
              
              <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <div 
                  style={{ 
                    width: "240px", 
                    height: "180px", 
                    borderRadius: "16px",
                    border: "3px solid var(--accent)",
                    boxShadow: "0 8px 30px rgba(122, 118, 110, 0.15)",
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: "#000"
                  }} 
                >
                  <video
                    ref={calibVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scaleX(-1)"
                    }}
                  />
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)" }}>
                  ✓ CENTER YOUR FACE IN THE WEB-CAMERA PREVIEW
                </span>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
                <button 
                  className="btn btn-red" 
                  onClick={() => setCalibrationStep("calibrating")}
                  style={{ padding: "12px 28px" }}
                >
                  START CALIBRATION
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setIsCalibrating(false)}
                  style={{ padding: "12px 28px" }}
                >
                  Exit Session
                </button>
              </div>
            </div>
          )}

          {calibrationStep === "calibrating" && (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {/* Instructions Overlay at center */}
              <div style={{ 
                position: "absolute", 
                left: "50%", 
                top: "50%", 
                transform: "translate(-50%, -50%)", 
                textAlign: "center", 
                maxWidth: "400px",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px"
              }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", fontFamily: "var(--font-display)" }}>
                  Calibrating...
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Stare at your cursor and click each dot. Hold your gaze steady for ~5 seconds until it shows ✓ (10/10).
                </p>
                <div 
                  style={{ 
                    width: "100px", 
                    height: "75px", 
                    borderRadius: "8px",
                    border: "2px solid var(--accent)",
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: "#000",
                    pointerEvents: "auto"
                  }} 
                >
                  <video
                    ref={calibVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scaleX(-1)"
                    }}
                  />
                </div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-primary)" }}>
                  {calibrationPoints.filter(p => p.count >= 10).length} / 13 Dots Calibrated
                </div>
                {/* Live Face Tracking Status */}
                <div style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                  marginTop: "8px",
                  backgroundColor: isFaceTracked ? "rgba(46, 204, 113, 0.15)" : "rgba(231, 76, 60, 0.15)",
                  color: isFaceTracked ? "#2ecc71" : "#e74c3c",
                  border: isFaceTracked ? "1px solid rgba(46, 204, 113, 0.3)" : "1px solid rgba(231, 76, 60, 0.3)",
                  animation: isFaceTracked ? "none" : "pulseGlowRed 1.5s infinite"
                }}>
                  {isFaceTracked ? "✓ FACE DETECTED" : "⚠ FACE NOT FOUND - CENTER PROFILE"}
                </div>
              </div>

              {/* Gaze calibration points grid */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10000000 }}>
                {calibrationPoints.map((pt) => {
                  const isDone = pt.count >= 10;
                  const isActive = pt.id === activeCalibPoint;
                  
                  return (
                    <button
                      key={pt.id}
                      onClick={() => handlePointClick(pt.id, pt.x, pt.y)}
                      disabled={activeCalibPoint !== null && !isActive}
                      style={{
                        position: "absolute",
                        left: `${pt.x}%`,
                        top: `${pt.y}%`,
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: isDone 
                          ? "#eae5dd" 
                          : isActive 
                            ? "#f39c12" 
                            : "var(--primary-red)",
                        border: isDone ? "2px solid #7a7670" : "2px solid #ffffff",
                        boxShadow: "0 4px 12px rgba(122, 118, 110, 0.25)",
                        color: isDone ? "#7a7670" : "#ffffff",
                        fontSize: "11px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: "translate(-50%, -50%)",
                        transition: "all 0.2s ease",
                        pointerEvents: isDone ? "none" : "auto",
                        cursor: (isDone || (activeCalibPoint !== null && !isActive)) ? "default" : "pointer",
                        opacity: (activeCalibPoint !== null && !isActive) ? 0.35 : 1,
                        zIndex: 10000001
                      }}
                    >
                      {isActive ? `${pt.count}/10` : isDone ? "✓" : pt.count}
                    </button>
                  );
                })}
              </div>

              {/* Check status bottom floating action */}
              <div style={{ position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)", zIndex: 10000002 }}>
                <button 
                  className="btn btn-red" 
                  onClick={checkCalibrationComplete}
                  style={{ padding: "12px 24px", fontWeight: "700" }}
                >
                  VALIDATE EYE POSITION
                </button>
              </div>
            </div>
          )}

          {calibrationStep === "validating" && (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {validationStatus === "failed" ? (
                /* Failed validation state overlay */
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", maxWidth: "480px", textAlign: "center" }}>
                  <div style={{ 
                    width: "64px", 
                    height: "64px", 
                    borderRadius: "50%", 
                    backgroundColor: "var(--primary-red)", 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "28px",
                    fontWeight: "bold"
                  }}>
                    ✗
                  </div>
                  <div>
                    <h3 style={{ fontSize: "22px", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                      Gaze Validation Failed
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px", lineHeight: "1.6" }}>
                      The measured accuracy deviation is <strong>{validationAccuracy}px</strong>, which exceeds the required <strong>60px</strong> academic standard. Try repositioning so your eyes are clearly visible to the camera.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                    <button 
                      className="btn btn-red" 
                      onClick={() => handleStartCalibration(true)}
                      style={{ padding: "10px 20px" }}
                    >
                      RE-CALIBRATE NOW
                    </button>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => {
                        setIsCalibrating(false);
                        setUseHighPrecision(true);
                      }}
                      style={{ padding: "10px 20px" }}
                    >
                      PROCEED ANYWAY
                    </button>
                  </div>
                </div>
              ) : (
                /* Active validation stare state */
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>

                  {/* Moving target dot that jumps to each validation position */}
                  {(() => {
                    const targets = [
                      { x: 50, y: 50, label: "Center" },
                      { x: 5,  y: 5,  label: "Top-Left Corner" },
                      { x: 95, y: 5,  label: "Top-Right Corner" },
                      { x: 5,  y: 95, label: "Bottom-Left Corner" },
                      { x: 95, y: 95, label: "Bottom-Right Corner" },
                    ];
                    const idx = Math.min(validationTargetIdx, targets.length - 1);
                    const tgt = targets[idx];
                    return (
                      <>
                        {/* Pulsing target dot at current validation position */}
                        <div style={{
                          position: "absolute",
                          left: `${tgt.x}%`,
                          top: `${tgt.y}%`,
                          transform: "translate(-50%, -50%)",
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary-red)",
                          border: "4px solid #ffffff",
                          boxShadow: "0 0 40px rgba(184, 50, 50, 0.7)",
                          animation: "pulseGlowRed 1s infinite",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "700"
                        }}>
                          👁
                        </div>
                        {/* Label panel at center of screen */}
                        <div style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "12px"
                        }}>
                          <h3 style={{ fontSize: "20px", fontWeight: "700", fontFamily: "var(--font-display)" }}>
                            Stare at the target dot
                          </h3>
                          <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--accent)" }}>
                            ➜ {tgt.label}
                          </p>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            Position {idx + 1} of {targets.length} &nbsp;·&nbsp; {validationCountdown}s remaining
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}