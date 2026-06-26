"use client";

import { motion } from "framer-motion";
import {
  Globe, Link2, Mail, MessageCircle, Bookmark,
  FileText, ExternalLink, TrendingUp,
} from "lucide-react";
import { cn, getInitials, getLeadScoreColor, cardVariants } from "@/lib/utils";
import type { Lead } from "@/lib/types";

interface LeadCardProps {
  lead: Lead;
  onSave?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onProposal?: (lead: Lead) => void;
  delay?: number;
  compact?: boolean;
}

const tagColors = [
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-pink-50 text-pink-700",
  "bg-teal-50 text-teal-700",
];

// Circular progress ring for Lead Score
function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  const color = getLeadScoreColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F3F5" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function LeadCard({ lead, onSave, onEmail, onWhatsApp, onProposal, delay = 0, compact = false }: LeadCardProps) {
  const initials = getInitials(lead.company);

  // Generate a stable gradient based on company name
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-700",
    "from-emerald-500 to-teal-600",
    "from-pink-500 to-rose-600",
    "from-amber-400 to-orange-500",
  ];
  const gradientIndex = lead.company.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.10)", scale: 1.005 }}
      transition={{ delay, duration: 0.3 }}
      className="card flex flex-col gap-4 p-5 cursor-pointer"
    >
      {/* Header: Company + Score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-sm font-bold shadow-sm", gradient)}>
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-tight">{lead.company}</h3>
              {lead.website && (
                <a
                  href={`https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {lead.website && (
                <span className="flex items-center gap-1 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                  <Globe className="h-3 w-3" />
                  {lead.website}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Lead Score ring */}
        <ScoreRing score={lead.leadScore} />
      </div>

      {/* Contact */}
      {lead.contactName && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-[var(--text-primary)]">{lead.contactName}</span>
          {lead.contactTitle && (
            <span className="text-[var(--text-muted)]">· {lead.contactTitle}</span>
          )}
          {lead.linkedin && (
            <a href={`https://${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors ml-auto">
              <Link2 className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Contact chips */}
      <div className="flex flex-wrap gap-1.5">
        {lead.email && (
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
            <Mail className="h-3 w-3" />
            {compact ? "Email" : lead.email}
          </span>
        )}
        {lead.whatsapp && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            <MessageCircle className="h-3 w-3" />
            {compact ? "WhatsApp" : lead.whatsapp}
          </span>
        )}
      </div>

      {/* AI Confidence bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-[var(--text-muted)]">AI Confidence</span>
          <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{lead.aiConfidence}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${lead.aiConfidence}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: delay + 0.2 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #2563EB, #7C3AED)" }}
          />
        </div>
      </div>

      {/* Pain points */}
      {lead.painPoints.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {lead.painPoints.slice(0, 3).map((pt, i) => (
            <span
              key={pt}
              className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", tagColors[i % tagColors.length])}
            >
              {pt}
            </span>
          ))}
        </div>
      )}

      {/* Outreach angle */}
      {lead.outreachAngle && !compact && (
        <p className="text-[12px] text-[var(--text-secondary)] italic leading-relaxed line-clamp-2">
          {"\"" + lead.outreachAngle + "\""}
        </p>
      )}

      {/* Estimated value */}
      {lead.estimatedValue && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">{lead.estimatedValue}</span>
          </div>
          {lead.companySize && (
            <span className="text-[11px] text-[var(--text-muted)]">{lead.companySize} employees</span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2 border-t border-[var(--border-subtle)] pt-3">
        {[
          { label: "Save", icon: Bookmark, onClick: () => onSave?.(lead), color: "hover:bg-blue-50 hover:text-blue-700" },
          { label: "Email", icon: Mail, onClick: () => onEmail?.(lead), color: "hover:bg-violet-50 hover:text-violet-700" },
          { label: "WhatsApp", icon: MessageCircle, onClick: () => onWhatsApp?.(lead), color: "hover:bg-emerald-50 hover:text-emerald-700" },
          { label: "Proposal", icon: FileText, onClick: () => onProposal?.(lead), color: "hover:bg-amber-50 hover:text-amber-700" },
        ].map(({ label, icon: Icon, onClick, color }) => (
          <button
            key={label}
            id={`lead-${lead.id}-${label.toLowerCase()}`}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-2 text-[var(--text-muted)] transition-all",
              color
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
