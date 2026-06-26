"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  ExternalLink, Mail, MessageCircle, MoreHorizontal,
} from "lucide-react";
import { cn, getStageBg, getLeadScoreColor, formatRelativeTime } from "@/lib/utils";
import { useLeadStore } from "@/lib/store/useLeadStore";
import type { Lead } from "@/lib/types";

type SortKey = "company" | "leadScore" | "estimatedValue" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

interface SortHeaderProps {
  label: string;
  colKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortHeader({ label, colKey, sortKey, sortDir, onSort }: SortHeaderProps) {
  const active = sortKey === colKey;
  return (
    <button
      onClick={() => onSort(colKey)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
    >
      {label}
      {active ? (
        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      ) : (
        <span className="h-3 w-3 opacity-30">↕</span>
      )}
    </button>
  );
}

export function LeadTable() {
  const { filteredLeads, selectedLeadIds, selectLead, deselectLead, selectAll, clearSelection } = useLeadStore();
  const leads = filteredLeads();

  const [sortKey, setSortKey] = useState<SortKey>("leadScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  const sorted = [...leads].sort((a, b) => {
    let valA: string | number = "";
    let valB: string | number = "";
    if (sortKey === "company") { valA = a.company; valB = b.company; }
    else if (sortKey === "leadScore") { valA = a.leadScore; valB = b.leadScore; }
    else if (sortKey === "createdAt") { valA = a.createdAt; valB = b.createdAt; }
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const allSelected = leads.length > 0 && leads.every((l) => selectedLeadIds.includes(l.id));

  return (
    <div className="card overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                  className="h-3.5 w-3.5 rounded border-[var(--border)] accent-[var(--accent-blue)]"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Company"
                  colKey="company"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Contact</span>
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Score"
                  colKey="leadScore"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Stage</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Est. Value</span>
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Created"
                  colKey="createdAt"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {paginated.map((lead, i) => {
              const selected = selectedLeadIds.includes(lead.id);
              return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  className={cn(
                    "group hover:bg-[var(--surface)] transition-colors cursor-pointer",
                    selected && "bg-blue-50/40"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) =>
                        e.target.checked ? selectLead(lead.id) : deselectLead(lead.id)
                      }
                      className="h-3.5 w-3.5 rounded border-[var(--border)] accent-[var(--accent-blue)]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ background: `hsl(${lead.company.charCodeAt(0) * 7}, 60%, 55%)` }}
                      >
                        {lead.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{lead.company}</p>
                        {lead.website && (
                          <p className="text-xs text-[var(--text-muted)]">{lead.website}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[var(--text-primary)]">{lead.contactName ?? "—"}</p>
                      <p className="text-xs text-[var(--text-muted)]">{lead.contactTitle ?? ""}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: getLeadScoreColor(lead.leadScore) }}
                      >
                        {lead.leadScore}
                      </span>
                      <div className="h-1.5 w-12 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${lead.leadScore}%`,
                            background: getLeadScoreColor(lead.leadScore),
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", getStageBg(lead.stage))}>
                      {lead.stage.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-emerald-700">
                      {lead.estimatedValue ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatRelativeTime(lead.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-blue-50 text-[var(--text-muted)] hover:text-blue-600 transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-emerald-50 text-[var(--text-muted)] hover:text-emerald-600 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
        <p className="text-xs text-[var(--text-muted)]">
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length} leads
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                i === page
                  ? "bg-[var(--accent-blue)] text-white"
                  : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)]"
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
