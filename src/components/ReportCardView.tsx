import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  ArrowLeft, 
  Download, 
  Printer, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  Briefcase,
  Share2
} from 'lucide-react';
import { EvaluationReport } from '../types';

interface ReportCardViewProps {
  report: EvaluationReport;
  onBackToDashboard: () => void;
  onRetake: () => void;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({
  report,
  onBackToDashboard,
  onRetake,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  // Trigger celebration confetti if score is high
  useEffect(() => {
    if (report.overallScore >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [report.overallScore]);

  // Export report as clean Markdown
  const handleDownloadMarkdown = () => {
    let md = `# MockMate Interview Evaluation Report\n\n`;
    md += `**Role:** ${report.role}\n`;
    md += `**Company:** ${report.company}\n`;
    md += `**Overall Score:** ${report.overallScore}/100 (${report.performanceTier})\n`;
    md += `**Proctor Trust Score:** ${report.proctorTrustScore}% (Tab switches: ${report.tabSwitches})\n`;
    md += `**Date:** ${new Date(report.completedAt).toLocaleDateString()}\n\n`;

    md += `## Category Breakdown\n`;
    md += `- Technical Knowledge: ${report.categoryScores.technical}%\n`;
    md += `- Communication & Poise: ${report.categoryScores.communication}%\n`;
    md += `- Problem Solving & DSA: ${report.categoryScores.problemSolving}%\n`;
    md += `- Confidence & Delivery: ${report.categoryScores.confidence}%\n`;
    md += `- Accuracy & Relevance: ${report.categoryScores.accuracy}%\n\n`;

    md += `## Interviewer Verdict\n${report.interviewerVerdict}\n\n`;

    md += `## Key Strengths\n`;
    report.strengths.forEach((s) => (md += `- ${s}\n`));
    md += `\n## Areas for Improvement\n`;
    report.weaknesses.forEach((w) => (md += `- ${w}\n`));

    md += `\n## Question Breakdown & Model Answers\n`;
    report.questionBreakdown.forEach((q) => {
      md += `\n### Question ${q.questionNumber}: ${q.question} (${q.score}/100)\n`;
      md += `**Candidate Answer:**\n${q.candidateAnswer}\n\n`;
      md += `**AI Feedback:**\n${q.feedback}\n\n`;
      md += `**Model Sample Answer:**\n${q.sampleAnswer}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MockMate_Report_${report.company}_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const trustColor = report.proctorTrustScore >= 85 
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-4 py-2 text-xs font-bold text-foreground shadow-sm transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-4 py-2 text-xs font-bold text-foreground shadow-sm transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Practice Again</span>
            </button>
          </div>
        </div>

        {/* Hero Score Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/80 via-background to-purple-50/60 dark:from-indigo-950/40 dark:via-background dark:to-purple-950/30 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-600 text-white px-2.5 py-0.5 text-xs font-bold">
                  {report.company}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">·</span>
                <span className="text-xs font-medium text-muted-foreground">{report.role}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Mock Interview Performance Report
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Evaluated by AI campus recruiter on clarity, confidence, technical correctness, and STAR structuring.
              </p>
            </div>

            {/* Score Ring badge */}
            <div className="flex items-center gap-4 bg-card/80 backdrop-blur rounded-2xl border border-border/80 p-5 shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400">
                  {report.overallScore}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">Out of 100</span>
              </div>
              <div className="border-l border-border/80 pl-4 space-y-1">
                <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {report.performanceTier}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Company Fit: <span className="font-bold text-foreground">{report.companyFitScore}%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown Bars */}
          <div className="mt-8 border-t border-border/60 pt-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Category Competency Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Technical', score: report.categoryScores.technical },
                { label: 'Communication', score: report.categoryScores.communication },
                { label: 'Problem Solving', score: report.categoryScores.problemSolving },
                { label: 'Confidence', score: report.categoryScores.confidence },
                { label: 'Accuracy', score: report.categoryScores.accuracy },
              ].map((cat) => (
                <div key={cat.label} className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">{cat.label}</span>
                    <span className="text-foreground font-bold">{cat.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Proctoring & Integrity Telemetry Card */}
        <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${trustColor}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center shrink-0 shadow-sm">
              {report.proctorTrustScore >= 85 ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">Anti-Cheating & Proctor Telemetry</h4>
                <span className="rounded px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-card border border-border">
                  {report.proctorTrustScore >= 85 ? 'Verified Authentic' : 'Review Recommended'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calculated Trust Score: <strong className="text-foreground">{report.proctorTrustScore}%</strong> · Tab/Window switches: <strong className="text-foreground">{report.tabSwitches}</strong>
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-muted-foreground sm:text-right">
            <span>Interview Duration: {Math.floor((report.durationSeconds || 600) / 60)}m {((report.durationSeconds || 600) % 60)}s</span>
          </div>
        </div>

        {/* Executive Verdict */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Interviewer Executive Verdict
            </h3>
          </div>
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-medium">
            &ldquo;{report.interviewerVerdict}&rdquo;
          </p>
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-bold text-base">Key Strengths Demonstrated</h3>
            </div>
            <ul className="space-y-2.5">
              {report.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/20 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-base">High-Impact Growth Areas</h3>
            </div>
            <ul className="space-y-2.5">
              {report.weaknesses.map((wk, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Deep Dive & Model Answers */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Question-by-Question Evaluation & Model Answers
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Compare your answer with what campus recruiters look for and study ideal responses.
            </p>
          </div>

          <div className="space-y-3">
            {report.questionBreakdown.map((q, idx) => {
              const isOpen = expandedQuestion === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setExpandedQuestion(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Q{q.questionNumber} · {q.stage.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-foreground">Score: {q.score}%</span>
                      </div>
                      <h4 className="font-semibold text-sm sm:text-base text-foreground mt-1">
                        {q.question}
                      </h4>
                    </div>

                    <div className="text-muted-foreground shrink-0">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border/70 p-5 space-y-4 bg-muted/10 text-xs sm:text-sm">
                      {/* Candidate Answer */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                          Your Submitted Answer
                        </span>
                        <div className="p-3.5 rounded-xl border border-border/60 bg-background text-foreground/90 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                          {q.candidateAnswer}
                        </div>
                      </div>

                      {/* AI Feedback */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                          Evaluator Feedback
                        </span>
                        <p className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-foreground/90 leading-relaxed">
                          {q.feedback}
                        </p>
                      </div>

                      {/* Model Sample Answer */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                          Model Placement-Ready Answer (Best Practice)
                        </span>
                        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-foreground/90 leading-relaxed font-sans">
                          {q.sampleAnswer}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Learning Resources */}
        {report.recommendedResources.length > 0 && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-base text-foreground">
                Targeted Preparation Resources
              </h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {report.recommendedResources.map((res, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 p-4 space-y-2 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                      {res.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">{res.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{res.description}</p>
                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                    Key takeaway: {res.linkOrKeyTakeaway}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
