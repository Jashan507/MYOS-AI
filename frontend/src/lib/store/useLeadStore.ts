"use client";

import { create } from "zustand";
import { mockLeads } from "@/lib/mock-data/leads";
import type { Lead, LeadStage } from "@/lib/types";
import {
  getLeadsAction,
  saveLeadAction,
  updateLeadStageAction,
  updateLeadAction,
  removeLeadAction,
} from "@/app/(dashboard)/leads/actions";

export type ViewMode = "kanban" | "table";

interface LeadFilters {
  stage?: LeadStage;
  source?: string;
  search?: string;
  tags?: string[];
}

interface LeadStore {
  // State
  leads: Lead[];
  selectedLeadIds: string[];
  viewMode: ViewMode;
  filters: LeadFilters;
  isSearching: boolean;
  searchResults: Lead[];

  // Actions
  fetchLeads: () => Promise<void>;
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  updateLeadStage: (id: string, stage: LeadStage) => Promise<void>;
  removeLead: (id: string) => Promise<void>;
  selectLead: (id: string) => void;
  deselectLead: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  setFilter: (filters: Partial<LeadFilters>) => void;
  clearFilters: () => void;
  setSearching: (value: boolean) => void;
  setSearchResults: (leads: Lead[]) => void;
  getLeadsByStage: (stage: LeadStage) => Lead[];
  filteredLeads: () => Lead[];
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  selectedLeadIds: [],
  viewMode: "kanban",
  filters: {},
  isSearching: false,
  searchResults: [],

  fetchLeads: async () => {
    try {
      const res = await getLeadsAction();
      if (res.success && res.leads) {
        if (res.leads.length === 0) {
          // Empty DB -> Populate with mock data for local testing
          set({ leads: mockLeads });
          // Background seeding
          for (const ml of mockLeads) {
            await saveLeadAction(ml);
          }
          // Fetch again to update state with real DB records
          const updated = await getLeadsAction();
          if (updated.success && updated.leads && updated.leads.length > 0) {
            set({ leads: updated.leads as Lead[] });
          }
        } else {
          set({ leads: res.leads as Lead[] });
        }
      } else {
        // Fallback on action failure
        set({ leads: mockLeads });
      }
    } catch (error) {
      console.error("Database connection failed, falling back to mock leads:", error);
      set({ leads: mockLeads });
    }
  },

  setLeads: (leads) => set({ leads }),

  addLead: async (lead) => {
    // Optimistic update
    set((state) => {
      if (state.leads.some((l) => l.id === lead.id)) {
        return state;
      }
      return { leads: [lead, ...state.leads] };
    });
    try {
      const res = await saveLeadAction(lead);
      if (res.success && res.lead) {
        // Sync with DB lead (which has DB-generated id, etc.)
        set((state) => ({
          leads: state.leads.map((l) => (l.id === lead.id ? (res.lead as Lead) : l)),
        }));
      }
    } catch (err) {
      console.error("Failed to save lead in database:", err);
    }
  },

  updateLead: async (id, updates) => {
    // Optimistic update
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ),
    }));
    try {
      await updateLeadAction(id, updates);
    } catch (err) {
      console.error("Failed to update lead in database:", err);
    }
  },

  updateLeadStage: async (id, stage) => {
    // Optimistic update
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === id ? { ...l, stage, updatedAt: new Date().toISOString() } : l
      ),
    }));
    try {
      await updateLeadStageAction(id, stage);
    } catch (err) {
      console.error("Failed to update lead stage in database:", err);
    }
  },

  removeLead: async (id) => {
    // Optimistic update
    set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }));
    try {
      await removeLeadAction(id);
    } catch (err) {
      console.error("Failed to remove lead from database:", err);
    }
  },

  selectLead: (id) =>
    set((state) => ({
      selectedLeadIds: state.selectedLeadIds.includes(id)
        ? state.selectedLeadIds
        : [...state.selectedLeadIds, id],
    })),

  deselectLead: (id) =>
    set((state) => ({
      selectedLeadIds: state.selectedLeadIds.filter((sid) => sid !== id),
    })),

  selectAll: () =>
    set((state) => ({ selectedLeadIds: state.leads.map((l) => l.id) })),

  clearSelection: () => set({ selectedLeadIds: [] }),

  setViewMode: (viewMode) => set({ viewMode }),

  setFilter: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  setSearching: (isSearching) => set({ isSearching }),

  setSearchResults: (searchResults) => set({ searchResults }),

  getLeadsByStage: (stage) => get().leads.filter((l) => l.stage === stage && !l.isArchived),

  filteredLeads: () => {
    const { leads, filters } = get();
    return leads.filter((lead) => {
      if (lead.isArchived) return false;
      if (filters.stage && lead.stage !== filters.stage) return false;
      if (filters.source && lead.source !== filters.source) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !lead.company.toLowerCase().includes(q) &&
          !lead.contactName?.toLowerCase().includes(q) &&
          !lead.email?.toLowerCase().includes(q)
        )
          return false;
      }
      if (filters.tags?.length) {
        if (!filters.tags.some((t) => lead.tags.includes(t))) return false;
      }
      return true;
    });
  },
}));
