import { create } from 'zustand';
import api from '../api/client';

export interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense' | string;
  category: 'Payroll' | 'Material' | 'Client Payment' | 'Other' | string;
  description: string;
  amount: number;
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
      const response = await api.get('/finance/transactions');
      set({ transactions: response.data });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  },
  addTransaction: async (transaction) => {
    try {
      const response = await api.post('/finance/transactions', transaction);
      set((state) => ({ transactions: [response.data, ...state.transactions] }));
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  },
}));
