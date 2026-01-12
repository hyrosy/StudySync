import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useNoteStore } from '../store';

// 1. Define the Note type so TypeScript is happy
interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
}

export default function HomeScreen() {
  // Get notes from store
  const notes = useNoteStore((state: any) => state.notes) as Note[];

  // 2. Add ": { item: Note }" here to fix the error
  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      className="bg-white p-5 rounded-xl mb-3 border border-slate-200 shadow-sm"
      onPress={() => router.push({ pathname: '/note-detail', params: { noteId: item.id } })}
    >
      {/* Top Row: Badge & Date */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-100">
           <Text className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
             {item.category}
           </Text>
        </View>
        <Text className="text-slate-400 text-xs">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      {/* Main Content */}
      <Text className="text-slate-900 text-lg font-bold mb-1 leading-tight">
        {item.title}
      </Text>
      <Text numberOfLines={2} className="text-slate-500 text-sm leading-5 mb-4">
        {item.content}
      </Text>

      {/* Footer: Action Shortcut */}
      <View className="flex-row justify-end pt-3 border-t border-slate-100">
        <TouchableOpacity 
          className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-full"
          onPress={() => router.push({ pathname: '/quiz', params: { noteId: item.id } })}
        >
          <MaterialCommunityIcons name="play-circle" size={16} color="#0f172a" />
          <Text className="text-slate-900 text-xs font-semibold ml-1.5">
            Quick Quiz
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="pt-16 pb-4 px-6 bg-white border-b border-slate-200">
        <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Notes
        </Text>
        <Text className="text-slate-500 text-base mt-1">
          {notes.length} {notes.length === 1 ? 'Note' : 'Notes'} Stored
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <View className="bg-slate-100 p-6 rounded-full mb-4">
              <MaterialCommunityIcons name="note-text-outline" size={48} color="#94a3b8" />
            </View>
            <Text className="text-slate-900 text-lg font-semibold">No notes yet</Text>
            <Text className="text-slate-500 text-sm mt-1">Tap the + button to create one.</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-6 w-14 h-14 bg-slate-900 rounded-full items-center justify-center shadow-lg shadow-slate-400/50 z-50"
        onPress={() => router.push('/add-note')}
      >
        <MaterialCommunityIcons name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}