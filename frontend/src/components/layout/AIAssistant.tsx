"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, X, Send, Mic, Search, FileText, Mail, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store/useUIStore";
import { AITypingIndicator } from "@/components/ui/ai-typing";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: Date;
}

const quickActions = [
  { label: "Find Leads", icon: Search, prompt: "Find me 10 SaaS startup leads in the United States" },
  { label: "Write Email", icon: Mail, prompt: "Write a cold email for a web development prospect" },
  { label: "Generate Proposal", icon: FileText, prompt: "Generate a proposal for a Shopify store rebuild" },
];

const aiResponses = [
  "I'm scanning for SaaS leads that match your criteria. Based on current market data, I've identified 47 high-quality prospects in the US tech sector with company sizes between 11–200 employees. Shall I add the top 10 to your Lead Database?",
  "Here's a personalized cold email for your web development services:\n\n**Subject:** Quick question about TechFlow's growth plans\n\nHi Sarah,\n\nNoticed TechFlow just expanded into enterprise — congrats on the Series A! Companies at your stage often hit bottlenecks with manual processes around lead gen and client onboarding.\n\nWe recently helped a similar SaaS reduce sales cycle by 34% with a custom automation system. Worth a 15-min call?\n\nBest,\nAlex",
  "Great! I'll generate a tailored proposal. What's the approximate budget range and timeline for this Shopify project?",
  "Your campaign 'SaaS Founders Cold Outreach' is performing exceptionally well — 18.4% reply rate vs 6.2% industry average. I recommend increasing the daily send limit from 50 to 80 to capitalize on this momentum.",
  "I've analyzed your last 30 days of outreach data. Key insight: emails sent Tuesday–Thursday between 9–11 AM get 34% higher open rates. Shall I automatically reschedule your pending campaigns?",
];

function generateMessageId(offset = 0) {
  return (Date.now() + offset).toString();
}

function getTypingDelay() {
  return 1200 + Math.random() * 800;
}

export function AIAssistant() {
  const { aiAssistantOpen, toggleAIAssistant } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi Alex! 👋 I'm your MYOS AI assistant. I can help you find leads, write emails, generate proposals, and analyze your campaign performance. What would you like to do today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: generateMessageId(),
      role: "user",
      content: text,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const response = aiResponses[responseIndex.current % aiResponses.length];
      responseIndex.current++;

      const aiMsg: Message = {
        id: generateMessageId(1),
        role: "assistant",
        content: response,
        time: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, getTypingDelay());
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        id="ai-assistant-toggle"
        onClick={toggleAIAssistant}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-[0_8px_32px_rgba(37,99,235,0.35)] transition-shadow hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)]"
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {aiAssistantOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Bot className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!aiAssistantOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-40" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {aiAssistantOpen && (
          <motion.div
            id="ai-assistant-panel"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white"
            style={{ width: 380, height: 520, boxShadow: "var(--shadow-lg)" }}
          >
            {/* Panel header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">MYOS AI Assistant</p>
                <p className="text-xs text-blue-100">Always online · GPT-4o powered</p>
              </div>
              <button
                onClick={toggleAIAssistant}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-blue-600 to-violet-600 text-white"
                        : "rounded-tl-sm bg-[var(--surface)] text-[var(--text-primary)]"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-[var(--surface)] px-1">
                    <AITypingIndicator />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick actions */}
            <div className="border-t border-[var(--border)] px-3 py-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {quickActions.map(({ label, icon: Icon, prompt }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(prompt)}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] hover:bg-blue-50"
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-[var(--border)] p-3">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[var(--accent-blue)] focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                />
                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <Mic className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
