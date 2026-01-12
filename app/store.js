import create from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

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
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);


// Notes functions
export const getNotes = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addNote = async (note) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateNote = async (id, updates) => {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteNote = async (id) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Also delete related quiz history
  await supabase
    .from('quiz_history')
    .delete()
    .eq('note_id', id);
};

// Quiz history functions
export const saveQuizResult = async (result) => {
  const { data, error } = await supabase
    .from('quiz_history')
    .insert([{
      note_id: result.noteId,
      score: result.score,
      date: result.date
    }])
    .select();

  if (error) throw error;
  return data[0];
};

export const getHistoryForNote = async (noteId) => {
  const { data, error } = await supabase
    .from('quiz_history')
    .select('*')
    .eq('note_id', noteId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};
