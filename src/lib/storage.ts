import { EvaluationReport, InterviewSession, StudentProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'mockmate_profile',
  SESSIONS: 'mockmate_sessions',
  REPORTS: 'mockmate_reports',
};

export const SAMPLE_RESUME_CS = `ANANYA SHARMA
Email: ananya.sharma@example.edu | GitHub: github.com/ananya-dev | LinkedIn: linkedin.com/in/ananya-sharma
B.Tech Computer Science and Engineering, National Institute of Technology (2022 - 2026), CGPA: 8.9/10

TECHNICAL SKILLS:
- Languages: TypeScript, JavaScript, Python, C++, SQL
- Frontend: React.js, Next.js, Tailwind CSS, Redux Toolkit
- Backend & DB: Node.js, Express, PostgreSQL, MongoDB, Redis, REST APIs, GraphQL
- Tools: Git, Docker, AWS (S3, Lambda), Linux, Postman

PROJECTS:
1. DevFlow - Real-time Collaborative Code Workspace:
- Built full-stack collaborative editor using React, WebSockets, and Node.js microservices.
- Implemented operational transformation algorithms handling 20+ concurrent socket connections with sub-50ms latency.
- Containerized with Docker and deployed on AWS ECS with automated CI/CD pipeline.

2. Campus Placement Portal & Algorithmic Matcher:
- Designed relational PostgreSQL schema with complex indexing for 3,500+ student profiles and 60+ recruiters.
- Implemented resume keyword semantic match ranker achieving 92% placement coordinator accuracy rating.
- Integrated JWT authentication and role-based access control (RBAC).

EXPERIENCE & ACHIEVEMENTS:
- Software Engineering Intern at FinTech Startup (Summer 2025): Optimized API queries reducing p99 latency by 38%.
- Knight on LeetCode (Rating 1890+, 450+ problems solved across DP, Graphs, and Trees).
- Finalist at Smart India Hackathon 2024.`;

export const SAMPLE_RESUME_DATA = `RAHUL VERMA
Email: rahul.verma@example.edu | Portfolio: rahulverma.dev
B.Tech in Information Technology, 2022-2026, CGPA: 8.6/10

SKILLS:
- Data Analysis & Science: Python (Pandas, NumPy, Scikit-Learn), SQL, Tableau, Power BI
- Engineering: FastAPI, PostgreSQL, Git, Statistical Modeling, A/B Testing

PROJECTS:
1. E-Commerce Customer Churn Prediction Engine:
- Trained XGBoost and Random Forest classifiers on 100K+ transactional records with 89% ROC-AUC.
- Built interactive monitoring dashboard with Streamlit and automated weekly batch inference.

2. Placement Trends & Salary Insight Visualizer:
- Extracted and cleaned 5 years of campus placement records using Pandas and regex.
- Created interactive dashboards in Tableau and embedded them into a web app.`;

export const INTERVIEWERS = [
  {
    id: 'aria' as const,
    name: 'Aria',
    title: 'Senior Campus Recruiter & Career Coach',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    tone: 'Encouraging, structured, and campus-friendly',
    description: 'Specializes in behavioral rounds, communication poise, and foundational tech screening.',
    accent: 'Warm & Professional',
  },
  {
    id: 'alex' as const,
    name: 'Alex',
    title: 'Lead Systems Architect & FAANG Bar Raiser',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    tone: 'Rigorous, analytical, and edge-case focused',
    description: 'Probes deep into data structures, computational trade-offs, and architecture bottlenecks.',
    accent: 'Analytical & Direct',
  },
  {
    id: 'elena' as const,
    name: 'Elena',
    title: 'Global HR Director & Culture Assessor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    tone: 'Empathetic, deep listener, STAR methodology evaluator',
    description: 'Evaluates culture-fit, situational problem solving, ownership, and cross-team leadership.',
    accent: 'Balanced & Thoughtful',
  },
];

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Ananya Sharma',
  college: 'National Institute of Technology',
  graduationYear: '2026',
  targetRole: 'Software Development Engineer (SDE-1)',
  targetCompany: 'Google & TCS Digital',
  resumeText: SAMPLE_RESUME_CS,
  extractedSkills: [
    'Data Structures & Algorithms',
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'Docker',
    'System Design',
    'Git',
  ],
  streakDays: 4,
};

const DEFAULT_REPORTS: EvaluationReport[] = [
  {
    id: 'rep-tcs-101',
    sessionId: 'sess-tcs-101',
    role: 'SDE-1 / Digital Cadre',
    company: 'TCS',
    difficulty: 'Campus / Entry',
    overallScore: 86,
    performanceTier: 'Placement Ready',
    categoryScores: {
      technical: 88,
      communication: 90,
      problemSolving: 82,
      confidence: 86,
      accuracy: 84,
    },
    strengths: [
      'Very articulate STAR responses during behavioral and HR screening',
      'Solid command of OOPs fundamentals, polymorphism, and database normalization',
      'Calm and confident delivery with professional posture and tone',
    ],
    weaknesses: [
      'Could explain space complexity optimizations more proactively during algorithmic explanations',
      'Make sure to mention automated testing strategies when discussing web projects',
    ],
    questionBreakdown: [
      {
        questionNumber: 1,
        stage: 'warmup',
        question: 'Introduce yourself and walk me through your engineering journey and what excites you about TCS.',
        candidateAnswer: 'Introduced background in CSE, core full-stack stack, and passion for large-scale enterprise transformation.',
        score: 92,
        feedback: 'Clear, concise, and stayed within 90 seconds without filler words.',
        sampleAnswer: 'Start with current degree & focus area, highlight 1 flagship project with quantifiable outcomes, and bridge to why the company matches your career aspirations.',
      },
      {
        questionNumber: 2,
        stage: 'technical',
        question: 'Explain the difference between synchronous and asynchronous operations in Node.js and how the Event Loop handles I/O.',
        candidateAnswer: 'Explained single-threaded non-blocking architecture, libuv worker threads, and microtask vs macrotask queues.',
        score: 88,
        feedback: 'Thorough conceptual accuracy and good usage of technical terminology.',
        sampleAnswer: 'Node.js delegates heavy I/O to libuv threadpool while the main event loop processes callbacks via microtask (promises) and macrotask (timers/I/O) phases.',
      },
      {
        questionNumber: 3,
        stage: 'dsa',
        question: 'Given an array of integers, how would you determine if there exists a subarray whose sum equals zero in O(N)?',
        candidateAnswer: 'Proposed prefix sums combined with a HashSet to detect recurring cumulative sums.',
        score: 85,
        feedback: 'Instantly recognized the optimal prefix sum pattern with O(N) time and O(N) space.',
        sampleAnswer: 'Compute running prefix sums; if prefixSum === 0 or prefixSum already exists in the seen set, return true. Time O(N), Space O(N).',
      },
      {
        questionNumber: 4,
        stage: 'behavioral',
        question: 'Describe a project where you faced a tight deadline or technical obstacle. How did you prioritize?',
        candidateAnswer: 'Shared hackathon project experience where API rate limits threatened demo; implemented Redis cache under pressure.',
        score: 89,
        feedback: 'Strong situation-action-result narrative with clear personal contribution.',
        sampleAnswer: 'Clearly state the stakes, the exact options evaluated, the chosen workaround, and the measurable result (e.g., successful zero-downtime demo).',
      },
    ],
    recommendedResources: [
      {
        title: 'TCS Digital Advanced Technical Preparation Guide',
        type: 'Practice',
        description: 'Covers core Java/Python concepts, relational indexing, and DSA frequency lists.',
        linkOrKeyTakeaway: 'Focus on recursion trees, array hash lookups, and SQL joins.',
      },
      {
        title: 'STAR Method Presentation Blueprint',
        type: 'Framework',
        description: 'How to structure HR answers to highlight leadership, ownership, and measurable impact.',
        linkOrKeyTakeaway: 'Spend 60% of narrative on Actions and Results rather than setting up the backstory.',
      },
    ],
    interviewerVerdict: 'High-probability campus hire for the TCS Digital band. Candidate demonstrated structured thought, strong core computer science fundamentals, and poise.',
    companyFitScore: 90,
    proctorTrustScore: 100,
    tabSwitches: 0,
    completedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    durationSeconds: 780,
  },
  {
    id: 'rep-google-102',
    sessionId: 'sess-google-102',
    role: 'Software Development Engineer (SDE-1)',
    company: 'Google',
    difficulty: 'Advanced',
    overallScore: 81,
    performanceTier: 'Near Ready',
    categoryScores: {
      technical: 85,
      communication: 82,
      problemSolving: 84,
      confidence: 76,
      accuracy: 80,
    },
    strengths: [
      'Strong algorithmic intuition; immediately verified constraints and edge cases',
      'Clean explanation of Big-O asymptotic bounds',
    ],
    weaknesses: [
      'Take a brief pause to outline trade-offs before committing to the first proposed algorithm',
      'Be more assertive when asked to defend design choices',
    ],
    questionBreakdown: [
      {
        questionNumber: 1,
        stage: 'warmup',
        question: 'What is the most technically complex bug you have ever diagnosed, and how did you resolve it?',
        candidateAnswer: 'Discussed a WebSocket race condition causing out-of-order state merges in collaborative text editor.',
        score: 84,
        feedback: 'Good technical depth; explain root cause analysis methodology earlier in the response.',
        sampleAnswer: 'Structure as: Symptom -> Hypothesis -> Verification with logs -> Root cause -> Fix & regression test.',
      },
      {
        questionNumber: 2,
        stage: 'dsa',
        question: 'Design an LRU Cache with O(1) get and put operations.',
        candidateAnswer: 'Proposed hash map combined with doubly linked list to achieve constant time lookups and updates.',
        score: 88,
        feedback: 'Accurately articulated node removal and insertion mechanics.',
        sampleAnswer: 'Map keys to DoublyLinkedList nodes. On get/put, move accessed node to head. Evict tail node on capacity overflow.',
      },
    ],
    recommendedResources: [
      {
        title: 'Google SDE Coding Interview Patterns',
        type: 'Practice',
        description: 'Top patterns tested in Google technical screening: Monotonic stacks, Dijkstra, and Interval Scheduling.',
        linkOrKeyTakeaway: 'Always verify constraints: null inputs, negative numbers, integer overflows.',
      },
    ],
    interviewerVerdict: 'Promising candidate with solid problem-solving foundation. Advancing to mock loop with focus on distributed systems fundamentals.',
    companyFitScore: 82,
    proctorTrustScore: 92,
    tabSwitches: 1,
    completedAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    durationSeconds: 1140,
  },
];

export function getProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function getSessions(): InterviewSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveSession(session: InterviewSession): void {
  try {
    const list = getSessions();
    const existingIndex = list.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      list[existingIndex] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function getReports(): EvaluationReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_REPORTS;
}

export function saveReport(report: EvaluationReport): void {
  try {
    const list = getReports();
    const existingIndex = list.findIndex((r) => r.id === report.id);
    if (existingIndex >= 0) {
      list[existingIndex] = report;
    } else {
      list.unshift(report);
    }
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));

    // Update streak and profile stats
    const prof = getProfile();
    prof.streakDays = Math.max(1, prof.streakDays + 1);
    saveProfile(prof);
  } catch (e) {
    console.error(e);
  }
}

export function getReportById(id: string): EvaluationReport | undefined {
  const reports = getReports();
  return reports.find((r) => r.id === id || r.sessionId === id);
}
