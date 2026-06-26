"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Filter, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeadStore } from "@/lib/store/useLeadStore";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { LeadTable } from "@/components/leads/LeadTable";

type ViewMode = "kanban" | "table";

export default function LeadDatabasePage() {
  const [view, setView] = useState<ViewMode>("kanban");
  const { filteredLeads, setFilter, filters, fetchLeads } = useLeadStore();

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const leads = filteredLeads();

  const stats = {
    total: leads.length,
    won: leads.filter((l) => l.stage === "WON").length,
    inPipeline: leads.filter((l) => !["WON", "LOST", "NEW"].includes(l.stage)).length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((acc, l) => acc + l.leadScore, 0) / leads.length) : 0,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Stats pills */}
          {[
            { label: "Total", value: stats.total, color: "text-[var(--text-primary)]" },
            { label: "In Pipeline", value: stats.inPipeline, color: "text-blue-600" },
            { label: "Won", value: stats.won, color: "text-emerald-600" },
            { label: "Avg Score", value: stats.avgScore, color: "text-violet-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className={cn("text-xl font-bold", color)}>{value}</span>
              <span className="text-xs text-[var(--text-muted)]">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[var(--accent-blue)] focus-within:bg-white transition-all">
            <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              placeholder="Search leads..."
              onChange={(e) => setFilter({ search: e.target.value })}
              className="w-40 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Filter */}
          <button className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>

          {/* Export */}
          <button className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>

          {/* View toggle */}
          <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              id="view-kanban"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                view === "kanban"
                  ? "bg-[var(--accent-blue)] text-white"
                  : "bg-white text-[var(--text-muted)] hover:bg-[var(--surface)]"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setView("table")}
              id="view-table"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                view === "table"
                  ? "bg-[var(--accent-blue)] text-white"
                  : "bg-white text-[var(--text-muted)] hover:bg-[var(--surface)]"
              )}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {view === "kanban" ? <KanbanBoard /> : <LeadTable />}
        </motion.div>
      </div>
    </div>
  );
}
