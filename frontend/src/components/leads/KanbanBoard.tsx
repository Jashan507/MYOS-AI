"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trophy, X } from "lucide-react";
import { cn, getStageColor, getStageBg } from "@/lib/utils";
import { useLeadStore } from "@/lib/store/useLeadStore";
import { LeadCard } from "@/components/leads/LeadCard";
import type { Lead, LeadStage } from "@/lib/types";

const COLUMNS: { id: LeadStage; label: string }[] = [
  { id: "NEW", label: "New Lead" },
  { id: "CONTACT_READY", label: "Contact Ready" },
  { id: "EMAIL_SENT", label: "Email Sent" },
  { id: "WHATSAPP_SENT", label: "WhatsApp Sent" },
  { id: "REPLIED", label: "Replied" },
  { id: "MEETING_SCHEDULED", label: "Meeting Scheduled" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent" },
  { id: "NEGOTIATION", label: "Negotiation" },
  { id: "WON", label: "Won 🎉" },
  { id: "LOST", label: "Lost" },
];

// Draggable lead card wrapper
function DraggableLead({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="touch-none"
    >
      <LeadCard lead={lead} compact />
    </div>
  );
}

// Droppable column
function KanbanColumn({
  stage,
  label,
  leads,
}: {
  stage: LeadStage;
  label: string;
  leads: Lead[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });
  const isWon = stage === "WON";
  const isLost = stage === "LOST";
  const stageColor = getStageColor(stage);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col rounded-xl border bg-[var(--surface)] flex-shrink-0 transition-colors",
        isOver ? "border-[var(--accent-blue)] bg-blue-50/30" : "border-[var(--border)]",
        isWon && "border-emerald-200 bg-emerald-50/30",
        isLost && "border-red-100 bg-red-50/20"
      )}
      style={{ width: 280 }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: stageColor }} />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
            style={{ background: stageColor }}
          >
            {leads.length}
          </span>
          {isWon && <Trophy className="h-3.5 w-3.5 text-emerald-600" />}
        </div>
        <button className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-secondary)] transition-colors">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide"
        style={{ minHeight: 120, maxHeight: "calc(100vh - 280px)" }}
      >
        <AnimatePresence>
          {leads.length === 0 ? (
            <div key="empty" className="flex flex-col items-center justify-center h-24 text-[var(--text-muted)] text-xs">
              <p>Drop leads here</p>
            </div>
          ) : (
            leads.map((lead) => (
              <DraggableLead key={lead.id} lead={lead} />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function KanbanBoard() {
  const { leads, updateLeadStage, getLeadsByStage } = useLeadStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const leadId = String(active.id);
    const newStage = String(over.id) as LeadStage;
    updateLeadStage(leadId, newStage);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {COLUMNS.map(({ id, label }) => (
          <KanbanColumn
            key={id}
            stage={id}
            label={label}
            leads={getLeadsByStage(id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-1 scale-105 opacity-95 shadow-xl">
            <LeadCard lead={activeLead} compact />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
