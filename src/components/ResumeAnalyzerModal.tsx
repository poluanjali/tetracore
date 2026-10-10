import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Play, 
  Upload, 
  RefreshCw,
  Award,
  Layers
} from 'lucide-react';
import { StudentProfile } from '../types';
import { SAMPLE_RESUME_CS, SAMPLE_RESUME_DATA, saveProfile } from '../lib/storage';

interface ResumeAnalyzerModalProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onLaunchTailoredMock: (parsedSkills: string[], resumeText: string) => void;
}

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({
  profile,
  onUpdateProfile,
  onLaunchTailoredMock,
}) => {
  const [resumeText, setResumeText] = useState(profile.resumeText || SAMPLE_RESUME_CS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    candidateName?: string;
    summary?: string;
    skills?: string[];
    projects?: string[];
    suggestedTopics?: string[];
    recommendedRole?: string;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      setAnalysisResult(data);

      if (data?.skills) {
        const updatedProfile = {
          ...profile,
          resumeText,
          extractedSkills: data.skills,
          targetRole: data.recommendedRole || profile.targetRole,
        };
        onUpdateProfile(updatedProfile);
        saveProfile(updatedProfile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseSample = (type: 'cs' | 'data') => {
    const text = type === 'cs' ? SAMPLE_RESUME_CS : SAMPLE_RESUME_DATA;
    setResumeText(text);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Resume-Aware Interview Intelligence
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Our AI interviewer extracts technical competencies, project architectures, and builds customized campus questions around your real experience.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Left: Input Textarea (7 cols) */}
          <div className="md:col-span-7 rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Resume Content
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => handleUseSample('cs')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Load CS Sample
                </button>
                <span>·</span>
                <button
                  onClick={() => handleUseSample('data')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Load Data Sample
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full rounded-xl border border-border bg-background p-4 text-xs font-mono focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
            />

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting Skills with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Resume & Extract Question Topics</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Extracted Intelligence (5 cols) */}
          <div className="md:col-span-5 rounded-2xl border border-border/80 bg-card p-5 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              AI Placement Profile
            </h3>

            {analysisResult ? (
              <div className="space-y-4">
                {analysisResult.recommendedRole && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">
                      Recommended Role Alignment
                    </span>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {analysisResult.recommendedRole}
                    </p>
                  </div>
                )}

                {analysisResult.summary && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">
                      Executive Summary
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {analysisResult.summary}
                    </p>
                  </div>
                )}

                {analysisResult.skills && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                      Detected Technical Proficiencies ({analysisResult.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.projects && (
                  <div className="space-y-2 border-t border-border/60 pt-3">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                      Target Project Deep Dives
                    </span>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {analysisResult.projects.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-border/60 pt-4">
                  <button
                    onClick={() =>
                      onLaunchTailoredMock(
                        analysisResult.skills || profile.extractedSkills,
                        resumeText
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold shadow-md transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Launch Interview on these Skills</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-8">
                <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">No Active Analysis Yet</h4>
                  <p className="text-xs text-muted-foreground">
                    Click &ldquo;Analyze Resume&rdquo; to extract your technical stack, key projects, and auto-generate specialized interview tracks.
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Analyze current text now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
