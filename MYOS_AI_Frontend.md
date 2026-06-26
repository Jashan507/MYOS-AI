# MYOS AI — Frontend Development Prompt

> **Use this prompt with:** Cursor AI, Claude Code, v0.dev, Bolt, or any AI coding assistant.
> **Stack:** Next.js 15 · TypeScript · Tailwind CSS · Shadcn UI · Framer Motion · Recharts · Lucide Icons

---

## 🎯 PROJECT CONTEXT

You are building **MYOS AI** — a premium AI-powered Freelancer Operating System SaaS. This is the **frontend only** (UI, pages, components, animations). All API calls should be mocked with realistic dummy data. The product must look like a funded 2026 Silicon Valley startup — comparable to Linear, Stripe Dashboard, Vercel, Attio CRM, and Framer.

---

## 🏗️ TECH STACK

```
Framework:       Next.js 15 (App Router, Server Components)
Language:        TypeScript (strict mode)
Styling:         Tailwind CSS v4
UI Components:   Shadcn UI (latest)
Animations:      Framer Motion v11
Charts:          Recharts v2
Icons:           Lucide React
Fonts:           Geist Sans + Geist Mono (Vercel)
State:           Zustand
Forms:           React Hook Form + Zod
DnD:             @dnd-kit/core
```

---

## 🎨 DESIGN SYSTEM

### Theme — Light Mode Only

```
Background:      #FFFFFF (pure white)
Surface:         #F8F9FA (soft gray)
Surface 2:       #F1F3F5
Border:          #E9ECEF
Border Subtle:   #F1F3F5
Text Primary:    #0A0A0A
Text Secondary:  #6B7280
Text Muted:      #9CA3AF
Accent Blue:     #2563EB
Accent Purple:   #7C3AED
Accent Green:    #059669
Accent Pink:     #DB2777
Gradient 1:      linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Gradient 2:      linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
Gradient 3:      linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
Shadow SM:       0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
Shadow MD:       0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)
Shadow LG:       0 20px 60px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)
Border Radius:   8px (sm), 12px (md), 16px (lg), 24px (xl)
```

### Typography

```css
/* Headings */
font-family: 'Geist', sans-serif;
font-weight: 600–700;

/* Body */
font-family: 'Geist', sans-serif;
font-weight: 400–500;

/* Code / Mono */
font-family: 'Geist Mono', monospace;
```

### Glassmorphism Pattern

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```

---

## 📁 FOLDER STRUCTURE

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← Sidebar + Header wrapper
│   │   ├── page.tsx                ← Dashboard Home
│   │   ├── leads/
│   │   │   ├── finder/page.tsx     ← AI Lead Finder
│   │   │   └── database/page.tsx   ← Lead Database (CRM)
│   │   ├── proposals/page.tsx      ← AI Proposal Studio
│   │   ├── outreach/
│   │   │   ├── email/page.tsx      ← Email Outreach
│   │   │   └── whatsapp/page.tsx   ← WhatsApp Outreach
│   │   ├── campaigns/page.tsx      ← Campaign Manager
│   │   ├── responses/page.tsx      ← Response Tracker
│   │   ├── automation/page.tsx     ← Workflow Automation
│   │   ├── analytics/page.tsx      ← Analytics
│   │   ├── integrations/page.tsx   ← Integrations
│   │   └── settings/page.tsx       ← Settings
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── AIAssistant.tsx         ← Floating chat
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── HeroSection.tsx
│   ├── leads/
│   │   ├── LeadFinderForm.tsx
│   │   ├── LeadCard.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── LeadTable.tsx
│   │   └── PipelineView.tsx
│   ├── proposals/
│   │   ├── ProposalEditor.tsx
│   │   └── ProposalPreview.tsx
│   ├── outreach/
│   │   ├── EmailComposer.tsx
│   │   └── WhatsAppComposer.tsx
│   ├── campaigns/
│   │   ├── CampaignCard.tsx
│   │   └── AutomationFlow.tsx
│   ├── analytics/
│   │   └── AnalyticsDashboard.tsx
│   └── ui/                         ← Shadcn + custom primitives
│       ├── animated-counter.tsx
│       ├── gradient-badge.tsx
│       ├── skeleton-card.tsx
│       ├── ai-typing.tsx
│       ├── trend-indicator.tsx
│       └── mini-sparkline.tsx
├── lib/
│   ├── mock-data/
│   │   ├── leads.ts
│   │   ├── campaigns.ts
│   │   ├── analytics.ts
│   │   └── proposals.ts
│   ├── store/
│   │   ├── useLeadStore.ts
│   │   ├── useCampaignStore.ts
│   │   └── useUIStore.ts
│   └── utils.ts
└── styles/
    └── globals.css
```

---

## 🧩 COMPONENT SPECIFICATIONS

### 1. Sidebar (`components/layout/Sidebar.tsx`)

```
- Fixed left sidebar, 240px wide, floating with subtle shadow
- Logo: "MYOS AI" with gradient text + small sparkle icon
- Navigation items with icons (Lucide), active state with blue accent
- Collapse button at bottom
- User avatar + name at bottom with settings gear
- Smooth open/close animation with Framer Motion (layoutId)
- Hover: subtle background shift (#F1F3F5), slight icon scale

Nav items (icon + label):
  LayoutDashboard   → Dashboard
  Search            → AI Lead Finder
  Database          → Lead Database
  FileText          → Proposal Studio
  Mail              → Email Outreach
  MessageCircle     → WhatsApp Outreach
  Megaphone         → Campaign Manager
  MessageSquare     → Response Tracker
  Workflow          → Workflow Automation
  BarChart3         → Analytics
  Bot               → AI Assistant
  Plug              → Integrations
  Settings          → Settings
```

### 2. Header (`components/layout/Header.tsx`)

```
- Floating top bar with blur backdrop
- Breadcrumb navigation (current page)
- Search bar (Cmd+K shortcut) — opens command palette
- Notification bell with red dot + animated count badge
- "Upgrade to Pro" pill button (gradient)
- User avatar dropdown
```

### 3. KPI Card (`components/dashboard/KPICard.tsx`)

```typescript
interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;       // e.g. "$"
  suffix?: string;       // e.g. "%"
  trend: number;         // e.g. +12.5
  trendLabel: string;    // e.g. "vs last month"
  icon: LucideIcon;
  iconColor: string;
  sparklineData: number[];
}
```

```
- White card with soft shadow
- Animated count-up on mount (useCountUp hook)
- Trend pill: green (up) / red (down) with arrow icon
- Mini sparkline using Recharts (no axes, just the line)
- Hover: lift effect (translateY -2px) + stronger shadow
- Framer Motion: fade + slide up stagger (delay 0.05s between cards)
```

### 4. Lead Card (`components/leads/LeadCard.tsx`)

```
- Premium card with company logo placeholder (gradient initials)
- Company name + website domain badge
- Contact name + LinkedIn icon
- Email chip + WhatsApp chip (green)
- Lead Score: circular progress (0–100, color-coded)
- AI Confidence Score: linear bar
- Pain points: 2–3 colored tags
- Outreach angle: italic text excerpt
- Estimated value: "$X,XXX – $XX,XXX"
- Action buttons: Save | Email | WhatsApp | Proposal
- Hover: card scale(1.01) + deeper shadow
```

### 5. Kanban Board (`components/leads/KanbanBoard.tsx`)

```
- Full-width horizontal scroll kanban
- Columns: New Lead → Contact Ready → Email Sent → WhatsApp Sent 
          → Replied → Meeting Scheduled → Proposal Sent 
          → Negotiation → Won → Lost
- Drag & drop using @dnd-kit
- Won column: green accent, confetti on drop
- Lost column: red/gray accent
- Add lead button in each column
- Column count badge
- Smooth reorder animation
```

### 6. Automation Flow Builder (`components/campaigns/AutomationFlow.tsx`)

```
- Visual node canvas (SVG-based or react-flow lite)
- Nodes:
    Trigger Node:  "Lead Found" (blue)
    Action Node:   "Generate Proposal" (purple)
    Condition:     "Email Opened?" (yellow diamond)
    Delay:         "Wait 24 Hours" (gray)
    Action:        "Send Follow-up" (green)
    End:           "Create Meeting" (teal)
- Animated dashed lines connecting nodes
- Hover tooltip on each node
- Add node button (+) between steps
- Play / Pause / Save buttons
```

### 7. AI Assistant (`components/layout/AIAssistant.tsx`)

```
- Floating bottom-right button (gradient circle with Bot icon)
- Expands to a 380×520px glass panel
- Chat interface: user messages (right, blue) + AI messages (left, white)
- AI typing indicator: three bouncing dots
- Streaming text effect on AI responses
- Quick action chips: "Find Leads" | "Write Email" | "Generate Proposal"
- Input bar with send button + voice icon
- Framer Motion: spring animation expand/collapse
```

---

## 📊 DASHBOARD PAGE (`app/(dashboard)/page.tsx`)

```tsx
// Layout:
// Row 1: Hero greeting + AI status banner
// Row 2: 8 KPI cards (2-row grid, 4 per row)
// Row 3: Revenue Pipeline chart (60%) | Activity Feed (40%)
// Row 4: Email Performance (50%) | Lead Source Breakdown (50%)

// Hero Section:
<HeroSection>
  <h1>Welcome back, Alex 👋</h1>
  <p>Your AI Sales System generated 24 new leads today.</p>
  <StatusBadge>🟢 AI Running · 3 campaigns active</StatusBadge>
</HeroSection>

// KPI Cards Data:
const kpis = [
  { title: "Total Leads", value: 2847, trend: 18.2, icon: Users },
  { title: "Emails Sent", value: 12439, trend: 7.4, icon: Mail },
  { title: "WhatsApp Sent", value: 3621, trend: 22.1, icon: MessageCircle },
  { title: "Replies Received", value: 891, trend: -3.2, icon: MessageSquare },
  { title: "Positive Responses", value: 347, trend: 14.8, icon: ThumbsUp },
  { title: "Meetings Booked", value: 89, trend: 31.5, icon: Calendar },
  { title: "Proposal Accept Rate", value: 68, suffix: "%", trend: 5.1, icon: FileCheck },
  { title: "Revenue Pipeline", value: 284000, prefix: "$", trend: 42.3, icon: DollarSign },
]
```

---

## 🔍 AI LEAD FINDER PAGE (`app/(dashboard)/leads/finder/page.tsx`)

```
Layout:
  Left panel (35%): Search form with AI inputs
  Right panel (65%): Results grid

Search Form:
  - Industry dropdown (Tech, E-commerce, SaaS, Agency, Healthcare...)
  - Country + City selects
  - Business Type (B2B, B2C, Enterprise...)
  - Company Size (1–10, 11–50, 51–200, 200+)
  - Keywords input (comma-separated tags)
  - Technologies multiselect (React, Shopify, WordPress...)
  - [Find Leads with AI] button → gradient, with sparkle icon

Loading State:
  - "AI is scanning the web..." with animated radar/pulse
  - Skeleton cards sliding in

Results:
  - Grid of LeadCard components
  - Each card fades in with stagger delay
  - Total count badge: "47 leads found"
  - Bulk actions: Select All | Save All | Add to Campaign
```

**Mock AI Response Data (use this in your mock):**
```typescript
const mockLeads = [
  {
    id: "1",
    company: "TechFlow Solutions",
    website: "techflow.io",
    decisionMaker: "Sarah Chen",
    position: "CEO & Co-founder",
    email: "sarah@techflow.io",
    phone: "+1 415 555 0192",
    whatsapp: "+1 415 555 0192",
    linkedin: "linkedin.com/in/sarahchen",
    companySize: "11–50",
    painPoints: ["Slow lead gen", "Manual outreach", "No CRM"],
    icebreaker: "Noticed TechFlow recently expanded to enterprise...",
    outreachAngle: "Show ROI of AI automation vs manual SDR",
    estimatedValue: "$8,000 – $15,000",
    leadScore: 92,
    aiConfidence: 88,
  },
  // ... 10+ more
]
```

---

## 📝 PROPOSAL STUDIO PAGE (`app/(dashboard)/proposals/page.tsx`)

```
Layout:
  Left panel (40%): Input form
  Right panel (60%): Live document preview

Input Form:
  - Lead selector (searchable dropdown)
  - Project type (Web Dev, App, Design, Marketing...)
  - Budget range slider ($1K – $100K+)
  - Timeline picker
  - Special requirements textarea
  - [Generate AI Proposal] button

Document Preview:
  - Looks like a real premium PDF document in browser
  - Sections animate in one by one (typewriter-style)
  - Company logo placeholder at top
  - Section headings in deep blue
  - Clean serif-ish document typography
  - Pricing table with highlighted recommended package

Actions toolbar (sticky):
  Edit | Export PDF | Download DOCX | Copy Link | Share
```

---

## 📈 ANALYTICS PAGE (`app/(dashboard)/analytics/page.tsx`)

```
Layout:
  Row 1: Date range picker + filters + Export button
  Row 2: 4 metric pills (quick stats)
  Row 3: Leads Over Time (area chart, full width)
  Row 4: Email Performance (bar) | Reply Rate (line) | Conversion Funnel (horizontal bar)
  Row 5: Top Performing Campaigns table
  Row 6: AI Insights panel (3 insight cards with bulb icon)

Charts (all Recharts):
  - All charts must have custom tooltips
  - Gradient fills on area charts
  - Animated on mount (isAnimationActive)
  - Colors match design system
```

---

## ⚡ ANIMATIONS SPEC

### Global Framer Motion Variants

```typescript
// Page enter
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8 }
}

// Card stagger container
export const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } }
}

// Individual card
export const cardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }
}

// Hover lift
export const hoverLift = {
  whileHover: { y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }
}
```

### Required Animations by Component

| Component | Animation |
|-----------|-----------|
| KPI Cards | Count-up + stagger fade-in |
| Lead Cards | Stagger slide-up from bottom |
| Sidebar items | Stagger on mount |
| AI Assistant | Spring expand from corner |
| Charts | Recharts built-in animate |
| Kanban columns | Slide-in left to right |
| Notifications | Slide-in from right |
| Modals | Scale + fade |
| Page transitions | Fade + slight translate-y |
| Gradient badges | Subtle shimmer animation |
| Loading states | Pulse skeleton |

---

## 🔔 NOTIFICATION CENTER

```
- Triggered by bell icon in header
- Slides in from right (400px wide panel)
- Grouped by: Today | Yesterday | Earlier
- Notification types with icons + colors:
    🟢 Lead Found (green)
    💌 Email Opened (blue)
    💬 Lead Replied (purple)
    📱 WhatsApp Read (teal)
    📅 Meeting Scheduled (orange)
    ✅ Proposal Accepted (green)
- Each item: icon + title + description + time ago
- "Mark all as read" button
- Unread count badge on bell (animated red dot)
```

---

## 🔐 AUTH PAGES

```
Login/Signup:
  - Centered card on subtle gradient background
  - MYOS AI logo + tagline
  - Google OAuth button (branded)
  - GitHub OAuth button
  - Email + password form
  - "Remember me" checkbox
  - Animated gradient border on the card
  - Subtle floating shapes in background (decorative)
```

---

## 📱 RESPONSIVE BEHAVIOR

```
≥1280px:  Full sidebar + all columns
1024–1279: Collapsible sidebar (icon-only mode)
768–1023:  Mobile sidebar (drawer, overlay)
<768px:    Bottom nav bar, stacked layouts
```

---

## 🚀 IMPLEMENTATION INSTRUCTIONS

1. **Start with** `app/(dashboard)/layout.tsx` — build Sidebar + Header first
2. **Then** `app/(dashboard)/page.tsx` — Dashboard with all KPI cards + charts
3. **Then** `leads/finder/page.tsx` — AI Lead Finder (most important feature)
4. **Then** `leads/database/page.tsx` — Kanban + Table views
5. **Then** remaining pages in order of complexity

**Rules:**
- All API calls → return mock data from `lib/mock-data/`
- Use `'use client'` only where needed (interactivity)
- Never use inline styles — Tailwind only
- Every loading state must use skeleton loaders
- Every empty state must have a meaningful illustration/message
- All forms must have Zod validation
- Console.log only in development (`process.env.NODE_ENV`)

---

## ✅ QUALITY CHECKLIST

Before considering any page complete, verify:

- [ ] Framer Motion animations on enter
- [ ] Hover states on all interactive elements
- [ ] Skeleton loading state
- [ ] Empty state with illustration
- [ ] Mobile responsive layout
- [ ] TypeScript: zero `any` types
- [ ] All Tailwind — no inline styles
- [ ] Lucide icons (not emoji) for UI elements
- [ ] Consistent spacing (use Tailwind scale: 4, 6, 8, 12, 16, 24)
- [ ] Soft shadows on cards
- [ ] Page title in `<title>` tag via metadata
