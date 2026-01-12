import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// We use 'persist' middleware so data survives app restarts!
export const useNoteStore = create(
  persist(
    (set, get) => ({
      notes: [],
      quizHistory: [],

      // Add a new note
      addNote: (newNote) => set((state) => ({ 
        notes: [newNote, ...state.notes] 
      })),

      // Update a note (e.g., adding an AI Summary to it)
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id ? { ...note, ...updates } : note
        ),
      })),

      // Save a quiz score
      saveQuizResult: (result) => set((state) => ({
        quizHistory: [result, ...state.quizHistory]
      })),

      // Helper: Get history for a specific note
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