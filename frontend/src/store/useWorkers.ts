import { create } from 'zustand';
import api from '../api/client';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  skill: string;
  dailyRate: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
  site: string;
  advances: number;
  balance: number;
  attendance?: { 
    date: string; 
    status: string;
    paid?: boolean;
    wage?: number;
    site?: string;
    paidDate?: string;
  }[];
}

interface WorkersState {
  workers: Worker[];
  fetchWorkers: () => Promise<void>;
  addWorker: (worker: Worker) => Promise<void>;
  updateWorker: (id: string, updatedData: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
}

export const useWorkers = create<WorkersState>((set) => ({
  workers: [],
  fetchWorkers: async () => {
    try {
      const response = await api.get('/workers');
      set({ workers: response.data });
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  },
  addWorker: async (worker) => {
    try {
      const response = await api.post('/workers', worker);
      set((state) => ({ workers: [...state.workers, response.data] }));
    } catch (error) {
      console.error('Failed to add worker:', error);
    }
  },
  updateWorker: async (id, updatedData) => {
    try {
      const workerToUpdate = useWorkers.getState().workers.find(w => w.id === id);
      if (!workerToUpdate) return;
      const response = await api.put(`/workers/${id}`, { ...workerToUpdate, ...updatedData });
      set((state) => ({
        workers: state.workers.map((w) => w.id === id ? response.data : w)
      }));
    } catch (error) {
      console.error('Failed to update worker:', error);
    }
  },
  deleteWorker: async (id) => {
    try {
      await api.delete(`/workers/${id}`);
      set((state) => ({
        workers: state.workers.filter((w) => w.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete worker:', error);
    }
  },
}));
