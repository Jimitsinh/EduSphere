const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

// Local fallback database of incredibly detailed explanations for prototype use
const localExpertResponses = {
  compiler: "In Compiler Design, lexical analysis is the very first phase. The lexical analyzer reads the stream of characters representing the source program, groups them into meaningful sequences called lexemes, and outputs a sequence of tokens. For example, in 'position = initial + rate * 60', the lexemes are mapped to tokens like ID, ASSIGN, PLUS, and MULT. Lexical analyzers typically use Finite Automata (DFA/NFA) and Regular Expressions to recognize syntax. Let me know if you would like me to draft an example lexer pattern in JavaScript!",
  parsing: "Parsing, or syntax analysis, is the second phase of a compiler. It takes the token stream from the lexical analyzer and structures it as a hierarchical Syntax Tree (AST). Parsers can be Top-Down (like Recursive Descent Parsers or LL parsers) or Bottom-Up (like shift-reduce, SLR, LALR, or canonical LR parsers). Top-down parsers build the tree from the root node down to the leaf nodes, while bottom-up parsers start from the leaves and reduce them toward the root symbol.",
  normalization: "Database normalization is the process of structuring a relational database to reduce data redundancy and improve data integrity. The primary normal forms are:\n1. 1NF: Eliminate duplicate columns and ensure all values are atomic.\n2. 2NF: Meet 1NF criteria and ensure all non-key attributes are fully functionally dependent on the primary key (no partial dependencies).\n3. 3NF: Meet 2NF criteria and eliminate transitive dependencies (non-prime attributes shouldn't depend on other non-prime attributes).\nLet me know if you want a step-by-step example of decomposing a table from 1NF to 3NF!",
  scheduling: "CPU Scheduling is the process by which the operating system decides which process in the ready queue gets executed by the CPU. Core algorithms include:\n- First-Come, First-Served (FCFS): Simplest scheduler, but can lead to the 'convoy effect'.\n- Shortest Job First (SJF): Provably optimal for minimizing average waiting times, but hard to predict next burst durations.\n- Round Robin (RR): Designed for time-sharing systems; cycles through processes with a fixed time quantum, ensuring responsiveness.\n- Priority Scheduling: Selects processes based on assigned priority, though it can suffer from process starvation (prevented via 'aging').",
  default: "I am your EduSphere AI learning assistant. I am ready to help you master Compiler Design, Database Systems, Operating Systems, or tackle any assignment queries you have. Ask me to explain a concept, outline a tutorial, or format code snippets, and I will walk you through the details!"
};

// @route   POST /api/ai/ask
// @desc    Interact with the EduSphere AI Tutor
router.post('/ask', auth, async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ msg: 'Please provide a question' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // If Gemini key is defined in .env, attempt to call real API
    if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `You are Antigravity, a brilliant, friendly, 24/7 AI tutor on the EduSphere LMS portal.
The student is asking: "${question}".
Context of what they are learning: ${context || "General LMS Learning"}.
Keep your response highly educational, engaging, precise, and format your code snippets nicely using markdown.`
                  }
                ]
              }
            ]
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 8000 // 8 second timeout
          }
        );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.json({
            answer: response.data.candidates[0].content.parts[0].text,
            source: 'gemini-api'
          });
        }
      } catch (apiErr) {
        console.warn("Gemini API request failed or timed out. Falling back to local expert system...", apiErr.message);
      }
    }

    // Fallback: Smart local response analyzer
    const queryLower = question.toLowerCase();
    let responseText = localExpertResponses.default;
    
    if (queryLower.includes('lexer') || queryLower.includes('lexical') || queryLower.includes('compiler')) {
      responseText = localExpertResponses.compiler;
    } else if (queryLower.includes('parse') || queryLower.includes('parsing') || queryLower.includes('ast') || queryLower.includes('syntax')) {
      responseText = localExpertResponses.parsing;
    } else if (queryLower.includes('normalize') || queryLower.includes('normalization') || queryLower.includes('normal form') || queryLower.includes('dbms') || queryLower.includes('database')) {
      responseText = localExpertResponses.normalization;
    } else if (queryLower.includes('schedule') || queryLower.includes('scheduling') || queryLower.includes('cpu') || queryLower.includes('round robin') || queryLower.includes('sjf')) {
      responseText = localExpertResponses.scheduling;
    } else if (context) {
      responseText = `Great question about ${context}! Lexical analysis and parser trees form the cornerstone of compilers, while relational calculus and indexes shape databases. What specific details about "${question}" can I break down for you?`;
    }

    res.json({
      answer: responseText,
      source: 'local-expert'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
