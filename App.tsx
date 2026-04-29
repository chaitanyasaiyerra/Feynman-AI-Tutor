import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { 
  AppState, 
  Checkpoint, 
  QuizQuestion, 
  QuizResult,
  WebSource 
} from './types';
import { 
  generateLearningPath, 
  generateContent, 
  generateQuiz, 
  evaluateQuiz 
} from './services/geminiService';

const App: React.FC = () => {
  // State Machine
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // Data
  const [topic, setTopic] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);
  const [currentContent, setCurrentContent] = useState('');
  const [currentSources, setCurrentSources] = useState<WebSource[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  
  // UX State
  const [loadingMessage, setLoadingMessage] = useState("Initializing Agent...");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Async Safety: Track the current session ID to prevent race conditions
  const sessionRef = useRef(0);

  // Handlers
  const handleStartLearning = async () => {
    if (!topic.trim()) return;
    
    // Start a new session
    sessionRef.current += 1;
    const currentSessionId = sessionRef.current;

    setAppState(AppState.PLANNING);
    try {
      const path = await generateLearningPath(topic, userNotes);
      
      // Check if user cancelled/navigated away while waiting
      if (currentSessionId !== sessionRef.current) return;

      setCheckpoints(path);
      setCurrentCheckpointIndex(0);
      
      // Immediately load content for first checkpoint
      await loadCheckpointContent(path[0], false, currentSessionId);
    } catch (error) {
      if (currentSessionId !== sessionRef.current) return;
      console.error(error);
      alert("Failed to generate learning path. Please check your network or try a different topic.");
      setAppState(AppState.IDLE);
    }
  };

  /**
   * Resets the application to the initial state (Landing Page).
   * Clears all data, history, and progress.
   */
  const handleGoHome = () => {
    // EXPLICIT RESET: Increment session ID to kill any pending async tasks
    sessionRef.current += 1;

    // Clear everything to ensure the user can start fresh.
    setTopic('');
    setUserNotes('');
    setCheckpoints([]);
    setCurrentCheckpointIndex(0);
    setCurrentContent('');
    setCurrentSources([]);
    setQuizQuestions([]);
    setQuizResult(null);
    setIsMobileMenuOpen(false);
    setLoadingMessage("Initializing Agent...");
    
    // Finally, switch view back to Landing Page
    setAppState(AppState.IDLE);
  };

  const simulateAgentThinking = () => {
    const messages = [
        "Analyzing Knowledge Graph...",
        "Identifying Key Concepts...",
        "Scouring Semantic Web...",
        "Validating Source Credibility...",
        "Synthesizing Feynman Analogy...",
        "Structuring Pedagogical Path..."
    ];
    let i = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
    }, 1800);
    return interval;
  };

  const loadCheckpointContent = async (checkpoint: Checkpoint, isFeynman: boolean, sessionId: number) => {
    if (sessionId !== sessionRef.current) return;

    setAppState(isFeynman ? AppState.FEYNMAN : AppState.LEARNING);
    setQuizResult(null); // Reset previous results
    setCurrentContent(''); // Clear old content
    setCurrentSources([]); // Clear old sources
    
    // Close mobile menu when loading new content
    setIsMobileMenuOpen(false);
    
    const loadingInterval = simulateAgentThinking();
    
    try {
      const { text, sources } = await generateContent(topic, checkpoint, userNotes, isFeynman);
      
      if (sessionId !== sessionRef.current) return;

      setCurrentContent(text);
      setCurrentSources(sources);
    } catch (error) {
      if (sessionId !== sessionRef.current) return;
      console.error(error);
      alert("Failed to generate content.");
      setAppState(AppState.IDLE); // Go back if content generation strictly fails
    } finally {
        clearInterval(loadingInterval);
    }
  };

  const handleStartQuiz = async () => {
    const currentSessionId = sessionRef.current;
    setAppState(AppState.QUIZ_GENERATION);
    try {
      const questions = await generateQuiz(currentContent);
      
      if (currentSessionId !== sessionRef.current) return;
      
      setQuizQuestions(questions);
      setAppState(AppState.QUIZ);
    } catch (error) {
      if (currentSessionId !== sessionRef.current) return;
      console.error(error);
      setAppState(AppState.LEARNING); // Fallback
      alert("Failed to generate quiz.");
    }
  };

  const handleSubmitQuiz = async (answers: number[]) => {
    const currentSessionId = sessionRef.current;
    setAppState(AppState.EVALUATING);
    try {
      const result = await evaluateQuiz(quizQuestions, answers);
      
      if (currentSessionId !== sessionRef.current) return;

      setQuizResult(result);
    } catch (error) {
      if (currentSessionId !== sessionRef.current) return;
      console.error(error);
      alert("Error grading quiz.");
      setAppState(AppState.QUIZ);
    }
  };

  const handleNextCheckpoint = async () => {
    const nextIdx = currentCheckpointIndex + 1;
    if (nextIdx < checkpoints.length) {
      // Update statuses
      const updatedCheckpoints = [...checkpoints];
      updatedCheckpoints[currentCheckpointIndex].status = 'completed';
      updatedCheckpoints[nextIdx].status = 'current';
      setCheckpoints(updatedCheckpoints);
      
      setCurrentCheckpointIndex(nextIdx);
      await loadCheckpointContent(updatedCheckpoints[nextIdx], false, sessionRef.current);
    } else {
      setAppState(AppState.COMPLETE);
    }
  };

  const handleRetryWithFeynman = async () => {
    // Reload content with Feynman mode true
    await loadCheckpointContent(checkpoints[currentCheckpointIndex], true, sessionRef.current);
  };

  // Initial Landing Screen
  if (appState === AppState.IDLE || appState === AppState.PLANNING) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 -left-4 w-48 h-48 md:w-72 md:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-48 h-48 md:w-72 md:h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-48 h-48 md:w-72 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="max-w-2xl w-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 p-6 md:p-12 relative z-10 transition-all duration-500">
          <div className="text-center mb-8 md:mb-10">
             <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-6 shadow-lg shadow-violet-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.24 50.552 50.552 0 0 0-2.658.813m-15.482 0A50.55 50.55 0 0 1 12 13.489a50.55 50.55 0 0 1 12-4.155" />
                </svg>
             </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 mb-4 tracking-tight">
              Feynman AI Tutor
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
              Master any subject through autonomous learning pathways, search-grounded context, and adaptive <span className="font-semibold text-violet-600">Feynman simplification</span>.
            </p>
          </div>

          <div className="space-y-5 md:space-y-6">
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wide text-xs">Topic of Study</label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quantum Entanglement, The Roman Republic, CRISPR"
                  className="w-full pl-5 pr-4 py-3.5 md:py-4 rounded-xl bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm group-hover:shadow-md text-sm md:text-base"
                  disabled={appState === AppState.PLANNING}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartLearning()}
                />
                 <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                 </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wide text-xs">Context Notes (Optional)</label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Paste syllabus, class notes, or specific learning goals here..."
                className="w-full px-5 py-3.5 md:py-4 rounded-xl bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all h-24 md:h-32 resize-none font-body text-slate-700 placeholder:text-slate-400 shadow-sm group-hover:shadow-md text-sm md:text-base"
                disabled={appState === AppState.PLANNING}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartLearning}
                disabled={appState === AppState.PLANNING || !topic}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-base md:text-lg font-bold py-3.5 md:py-4 rounded-xl transition-all shadow-xl shadow-violet-500/30 transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {appState === AppState.PLANNING ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Building Knowledge Graph...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Learning Agent</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
              
              {appState === AppState.PLANNING && (
                  <button 
                    onClick={handleGoHome}
                    className="text-slate-400 hover:text-red-500 text-sm font-semibold py-2 transition-colors"
                  >
                      Cancel
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Learning Interface
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans selection:bg-violet-200 selection:text-violet-900">
        {/* Subtle mesh background for main app */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200 blur-[100px]"></div>
          <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] rounded-full bg-fuchsia-200 blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex w-full h-full">
          {/* Mobile Menu Overlay */}
          <div 
            className={`fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <Sidebar 
            checkpoints={checkpoints} 
            currentCheckpointIndex={currentCheckpointIndex} 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />

          {/* Home / End Session Button - Moved OUTSIDE of Main to ensure top Z-Index layer */}
          <div className="absolute top-4 right-4 z-50">
                <button 
                    onClick={handleGoHome}
                    className={`flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 active:scale-95 transition-all text-sm font-bold group ${
                      appState === AppState.COMPLETE ? 'border-green-200 text-green-700 hover:text-green-800 bg-green-50' : 'hover:border-red-200 hover:text-red-600'
                    }`}
                    title={appState === AppState.COMPLETE ? "Start New Topic" : "End Session"}
                >
                    {/* Icon changes based on state to indicate 'Home' or 'Reset' */}
                    {appState === AppState.COMPLETE ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                       </svg>
                    )}
                    <span className="hidden md:inline">{appState === AppState.COMPLETE ? "New Topic" : "End Session"}</span>
                </button>
            </div>
          
          <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
            {/* Mobile Header / Menu Button */}
            <div className="md:hidden absolute top-4 left-4 z-30">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 bg-white/80 backdrop-blur rounded-lg shadow-sm border border-slate-200 text-slate-700 hover:bg-white active:scale-95 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>

            <ContentArea 
              state={appState}
              checkpoint={checkpoints[currentCheckpointIndex]}
              content={currentContent}
              sources={currentSources}
              quizQuestions={quizQuestions}
              onStartQuiz={handleStartQuiz}
              onSubmitQuiz={handleSubmitQuiz}
              quizResult={quizResult}
              onNextCheckpoint={handleNextCheckpoint}
              onRetry={handleRetryWithFeynman}
              loadingMessage={loadingMessage}
            />
          </main>
      </div>
    </div>
  );
};

export default App;