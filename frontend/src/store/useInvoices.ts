import { create } from 'zustand';
import api from '../api/client';

export interface InvoiceLineItem {
  id: number;
  description: string;
  qty: number;
  rate: number;
  gstPercent: number;
}

export interface SavedInvoice {
  id: string;
  invoiceType: string;
  date: string;
  targetId: string;
  targetName: string;
  targetRoleOrProject: string;
  targetLocationOrSite: string;
  fromName?: string;
  fromAddress?: string;
  fromGSTIN?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  totalGst: number;
  total: number;
}

interface InvoicesState {
  invoices: SavedInvoice[];
  fetchInvoices: () => Promise<void>;
  saveInvoice: (invoice: SavedInvoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

export const useInvoices = create<InvoicesState>((set) => ({
  invoices: [],
  fetchInvoices: async () => {
    try {
      const response = await api.get('/invoices');
      set({ invoices: response.data });
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  },
  saveInvoice: async (invoice) => {
    try {
      const response = await api.post('/invoices', invoice);
      set((state) => ({ invoices: [response.data, ...state.invoices] }));
    } catch (error) {
      console.error('Failed to save invoice:', error);
    }
  },
  deleteInvoice: async (id) => {
    try {
      await api.delete(`/invoices/${id}`);
      set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }));
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  },
}));
