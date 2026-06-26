# MYOS AI — Backend Development Prompt

> **Use this prompt with:** Cursor AI, Claude Code, or any AI coding assistant.
> **Stack:** Next.js 15 Server Actions · TypeScript · Prisma ORM · PostgreSQL · Better Auth · OpenAI · Resend · WhatsApp Business API

---

## 🎯 PROJECT CONTEXT

You are building the **backend** for **MYOS AI** — a premium AI-powered Freelancer Operating System SaaS. This includes the database schema, API routes, server actions, authentication, AI integrations, and all third-party service connections.

---

## 🏗️ TECH STACK

```
Runtime:         Node.js 20+ (Next.js 15 App Router)
Language:        TypeScript (strict mode)
ORM:             Prisma ORM 6
Database:        PostgreSQL 16 (Supabase or Neon recommended)
Auth:            Better Auth (better-auth.com)
Email:           Resend API
AI:              OpenAI GPT-4o + Anthropic Claude Sonnet
WhatsApp:        WhatsApp Business Cloud API (Meta)
Background Jobs: Inngest (serverless queues)
File Storage:    AWS S3 / Cloudflare R2
Rate Limiting:   Upstash Redis
Validation:      Zod
Payments:        Stripe
```

---

## 🗄️ DATABASE SCHEMA (Prisma)

Create `prisma/schema.prisma` with the following complete schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── AUTH ─────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  role          UserRole  @default(FREELANCER)
  plan          PlanType  @default(FREE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  workspaces    WorkspaceMember[]
  sessions      Session[]
  accounts      Account[]

  @@map("users")
}

model Session {
  id        String   @id
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  accessToken       String? @db.Text
  refreshToken      String? @db.Text
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// ─── WORKSPACE ────────────────────────────────────────

model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  logo      String?
  plan      PlanType @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members     WorkspaceMember[]
  leads       Lead[]
  campaigns   Campaign[]
  proposals   Proposal[]
  templates   EmailTemplate[]
  integrations Integration[]
  aiSettings  AISettings?

  @@map("workspaces")
}

model WorkspaceMember {
  id          String          @id @default(cuid())
  workspaceId String
  userId      String
  role        WorkspaceRole   @default(MEMBER)
  joinedAt    DateTime        @default(now())

  workspace   Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@map("workspace_members")
}

// ─── LEADS ────────────────────────────────────────────

model Lead {
  id                String        @id @default(cuid())
  workspaceId       String
  company           String
  website           String?
  industry          String?
  companySize       String?
  country           String?
  city              String?
  
  // Contact
  contactName       String?
  contactTitle      String?
  email             String?
  phone             String?
  whatsapp          String?
  linkedin          String?

  // AI Generated
  painPoints        String[]
  icebreaker        String?       @db.Text
  outreachAngle     String?       @db.Text
  estimatedValue    String?
  leadScore         Int           @default(0)
  aiConfidence      Int           @default(0)

  // Pipeline
  stage             LeadStage     @default(NEW)
  tags              String[]
  notes             String?       @db.Text
  dealValue         Decimal?      @db.Decimal(12, 2)
  
  // Metadata
  source            LeadSource    @default(AI_FINDER)
  isArchived        Boolean       @default(false)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  workspace         Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  emails            EmailLog[]
  whatsappLogs      WhatsAppLog[]
  proposals         Proposal[]
  activities        Activity[]
  campaignLeads     CampaignLead[]

  @@index([workspaceId, stage])
  @@index([workspaceId, createdAt])
  @@map("leads")
}

// ─── PROPOSALS ────────────────────────────────────────

model Proposal {
  id            String          @id @default(cuid())
  workspaceId   String
  leadId        String?
  title         String
  status        ProposalStatus  @default(DRAFT)
  
  // Input
  projectType   String?
  budget        String?
  timeline      String?
  requirements  String?         @db.Text
  
  // AI Generated Content (JSON)
  content       Json?           // Full proposal sections
  
  // Sharing
  shareToken    String?         @unique @default(cuid())
  isPublic      Boolean         @default(false)
  viewCount     Int             @default(0)
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  expiresAt     DateTime?

  workspace     Workspace       @relation(fields: [workspaceId], references: [id])
  lead          Lead?           @relation(fields: [leadId], references: [id])

  @@map("proposals")
}

// ─── CAMPAIGNS ────────────────────────────────────────

model Campaign {
  id            String          @id @default(cuid())
  workspaceId   String
  name          String
  type          CampaignType    @default(EMAIL)
  status        CampaignStatus  @default(DRAFT)
  
  // Config (JSON: schedule, delays, conditions)
  config        Json            @default("{}")
  
  // Stats (denormalized for performance)
  totalLeads    Int             @default(0)
  emailsSent    Int             @default(0)
  opens         Int             @default(0)
  clicks        Int             @default(0)
  replies       Int             @default(0)
  conversions   Int             @default(0)
  
  scheduledAt   DateTime?
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  workspace     Workspace       @relation(fields: [workspaceId], references: [id])
  leads         CampaignLead[]
  emails        EmailLog[]
  automationSteps AutomationStep[]

  @@index([workspaceId, status])
  @@map("campaigns")
}

model CampaignLead {
  id          String    @id @default(cuid())
  campaignId  String
  leadId      String
  status      String    @default("pending")
  addedAt     DateTime  @default(now())

  campaign    Campaign  @relation(fields: [campaignId], references: [id])
  lead        Lead      @relation(fields: [leadId], references: [id])

  @@unique([campaignId, leadId])
  @@map("campaign_leads")
}

// ─── AUTOMATION ────────────────────────────────────────

model AutomationStep {
  id          String    @id @default(cuid())
  campaignId  String
  type        String    // trigger | action | condition | delay
  name        String
  config      Json      @default("{}")
  order       Int
  
  campaign    Campaign  @relation(fields: [campaignId], references: [id])

  @@map("automation_steps")
}

// ─── EMAIL LOGS ────────────────────────────────────────

model EmailLog {
  id          String      @id @default(cuid())
  workspaceId String
  leadId      String?
  campaignId  String?
  
  to          String
  subject     String
  body        String      @db.Text
  
  status      EmailStatus @default(PENDING)
  resendId    String?     // Resend message ID for tracking
  
  openedAt    DateTime?
  clickedAt   DateTime?
  repliedAt   DateTime?
  bouncedAt   DateTime?
  
  sentAt      DateTime?
  createdAt   DateTime    @default(now())

  lead        Lead?       @relation(fields: [leadId], references: [id])
  campaign    Campaign?   @relation(fields: [campaignId], references: [id])

  @@index([leadId])
  @@index([campaignId])
  @@map("email_logs")
}

// ─── WHATSAPP LOGS ─────────────────────────────────────

model WhatsAppLog {
  id          String    @id @default(cuid())
  leadId      String
  to          String
  message     String    @db.Text
  type        String    @default("text") // text | template | media
  
  waMessageId String?   // Meta's message ID
  status      String    @default("pending") // sent | delivered | read | failed
  
  deliveredAt DateTime?
  readAt      DateTime?
  repliedAt   DateTime?
  
  sentAt      DateTime?
  createdAt   DateTime  @default(now())

  lead        Lead      @relation(fields: [leadId], references: [id])

  @@map("whatsapp_logs")
}

// ─── EMAIL TEMPLATES ────────────────────────────────────

model EmailTemplate {
  id          String    @id @default(cuid())
  workspaceId String
  name        String
  subject     String
  body        String    @db.Text
  variables   String[]  // e.g. ["{{firstName}}", "{{company}}"]
  type        String    @default("cold_email") // cold_email | follow_up | proposal
  isDefault   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@map("email_templates")
}

// ─── ACTIVITY LOG ──────────────────────────────────────

model Activity {
  id          String    @id @default(cuid())
  leadId      String
  type        String    // email_sent | email_opened | whatsapp_sent | replied | stage_changed | note_added
  description String
  metadata    Json      @default("{}")
  createdAt   DateTime  @default(now())

  lead        Lead      @relation(fields: [leadId], references: [id])

  @@index([leadId, createdAt])
  @@map("activities")
}

// ─── INTEGRATIONS ──────────────────────────────────────

model Integration {
  id          String    @id @default(cuid())
  workspaceId String
  provider    String    // gmail | outlook | whatsapp | linkedin | apollo | stripe
  status      String    @default("disconnected") // connected | disconnected | error
  config      Json      @default("{}") // encrypted tokens + settings
  connectedAt DateTime?
  updatedAt   DateTime  @updatedAt

  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([workspaceId, provider])
  @@map("integrations")
}

// ─── AI SETTINGS ───────────────────────────────────────

model AISettings {
  id                String    @id @default(cuid())
  workspaceId       String    @unique
  provider          String    @default("openai") // openai | anthropic
  model             String    @default("gpt-4o")
  temperature       Float     @default(0.7)
  customApiKey      String?   // User's own key
  leadFinderPrompt  String?   @db.Text
  emailTone         String    @default("professional") // professional | casual | friendly
  proposalStyle     String    @default("detailed")
  
  workspace         Workspace @relation(fields: [workspaceId], references: [id])

  @@map("ai_settings")
}

// ─── ENUMS ─────────────────────────────────────────────

enum UserRole {
  ADMIN
  FREELANCER
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
}

enum PlanType {
  FREE
  STARTER
  PRO
  AGENCY
}

enum LeadStage {
  NEW
  CONTACT_READY
  EMAIL_SENT
  WHATSAPP_SENT
  REPLIED
  MEETING_SCHEDULED
  PROPOSAL_SENT
  NEGOTIATION
  WON
  LOST
}

enum LeadSource {
  AI_FINDER
  MANUAL
  IMPORT
  API
  REFERRAL
}

enum ProposalStatus {
  DRAFT
  SENT
  VIEWED
  ACCEPTED
  REJECTED
  EXPIRED
}

enum CampaignType {
  EMAIL
  WHATSAPP
  COMBINED
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  REPLIED
  BOUNCED
  FAILED
}
```

---

## 📁 FOLDER STRUCTURE

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts      ← Better Auth handler
│   │   ├── webhooks/
│   │   │   ├── resend/route.ts         ← Email event webhooks
│   │   │   ├── whatsapp/route.ts       ← WA webhook receiver
│   │   │   └── stripe/route.ts         ← Payment webhooks
│   │   └── ai/
│   │       ├── stream/route.ts         ← Streaming AI responses
│   │       └── analyze/route.ts        ← Lead analysis
│   └── (dashboard)/
│       └── */
│           └── actions.ts              ← Server Actions per page
├── lib/
│   ├── db.ts                           ← Prisma singleton
│   ├── auth.ts                         ← Better Auth config
│   ├── ai/
│   │   ├── openai.ts                   ← OpenAI client
│   │   ├── prompts.ts                  ← All AI prompts
│   │   ├── lead-finder.ts              ← Lead generation AI
│   │   ├── proposal-generator.ts       ← Proposal AI
│   │   ├── email-writer.ts             ← Email AI
│   │   └── whatsapp-writer.ts          ← WhatsApp AI
│   ├── email/
│   │   └── resend.ts                   ← Resend client
│   ├── whatsapp/
│   │   └── meta.ts                     ← WhatsApp Business API
│   ├── payments/
│   │   └── stripe.ts                   ← Stripe client
│   ├── redis.ts                        ← Upstash Redis
│   └── validations/
│       ├── lead.ts
│       ├── campaign.ts
│       └── proposal.ts
└── inngest/
    ├── client.ts
    └── functions/
        ├── process-campaign.ts
        ├── send-email-sequence.ts
        └── ai-lead-enrichment.ts
```

---

## 🔐 AUTHENTICATION (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "MYOS AI <noreply@myos.ai>",
        to: user.email,
        subject: "Reset your password",
        html: `<a href="${url}">Reset Password</a>`,
      });
    },
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
});
```

---

## 🤖 AI INTEGRATIONS (`lib/ai/`)

### OpenAI Client (`lib/ai/openai.ts`)

```typescript
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### All AI Prompts (`lib/ai/prompts.ts`)

```typescript
export const PROMPTS = {

  LEAD_FINDER: `You are an expert B2B lead researcher with access to company databases.
Given the following search criteria, generate realistic and detailed lead data.
Return ONLY a valid JSON array of leads. No markdown. No explanation.

Criteria: {criteria}

For each lead generate:
{
  "company": "string",
  "website": "string",
  "industry": "string",
  "companySize": "string",
  "country": "string",
  "city": "string",
  "contactName": "string",
  "contactTitle": "string",
  "email": "string (professional email)",
  "phone": "string",
  "whatsapp": "string",
  "linkedin": "string (linkedin.com/in/...)",
  "painPoints": ["string", "string", "string"],
  "icebreaker": "string (one specific personalized sentence)",
  "outreachAngle": "string (why they need the user's service)",
  "estimatedValue": "string (e.g. $5,000 – $15,000)",
  "leadScore": number (0–100),
  "aiConfidence": number (0–100)
}

Generate {count} leads. Make them varied, realistic, and highly relevant.`,


  PROPOSAL_GENERATOR: `You are a world-class freelance proposal writer.
Create a highly personalized, professional proposal for:

Lead: {leadData}
Project Type: {projectType}
Budget: {budget}
Timeline: {timeline}
Requirements: {requirements}

Return ONLY a valid JSON object with this exact structure:
{
  "title": "string",
  "introduction": "string (2-3 paragraphs, mention company by name)",
  "problemAnalysis": "string (their specific pain points)",
  "proposedSolution": "string (your approach)",
  "scopeOfWork": ["string", ...],
  "deliverables": ["string", ...],
  "timeline": [{"phase": "string", "duration": "string", "tasks": ["string"]}],
  "pricing": {
    "packages": [
      {"name": "Starter", "price": number, "features": ["string"]},
      {"name": "Professional", "price": number, "features": ["string"], "recommended": true},
      {"name": "Enterprise", "price": number, "features": ["string"]}
    ]
  },
  "milestones": [{"name": "string", "percentage": number, "amount": number}],
  "technologies": ["string"],
  "terms": ["string"],
  "closing": "string (compelling CTA)"
}`,


  EMAIL_WRITER: `You are an elite cold email copywriter. Write a personalized cold email.

Lead: {leadData}
Sender Service: {service}
Email Tone: {tone}

Return ONLY a valid JSON object:
{
  "subject": "string (compelling, <60 chars)",
  "body": "string (plain text, 4–6 short paragraphs)",
  "followUp1": "string (3 days later)",
  "followUp2": "string (7 days later)",
  "followUp3": "string (14 days — breakup email)"
}

Rules:
- Open with a specific compliment about their company
- ONE clear pain point
- ONE specific value proposition (with a number/result)
- ONE soft CTA (15-minute call, not "buy now")
- Under 150 words for the first email
- Sound human, not robotic`,


  WHATSAPP_WRITER: `You are an expert at WhatsApp business outreach.
Write natural, conversational WhatsApp messages for:

Lead: {leadData}
Service: {service}

Return ONLY a valid JSON object:
{
  "firstMessage": "string (casual intro, under 100 words, no hard sell)",
  "followUp": "string (2 days later, add value)",
  "reminder": "string (5 days later, soft)",
  "closingMessage": "string (10 days later, polite exit)"
}

Rules:
- WhatsApp is personal — be conversational
- Use their first name
- No formal language
- Include a question to encourage response
- Mention one specific thing about their business`,


  SENTIMENT_ANALYZER: `Analyze this email/WhatsApp reply and return sentiment data.

Reply: "{reply}"

Return ONLY valid JSON:
{
  "sentiment": "positive" | "neutral" | "negative",
  "interestLevel": number (0–100),
  "intent": "interested" | "objection" | "not_interested" | "question" | "request_info",
  "nextAction": "string (recommended next step)",
  "bestFollowUpTime": "string (e.g. Tomorrow 10am)",
  "closingProbability": number (0–100),
  "summary": "string (one sentence)"
}`,
};
```

### Lead Finder Action (`lib/ai/lead-finder.ts`)

```typescript
import { openai } from "./openai";
import { PROMPTS } from "./prompts";

interface LeadSearchCriteria {
  industry: string;
  country: string;
  city?: string;
  businessType?: string;
  companySize?: string;
  keywords?: string;
  technologies?: string[];
  count?: number;
}

export async function findLeadsWithAI(criteria: LeadSearchCriteria) {
  const prompt = PROMPTS.LEAD_FINDER
    .replace("{criteria}", JSON.stringify(criteria))
    .replace("{count}", String(criteria.count || 10));

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No AI response");

  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.leads ?? [];
}
```

---

## ⚡ SERVER ACTIONS

### Lead Finder Actions (`app/(dashboard)/leads/finder/actions.ts`)

```typescript
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { findLeadsWithAI } from "@/lib/ai/lead-finder";
import { z } from "zod";

const LeadSearchSchema = z.object({
  industry: z.string().min(1),
  country: z.string().min(1),
  city: z.string().optional(),
  businessType: z.string().optional(),
  companySize: z.string().optional(),
  keywords: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  count: z.number().min(1).max(50).default(10),
});

export async function searchLeadsAction(formData: unknown) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: ... });
  if (!session) throw new Error("Unauthorized");

  // 2. Validate
  const input = LeadSearchSchema.parse(formData);

  // 3. Rate limit check (Upstash Redis)
  const limited = await checkRateLimit(session.user.id, "lead_search", 10, 3600);
  if (limited) throw new Error("Rate limit exceeded. Try again in an hour.");

  // 4. Call AI
  const leads = await findLeadsWithAI(input);

  // 5. Return (don't save yet — user chooses which to save)
  return { success: true, leads, count: leads.length };
}

export async function saveLeadAction(leadData: unknown, workspaceId: string) {
  const session = await auth.api.getSession({ headers: ... });
  if (!session) throw new Error("Unauthorized");

  const lead = await db.lead.create({
    data: {
      workspaceId,
      ...leadData,
      source: "AI_FINDER",
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      leadId: lead.id,
      type: "lead_created",
      description: `Lead created from AI Finder`,
    },
  });

  return { success: true, lead };
}
```

### Proposal Actions (`app/(dashboard)/proposals/actions.ts`)

```typescript
"use server";

import { generateProposal } from "@/lib/ai/proposal-generator";

export async function generateProposalAction(input: ProposalInput) {
  const session = await requireAuth();
  
  // Generate with AI
  const proposalContent = await generateProposal(input);

  // Save to DB
  const proposal = await db.proposal.create({
    data: {
      workspaceId: input.workspaceId,
      leadId: input.leadId,
      title: proposalContent.title,
      content: proposalContent,
      projectType: input.projectType,
      budget: input.budget,
      timeline: input.timeline,
      requirements: input.requirements,
      shareToken: generateShareToken(),
    },
  });

  return { success: true, proposal };
}
```

---

## 📧 EMAIL SERVICE (`lib/email/resend.ts`)

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendColdEmail({
  to,
  subject,
  body,
  leadId,
  campaignId,
  workspaceId,
}: SendEmailOptions) {
  // 1. Personalize body
  const personalized = body
    .replace("{{firstName}}", lead.contactName?.split(" ")[0] ?? "there")
    .replace("{{company}}", lead.company);

  // 2. Send via Resend
  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text: personalized,
    headers: {
      "X-Lead-ID": leadId,
      "X-Campaign-ID": campaignId ?? "",
    },
  });

  if (error) throw new Error(error.message);

  // 3. Log to DB
  await db.emailLog.create({
    data: {
      workspaceId,
      leadId,
      campaignId,
      to,
      subject,
      body: personalized,
      status: "SENT",
      resendId: data?.id,
      sentAt: new Date(),
    },
  });

  // 4. Update lead stage if first contact
  await db.lead.update({
    where: { id: leadId },
    data: { stage: "EMAIL_SENT" },
  });

  return { success: true, messageId: data?.id };
}
```

### Resend Webhook (`app/api/webhooks/resend/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  
  // Verify webhook signature
  const signature = req.headers.get("svix-signature");
  // ... verify with Resend's Svix secret

  const { type, data } = payload;
  const resendId = data.email_id;

  const emailLog = await db.emailLog.findFirst({
    where: { resendId },
  });

  if (!emailLog) return NextResponse.json({ ok: true });

  switch (type) {
    case "email.opened":
      await db.emailLog.update({
        where: { id: emailLog.id },
        data: { status: "OPENED", openedAt: new Date() },
      });
      break;
    case "email.clicked":
      await db.emailLog.update({
        where: { id: emailLog.id },
        data: { status: "CLICKED", clickedAt: new Date() },
      });
      break;
    case "email.bounced":
      await db.emailLog.update({
        where: { id: emailLog.id },
        data: { status: "BOUNCED", bouncedAt: new Date() },
      });
      break;
  }

  return NextResponse.json({ ok: true });
}
```

---

## 📱 WHATSAPP API (`lib/whatsapp/meta.ts`)

```typescript
const WA_API = "https://graph.facebook.com/v20.0";

export async function sendWhatsAppMessage({
  to,
  message,
  phoneNumberId,
  accessToken,
}: WhatsAppSendOptions) {
  const response = await fetch(
    `${WA_API}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""), // digits only
        type: "text",
        text: { body: message },
      }),
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message ?? "WhatsApp send failed");
  }

  return { messageId: data.messages?.[0]?.id };
}
```

### WhatsApp Webhook (`app/api/webhooks/whatsapp/route.ts`)

```typescript
// GET: verify webhook
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST: receive messages
export async function POST(req: NextRequest) {
  const payload = await req.json();
  
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];
      
      for (const msg of messages) {
        if (msg.type === "text") {
          // Find lead by phone number
          const lead = await db.lead.findFirst({
            where: { whatsapp: msg.from },
          });

          if (lead) {
            // Log the reply
            await db.whatsAppLog.create({
              data: {
                leadId: lead.id,
                to: msg.from,
                message: msg.text.body,
                status: "replied",
                waMessageId: msg.id,
              },
            });

            // Update lead stage
            await db.lead.update({
              where: { id: lead.id },
              data: { stage: "REPLIED", updatedAt: new Date() },
            });
          }
        }
        
        // Handle status updates (delivered, read)
        const statuses = change.value?.statuses ?? [];
        for (const status of statuses) {
          await db.whatsAppLog.updateMany({
            where: { waMessageId: status.id },
            data: {
              status: status.status,
              ...(status.status === "delivered" && { deliveredAt: new Date() }),
              ...(status.status === "read" && { readAt: new Date() }),
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
```

---

## 📊 ANALYTICS API (`app/api/analytics/route.ts`)

```typescript
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId")!;
  const range = searchParams.get("range") ?? "30d";

  const startDate = getStartDate(range); // 7d | 30d | 90d | 1y

  const [
    totalLeads,
    leadsByStage,
    emailStats,
    whatsappStats,
    proposalStats,
    leadsOverTime,
  ] = await Promise.all([
    db.lead.count({ where: { workspaceId } }),
    
    db.lead.groupBy({
      by: ["stage"],
      where: { workspaceId },
      _count: true,
    }),
    
    db.emailLog.aggregate({
      where: { workspaceId, createdAt: { gte: startDate } },
      _count: { _all: true },
      _sum: { opens: true, clicks: true, replies: true },
    }),
    
    db.whatsAppLog.groupBy({
      by: ["status"],
      where: { lead: { workspaceId }, createdAt: { gte: startDate } },
      _count: true,
    }),
    
    db.proposal.groupBy({
      by: ["status"],
      where: { workspaceId, createdAt: { gte: startDate } },
      _count: true,
    }),
    
    // Daily lead count for chart
    db.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM leads
      WHERE workspace_id = ${workspaceId}
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
  ]);

  return NextResponse.json({
    totalLeads,
    leadsByStage,
    emailStats,
    whatsappStats,
    proposalStats,
    leadsOverTime,
  });
}
```

---

## 🔄 BACKGROUND JOBS (Inngest)

### Campaign Processor (`inngest/functions/process-campaign.ts`)

```typescript
import { inngest } from "@/inngest/client";

export const processCampaign = inngest.createFunction(
  { id: "process-campaign" },
  { event: "campaign/start" },
  async ({ event, step }) => {
    const { campaignId } = event.data;

    const campaign = await step.run("fetch-campaign", async () => {
      return db.campaign.findUnique({
        where: { id: campaignId },
        include: { leads: { include: { lead: true } } },
      });
    });

    // Process each lead with delay
    for (const campaignLead of campaign.leads) {
      await step.sleep("rate-limit-delay", "2s");
      
      await step.run(`email-lead-${campaignLead.leadId}`, async () => {
        const email = await generateEmailForLead(campaignLead.lead);
        await sendColdEmail({ ...email, leadId: campaignLead.leadId, campaignId });
      });
    }

    // Schedule follow-ups
    await step.sleepUntil("follow-up-delay", addDays(new Date(), 3));
    await step.run("send-followups", async () => {
      // Send follow-up emails to non-replied leads
    });
  }
);
```

---

## 🌐 ENVIRONMENT VARIABLES (`.env.example`)

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# AI
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="hello@myos.ai"
RESEND_WEBHOOK_SECRET="..."

# WhatsApp (Meta)
META_ACCESS_TOKEN="..."
META_PHONE_NUMBER_ID="..."
WA_VERIFY_TOKEN="your-custom-verify-token"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Storage
S3_BUCKET="..."
S3_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# Inngest
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📋 API REFERENCE TABLE

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...all]` | ALL | Better Auth handler |
| `/api/webhooks/resend` | POST | Email event tracking |
| `/api/webhooks/whatsapp` | GET/POST | WA verification + inbox |
| `/api/webhooks/stripe` | POST | Payment events |
| `/api/ai/stream` | POST | Streaming AI (chat assistant) |
| `/api/analytics` | GET | Dashboard analytics |
| Server Action: `searchLeadsAction` | — | AI lead generation |
| Server Action: `saveLeadAction` | — | Save lead to DB |
| Server Action: `generateProposalAction` | — | AI proposal gen |
| Server Action: `sendEmailAction` | — | Send cold email |
| Server Action: `sendWhatsAppAction` | — | Send WA message |
| Server Action: `createCampaignAction` | — | Create + schedule campaign |
| Server Action: `updateLeadStageAction` | — | Drag-drop pipeline update |

---

## ✅ BACKEND CHECKLIST

- [ ] Prisma schema applied (`npx prisma db push`)
- [ ] Better Auth configured with Google + GitHub + email
- [ ] All Server Actions have auth checks first
- [ ] Rate limiting on AI endpoints (Redis)
- [ ] Resend webhook signature verification
- [ ] WhatsApp webhook GET verification handler
- [ ] Stripe webhook signature verification
- [ ] All secrets via environment variables (never hardcoded)
- [ ] Input validation with Zod on every action
- [ ] Error handling: try/catch on all external API calls
- [ ] Background jobs for campaign processing (Inngest)
- [ ] Prisma query optimization (select only needed fields)
- [ ] TypeScript: zero `any` types
- [ ] API responses consistent `{ success: boolean, data?: T, error?: string }`
```
