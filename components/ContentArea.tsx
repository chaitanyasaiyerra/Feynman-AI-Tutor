import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AppState, Checkpoint, QuizQuestion, WebSource } from '../types';

interface ContentAreaProps {
  state: AppState;
  checkpoint: Checkpoint | null;
  content: string;
  sources: WebSource[];
  quizQuestions: QuizQuestion[];
  onStartQuiz: () => void;
  onSubmitQuiz: (answers: number[]) => void;
  onNextCheckpoint: () => void;
  onRetry: () => void;
  quizResult: { score: number; passed: boolean; feedback: string } | null;
  loadingMessage?: string;
}

const ContentArea: React.FC<ContentAreaProps> = ({ 
  state, 
  checkpoint, 
  content, 
  sources,
  onStartQuiz, 
  quizQuestions,
  onSubmitQuiz,
  quizResult,
  onNextCheckpoint,
  onRetry,
  loadingMessage
}) => {
  const [answers, setAnswers] = React.useState<number[]>([]);

  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = oIdx;
    setAnswers(newAnswers);
  };

  if (!checkpoint) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-6 md:p-10 min-h-[50vh]">
        <div className="p-6 rounded-full bg-white/50 mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 md:w-16 md:h-16 opacity-50 text-indigo-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
        </div>
        <p className="text-lg md:text-xl font-medium text-slate-400 text-center">Select a topic to initialize the agent.</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth relative pt-20 md:pt-10">
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* Header Section */}
        <div className="mb-6 md:mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
             <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm border transition-colors duration-300 ${
                 state === AppState.FEYNMAN 
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : 'bg-violet-50 text-violet-600 border-violet-100'
             }`}>
                {state === AppState.FEYNMAN ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1.5"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>
                        Feynman Mode Active
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1.5"><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" /></svg>
                        Standard Module
                    </>
                )}
             </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {checkpoint.title}
          </h1>
          <p className="text-base md:text-lg text-slate-500 mt-3 md:mt-4 font-medium max-w-2xl border-l-4 border-violet-200 pl-4 py-1">
            {checkpoint.objective}
          </p>
        </div>

        {/* Dynamic Content Card */}
        <div className="bg-white/90 backdrop-blur rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/60 border border-white/50 p-5 md:p-12 min-h-[400px] md:min-h-[500px] transition-all duration-500 relative overflow-hidden">
          
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-80"></div>

          {(state === AppState.LEARNING || state === AppState.FEYNMAN) && (
            <div>
              {content ? (
                <div className="fade-in">
                  {/* React Markdown Renderer with Explicit Text Colors */}
                  <ReactMarkdown
                    className="font-body"
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl md:text-3xl font-extrabold mt-8 md:mt-10 mb-4 md:mb-6 pb-4 border-b border-slate-100 text-slate-900 tracking-tight" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold mt-10 md:mt-12 mb-4 md:mb-5 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-bold mt-6 md:mt-8 mb-3 text-slate-800 tracking-tight" {...props} />,
                      // Explicitly setting text-slate-600 to ensure visibility on white background
                      p: ({node, ...props}) => <p className="leading-relaxed mb-4 md:mb-5 text-slate-600 text-base md:text-[1.05rem]" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-5 md:ml-6 space-y-2 md:space-y-3 mb-6 text-slate-600 text-sm md:text-base" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-5 md:ml-6 space-y-2 md:space-y-3 mb-6 text-slate-600 text-sm md:text-base" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1 marker:text-violet-500 text-slate-600 leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded box-decoration-clone" {...props} />,
                      a: ({node, ...props}) => <a className="text-violet-600 font-semibold underline decoration-violet-300 underline-offset-2 hover:text-violet-800 hover:decoration-violet-600 transition-all" target="_blank" rel="noopener noreferrer" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-violet-300 bg-violet-50/50 pl-4 md:pl-5 pr-4 py-3 italic text-slate-600 rounded-r-lg my-6 md:my-8 text-sm md:text-base" {...props} />,
                      code: ({node, ...props}) => <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono border border-slate-200" {...props} />,
                      hr: ({node, ...props}) => <hr className="my-8 md:my-10 border-slate-100" {...props} />,
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                  
                  {/* Sources Section */}
                  {sources.length > 0 && (
                    <div className="mt-12 md:mt-16 pt-8 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-violet-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                        Verified Sources
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sources.map((source, i) => (
                          <a 
                            key={i} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-white hover:shadow-md transition-all group duration-300"
                          >
                             <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                                </svg>
                             </div>
                             <span className="text-sm text-slate-600 group-hover:text-violet-700 font-medium truncate">{source.title || new URL(source.uri).hostname}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-10 md:mt-12 flex justify-end">
                    <button 
                      onClick={onStartQuiz}
                      className="w-full md:w-auto group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-violet-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-600"
                    >
                        <span className="mr-2">Verify Understanding</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] gap-6 md:gap-8">
                  <div className="relative w-20 h-20 md:w-24 md:h-24">
                     <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 animate-ping"></div>
                     <div className="absolute inset-2 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full animate-pulse shadow-xl shadow-violet-500/40"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10 text-white animate-spin-slow">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                     </div>
                  </div>
                  <div className="text-center px-4">
                      <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Engaging Neural Engines</h3>
                      <p className="text-sm md:text-base text-slate-500 font-medium animate-pulse">{loadingMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {(state === AppState.QUIZ || state === AppState.QUIZ_GENERATION) && (
            <div className="fade-in">
              <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-slate-100 pb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Knowledge Verification</h2>
                <div className="text-[10px] md:text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wide border border-violet-100">
                    {quizQuestions.length > 0 ? `${quizQuestions.length} Questions` : 'Preparing...'}
                </div>
              </div>

              {quizQuestions.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-48 md:h-60 gap-4 text-slate-500">
                   <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-slate-100 border-t-violet-500 rounded-full animate-spin"></div>
                   <p className="font-medium text-slate-600">Formulating Assessment Matrix...</p>
                 </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 md:p-6 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:bg-white">
                      <p className="text-base md:text-lg font-bold text-slate-800 mb-4 md:mb-5 flex gap-3">
                          <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold shadow-sm">{idx + 1}</span>
                          {q.question}
                      </p>
                      <div className="grid grid-cols-1 gap-2 md:gap-3 pl-0 md:pl-11">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleOptionSelect(idx, oIdx)}
                            className={`w-full text-left p-3 md:p-4 rounded-xl text-sm md:text-base transition-all duration-200 font-medium border-2 relative overflow-hidden group ${
                              answers[idx] === oIdx 
                                ? 'bg-white border-violet-500 text-violet-700 shadow-lg shadow-violet-200' 
                                : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'
                            }`}
                          >
                            <span className="relative z-10 flex items-center justify-between">
                                {opt}
                                {answers[idx] === oIdx && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-violet-500 flex-shrink-0 ml-2">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button
                      onClick={() => onSubmitQuiz(answers)}
                      disabled={answers.length !== quizQuestions.length}
                      className="w-full md:w-auto bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-400/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                      Evaluate Responses
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {state === AppState.EVALUATING && (
             <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] gap-6 fade-in">
               <div className="w-16 h-16 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin"></div>
               <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800">Analyzing Performance</h3>
                    <p className="text-slate-500 mt-2">Checking against 70% mastery threshold...</p>
               </div>
             </div>
          )}

          {state === AppState.COMPLETE && (
              <div className="text-center py-16 md:py-20 fade-in">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl shadow-green-500/30 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4">Mastery Achieved!</h2>
                  <p className="text-base md:text-lg text-slate-600 mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed px-4">
                      You have successfully navigated the entire learning path. The agent has verified your understanding of all checkpoints.
                  </p>
                  <button onClick={() => window.location.reload()} className="w-full md:w-auto bg-white text-slate-900 border border-slate-200 hover:border-violet-300 hover:text-violet-600 px-8 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md">
                      Start New Topic
                  </button>
              </div>
          )}

          {/* Result Overlay */}
          {quizResult && state !== AppState.QUIZ && state !== AppState.COMPLETE && state !== AppState.LEARNING && state !== AppState.FEYNMAN && (
             <div className="text-center py-8 md:py-12 fade-in">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-3 ${quizResult.passed ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30'}`}>
                    {quizResult.passed ? (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                    )}
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">{quizResult.passed ? 'Checkpoint Cleared' : 'Knowledge Gap Detected'}</h3>
                <p className="text-base md:text-lg text-slate-500 mb-8 max-w-lg mx-auto font-medium px-4">{quizResult.feedback} <span className="font-bold text-slate-800 block mt-1">Score: {quizResult.score}%</span></p>
                
                {quizResult.passed ? (
                    <button 
                        onClick={onNextCheckpoint}
                        className="w-full md:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-violet-500/30 transition-all transform hover:-translate-y-1"
                    >
                        Advance to Next Checkpoint
                    </button>
                ) : (
                    <div className="flex flex-col items-center">
                        <button 
                            onClick={onRetry}
                            className="w-full md:w-auto bg-white text-amber-600 border-2 border-amber-100 hover:border-amber-500 px-10 py-4 rounded-xl font-bold shadow-lg shadow-amber-500/10 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>
                            Activate Feynman Simplification
                        </button>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-4">
                            Regenerating content with adaptive analogies
                        </p>
                    </div>
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContentArea;