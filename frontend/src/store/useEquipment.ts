import { create } from 'zustand';
import api from '../api/client';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  owned: boolean;
  status: string;
  site: string;
  maintenanceSchedule?: string;
  fuelCost?: number;
  operator?: string;
}

interface EquipmentState {
  equipment: Equipment[];
  fetchEquipment: () => Promise<void>;
  addEquipment: (item: Equipment) => Promise<void>;
  updateEquipment: (id: string, updatedData: Partial<Equipment>) => Promise<void>;
}

export const useEquipment = create<EquipmentState>((set) => ({
  equipment: [],
  fetchEquipment: async () => {
    try {
      const response = await api.get('/equipment');
      set({ equipment: response.data });
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  },
  addEquipment: async (item) => {
    try {
      const response = await api.post('/equipment', item);
      set((state) => ({ equipment: [...state.equipment, response.data] }));
    } catch (error) {
      console.error('Failed to add equipment:', error);
    }
  },
  updateEquipment: async (id, updatedData) => {
    try {
      const itemToUpdate = useEquipment.getState().equipment.find(e => e.id === id);
      if (!itemToUpdate) return;
      const response = await api.put(`/equipment/${id}`, { ...itemToUpdate, ...updatedData });
      set((state) => ({
        equipment: state.equipment.map((e) => e.id === id ? response.data : e)
      }));
    } catch (error) {
      console.error('Failed to update equipment:', error);
    }
  },
}));
