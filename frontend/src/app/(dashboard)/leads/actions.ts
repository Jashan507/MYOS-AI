"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import type { LeadStage, LeadSource } from "@prisma/client";

// Zod Schema for validation
const LeadInputSchema = z.object({
  company: z.string().min(1),
  website: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  companySize: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactTitle: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  painPoints: z.array(z.string()).default([]),
  icebreaker: z.string().nullable().optional(),
  outreachAngle: z.string().nullable().optional(),
  estimatedValue: z.string().nullable().optional(),
  leadScore: z.number().default(0),
  aiConfidence: z.number().default(0),
  stage: z.string().default("NEW"),
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  source: z.string().default("AI_FINDER"),
});

// Easiest CRUD: Get all leads for workspace
export async function getLeadsAction(workspaceId: string = "ws_1") {
  try {
    // Ensure default workspace exists
    await ensureWorkspaceExists(workspaceId);

    const leads = await db.lead.findMany({
      where: {
        workspaceId,
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert decimal value to number/string for client serialization
    return {
      success: true,
      leads: leads.map(l => ({
        ...l,
        dealValue: l.dealValue ? Number(l.dealValue) : null,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch leads";
    console.error("Error in getLeadsAction:", error);
    return { success: false, error: message };
  }
}

// Easiest CRUD: Save a single lead
export async function saveLeadAction(leadData: unknown, workspaceId: string = "ws_1") {
  try {
    const validated = LeadInputSchema.parse(leadData);
    await ensureWorkspaceExists(workspaceId);

    const lead = await db.lead.create({
      data: {
        workspaceId,
        company: validated.company,
        website: validated.website,
        industry: validated.industry,
        companySize: validated.companySize,
        country: validated.country,
        city: validated.city,
        contactName: validated.contactName,
        contactTitle: validated.contactTitle,
        email: validated.email,
        phone: validated.phone,
        whatsapp: validated.whatsapp,
        linkedin: validated.linkedin,
        painPoints: validated.painPoints,
        icebreaker: validated.icebreaker,
        outreachAngle: validated.outreachAngle,
        estimatedValue: validated.estimatedValue,
        leadScore: validated.leadScore,
        aiConfidence: validated.aiConfidence,
        stage: validated.stage as LeadStage,
        tags: validated.tags,
        notes: validated.notes,
        source: validated.source as LeadSource,
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        leadId: lead.id,
        type: "lead_created",
        description: `Lead created from ${validated.source}`,
      },
    });

    return {
      success: true,
      lead: {
        ...lead,
        dealValue: lead.dealValue ? Number(lead.dealValue) : null,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save lead";
    console.error("Error in saveLeadAction:", error);
    return { success: false, error: message };
  }
}

// Easiest CRUD: Update lead stage (e.g. Kanban drop)
export async function updateLeadStageAction(leadId: string, stage: string) {
  try {
    const lead = await db.lead.update({
      where: { id: leadId },
      data: {
        stage: stage as LeadStage,
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        leadId,
        type: "stage_changed",
        description: `Stage updated to ${stage.replace(/_/g, " ")}`,
      },
    });

    return {
      success: true,
      lead: {
        ...lead,
        dealValue: lead.dealValue ? Number(lead.dealValue) : null,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update lead stage";
    console.error("Error in updateLeadStageAction:", error);
    return { success: false, error: message };
  }
}

// Easiest CRUD: Update other lead details
export async function updateLeadAction(leadId: string, updates: Partial<z.infer<typeof LeadInputSchema>>) {
  try {
    const lead = await db.lead.update({
      where: { id: leadId },
      data: {
        ...updates,
        stage: updates.stage ? (updates.stage as LeadStage) : undefined,
        source: updates.source ? (updates.source as LeadSource) : undefined,
      },
    });

    return {
      success: true,
      lead: {
        ...lead,
        dealValue: lead.dealValue ? Number(lead.dealValue) : null,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update lead";
    console.error("Error in updateLeadAction:", error);
    return { success: false, error: message };
  }
}

// Easiest CRUD: Archive or Delete a lead
export async function removeLeadAction(leadId: string) {
  try {
    // Delete/Archive the lead
    await db.lead.update({
      where: { id: leadId },
      data: {
        isArchived: true,
      },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove lead";
    console.error("Error in removeLeadAction:", error);
    return { success: false, error: message };
  }
}

// Helper to make sure default workspace exists for initial development
async function ensureWorkspaceExists(workspaceId: string) {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    await db.workspace.create({
      data: {
        id: workspaceId,
        name: "My First Workspace",
        slug: "my-first-workspace",
      },
    });
  }
}
