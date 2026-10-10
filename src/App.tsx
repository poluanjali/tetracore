/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DashboardView } from './components/DashboardView';
import { InterviewSetupView } from './components/InterviewSetupView';
import { InterviewRoom } from './components/InterviewRoom';
import { ReportCardView } from './components/ReportCardView';
import { HistoryView } from './components/HistoryView';
import { ResumeAnalyzerModal } from './components/ResumeAnalyzerModal';
import { 
  EvaluationReport, 
  InterviewSession, 
  StudentProfile 
} from './types';
import { 
  getProfile, 
  getReports, 
  getReportById, 
  saveProfile 
} from './lib/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'setup' | 'interview' | 'report' | 'history' | 'resume'>('dashboard');
  const [profile, setProfile] = useState<StudentProfile>(getProfile());
  const [reports, setReports] = useState<EvaluationReport[]>(getReports());
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [activeReport, setActiveReport] = useState<EvaluationReport | null>(null);

  // Sync reports & profile on mount
  useEffect(() => {
    setProfile(getProfile());
    setReports(getReports());
  }, []);

  const handleStartSession = (session: InterviewSession) => {
    setActiveSession(session);
    setCurrentTab('interview');
  };

  const handleFinishInterview = (report: EvaluationReport) => {
    setActiveReport(report);
    setReports(getReports());
    setProfile(getProfile());
    setCurrentTab('report');
  };

  const handleOpenReport = (reportId: string) => {
    const rep = getReportById(reportId);
    if (rep) {
      setActiveReport(rep);
      setCurrentTab('report');
    } else if (reports.length > 0) {
      setActiveReport(reports[0]);
      setCurrentTab('report');
    }
  };

  const handleRetake = () => {
    setCurrentTab('setup');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Navigation bar only when outside interview room, dashboard & setup */}
      {currentTab !== 'interview' && currentTab !== 'dashboard' && currentTab !== 'setup' && (
        <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('history')}
              className={`px-3 py-1.5 rounded-lg ${currentTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              History
            </button>
            <button
              onClick={() => setCurrentTab('resume')}
              className={`px-3 py-1.5 rounded-lg ${currentTab === 'resume' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Skill Gap Analyzer
            </button>
          </div>
        </nav>
      )}

      {/* Main Views */}
      <div className="w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            reports={reports}
            onStartNewMock={() => setCurrentTab('setup')}
            onOpenReport={handleOpenReport}
            onOpenResumeTool={() => setCurrentTab('resume')}
            onOpenHistory={() => setCurrentTab('history')}
          />
        )}

        {currentTab === 'setup' && (
          <InterviewSetupView
            onBack={() => setCurrentTab('dashboard')}
            onContinueToInterview={handleStartSession}
          />
        )}

        {currentTab === 'interview' && activeSession && (
          <InterviewRoom
            session={activeSession}
            onFinishInterview={handleFinishInterview}
            onExit={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'report' && activeReport && (
          <ReportCardView
            report={activeReport}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onRetake={handleRetake}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            reports={reports}
            onOpenReport={handleOpenReport}
            onStartNewMock={() => setCurrentTab('setup')}
          />
        )}

        {currentTab === 'resume' && (
          <ResumeAnalyzerModal
            profile={profile}
            onUpdateProfile={(updated) => setProfile(updated)}
            onLaunchTailoredMock={() => {
              setCurrentTab('setup');
            }}
          />
        )}
      </div>
    </div>
  );
}
