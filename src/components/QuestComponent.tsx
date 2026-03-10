"use client";

import React from 'react';

interface Quest {
  id: number;
  title: string;
  desc: string;
  progress: number;
}

interface QuestComponentProps {
  quests: Quest[];
  balance: number;
  tradeCount: number;
  tradeHistory: TradeRecord[];
}

const QuestComponent = ({ quests, balance, tradeCount, tradeHistory }: QuestComponentProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">Degen Quests</span>
        <Target className="w-3 h-3" />
      </div>
      <div className="flex-1 space-y-2">
        {quests.map((q) => (
          <div key={q.id} className="bg-zinc-900/50 border border-zinc-800 rounded p-2">
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="text-[10px] font-bold text-zinc-200">{q.title}</div>
                <div className="text-[8px] text-zinc-500">{q.desc}</div>
              </div>
              {q.progress >= 100 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${q.progress}%` }}
                className={`h-full ${q.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestComponent;