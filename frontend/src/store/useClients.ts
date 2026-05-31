import { create } from 'zustand';
import api from '../api/client';

export interface Client {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  value: string;
}

interface ClientsState {
  clients: Client[];
  fetchClients: () => Promise<void>;
  addClient: (client: Client) => Promise<void>;
  updateClient: (id: string, updatedData: Partial<Client>) => Promise<void>;
}

export const useClients = create<ClientsState>((set) => ({
  clients: [],
  fetchClients: async () => {
    try {
      const response = await api.get('/clients');
      set({ clients: response.data });
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  },
  addClient: async (client) => {
    try {
      // Prevent duplicate client entries by company name
      const state = useClients.getState();
      if (state.clients.some(c => c.company.toLowerCase() === client.company.toLowerCase())) {
        return;
      }
      const response = await api.post('/clients', client);
      set((state) => ({ clients: [...state.clients, response.data] }));
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  },
  updateClient: async (id, updatedData) => {
    try {
      const clientToUpdate = useClients.getState().clients.find(c => c.id === id);
      if (!clientToUpdate) return;
      const response = await api.put(`/clients/${id}`, { ...clientToUpdate, ...updatedData });
      set((state) => ({
        clients: state.clients.map((c) => c.id === id ? response.data : c)
      }));
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  },
}));
