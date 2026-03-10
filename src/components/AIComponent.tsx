"use client";

import React from 'react';

interface AIComponentProps {
  aiAlpha: string;
  isAiLoading: boolean;
  onRefreshAi: () => void;
}

const AIComponent = ({ aiAlpha, isAiLoading, onRefreshAi }: AIComponentProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">DegenBot Analysis</span>
        <button 
          onClick={onRefreshAi} 
          disabled={isAiLoading}
          className="p-1 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 text-zinc-500 ${isAiLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="flex-1 bg-zinc-950/50 border border-purple-500/20 rounded-lg p-3 font-mono text-[11px] leading-relaxed relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        {isAiLoading ? (
          <div className="flex flex-col gap-2">
            <div className="h-3 w-3/4 bg-zinc-800 animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-zinc-800 animate-pulse rounded" />
          </div>
        ) : (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-purple-300"
          >
            {aiAlpha}
          </motion.p>
        )}
        <div className="mt-4 text-[8px] text-zinc-600 uppercase tracking-tighter">
          Powered by Gemini 1.5 Flash
        </div>
      </div>
    </div>
  );
};

export default AIComponent;