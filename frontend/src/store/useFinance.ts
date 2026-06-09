import { create } from 'zustand';
import api from '../api/client';

export interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense' | string;
  category: 'Payroll' | 'Material' | 'Client Payment' | 'Other' | string;
  description: string;
  amount: number;
  site?: string;
}

interface FinanceState {
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
}

export const useFinance = create<FinanceState>((set) => ({
  transactions: [],
  fetchTransactions: async () => {
    try {
      const response = await api.get('/finance');
      set({ transactions: response.data });
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      alert('Failed to fetch finance: ' + (error.response?.data?.detail || error.message));
    }
  },
  addTransaction: async (transaction) => {
    try {
      const response = await api.post('/finance', transaction);
      set((state) => ({ transactions: [response.data, ...state.transactions] }));
    } catch (error: any) {
      console.error('Failed to add transaction:', error);
      alert('Failed to add transaction: ' + (error.response?.data?.detail || error.message));
    }
  },
}));
