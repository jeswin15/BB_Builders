import { create } from 'zustand';
import api from '../api/client';

export interface Document {
  id: string;
  title: string;
  type: string;
  project: string;
  uploadedBy: string;
  date: string;
  size: string;
}

interface DocumentsState {
  documents: Document[];
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: Document) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocuments = create<DocumentsState>((set) => ({
  documents: [],
  fetchDocuments: async () => {
    try {
      const response = await api.get('/documents');
      set({ documents: response.data });
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  },
  addDocument: async (doc) => {
    try {
      const response = await api.post('/documents', doc);
      set((state) => ({ documents: [...state.documents, response.data] }));
    } catch (error) {
      console.error('Failed to add document:', error);
    }
  },
  deleteDocument: async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      set((state) => ({
        documents: state.documents.filter(d => d.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  },
}));
