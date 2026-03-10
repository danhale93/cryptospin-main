"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';

interface Message {
  id: number;
  address: string;
  text: string;
  timestamp: string;
  is_ai?: boolean;
}

interface ChatComponentProps {
  messages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  currentAddress: string;
}

export default function ChatComponent({
  messages,
  inputText,
  setInputText,
  handleSendMessage,
  currentAddress
}: ChatComponentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl">
      <div className="flex items-center gap-2 p-3 border-b border-zinc-800">
        <MessageSquare className="w-4 h-4 text-pink-400" />
        <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Live Chat</span>
        <span className="ml-auto text-[8px] text-zinc-500">{messages.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col ${
                msg.address === currentAddress ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[8px] font-black uppercase tracking-tighter ${
                  msg.is_ai 
                    ? 'text-pink-500' 
                    : msg.address === currentAddress 
                      ? 'text-emerald-400' 
                      : 'text-zinc-500'
                }`}>
                  {msg.is_ai ? 'DEGEN_BOT' : msg.address === currentAddress ? 'YOU' : `${msg.address.slice(0,4)}...`}
                </span>
                <span className="text-[7px] text-zinc-700 font-mono">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                msg.address === currentAddress
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : msg.is_ai
                    ? 'bg-pink-500/20 border border-pink-500/30'
                    : 'bg-zinc-800/50 border border-zinc-700'
              }`}>
                <p className={`text-[10px] font-mono leading-tight ${
                  msg.is_ai ? 'text-pink-300 italic' : 'text-zinc-300'
                }`}>
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Talk trash..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-pink-500/50 transition-colors"
          maxLength={100}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-zinc-400 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}