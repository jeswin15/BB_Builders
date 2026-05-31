import { create } from 'zustand';
import api from '../api/client';

export interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  timeline: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Completed' | string;
}

interface ProjectsState {
  projects: Project[];
  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, updatedData: Partial<Project>) => Promise<void>;
}

export const useProjects = create<ProjectsState>((set) => ({
  projects: [],
  fetchProjects: async () => {
    try {
      const response = await api.get('/projects');
      set({ projects: response.data });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  },
  addProject: async (project) => {
    try {
      const response = await api.post('/projects', project);
      set((state) => ({ projects: [...state.projects, response.data] }));
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  },
  updateProject: async (id, updatedData) => {
    try {
      const projectToUpdate = useProjects.getState().projects.find(p => p.id === id);
      if (!projectToUpdate) return;
      const response = await api.put(`/projects/${id}`, { ...projectToUpdate, ...updatedData });
      set((state) => ({
        projects: state.projects.map((p) => p.id === id ? response.data : p)
      }));
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  },
}));
