"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Bell, Search, Zap, ChevronDown, Home, LogOut, Settings, User,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useUIStore } from "@/lib/store/useUIStore";
import { GradientBadge } from "@/components/ui/gradient-badge";
import type { Notification } from "@/lib/types";

// Auto breadcrumb from pathname
function useBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const labels: Record<string, string> = {
    leads: "Leads",
    finder: "AI Lead Finder",
    database: "Lead Database",
    proposals: "Proposal Studio",
    outreach: "Outreach",
    email: "Email",
    whatsapp: "WhatsApp",
    campaigns: "Campaign Manager",
    responses: "Response Tracker",
    automation: "Workflow Automation",
    analytics: "Analytics",
    integrations: "Integrations",
    settings: "Settings",
  };

  return [
    { label: "Home", href: "/" },
    ...segments.map((seg, i) => ({
      label: labels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];
}

const typeEmoji: Record<string, string> = {
  lead_found: "🟢",
  email_opened: "💌",
  lead_replied: "💬",
  whatsapp_read: "📱",
  meeting_scheduled: "📅",
  proposal_accepted: "✅",
};

interface NotificationSectionProps {
  title: string;
  items: Notification[];
  markRead: (id: string) => void;
}

function NotificationSection({ title, items, markRead }: NotificationSectionProps) {
  if (!items.length) return null;
  return (
    <div>
      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </p>
      {items.map((n) => (
        <div
          key={n.id}
          onClick={() => markRead(n.id)}
          className={cn(
            "flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface)]",
            !n.read && "bg-blue-50/50"
          )}
        >
          <span className="text-xl flex-shrink-0 mt-0.5">{typeEmoji[n.type]}</span>
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium text-[var(--text-primary)]", !n.read && "font-semibold")}>
              {n.title}
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate-2 mt-0.5">
              {n.description}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {formatRelativeTime(n.time)}
            </p>
          </div>
          {!n.read && (
            <div className="h-2 w-2 mt-1.5 rounded-full bg-[var(--accent-blue)] flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// Notification panel
function NotificationPanel() {
  const { notifications, markAllRead, markRead } = useUIStore();
  const unread = notifications.filter((n) => !n.read);
  const today = notifications.filter((n) => {
    const d = new Date(n.time);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const older = notifications.filter((n) => {
    const d = new Date(n.time);
    const now = new Date();
    return d.toDateString() !== now.toDateString();
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed right-4 top-16 z-50 w-[400px] overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-lg)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Notifications</span>
          {unread.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-blue)] px-1.5 text-xs font-bold text-white">
              {unread.length}
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-medium text-[var(--accent-blue)] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[520px] overflow-y-auto">
        <NotificationSection title="Today" items={today} markRead={markRead} />
        <NotificationSection title="Earlier" items={older} markRead={markRead} />
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Header() {
  const breadcrumb = useBreadcrumb();
  const { notificationPanelOpen, toggleNotificationPanel, closeNotificationPanel, unreadCount } = useUIStore();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-notification-panel]")) {
        closeNotificationPanel();
      }
    };
    if (notificationPanelOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [notificationPanelOpen, closeNotificationPanel]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-white/80 backdrop-blur-xl px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[var(--text-muted)]">/</span>}
              {i === 0 ? (
                <Home className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              ) : i < breadcrumb.length - 1 ? (
                <span className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors">
                  {crumb.label}
                </span>
              ) : (
                <span className="font-semibold text-[var(--text-primary)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <button className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-muted)] transition-all hover:border-[var(--accent-blue)] hover:text-[var(--text-secondary)] w-44 text-left">
            <Search className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1">Search...</span>
            <kbd className="rounded border border-[var(--border)] bg-white px-1 py-0.5 text-[10px] font-mono text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>

          {/* Upgrade pill */}
          <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95">
            <Zap className="h-3 w-3" />
            Upgrade to Pro
          </button>

          {/* Notification bell */}
          <div data-notification-panel>
            <button
              id="notification-bell"
              onClick={toggleNotificationPanel}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text-secondary)] transition-all hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
              aria-label="Open notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse-dot">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User avatar */}
          <button className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 transition-all hover:bg-[var(--surface)]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[10px] font-bold text-white">
              AC
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Alex</span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </button>
        </div>
      </header>

      {/* Notification panel */}
      <AnimatePresence>
        {notificationPanelOpen && <NotificationPanel />}
      </AnimatePresence>
    </>
  );
}
