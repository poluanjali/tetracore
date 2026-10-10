import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Calendar, 
  Award,
  Filter,
  Plus
} from 'lucide-react';
import { EvaluationReport } from '../types';

interface HistoryViewProps {
  reports: EvaluationReport[];
  onOpenReport: (reportId: string) => void;
  onStartNewMock: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  reports,
  onOpenReport,
  onStartNewMock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');

  const companies = ['All', ...Array.from(new Set(reports.map((r) => r.company)))];

  const filteredReports = reports.filter((r) => {
    const matchSearch =
      r.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCompany = selectedCompany === 'All' || r.company === selectedCompany;
    return matchSearch && matchCompany;
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Placement Practice History
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Track your score progression across mock rounds, review past feedback, and monitor readiness.
            </p>
          </div>

          <button
            onClick={onStartNewMock}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>New Mock Session</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-card focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {companies.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
                  selectedCompany === c
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No interview sessions found matching your filter.</p>
            <button
              onClick={onStartNewMock}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Start an interview now
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((r) => {
              const dateStr = new Date(r.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {r.company}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">{dateStr}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-foreground">{r.role}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Difficulty: {r.difficulty}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-y border-border/60 py-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Overall Score
                        </span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                          {r.overallScore}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Readiness Tier
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {r.performanceTier}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{r.proctorTrustScore}% Trust</span>
                      </div>
                      <span>{r.questionBreakdown.length} questions answered</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenReport(r.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-muted/60 hover:bg-indigo-600 hover:text-white text-foreground py-2 text-xs font-bold transition-all"
                  >
                    <span>View Detailed Report Card</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
