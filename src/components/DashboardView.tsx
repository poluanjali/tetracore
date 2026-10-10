import React, { useState } from 'react';
import { 
  Brain, 
  Bell, 
  MessageSquare, 
  Play, 
  BarChart2, 
  FileText, 
  Target, 
  History, 
  ArrowDown, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Sparkles,
  X
} from 'lucide-react';
import { EvaluationReport, StudentProfile } from '../types';

interface DashboardViewProps {
  profile: StudentProfile;
  reports: EvaluationReport[];
  onStartNewMock: (preset?: any) => void;
  onOpenReport: (reportId: string) => void;
  onOpenResumeTool: () => void;
  onOpenHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  reports,
  onStartNewMock,
  onOpenReport,
  onOpenResumeTool,
  onOpenHistory,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [activeModal, setActiveModal] = useState<'progress' | 'notifications' | null>(null);

  const completedCount = reports.length;
  const averageScore = completedCount > 0
    ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / completedCount)
    : 85;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16">
      {/* Top Header Matching Screenshot */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5452F6] text-white shadow-sm shadow-indigo-500/20">
            <Brain className="h-6 w-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">MockMate</h1>
            <p className="text-xs text-slate-500 font-medium">AI Mock Interview Platform</p>
          </div>
        </div>

        {/* Right side notification and quick streak */}
        <div className="flex items-center gap-3">
          <div 
            title="Practice Streak"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-semibold"
          >
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>{profile.streakDays}d Streak</span>
          </div>

          <button
            onClick={() => setActiveModal(activeModal === 'notifications' ? null : 'notifications')}
            className="relative p-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#5452F6]" />
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back! 👋
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Ready to improve your interview skills? Practice, get AI feedback, and track your progress.
          </p>
        </div>

        {/* Primary Action Card: Start a Mock Interview */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#5452F6] shrink-0">
              <MessageSquare className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Start a Mock Interview
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Practice with AI-generated questions tailored to your selected role.
              </p>
            </div>
          </div>

          {/* Big Start Interview Button */}
          <button
            onClick={() => onStartNewMock()}
            className="w-full mt-6 py-4 px-6 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] active:scale-[0.99] text-white font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 transition-all text-base"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#5452F6]">
              <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
            </div>
            <span>Start Interview</span>
          </button>

          <p className="text-xs text-slate-400 mt-3 text-center sm:text-left">
            Choose your role, interview round, difficulty, and duration on the next screen.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. My Progress */}
          <div
            onClick={() => setActiveModal('progress')}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-[#5452F6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5452F6] group-hover:scale-110 transition-transform">
              <BarChart2 className="h-5 w-5 stroke-[2]" />
            </div>
            <h4 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[#5452F6] transition-colors">
              My Progress
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Track scores and improvement
            </p>
          </div>

          {/* 2. Interview Reports */}
          <div
            onClick={() => {
              if (reports.length > 0) {
                onOpenReport(reports[0].id);
              } else {
                onOpenHistory();
              }
            }}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-[#5452F6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5452F6] group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5 stroke-[2]" />
            </div>
            <h4 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[#5452F6] transition-colors">
              Interview Reports
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Review feedback and weak areas
            </p>
          </div>

          {/* 3. Skill Gap Analyzer */}
          <div
            onClick={onOpenResumeTool}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-[#5452F6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5452F6] group-hover:scale-110 transition-transform">
              <Target className="h-5 w-5 stroke-[2]" />
            </div>
            <h4 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[#5452F6] transition-colors">
              Skill Gap Analyzer
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Find skills to improve
            </p>
          </div>

          {/* 4. Recent Interviews */}
          <div
            onClick={() => {
              setShowDetails(true);
              onOpenHistory();
            }}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-[#5452F6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5452F6] group-hover:scale-110 transition-transform">
              <History className="h-5 w-5 stroke-[2]" />
            </div>
            <h4 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[#5452F6] transition-colors">
              Recent Interviews
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Continue reviewing past sessions
            </p>
          </div>
        </div>

        {/* Footer Note & Down Arrow */}
        <div className="flex flex-col items-center pt-3 pb-2">
          <p className="text-xs text-slate-400 text-center max-w-md">
            Example dashboard design — statistics and interview history should appear only when real data is available.
          </p>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-800 text-white transition-colors shadow-sm cursor-pointer"
            title="Expand statistics and real data"
          >
            <ArrowDown className={`h-4 w-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Real Data & Recent History Section (revealed when expanded) */}
        {showDetails && (
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Average Score</span>
                <div className="text-2xl font-black text-[#5452F6] mt-0.5">{averageScore}%</div>
                <span className="text-[11px] text-emerald-600 font-medium">Placement Ready</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Sessions</span>
                <div className="text-2xl font-black text-slate-800 mt-0.5">{completedCount}</div>
                <span className="text-[11px] text-slate-400">Completed</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Target Role</span>
                <div className="text-sm font-bold text-slate-800 truncate mt-1">{profile.targetRole}</div>
                <span className="text-[11px] text-slate-400">{profile.targetCompany}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Proctor Trust</span>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">96%</div>
                <span className="text-[11px] text-slate-400">Zero infractions</span>
              </div>
            </div>

            {/* Recent Sessions List */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Recent Completed Sessions</h3>
                <button
                  onClick={onOpenHistory}
                  className="text-xs font-bold text-[#5452F6] hover:underline"
                >
                  View All History
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onOpenReport(r.id)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{r.company} — {r.role}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(r.completedAt).toLocaleDateString()} · {r.difficulty}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-[#5452F6]">{r.overallScore}%</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Progress Modal */}
      {activeModal === 'progress' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-[#5452F6]" />
                <h3 className="font-bold text-slate-900 text-base">My Placement Readiness Progress</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-600">Overall Average Score</span>
                <span className="text-xl font-black text-[#5452F6]">{averageScore}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-600">Practice Consistency Streak</span>
                <span className="text-base font-bold text-amber-600 flex items-center gap-1">
                  <Flame className="h-4 w-4 fill-current" /> {profile.streakDays} Days
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-600">Anti-Cheating Trust Baseline</span>
                <span className="text-base font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> 96% Verified
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                onStartNewMock();
              }}
              className="w-full py-3 rounded-xl bg-[#5452F6] text-white font-bold text-sm shadow-md transition-all hover:bg-[#4341E8]"
            >
              Start Next Practice Round
            </button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#5452F6]" />
                <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="font-bold text-indigo-900">Placement Season Update</div>
                <div className="text-indigo-700/80 mt-0.5">TCS, Infosys, and Google mock tracks updated for 2026 drives.</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800">New Report Ready</div>
                <div className="text-slate-500 mt-0.5">Your latest TCS interview evaluation has been processed.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
