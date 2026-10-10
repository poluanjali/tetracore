import React, { useState } from 'react';
import { 
  ArrowRight, 
  CircleCheck, 
  Sparkles, 
  Mic, 
  Volume2, 
  FileText, 
  Bot, 
  CheckCircle2, 
  BarChart3, 
  ShieldCheck, 
  Code2, 
  Briefcase, 
  Zap,
  PlayCircle
} from 'lucide-react';
import { speechManager } from '../lib/speech';

interface LandingPageProps {
  onStartMock: (preset?: { mode: 'quick' | 'full' | 'company'; role?: string; company?: string; topics?: string[] }) => void;
  onExploreTracks: () => void;
  onViewDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartMock,
  onExploreTracks,
  onViewDemo,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleTestAudioSample = () => {
    if (isPlayingAudio) {
      speechManager.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speechManager.speak(
      "Hello! Welcome to MockMate. I'm Aria, your campus placement interviewer. I adapt to your answers in real time, probe your technical depth, and generate an in-depth score card. Are you ready for your next round?",
      'female',
      1.05
    ).then(() => {
      setIsPlayingAudio(false);
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-5xl text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/40 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            Built for campus placement prep
          </div>

          {/* Main Title */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-foreground">
            Practice interviews that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
              feel real
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            MockMate simulates HR, technical, and DSA rounds with an adaptive AI interviewer.
            Get scored on clarity, confidence, and accuracy — then receive a detailed report card.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => onStartMock()}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <span>Start mock interview</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onExploreTracks}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 text-base font-semibold text-foreground shadow-sm hover:bg-muted/80 active:scale-95 transition-all"
            >
              Explore practice tracks
            </button>

            <button
              onClick={onViewDemo}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 px-6 text-base font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/60 active:scale-95 transition-all"
            >
              <Zap className="h-4 w-4 text-indigo-600" />
              <span>Launch Demo</span>
            </button>
          </div>

          {/* Interactive Hero Audition Card */}
          <div className="mt-14 mx-auto max-w-3xl rounded-2xl border border-border/80 bg-card/90 p-5 shadow-xl backdrop-blur text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-11 w-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow">
                    A
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Aria</span>
                    <span className="rounded bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Live AI Interviewer
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Lead Technical Evaluator • Adaptive Speech Mode Active</p>
                </div>
              </div>

              <button
                onClick={handleTestAudioSample}
                className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors w-fit"
              >
                <Volume2 className={`h-4 w-4 ${isPlayingAudio ? 'animate-bounce text-indigo-600' : ''}`} />
                <span>{isPlayingAudio ? 'Stop Voice Audition' : 'Hear Aria Speak (Audio Demo)'}</span>
              </button>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 shrink-0 animate-ping" />
              <div className="space-y-1.5">
                <p className="text-sm text-foreground/90 font-medium">
                  &ldquo;I noticed you built a collaborative workspace with WebSockets on your resume. Could you walk me through how you prevent race conditions during concurrent typing, and what trade-offs you considered?&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-0.5 font-medium">Stage 2: Resume Deep-Dive</span>
                  <span>•</span>
                  <span>Adaptive Follow-up: Enabled</span>
                  <span>•</span>
                  <span>Scoring: Clarity, Asymptotic Rigor, STAR format</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: "Everything you need to crack placements" */}
      <section className="border-t border-border/60 bg-muted/20 px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to crack placements
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              From first-round HR to final technical deep dives.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">Adaptive AI questions</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Follow-up questions react to your answers, just like a real interviewer.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">Voice & text mode</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Answer by speaking or typing. Build comfort for online assessments and video calls.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">Resume-aware interviews</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Paste your resume and the AI asks about your specific projects, stack, and skills.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">Detailed report card</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Scores, strengths, weaknesses, sample answers, and curated resources to improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: 01, 02, 03 */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Simple 3-Step Process
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-border/70 bg-card p-7 shadow-sm">
              <div className="text-3xl font-black text-indigo-600/30 dark:text-indigo-400/20">01</div>
              <h3 className="mt-2 text-xl font-bold text-foreground">Set your target</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Pick a role, company, difficulty, and topics. Upload your resume text for personalized questions.
              </p>
              <div className="mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Supports FAANG, MNCs, & Startups</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-border/70 bg-card p-7 shadow-sm">
              <div className="text-3xl font-black text-indigo-600/30 dark:text-indigo-400/20">02</div>
              <h3 className="mt-2 text-xl font-bold text-foreground">Start the interview</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Meet Alex or Aria. Answer questions in text or voice while the AI adapts in real time.
              </p>
              <div className="mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Anti-cheating tab switch telemetry</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-border/70 bg-card p-7 shadow-sm">
              <div className="text-3xl font-black text-indigo-600/30 dark:text-indigo-400/20">03</div>
              <h3 className="mt-2 text-xl font-bold text-foreground">Review your report</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Get a breakdown of technical, communication, and confidence scores with improvement tips.
              </p>
              <div className="mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Exportable markdown report & model answers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Types Section */}
      <section id="interview-types" className="border-t border-border/60 bg-muted/20 px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Interview types students love
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Tailored preparation modes designed for each stage of the campus placement season.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick Practice Card */}
            <div className="rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Quick practice</h3>
                  <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                    10 Mins
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  10-minute warm-up rounds for any topic. Perfect for daily consistency before recruitment drives.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50">
                    Aptitude
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50">
                    Communication
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50">
                    HR screening
                  </span>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => onStartMock({ mode: 'quick', topics: ['HR', 'Communication', 'Aptitude'] })}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 py-2.5 text-xs font-bold transition-colors"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Launch Quick Practice</span>
                </button>
              </div>
            </div>

            {/* Full Mock Card */}
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-card text-card-foreground shadow-md overflow-hidden flex flex-col justify-between relative ring-1 ring-indigo-500/20">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Full mock</h3>
                  <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Multi-stage simulation covering HR, technical, and DSA. End-to-end rehearsal under real pressure.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50">
                    HR
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50">
                    Technical
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50">
                    DSA
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50">
                    System design
                  </span>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => onStartMock({ mode: 'full' })}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold shadow transition-colors"
                >
                  <PlayCircle className="h-4 w-4 fill-white" />
                  <span>Launch Full Mock Simulation</span>
                </button>
              </div>
            </div>

            {/* Company Specific Card */}
            <div className="rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Company-specific</h3>
                  <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                    Targeted
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Practice for the style of top recruiters. Master TCS, Infosys, Wipro, Google, and Amazon formats.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button 
                    onClick={() => onStartMock({ mode: 'company', company: 'TCS' })}
                    className="inline-flex items-center rounded-md border border-border hover:border-indigo-400 px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50 cursor-pointer"
                  >
                    TCS
                  </button>
                  <button 
                    onClick={() => onStartMock({ mode: 'company', company: 'Infosys' })}
                    className="inline-flex items-center rounded-md border border-border hover:border-indigo-400 px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50 cursor-pointer"
                  >
                    Infosys
                  </button>
                  <button 
                    onClick={() => onStartMock({ mode: 'company', company: 'Wipro' })}
                    className="inline-flex items-center rounded-md border border-border hover:border-indigo-400 px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50 cursor-pointer"
                  >
                    Wipro
                  </button>
                  <button 
                    onClick={() => onStartMock({ mode: 'company', company: 'Google' })}
                    className="inline-flex items-center rounded-md border border-border hover:border-indigo-400 px-2.5 py-0.5 font-semibold text-foreground text-xs bg-muted/50 cursor-pointer"
                  >
                    Google
                  </button>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => onStartMock({ mode: 'company', company: 'TCS' })}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 py-2.5 text-xs font-bold transition-colors"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Practice Top Recruiter Track</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-indigo-600 px-8 py-16 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to ace your next interview?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-indigo-100 text-base sm:text-lg">
            Join thousands of students practicing smarter with MockMate.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => onStartMock()}
              className="inline-flex items-center justify-center rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 text-sm font-bold shadow-md active:scale-95 transition-all gap-2"
            >
              <span>Create free account & Start</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-100">
            <li className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-emerald-300" /> Unlimited practice
            </li>
            <li className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-emerald-300" /> Instant feedback
            </li>
            <li className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-emerald-300" /> Progress tracking
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 sm:px-6 lg:px-8 py-8 bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white text-xs font-bold">
              M
            </div>
            <span className="font-semibold text-foreground">MockMate</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 MockMate. Built for student placement success.
          </p>
        </div>
      </footer>
    </div>
  );
};
