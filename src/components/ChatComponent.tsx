"use client";

import React from 'react';

interface ChatComponentProps {
  messages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  currentAddress: string;
}

const ChatComponent = ({ messages, inputText, setInputText, handleSendMessage, currentAddress }: ChatComponentProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`text-[8px] font-black uppercase tracking-tighter ${msg.is_ai ? 'text-pink-500' : 'text-zinc-500'}`}>
                {msg.is_ai ? 'DEGEN_BOT' : `${msg.address.slice(0,4)}...${msg.address.slice(-2)}`}
              </span>
              <span className="text-[7px] text-zinc-700 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className={`text-[10px] font-mono leading-tight ${msg.is_ai ? 'text-pink-300 italic' : 'text-zinc-300'}`}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-1 shrink-0">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Talk trash..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-white focus:outline-none focus:border-pink-500/50"
        />
        <button type="submit" className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400">
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;