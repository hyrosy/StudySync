import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useNoteStore = create(
  persist(
    (set, get) => ({
      notes: [],
      quizHistory: [],

      addNote: (newNote) => set((state) => ({ 
        notes: [newNote, ...state.notes] 
      })),

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id ? { ...note, ...updates } : note
        ),
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        quizHistory: state.quizHistory.filter((h) => h.noteId !== id)
      })),

      saveQuizResult: (result) => set((state) => ({
        quizHistory: [result, ...state.quizHistory]
      })),

      getHistoryForNote: (noteId) => {
        return get().quizHistory.filter((h) => h.noteId === noteId);
      }
    }),
    {
      name: 'study-sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);