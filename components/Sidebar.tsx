import React from 'react';
import { Checkpoint } from '../types';

interface SidebarProps {
  checkpoints: Checkpoint[];
  currentCheckpointIndex: number;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ checkpoints, currentCheckpointIndex, isOpen = false, onClose }) => {
  return (
    <div className={`
        fixed inset-y-0 left-0 z-50 w-72 md:w-80 
        bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-lg shadow-slate-200/50 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 md:p-8 pb-4 flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                    </svg>
                </div>
                Pathfinder
            </h2>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2 ml-1">Learning Trajectory</p>
        </div>
        
        {/* Mobile Close Button */}
        <button 
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="relative border-l-2 border-slate-100 ml-3.5 space-y-8 pb-10">
          {checkpoints.map((checkpoint, idx) => {
            const isCompleted = checkpoint.status === 'completed';
            const isCurrent = checkpoint.status === 'current';
            const isLocked = checkpoint.status === 'locked';

            return (
              <div key={checkpoint.id} className="relative pl-8 group">
                {/* Timeline Dot */}
                <div 
                  className={`absolute -left-[9px] top-1.5 w-5 h-5 rounded-full border-2 transition-all duration-500 z-10 flex items-center justify-center
                    ${isCompleted ? 'bg-green-500 border-green-500 scale-100' : ''}
                    ${isCurrent ? 'bg-white border-violet-500 scale-125 shadow-[0_0_0_4px_rgba(139,92,246,0.2)]' : ''}
                    ${isLocked ? 'bg-slate-50 border-slate-300' : ''}
                  `}
                >
                  {isCompleted && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></div>}
                </div>
                
                {/* Content */}
                <div className={`transition-all duration-500 ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                  <h3 className={`text-sm font-bold leading-tight ${isCurrent ? 'text-violet-700' : 'text-slate-700'}`}>
                    {checkpoint.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                    {checkpoint.objective}
                  </p>
                  
                  {isCurrent && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-wider border border-violet-100">
                            Active Node
                        </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer / User Profile Stub */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">
                U
            </div>
            <div>
                <p className="text-xs font-bold text-slate-700">Guest Learner</p>
                <p className="text-[10px] text-slate-400">Session Active</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;