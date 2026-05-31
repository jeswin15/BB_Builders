import { create } from 'zustand';
import api from '../api/client';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  location: string;
}

interface MaterialsState {
  materials: Material[];
  fetchMaterials: () => Promise<void>;
  addMaterial: (material: Material) => Promise<void>;
  updateMaterial: (id: string, updatedData: Partial<Material>) => Promise<void>;
}

export const useMaterials = create<MaterialsState>((set) => ({
  materials: [],
  fetchMaterials: async () => {
    try {
      const response = await api.get('/materials');
      set({ materials: response.data });
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    }
  },
  addMaterial: async (material) => {
    try {
      const response = await api.post('/materials', material);
      set((state) => ({ materials: [...state.materials, response.data] }));
    } catch (error) {
      console.error('Failed to add material:', error);
    }
  },
  updateMaterial: async (id, updatedData) => {
    try {
      const materialToUpdate = useMaterials.getState().materials.find(m => m.id === id);
      if (!materialToUpdate) return;
      const response = await api.put(`/materials/${id}`, { ...materialToUpdate, ...updatedData });
      set((state) => ({
        materials: state.materials.map((m) => m.id === id ? response.data : m)
      }));
    } catch (error) {
      console.error('Failed to update material:', error);
    }
  },
}));
