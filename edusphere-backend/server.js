const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize WebRTC & Live Class Sockets
const { initLiveClassSocket } = require('./socket/liveClassSocket');
initLiveClassSocket(io);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/edusphere')
  .then(() => {
    console.log('MongoDB Connected for EduSphere');
    // Start seeding data once DB connects
    seedDatabase();
  })
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/live', require('./routes/liveClasses'));
app.use('/api/live-classes', require('./routes/liveClasses'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search', require('./routes/search'));

// Database Seeder Logic
async function seedDatabase() {
  try {
    const Course = require('./models/Course');
    const Exam = require('./models/Exam');
    const Assignment = require('./models/Assignment');

    // Wiping course/exam/assignment collections on start to guarantee database refresh with new fields
    // NOTE: Users are NOT wiped so that registered accounts and OTP records persist across restarts.
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    await Course.deleteMany({});
    await Exam.deleteMany({});
    await Assignment.deleteMany({});

    // Seed default test accounts (upsert — create only if missing)
    const testAccounts = [
      { email: 'jimitsinhataliya25@gmail.com', password: '123456', role: 'admin' },
      { email: '2403031057005@paruluniversity.ac.in', password: '123456', role: 'student' },
    ];
    for (const acct of testAccounts) {
      const exists = await User.findOne({ email: acct.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(acct.password, salt);
        await User.create({ email: acct.email, password: hashed, role: acct.role });
        console.log(`Seeded test account: ${acct.email} (${acct.role})`);
      }
    }

    // 1. Seed Courses if empty
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('Seeding initial Courses collection...');
      await Course.create([
        {
          title: "Compiler Design",
          description: "Learn to build professional compilers, lexers, AST engines, and target code generators.",
          modules: [
            {
              title: "Module 1: Overview",
              lessons: [
                {
                  title: "Introduction to Compilers",
                  content: "A compiler is a specialized system program that translates source code written in a high-level language into machine code or intermediate representations. It consists of two main divisions: the Front-End (lexical analysis, parsing, semantic verification) and the Back-End (optimization, code generation). Understanding compilation theory provides vital insight into memory footprints and program optimization.",
                  durationMins: 15,
                  videoUrl: "https://www.youtube.com/embed/Qkwj65l_96I"
                },
                {
                  title: "Core concepts of Compilation",
                  content: "The translation process relies on formal grammars. We represent source structures using Regular Expressions (for identifiers and literals) and Context-Free Grammars (for statement nests and arithmetic). Symbol tables coordinate identifiers and scopes during compilation phases.",
                  durationMins: 20
                }
              ]
            },
            {
              title: "Module 2: Practice",
              lessons: [
                {
                  title: "Syntax Analysis & DFAs",
                  content: "Lexical analyzers utilize Deterministic Finite Automata (DFAs) to group source character matrices into Lexeme sequences. If a stream matches predefined rules, it generates tokens. Otherwise, lexer warnings raise syntax exceptions. Practicing tree generation strengthens algorithmic scope comprehension.",
                  durationMins: 25
                }
              ]
            }
          ]
        },
        {
          title: "DBMS",
          description: "Master database schemas, query optimization, normal forms, and transaction ACID parameters.",
          modules: [
            {
              title: "Module 1: Overview",
              lessons: [
                {
                  title: "Introduction to Databases",
                  content: "Database Management Systems (DBMS) allow users to store, query, and modify structured tables. Relational systems represent entities in grids called relations. By structuring indexes, users can speed query evaluation dramatically.",
                  durationMins: 12
                }
              ]
            },
            {
              title: "Module 2: Core concepts",
              lessons: [
                {
                  title: "Entity-Relationship Diagrams",
                  content: "Entity-Relationship Models capture real-world constraints via rectangles (entities), ovals (attributes), and diamonds (relationships). Drawing clear schemas avoids data modeling errors down the line.",
                  durationMins: 18
                }
              ]
            },
            {
              title: "Module 3: Practice",
              lessons: [
                {
                  title: "1NF, 2NF, and 3NF Normalization",
                  content: "Database Normalization is the systematic optimization of tables to restrict data duplication. 1NF guarantees scalar elements. 2NF guarantees that non-key elements depend entirely on the composite keys. 3NF removes transitive dependencies to protect referential integrity.",
                  durationMins: 30,
                  videoUrl: "https://www.youtube.com/embed/5zsDguxi9L8"
                }
              ]
            }
          ]
        },
        {
          title: "Operating Systems",
          description: "Study kernel loops, process thread context-switches, CPU schedules, and virtual memory segments.",
          modules: [
            {
              title: "Module 1: Overview",
              lessons: [
                {
                  title: "Monolithic vs Microkernel",
                  content: "A kernel sits directly above the hardware layer. Monolithic kernels (like Linux) embed virtual file systems, device drivers, and schedulers inside a unified space. Microkernels (like Mach) push drivers and file systems to user-space, improving system modularity.",
                  durationMins: 15
                }
              ]
            },
            {
              title: "Module 2: Core concepts",
              lessons: [
                {
                  title: "CPU Scheduling Loops",
                  content: "CPU schedulers allocate execution threads. Shortest Job First minimizes average wait indexes but risks starvation. Round Robin cycles processes using a fixed time quantum to provide highly interactive multitasking platforms.",
                  durationMins: 22,
                  videoUrl: "https://www.youtube.com/embed/zFDKWpZg-Jg"
                }
              ]
            }
          ]
        }
      ]);
      console.log('Courses seeded successfully.');
    }

    // 2. Seed Exams if empty
    const examCount = await Exam.countDocuments();
    if (examCount === 0) {
      console.log('Seeding initial Exams collection...');
      await Exam.create([
        {
          title: "System Architecture — Midterm",
          courseName: "Operating Systems",
          durationMins: 45,
          isProctored: true,
          questions: [
            {
              questionText: "Explain how collaborative filtering generates adaptive learning paths compared to static content delivery. Briefly discuss algorithmic complexity and practical trade-offs.",
              marks: 10
            }
          ]
        },
        {
          title: "DBMS — Quiz 2",
          courseName: "DBMS",
          durationMins: 20,
          isProctored: false,
          questions: [
            {
              questionText: "Explain the ACID properties of a database transaction. Provide a brief real-world scenario where violating Isolation causes a concurrency anomaly.",
              marks: 10
            }
          ]
        },
        {
          title: "Advanced Macroeconomics IV",
          courseName: "Economics",
          durationMins: 45,
          isProctored: true,
          questions: [
            {
              questionText: "Evaluate the dynamic mechanisms of monetary policy transmissions, real business cycles, and institutional frameworks within advanced Keynesian macroeconomic models.",
              marks: 10
            }
          ]
        }
      ]);
      console.log('Exams seeded successfully.');
    }

    // 3. Seed Assignments if empty
    const assignmentCount = await Assignment.countDocuments();
    if (assignmentCount === 0) {
      console.log('Seeding initial Assignments collection...');
      await Assignment.create([
        {
          title: "Assignment 3 — DBMS",
          courseName: "DBMS",
          description: "Write SQL queries to find all students who have scored above 90% in Compiler Design and list their advisors. Ensure you use nested joins for optimization.",
          dueDateString: "Due in 2 days"
        },
        {
          title: "Lab — Operating Systems",
          courseName: "Operating Systems",
          description: "Implement a Round Robin CPU scheduling simulation in C or JavaScript. Your program should take a set of processes, arrival times, and burst times, and calculate average wait time and turnaround time.",
          dueDateString: "Due today"
        },
        {
          title: "Quiz 4 — Compiler Design",
          courseName: "Compiler Design",
          description: "Formulate a regular expression that recognizes floating-point numbers in C syntax (e.g. 1.23, .45, 6.e-2). Draw the corresponding Transition Diagram.",
          dueDateString: "This week"
        }
      ]);
      console.log('Assignments seeded successfully.');
    }

    // 4. Seed LiveClasses if empty
    const LiveClass = require('./models/LiveClass');
    const liveClassCount = await LiveClass.countDocuments();
    if (liveClassCount === 0) {
      console.log('Seeding initial LiveClasses collection...');
      await LiveClass.create([
        {
          meetingId: "meet_lexer101",
          title: "Compiler Design — Lexer Engine Implementation",
          topic: "Building DFAs for Tokenization",
          description: "Live coding session building a tokenization engine in JS/C++.",
          courseName: "Compiler Design",
          scheduledStart: new Date(Date.now() - 5 * 60 * 1000), // started 5 mins ago
          scheduledEnd: new Date(Date.now() + 55 * 60 * 1000),
          status: "live",
          activeParticipantsCount: 1
        },
        {
          meetingId: "meet_dbms202",
          title: "DBMS — SQL Nested Join Optimization",
          topic: "Query Planner Execution",
          description: "Deep dive into query execution plans, indexing strategies, and B-Tree structures.",
          courseName: "DBMS",
          scheduledStart: new Date(Date.now() + 2 * 60 * 60 * 1000), // in 2 hours
          scheduledEnd: new Date(Date.now() + 3 * 60 * 60 * 1000),
          status: "scheduled",
          activeParticipantsCount: 0
        }
      ]);
      console.log('LiveClasses seeded successfully.');
    }

  } catch (err) {
    console.error('Error seeding collections:', err);
  }
}

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Backend Server running on port ${PORT}`));