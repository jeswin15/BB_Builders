import { create } from 'zustand';
import api from '../api/client';

export interface Site {
  id: string;
  name: string;
  project: string;
  location: string;
  engineers: number;
  workers: number;
  status: 'Active' | 'Completed' | 'On Hold' | string;
}

interface SitesState {
  sites: Site[];
  fetchSites: () => Promise<void>;
  addSite: (site: Site) => Promise<void>;
  updateSite: (id: string, updatedData: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
}

export const useSites = create<SitesState>((set) => ({
  sites: [],
  fetchSites: async () => {
    try {
      const response = await api.get('/sites');
      set({ sites: response.data });
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  },
  addSite: async (site) => {
    try {
      const response = await api.post('/sites', site);
      set((state) => ({ sites: [...state.sites, response.data] }));
    } catch (error) {
      console.error('Failed to add site:', error);
    }
  },
  updateSite: async (id, updatedData) => {
    try {
      const siteToUpdate = useSites.getState().sites.find(s => s.id === id);
      if (!siteToUpdate) return;
      const response = await api.put(`/sites/${id}`, { ...siteToUpdate, ...updatedData });
      set((state) => ({
        sites: state.sites.map((s) => s.id === id ? response.data : s)
      }));
    } catch (error) {
      console.error('Failed to update site:', error);
    }
  },
  deleteSite: async (id) => {
    try {
      await api.delete(`/sites/${id}`);
      set((state) => ({
        sites: state.sites.filter((s) => s.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete site:', error);
    }
  },
}));
