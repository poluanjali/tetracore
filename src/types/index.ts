export type InterviewMode = 'quick' | 'full' | 'company';

export type DifficultyLevel = 'Campus / Entry' | 'Intermediate' | 'Advanced';

export interface InterviewerProfile {
  id: 'aria' | 'alex' | 'elena';
  name: string;
  title: string;
  avatar: string;
  tone: string;
  description: string;
  accent: string;
}

export interface InterviewSession {
  id: string;
  mode: InterviewMode;
  title: string;
  role: string;
  company: string;
  difficulty: DifficultyLevel;
  interviewer: InterviewerProfile;
  topics: string[];
  resumeText?: string;
  candidateSkills?: string[];
  createdAt: number;
  completedAt?: number;
  status: 'setup' | 'in_progress' | 'completed';
  totalQuestions: number;
  permissionsApproved?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'interviewer' | 'candidate' | 'system';
  content: string;
  question?: string;
  stage?: 'warmup' | 'resume' | 'technical' | 'dsa' | 'system_design' | 'behavioral' | 'wrapup';
  isFollowUp?: boolean;
  codePrompt?: string;
  codeAnswer?: string;
  hint?: string;
  timestamp: number;
}

export interface QuestionEvaluation {
  questionNumber: number;
  stage: string;
  question: string;
  candidateAnswer: string;
  score: number;
  feedback: string;
  sampleAnswer: string;
}

export interface LearningResource {
  title: string;
  type: 'Article' | 'Practice' | 'Video' | 'Framework';
  description: string;
  linkOrKeyTakeaway: string;
}

export interface EvaluationReport {
  id: string;
  sessionId: string;
  role: string;
  company: string;
  difficulty: DifficultyLevel;
  overallScore: number;
  performanceTier: 'Placement Ready' | 'Near Ready' | 'Needs Focused Practice';
  categoryScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    accuracy: number;
  };
  strengths: string[];
  weaknesses: string[];
  questionBreakdown: QuestionEvaluation[];
  recommendedResources: LearningResource[];
  interviewerVerdict: string;
  companyFitScore: number;
  proctorTrustScore: number;
  tabSwitches: number;
  completedAt: number;
  durationSeconds: number;
}

export interface StudentProfile {
  name: string;
  college: string;
  graduationYear: string;
  targetRole: string;
  targetCompany: string;
  resumeText: string;
  extractedSkills: string[];
  streakDays: number;
}
