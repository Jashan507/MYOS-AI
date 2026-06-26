"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, BookmarkPlus, Megaphone, Radar, Sparkles } from "lucide-react";
import { LeadFinderForm } from "@/components/leads/LeadFinderForm";
import { LeadCard } from "@/components/leads/LeadCard";
import { SkeletonLeadCard } from "@/components/ui/skeleton-card";
import { containerVariants } from "@/lib/utils";
import { useLeadStore } from "@/lib/store/useLeadStore";
import type { Lead } from "@/lib/types";

export default function LeadFinderPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Lead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { addLead } = useLeadStore();

  function handleResults(leads: Lead[]) {
    setIsSearching(false);
    setResults(leads);
    setHasSearched(true);
  }

  function handleSearch(leads: Lead[]) {
    setIsSearching(true);
    setResults([]);
    handleResults(leads);
  }

  function saveAll() {
    results.forEach((lead) => addLead({ ...lead, id: `saved_${lead.id}` }));
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Left panel — form */}
      <div className="w-[320px] flex-shrink-0 overflow-y-auto border-r border-[var(--border)] bg-white p-6 scrollbar-hide">
        <LeadFinderForm onResults={handleSearch} isSearching={isSearching} />
      </div>

      {/* Right panel — results */}
      <div className="flex-1 overflow-y-auto bg-[var(--surface)] p-6">
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {isSearching && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Scanning animation */}
              <div className="mb-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-white py-8">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500" style={{ animationDuration: "1s" }} />
                  <Radar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-[var(--text-primary)]">AI is scanning the web...</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Analyzing thousands of companies to find your ideal leads</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonLeadCard key={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {!isSearching && hasSearched && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Bulk actions bar */}
              <div className="mb-5 flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--accent-blue)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {results.length} leads found
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">by AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                    <CheckSquare className="h-3.5 w-3.5" />
                    Select All
                  </button>
                  <button
                    onClick={saveAll}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    Save All
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors">
                    <Megaphone className="h-3.5 w-3.5" />
                    Add to Campaign
                  </button>
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
                {results.map((lead, i) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    delay={i * 0.05}
                    onSave={() => addLead({ ...lead, id: `saved_${lead.id}` })}
                    onEmail={() => {}}
                    onWhatsApp={() => {}}
                    onProposal={() => {}}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Empty state */}
          {!isSearching && !hasSearched && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-[var(--border)]">
                <Sparkles className="h-9 w-9 text-[var(--accent-blue)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">AI Lead Finder</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs">
                  Fill in the search form on the left and let our AI find high-quality leads that match your ideal client profile.
                </p>
              </div>
              <div className="flex gap-2 text-xs text-[var(--text-muted)]">
                <span className="rounded-full border border-[var(--border)] px-3 py-1">🎯 AI-powered matching</span>
                <span className="rounded-full border border-[var(--border)] px-3 py-1">📊 Lead scoring</span>
                <span className="rounded-full border border-[var(--border)] px-3 py-1">✉️ Contact details</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
