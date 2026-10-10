import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowDown, 
  ArrowLeft, 
  Brain, 
  Bell, 
  Check, 
  ShieldCheck, 
  Code2, 
  Mic, 
  Video,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { DifficultyLevel, InterviewSession } from '../types';
import { INTERVIEWERS, saveSession } from '../lib/storage';

interface InterviewSetupViewProps {
  onBack: () => void;
  onContinueToInterview: (session: InterviewSession) => void;
}

const ROLES = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Web Developer',
  'Mobile App Developer',
  'Data Analyst',
  'Data Scientist',
  'AI / ML Engineer',
  'Data Engineer',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'DevOps Engineer',
  'QA / Software Tester',
  'UI / UX Designer',
  'Business Analyst',
  'Product Manager',
  'Network Engineer',
];

const ROUNDS = [
  { id: 'Technical', label: 'Technical' },
  { id: 'HR', label: 'HR Interview' },
  { id: 'DSA', label: 'Coding / DSA Interview' },
  { id: 'Behavioral', label: 'Behavioral Round' },
];

const DIFFICULTIES = [
  { id: 'Beginner', label: 'Beginner', level: 'Campus / Entry' as DifficultyLevel },
  { id: 'Intermediate', label: 'Intermediate', level: 'Intermediate' as DifficultyLevel },
  { id: 'Advanced', label: 'Advanced', level: 'Advanced' as DifficultyLevel },
];

const DURATIONS = [
  { id: '10', label: '10 minutes - Quick practice', timeText: '10 minutes', questions: 3 },
  { id: '15', label: '15 minutes - Recommended', timeText: '15 minutes', questions: 5 },
  { id: '30', label: '30 minutes - Full practice', timeText: '30 minutes', questions: 7 },
];

export const InterviewSetupView: React.FC<InterviewSetupViewProps> = ({
  onBack,
  onContinueToInterview,
}) => {
  const [selectedRole, setSelectedRole] = useState('Software Developer');
  const [customRole, setCustomRole] = useState('');
  const [selectedRound, setSelectedRound] = useState('Technical');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');
  const [selectedDuration, setSelectedDuration] = useState('15');
  const [showWhatHappens, setShowWhatHappens] = useState(true);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const durationObj = DURATIONS.find((d) => d.id === selectedDuration) || DURATIONS[1];
  const difficultyObj = DIFFICULTIES.find((d) => d.id === selectedDifficulty) || DIFFICULTIES[0];

  // User clicks Continue on setup - do NOT automatically go to interview room!
  // Instead, show the permission message first with an OK button!
  const handleOpenPermissionCheck = () => {
    setShowPermissionPrompt(true);
  };

  // ONLY when user explicitly clicks "OK" does it request permission and enter the interview room
  const handleConfirmOkAndProceed = async () => {
    setIsRequestingPermissions(true);
    setPermissionError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }
    } catch (e: any) {
      console.warn('Camera/mic access note:', e);
      // Even if user restricts or on simulated device, allow proceeding with fallback avatar
    } finally {
      setIsRequestingPermissions(false);
      setShowPermissionPrompt(false);

      const session: InterviewSession = {
        id: 'sess-' + Date.now(),
        mode: selectedDuration === '10' ? 'quick' : 'full',
        title: `${selectedRole} - ${selectedRound}`,
        role: selectedRole,
        company: 'Tech Recruiter',
        difficulty: difficultyObj.level,
        interviewer: INTERVIEWERS[0], // Aria
        topics: [
          selectedRound,
          selectedRound === 'DSA' ? 'Technical' : selectedRound === 'Behavioral' ? 'Communication' : 'HR'
        ],
        createdAt: Date.now(),
        status: 'in_progress',
        totalQuestions: durationObj.questions,
        permissionsApproved: true,
      };

      saveSession(session);
      onContinueToInterview(session);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20">
      {/* Top Header Matching App Style */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5452F6] text-white shadow-sm">
            <Brain className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">MockMate</h1>
            <p className="text-xs text-slate-500 font-medium">AI Mock Interview Platform</p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
      </header>

      {/* Main Configuration Card */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
          {/* 1. Select role */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. Select role
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {ROLES.length} roles available
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role && !customRole.trim();
                return (
                  <div
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setCustomRole('');
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-[#5452F6] bg-indigo-50/50 shadow-sm ring-1 ring-[#5452F6]'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'text-[#5452F6] bg-white' : 'text-slate-400'}`}>
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className={`text-sm ${isSelected ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {role}
                    </span>
                    {isSelected && (
                      <div className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#5452F6] text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Can't find your role? */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">
                Can't find your role?
              </label>
              <input
                type="text"
                placeholder="Enter any role (e.g. Embedded Engineer)"
                value={customRole}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomRole(val);
                  if (val.trim()) {
                    setSelectedRole(val.trim());
                  } else {
                    setSelectedRole('Software Developer');
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#5452F6] focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 2. Select interview round */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              2. Select interview round
            </h2>
            <div className="space-y-2.5">
              {ROUNDS.map((round) => (
                <label
                  key={round.id}
                  className="flex items-center gap-3 cursor-pointer select-none group text-sm text-slate-700"
                >
                  <input
                    type="radio"
                    name="round"
                    value={round.id}
                    checked={selectedRound === round.id}
                    onChange={() => setSelectedRound(round.id)}
                    className="h-4 w-4 text-[#5452F6] border-slate-300 focus:ring-[#5452F6] accent-[#5452F6] cursor-pointer"
                  />
                  <span className={`${selectedRound === round.id ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                    {round.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Select difficulty */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              3. Select difficulty
            </h2>
            <div className="space-y-2.5">
              {DIFFICULTIES.map((diff) => (
                <label
                  key={diff.id}
                  className="flex items-center gap-3 cursor-pointer select-none group text-sm text-slate-700"
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={diff.id}
                    checked={selectedDifficulty === diff.id}
                    onChange={() => setSelectedDifficulty(diff.id)}
                    className="h-4 w-4 text-[#5452F6] border-slate-300 focus:ring-[#5452F6] accent-[#5452F6] cursor-pointer"
                  />
                  <span className={`${selectedDifficulty === diff.id ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                    {diff.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Interview duration */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              4. Interview duration
            </h2>
            <div className="space-y-2.5">
              {DURATIONS.map((dur) => (
                <label
                  key={dur.id}
                  className="flex items-center gap-3 cursor-pointer select-none group text-sm text-slate-700"
                >
                  <input
                    type="radio"
                    name="duration"
                    value={dur.id}
                    checked={selectedDuration === dur.id}
                    onChange={() => setSelectedDuration(dur.id)}
                    className="h-4 w-4 text-[#5452F6] border-slate-300 focus:ring-[#5452F6] accent-[#5452F6] cursor-pointer"
                  />
                  <span className={`${selectedDuration === dur.id ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                    {dur.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Your interview summary Card (Light Purple Card matching video) */}
          <div className="rounded-2xl border border-purple-200/80 bg-[#FAF5FF] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-4 w-4 fill-purple-200 text-purple-600" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Your interview summary
              </h3>
            </div>

            <div className="space-y-2.5 text-sm divide-y divide-purple-100/80 pt-1">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 text-xs sm:text-sm font-medium">Role</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{selectedRole}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 text-xs sm:text-sm font-medium">Round</span>
                <span className="font-medium text-slate-800 text-xs sm:text-sm">{selectedRound}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 text-xs sm:text-sm font-medium">Difficulty</span>
                <span className="font-medium text-slate-800 text-xs sm:text-sm">{selectedDifficulty}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 text-xs sm:text-sm font-medium">Duration</span>
                <span className="font-medium text-slate-800 text-xs sm:text-sm">{durationObj.timeText}</span>
              </div>
            </div>

            {/* Black Continue to Interview Button */}
            <div className="pt-2">
              <button
                onClick={handleOpenPermissionCheck}
                className="w-full py-3.5 px-6 rounded-xl bg-black hover:bg-slate-900 active:scale-[0.99] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition-all text-sm sm:text-base cursor-pointer"
              >
                <span>Continue with {selectedRole}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-[11px] text-slate-400 text-center mt-3">
                Interactive design preview. The selections here are connected to your deployed website.
              </p>
            </div>
          </div>
        </div>

        {/* Circular Down Arrow & "What happens after this screen?" section from video */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <button
            onClick={() => setShowWhatHappens(!showWhatHappens)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-800 text-white transition-colors shadow-sm cursor-pointer"
            title="Toggle details"
          >
            <ArrowDown className={`h-4 w-4 transition-transform duration-300 ${showWhatHappens ? 'rotate-180' : ''}`} />
          </button>

          {showWhatHappens && (
            <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2 animate-in fade-in duration-300 text-left">
              <h4 className="font-bold text-sm text-slate-900">
                What happens after this screen?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The user clicks <strong className="text-slate-700">Continue to Interview</strong> and is prompted to turn ON camera and audio permissions. Once they click <strong className="text-slate-700">OK</strong>, they enter the live interview screen, where they can answer with voice or text, write code in the scratchpad, share their entire screen, and receive instant AI feedback and an end-of-round evaluation report card.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-[#5452F6]" />
                  <span>Voice & Speech</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-[#5452F6]" />
                  <span>Code Scratchpad</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#5452F6]" />
                  <span>Report Card</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Camera & Audio Permissions Modal - Appears BEFORE entering interview room. User MUST click OK to proceed! */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 text-center relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPermissionPrompt(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Visual Icon Header */}
            <div className="flex items-center justify-center gap-3 mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#5452F6] shadow-sm">
                <Video className="h-6 w-6 stroke-[2]" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#5452F6] shadow-sm">
                <Mic className="h-6 w-6 stroke-[2]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Camera & Audio Permissions Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Please turn ON your Camera and Microphone permissions to proceed. MockMate uses them for live proctoring and real-time voice-to-text conversion.
              </p>
            </div>

            {/* Permissions feature details */}
            <div className="space-y-2 text-left text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Video className="h-4 w-4 text-[#5452F6]" />
                  <span>Camera Access</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6">
                  Webcam face tracking, live engagement analysis, and proctoring monitor.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Mic className="h-4 w-4 text-[#5452F6]" />
                  <span>Microphone & Audio Access</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6">
                  Converts your spoken answers directly into text so the AI interviewer can evaluate and ask follow-up questions.
                </p>
              </div>
            </div>

            {permissionError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-left flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{permissionError}</span>
              </div>
            )}

            {/* Action Buttons: Explicit OK and Cancel */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleConfirmOkAndProceed}
                disabled={isRequestingPermissions}
                className="w-full py-3.5 px-6 rounded-xl bg-[#5452F6] hover:bg-indigo-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isRequestingPermissions ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enabling Permissions...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>OK - Turn ON & Start Interview</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowPermissionPrompt(false)}
                className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel (Stay on Setup)
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              When you click <strong>OK</strong>, click &ldquo;Allow&rdquo; in your browser&apos;s permission pop-up.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
