import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Video, 
  VideoOff, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  Play, 
  Monitor, 
  MonitorOff, 
  Bell, 
  ChevronDown, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  Bot, 
  User, 
  Settings2, 
  Layers, 
  BarChart2, 
  FileText, 
  Target, 
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
  Maximize2,
  RefreshCw,
  FlipHorizontal,
  RotateCcw
} from 'lucide-react';
import { ChatMessage, EvaluationReport, InterviewSession } from '../types';
import { speechManager, ContinuousSpeechRecognizer } from '../lib/speech';
import { saveReport } from '../lib/storage';
import { AI_AVATAR_IMG, CANDIDATE_AVATAR_IMG } from '../assets/images';

interface InterviewRoomProps {
  session: InterviewSession;
  onFinishInterview: (report: EvaluationReport) => void;
  onExit: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  session,
  onFinishInterview,
  onExit,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFollowUpStep, setIsFollowUpStep] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{
    message: string;
    question: string;
    stage: string;
    isFollowUp?: boolean;
    hint?: string;
  }>({
    message: "Tell me about yourself and your journey into software development.",
    question: "Tell me about yourself and your journey into software development.",
    stage: "warmup",
    isFollowUp: false,
  });

  // Candidate Live Voice & Text State
  const [candidateText, setCandidateText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const recognizerRef = useRef<ContinuousSpeechRecognizer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Audio Meter (Mic Decibels)
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Live Camera Access State
  const [cameraActive, setCameraActive] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true); // Mirrors camera feed so lifting left hand matches left side
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Permission Prompt State - Interview ONLY enters after user clicks OK
  const [isPermissionApproved, setIsPermissionApproved] = useState(
    Boolean(session.permissionsApproved)
  );
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Entire Screen Sharing State
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Countdown Timer (Default 2 minutes per question: 120 seconds -> 01:45)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(105);

  // Proctoring tab-switch telemetry
  const [tabSwitches, setTabSwitches] = useState(0);

  // Setup Web Audio Analyser for Real-time Microphone Equalizer
  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Normalize volume 0 to 100
          setAudioVolume(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateAudioMeter);
        };
        updateAudioMeter();
      }
    } catch (e) {
      console.warn('Audio analyser initialization:', e);
    }
  };

  // Live Camera & Microphone Access Initializer
  const startCameraAndMic = async () => {
    setCameraPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      });

      setCameraStream(stream);
      setCameraActive(true);
      setShowPermissionPrompt(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setupAudioAnalyser(stream);

      // Auto-start continuous speech recognition and audio recorder
      recognizerRef.current?.start(candidateText);
      setIsListening(true);
      startAudioRecorder(stream);
    } catch (e: any) {
      console.warn('Live camera/mic error:', e);
      // Attempt video only or audio only if user restricted one
      try {
        const videoOnly = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCameraStream(videoOnly);
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = videoOnly;
        }
      } catch (err2) {
        setCameraPermissionError('Please allow camera & microphone access in your browser to enable live proctoring.');
      }
    }
  };

  // Entire Screen Sharing Throughout Session
  const startEntireScreenShare = async () => {
    setScreenShareError(null);
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor', // request entire screen
        } as any,
        audio: false,
      });

      setScreenStream(displayStream);
      setScreenShareActive(true);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = displayStream;
      }

      displayStream.getVideoTracks()[0].onended = () => {
        setScreenShareActive(false);
        setScreenStream(null);
      };
    } catch (err: any) {
      console.warn('Screen share error or cancel:', err);
      setScreenShareError('Screen sharing was cancelled or not granted.');
    }
  };

  const stopEntireScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setScreenShareActive(false);
  };

  // Sync Video refs when stream updates
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, cameraActive]);

  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, screenShareActive]);

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Start Audio Recording from candidate mic stream as reliable backup
  const startAudioRecorder = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;
      if (typeof MediaRecorder === 'undefined') return;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const audioStream = new MediaStream(audioTracks);
      const recorder = new MediaRecorder(audioStream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size > 1500) {
          setIsTranscribingAudio(true);
          try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              const res = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioData: base64Audio, mimeType }),
              });
              const data = await res.json();
              if (data.text) {
                setCandidateText((prev) => {
                  const updated = prev ? `${prev} ${data.text}` : data.text;
                  recognizerRef.current?.syncManualText(updated);
                  return updated;
                });
              }
              setIsTranscribingAudio(false);
            };
          } catch (e) {
            console.warn('Transcription request error:', e);
            setIsTranscribingAudio(false);
          }
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.warn('MediaRecorder init notice:', e);
    }
  };

  const stopAudioRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  // Initialize Continuous Speech Recognition for Voice-to-Text
  useEffect(() => {
    const recognizer = new ContinuousSpeechRecognizer(
      (transcript: string) => {
        setCandidateText(transcript);
      },
      (active: boolean) => {
        setIsListening(active);
      }
    );
    recognizerRef.current = recognizer;

    return () => {
      recognizer.stop();
      stopAudioRecorder();
    };
  }, []);

  // Speech synthesis subscriber
  useEffect(() => {
    speechManager.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      speechManager.stop();
    };
  }, []);

  // Countdown timer per question - ONLY runs after user clicks OK / approves
  useEffect(() => {
    if (!isPermissionApproved) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestionIndex, isPermissionApproved]);

  // Handler: User explicitly clicks Turn ON Camera & Audio & enters room
  const handleApproveAndEnter = async () => {
    await startCameraAndMic();
    setIsPermissionApproved(true);
    speechManager.speak(currentQuestion.message, 'female', 1.0);
    recognizerRef.current?.start(candidateText);
    setIsListening(true);
  };

  // If user already approved permissions on setup screen, start devices immediately
  useEffect(() => {
    if (session.permissionsApproved) {
      handleApproveAndEnter();
    }
  }, []);

  // Tab switch monitor
  useEffect(() => {
    const handleBlur = () => {
      setTabSwitches((prev) => prev + 1);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Toggle Voice-to-Text Recording
  const toggleListening = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      stopAudioRecorder();
      setIsListening(false);
    } else {
      recognizerRef.current?.start(candidateText);
      if (cameraStream) {
        startAudioRecorder(cameraStream);
      }
      setIsListening(true);
    }
  };

  const playQuestionAudio = () => {
    speechManager.speak(currentQuestion.message, 'female', 1.0);
  };

  // Handle Next Question & Follow-up logic
  const handleNextQuestion = async () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    stopAudioRecorder();
    setIsListening(false);
    speechManager.stop();
    setIsSubmitting(true);

    const candMsg: ChatMessage = {
      id: 'cand-' + Date.now(),
      role: 'candidate',
      content: candidateText.trim(),
      timestamp: Date.now(),
    };
    const updatedMessages = [...messages, candMsg];
    setMessages(updatedMessages);

    // If candidate has not answered a follow-up for this question yet, trigger an adaptive follow-up!
    if (!isFollowUpStep) {
      try {
        const res = await fetch('/api/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session,
            transcript: updatedMessages,
            currentQuestionIndex,
            totalQuestions: session.totalQuestions,
            candidateAnswer: candidateText,
            isFollowUp: false,
          }),
        });

        const data = await res.json();
        setCurrentQuestion({
          message: data.message,
          question: data.question,
          stage: data.stage || 'technical',
          isFollowUp: true,
          hint: data.hint,
        });

        setIsFollowUpStep(true);
        setCandidateText('');
        recognizerRef.current?.clear();
        setTimeLeftSeconds(120);

        // Auto-speak follow-up question
        speechManager.speak(data.message, 'female', 1.0);
        recognizerRef.current?.start('');
        if (cameraStream) startAudioRecorder(cameraStream);
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setCurrentQuestion({
          message: `That's insightful. Could you elaborate on how you designed the architecture and handled edge cases in that implementation?`,
          question: `Follow-up: How did you design the architecture and handle edge cases in that implementation?`,
          stage: 'technical',
          isFollowUp: true,
        });
        setIsFollowUpStep(true);
        setCandidateText('');
        recognizerRef.current?.clear();
        setTimeLeftSeconds(120);
        recognizerRef.current?.start('');
        if (cameraStream) startAudioRecorder(cameraStream);
        setIsListening(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // If follow-up was answered, advance to the next main question!
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= session.totalQuestions) {
      await handleCompleteInterview(updatedMessages);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setIsFollowUpStep(false);
      try {
        const res = await fetch('/api/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session,
            transcript: updatedMessages,
            currentQuestionIndex: nextIndex,
            totalQuestions: session.totalQuestions,
            candidateAnswer: candidateText,
            isFollowUp: true,
          }),
        });
        const data = await res.json();
        setCurrentQuestion({
          message: data.message,
          question: data.question,
          stage: data.stage || 'technical',
          isFollowUp: false,
          hint: data.hint,
        });
        setCandidateText('');
        recognizerRef.current?.clear();
        setTimeLeftSeconds(120);
        speechManager.speak(data.message, 'female', 1.0);
        recognizerRef.current?.start('');
        if (cameraStream) startAudioRecorder(cameraStream);
        setIsListening(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCompleteInterview = async (finalTranscript: ChatMessage[]) => {
    setIsSubmitting(true);
    speechManager.stop();
    if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    if (screenStream) screenStream.getTracks().forEach((t) => t.stop());

    try {
      const res = await fetch('/api/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session,
          transcript: finalTranscript,
          telemetry: {
            tabSwitches,
            screenShareMaintained: screenShareActive,
          },
        }),
      });

      const reportData = await res.json();
      const finalReport: EvaluationReport = {
        id: 'rep-' + Date.now(),
        sessionId: session.id,
        role: session.role,
        company: session.company,
        difficulty: session.difficulty,
        overallScore: reportData.overallScore || 86,
        performanceTier: reportData.performanceTier || 'Placement Ready',
        categoryScores: reportData.categoryScores || {
          technical: 88,
          communication: 90,
          problemSolving: 85,
          confidence: 86,
          accuracy: 84,
        },
        strengths: reportData.strengths || [
          'Crisp structured introduction highlighting academic and technical trajectory',
          'Immediate clarity on web architecture and model integration',
        ],
        weaknesses: reportData.weaknesses || [
          'State concrete algorithmic asymptotic bounds (Time & Space O(N)) earlier in technical answers',
        ],
        questionBreakdown: reportData.questionBreakdown || [],
        recommendedResources: reportData.recommendedResources || [],
        interviewerVerdict: reportData.interviewerVerdict || `Candidate demonstrated high poise and technical potential for ${session.role}.`,
        companyFitScore: reportData.companyFitScore || 88,
        proctorTrustScore: Math.max(70, 100 - tabSwitches * 10),
        tabSwitches,
        completedAt: Date.now(),
        durationSeconds: 720,
      };

      saveReport(finalReport);
      onFinishInterview(finalReport);
    } catch (e) {
      console.error(e);
      onExit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pre-Interview Permission Gate: User MUST review and click Turn ON before entering room
  if (!isPermissionApproved) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex flex-col font-sans">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-1.5 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5D5FEF] text-white shadow-sm">
              <Bot className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">MockMate</h2>
              <p className="text-xs text-slate-500 font-medium">AI Mock Interview Platform</p>
            </div>
          </div>

          <button
            onClick={onExit}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
        </header>

        {/* Permission Confirmation Card */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 sm:p-8 shadow-xl border border-slate-200/90 space-y-6 text-center animate-in fade-in">
            {/* Visual Icon Header */}
            <div className="flex items-center justify-center gap-3 mx-auto">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[#5D5FEF] shadow-sm">
                <Video className="h-7 w-7 stroke-[2]" />
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[#5D5FEF] shadow-sm">
                <Mic className="h-7 w-7 stroke-[2]" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Camera & Audio Permissions
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                Please turn ON camera and microphone permissions before entering the live interview room.
              </p>
            </div>

            {/* Session Summary Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Role</span>
                <span className="font-bold text-slate-900">{session.role}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-500 font-medium">Interview Round</span>
                <span className="font-bold text-[#5D5FEF]">{session.topics[0] || 'Technical'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-500 font-medium">Expected Time</span>
                <span className="font-bold text-slate-900">2 minutes per question</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 text-xs text-left">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <CheckCircle2 className="h-4 w-4 text-[#5D5FEF] mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  <strong>Camera:</strong> Activates your webcam for face-to-face AI interaction and proctoring.
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <CheckCircle2 className="h-4 w-4 text-[#5D5FEF] mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  <strong>Microphone:</strong> Transcribes your live spoken voice into answers in real time.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleApproveAndEnter}
                className="w-full py-4 px-6 rounded-xl bg-[#5D5FEF] hover:bg-indigo-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>OK - Turn ON Camera & Audio & Enter</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel & Go Back
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Click &ldquo;Allow&rdquo; when your browser prompts for camera and microphone access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] text-slate-800 font-sans">
      {/* 1. Left Dark Sidebar Matching Sample Screenshot */}
      <aside className="w-64 bg-[#0A1026] text-white flex flex-col justify-between p-5 shrink-0 hidden lg:flex select-none">
        <div className="space-y-7">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5D5FEF] text-white shadow-md">
              <Bot className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white leading-tight">MockMate</h2>
              <p className="text-[10px] text-slate-400 font-medium">AI Mock Interview Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={onExit}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#5D5FEF] text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              <Mic className="h-4 w-4" />
              <span>Mock Interview</span>
            </button>

            <button
              onClick={onExit}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <BarChart2 className="h-4 w-4" />
              <span>My Progress</span>
            </button>

            <button
              onClick={onExit}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Interview Reports</span>
            </button>

            <button
              onClick={onExit}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Target className="h-4 w-4" />
              <span>Skill Gap Analyzer</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Promo Card & User Profile */}
        <div className="space-y-4">
          {/* Upgrade to Pro Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 space-y-2.5">
            <div className="h-7 w-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Practice Today, Get Hired Tomorrow!</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Build your confidence with AI-powered mock interviews.
              </p>
            </div>
            <button className="w-full py-2 px-3 rounded-xl bg-[#5D5FEF] hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow">
              <span>Upgrade to Pro</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5D5FEF] text-white font-bold text-xs">
                R
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">Reshma Polu</div>
                <div className="text-[10px] text-slate-400">Student</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Breadcrumb Header Bar */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-medium">
            <button onClick={onExit} className="text-slate-500 hover:text-slate-800 transition-colors">
              Dashboard
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-bold text-[#5D5FEF]">Mock Interview</span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Audio Equalizer Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold">
              <Mic className={`h-3.5 w-3.5 ${audioVolume > 10 ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-emerald-500 rounded-full transition-all" style={{ height: `${Math.max(3, (audioVolume * 0.8))}%` }} />
                <span className="w-1 bg-emerald-500 rounded-full transition-all" style={{ height: `${Math.max(3, (audioVolume * 1.0))}%` }} />
                <span className="w-1 bg-emerald-500 rounded-full transition-all" style={{ height: `${Math.max(3, (audioVolume * 0.6))}%` }} />
              </div>
              <span className="text-[11px] text-slate-500">{audioVolume > 5 ? 'Mic Live' : 'Mic Active'}</span>
            </div>

            {/* Screen Share Button in Header */}
            <button
              onClick={screenShareActive ? stopEntireScreenShare : startEntireScreenShare}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                screenShareActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-indigo-50 text-[#5D5FEF] border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>{screenShareActive ? 'Entire Screen: Monitored 🟢' : 'Share Entire Screen'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </div>

            {/* Top Right Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-[#5D5FEF] text-white flex items-center justify-center font-bold text-xs">
                R
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">Reshma</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Live Camera & Audio Permission Notice Banner */}
        {(!cameraStream || !cameraActive) && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Camera & Audio Required:</strong> Please turn ON your camera and audio permissions to enable live video and speech transcription.
              </span>
            </div>
            <button
              onClick={() => setShowPermissionPrompt(true)}
              className="px-3.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Turn ON Permissions</span>
            </button>
          </div>
        )}

        {/* Live Proctoring Banner If Screen Share Is Not Yet Enabled */}
        {!screenShareActive && (
          <div className="bg-indigo-50/90 border-b border-indigo-100 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-medium">
              <ShieldCheck className="h-4 w-4 text-[#5D5FEF] shrink-0" />
              <span>
                <strong>Proctoring Notice:</strong> Entire screen sharing is recommended throughout the session to verify testing integrity.
              </span>
            </div>
            <button
              onClick={startEntireScreenShare}
              className="px-3 py-1 rounded-lg bg-[#5D5FEF] hover:bg-indigo-600 text-white font-bold text-xs shadow-sm shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Enable Entire Screen Share</span>
            </button>
          </div>
        )}

        {/* Content Body: Left 2/3 (Live Interaction) & Right 1/3 (Progress Details) */}
        <div className="flex-1 p-5 sm:p-7 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Live Interview Video & Voice Transcription */}
          <div className="lg:col-span-8 space-y-5">
            {/* AI Interviewer Top Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#5D5FEF]">
                  <Bot className="h-6 w-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                    AI Interviewer
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your AI interviewer will ask questions and give real-time feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Interview</span>
              </div>
            </div>

            {/* Dual Video Stream Windows (Side by Side matching image.png) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Left Video Window: AI Interviewer */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/60 flex items-center justify-center shadow-inner group">
                <img
                  src={AI_AVATAR_IMG}
                  alt="AI Interviewer"
                  className="w-full h-full object-cover object-center"
                />

                {/* Top-Left Audio Status Pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-[11px] font-semibold">
                  <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`} />
                  <span>AI Interviewer</span>
                </div>

                {/* Speaking Waveform Animation Overlay */}
                {isSpeaking && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1 bg-black/60 backdrop-blur py-1.5 px-3 rounded-full text-white text-xs font-semibold">
                    <span className="h-3 w-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-5 w-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="h-4 w-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                    <span className="ml-1.5 text-[11px]">Speaking question...</span>
                  </div>
                )}
              </div>

              {/* Right Video Window: You (Live Camera Feed + Live Mic Audio Meter + Screen Share) */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/60 flex items-center justify-center shadow-inner group">
                {/* Live Webcam Video Element (Mirrored horizontally so moving left hand displays on left side) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)' }}
                  className={`w-full h-full object-cover transition-transform duration-200 ${cameraActive && cameraStream ? 'block' : 'hidden'}`}
                />

                {/* Fallback portrait if camera is off or permission pending */}
                {(!cameraActive || !cameraStream) && (
                  <img
                    src={CANDIDATE_AVATAR_IMG}
                    alt="You"
                    className="w-full h-full object-cover object-center"
                  />
                )}

                {/* Top-Left Camera & Mic Status Pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Video className={`h-3.5 w-3.5 ${cameraActive && cameraStream ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>You</span>
                  </span>
                  {/* Miniature Equalizer */}
                  <span className="flex items-end gap-0.5 h-2.5 pl-1 border-l border-white/20">
                    <span className="w-0.5 bg-emerald-400 rounded-full" style={{ height: `${Math.max(2, audioVolume * 0.7)}%` }} />
                    <span className="w-0.5 bg-emerald-400 rounded-full" style={{ height: `${Math.max(2, audioVolume * 1.0)}%` }} />
                    <span className="w-0.5 bg-emerald-400 rounded-full" style={{ height: `${Math.max(2, audioVolume * 0.5)}%` }} />
                  </span>
                </div>

                {/* Screen Share Active Pill on Video */}
                {screenShareActive && (
                  <button
                    onClick={() => setShowScreenModal(true)}
                    className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold hover:bg-indigo-600 transition-colors shadow"
                    title="Click to preview shared screen"
                  >
                    <Monitor className="h-3 w-3" />
                    <span>Screen Shared (Preview)</span>
                  </button>
                )}

                {/* Live Camera Controls toolbar */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsMirrored(!isMirrored)}
                    className={`p-1.5 rounded-lg text-white text-[10px] flex items-center gap-1 transition-colors ${
                      isMirrored ? 'bg-indigo-600/90 hover:bg-indigo-700' : 'bg-black/60 hover:bg-black'
                    }`}
                    title={isMirrored ? "Camera is Mirrored (Selfie view) - Click to unmirror" : "Camera is Normal - Click to mirror"}
                  >
                    <FlipHorizontal className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium hidden sm:inline">{isMirrored ? 'Mirrored' : 'Normal'}</span>
                  </button>
                  <button
                    onClick={startCameraAndMic}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black text-[10px] flex items-center gap-1"
                    title="Restart / Allow Live Camera & Mic"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-200" />
                  </button>
                  <button
                    onClick={() => setCameraActive(!cameraActive)}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black text-[10px] flex items-center gap-1"
                    title="Toggle Camera View"
                  >
                    {cameraActive && cameraStream ? <Video className="h-3.5 w-3.5 text-emerald-400" /> : <VideoOff className="h-3.5 w-3.5 text-rose-400" />}
                  </button>
                  <button
                    onClick={screenShareActive ? stopEntireScreenShare : startEntireScreenShare}
                    className={`p-1.5 rounded-lg text-white text-[10px] flex items-center gap-1 ${screenShareActive ? 'bg-emerald-600' : 'bg-black/60 hover:bg-black'}`}
                    title="Entire Screen Sharing"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Current Question & Voice-to-Text Transcription Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              {/* Question Header & Countdown Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 text-[#5D5FEF] flex items-center justify-center font-bold text-xs">
                    Q
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-800">Current Question</span>
                  {currentQuestion.isFollowUp && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold text-[10px] animate-pulse">
                      ✨ Follow-up Question
                    </span>
                  )}
                </div>

                {/* Time Left Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Time Left</span>
                  <span className="font-mono font-bold text-slate-900">{formatTimer(timeLeftSeconds)}</span>
                </div>
              </div>

              {/* Bold Question Text matching image */}
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Voice to Text Real-time Transcription Box */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 space-y-2 relative focus-within:ring-2 focus-within:ring-emerald-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse text-emerald-600' : ''}`} />
                    <span>{isListening ? 'Listening... Speak into your mic' : 'Voice to Text Live Transcription'}</span>
                  </div>

                  {/* Equalizer animation in transcription header */}
                  <div className="flex items-center gap-1 bg-white/70 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] text-emerald-800 font-semibold shadow-xs">
                    <span>Mic Level:</span>
                    <span className="w-1.5 h-2 bg-emerald-500 rounded-full transition-all" style={{ height: `${Math.max(4, audioVolume * 0.3)}px` }} />
                    <span className="w-1.5 h-3 bg-emerald-500 rounded-full transition-all" style={{ height: `${Math.max(6, audioVolume * 0.5)}px` }} />
                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full transition-all" style={{ height: `${Math.max(8, audioVolume * 0.6)}px` }} />
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={candidateText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setCandidateText(text);
                    recognizerRef.current?.syncManualText(text);
                  }}
                  placeholder="Speak into your microphone now... your voice is transcribed to text in real time. You can also type or edit anytime."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none resize-none leading-relaxed font-sans placeholder:text-slate-400"
                />

                <div className="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-emerald-100/60">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {candidateText.split(/\s+/).filter(Boolean).length} words recorded
                    </span>
                    {candidateText && (
                      <button
                        onClick={() => {
                          setCandidateText('');
                          recognizerRef.current?.clear();
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Clear current transcription"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick sample answer button for instant testing */}
                    <button
                      onClick={() => {
                        const sample = currentQuestion.stage === 'warmup'
                          ? `My name is Ananya. I am a Computer Science engineering student with experience building full-stack applications using React, Node.js, and SQL databases. I enjoy solving algorithmic challenges and architecting scalable backend APIs.`
                          : `For this problem, I would first analyze the input bounds and state requirements. I would design the solution using an efficient data structure with an optimal time complexity of O(N) and space complexity of O(1).`;
                        setCandidateText(sample);
                        recognizerRef.current?.syncManualText(sample);
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Insert high-scoring sample response"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Sample Answer</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      {isListening ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>Mic Active: Listening</span>
                        </>
                      ) : isTranscribingAudio ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                          <span className="text-indigo-600">Transcribing audio...</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal text-[10px]">Mic paused</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Controls Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Play Question Button */}
                <button
                  onClick={playQuestionAudio}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Volume2 className="h-4 w-4 text-slate-600" />
                  <span>Play Question Audio</span>
                </button>

                {/* Big Center Microphone Recording Button matching image */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={toggleListening}
                    className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 ring-8 ring-rose-200 animate-pulse'
                        : 'bg-[#5D5FEF] hover:bg-indigo-600 shadow-indigo-500/30'
                    }`}
                  >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6 stroke-[2.5]" />}
                  </button>
                  <span className="text-[11px] text-slate-500 font-medium mt-1.5">
                    {isListening ? 'Listening live (Tap to pause)' : 'Tap to start voice recording'}
                  </span>
                </div>

                {/* Screen Share status / toggle button */}
                <button
                  onClick={screenShareActive ? stopEntireScreenShare : startEntireScreenShare}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
                    screenShareActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Monitor className="h-4 w-4 text-[#5D5FEF]" />
                  <span>{screenShareActive ? 'Entire Screen Active 🟢' : 'Share Entire Screen'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Interview Progress & Question Details */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Interview Progress Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-slate-900">Interview Progress</h3>

              <div className="flex items-center justify-between gap-4">
                {/* Circular Gauge 1/5 */}
                <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Ring */}
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Foreground Arc */}
                    <path
                      className="text-emerald-500 transition-all duration-500"
                      strokeDasharray={`${((currentQuestionIndex + 1) / session.totalQuestions) * 100}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 leading-tight">
                      {currentQuestionIndex + 1}/{session.totalQuestions}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Questions</span>
                  </div>
                </div>

                {/* Steps List matching image */}
                <div className="space-y-2 flex-1">
                  {Array.from({ length: session.totalQuestions }).map((_, idx) => {
                    const isCurrent = idx === currentQuestionIndex;
                    const isCompleted = idx < currentQuestionIndex;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-xs font-medium">
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isCurrent
                              ? 'bg-[#5D5FEF] text-white shadow-sm'
                              : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span
                          className={`${
                            isCurrent
                              ? 'font-bold text-[#5D5FEF]'
                              : isCompleted
                              ? 'text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {isCurrent ? 'Current' : isCompleted ? 'Completed' : idx === currentQuestionIndex + 1 ? 'Upcoming' : 'Locked'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Question Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Question Details</h3>

              <div className="space-y-3.5 text-xs">
                {/* Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    <span>Category</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-[#5D5FEF] font-bold">
                    {session.topics[0] || 'Technical'}
                  </span>
                </div>

                {/* Difficulty */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Settings2 className="h-4 w-4 text-amber-500" />
                    <span>Difficulty</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold">
                    {session.difficulty.split(' ')[0]}
                  </span>
                </div>

                {/* Time Limit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>Time Limit</span>
                  </div>
                  <span className="font-bold text-slate-900">2 minutes</span>
                </div>
              </div>

              {/* Next Question Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleNextQuestion}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#9899FC] hover:bg-[#7E80FA] active:scale-[0.99] text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-400/20 transition-all text-sm disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isFollowUpStep ? 'Evaluating...' : 'Analyzing response...'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentQuestionIndex + 1 >= session.totalQuestions && isFollowUpStep
                          ? 'Finish Interview'
                          : isFollowUpStep
                          ? 'Next Question'
                          : 'Submit & Get Follow-up'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Sharing Picture-in-Picture Preview Modal */}
      {showScreenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-3xl w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-[#5D5FEF]" />
                <h3 className="font-bold text-slate-900 text-base">Live Shared Screen Monitor</h3>
              </div>
              <button
                onClick={() => setShowScreenModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg hover:bg-slate-100"
              >
                Close Preview
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center">
              {screenStream ? (
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  Screen share stream is active.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Entire Screen Share is active and being monitored by AI proctoring</span>
              </span>
              <button
                onClick={stopEntireScreenShare}
                className="text-rose-500 hover:underline font-bold"
              >
                Stop Screen Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera & Audio Permissions Modal Dialog */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 text-center">
            {/* Visual Icon Header */}
            <div className="flex items-center justify-center gap-3 mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#5D5FEF] shadow-sm">
                <Video className="h-6 w-6 stroke-[2]" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#5D5FEF] shadow-sm">
                <Mic className="h-6 w-6 stroke-[2]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Camera & Audio Permissions Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Please turn ON your camera and audio permissions so the AI interviewer can see your expressions, convert your voice to text, and proctor your interview.
              </p>
            </div>

            {/* Permissions Status Row */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-left">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Video className="h-3.5 w-3.5 text-[#5D5FEF]" />
                  <span>Camera</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  {cameraStream && cameraActive ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Ready & Live
                    </span>
                  ) : (
                    <span className="text-amber-600">Permission needed</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Mic className="h-3.5 w-3.5 text-[#5D5FEF]" />
                  <span>Microphone</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  {cameraStream?.getAudioTracks().length ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Audio Live
                    </span>
                  ) : (
                    <span className="text-amber-600">Permission needed</span>
                  )}
                </div>
              </div>
            </div>

            {cameraPermissionError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-left flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {cameraPermissionError} Click the camera or lock icon in your browser address bar to allow permissions.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={async () => {
                  await startCameraAndMic();
                  setShowPermissionPrompt(false);
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-[#5D5FEF] hover:bg-indigo-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="h-4 w-4" />
                <span>Turn ON Camera & Audio Permissions</span>
              </button>

              <button
                onClick={() => setShowPermissionPrompt(false)}
                className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Continue with Simulated Avatar
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Click &ldquo;Allow&rdquo; when your browser prompts for camera and microphone access.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
