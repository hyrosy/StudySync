import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Platform, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNoteStore } from '../store';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
}

export default function HomeScreen() {
  const notes = useNoteStore((state: any) => state.notes) as Note[];
  const [searchQuery, setSearchQuery] = useState('');

  // Filter notes based on search query
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 shadow-sm shadow-slate-200 dark:shadow-none mx-4 border border-slate-100 dark:border-slate-700"
      onPress={() => router.push({ pathname: '/note-detail', params: { noteId: item.id } })}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full self-start">
           <Text className="text-blue-700 dark:text-blue-300 text-[10px] font-bold tracking-wide uppercase">
             {item.category}
           </Text>
        </View>
        <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium">
          {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <Text className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-2 tracking-tight">
        {item.title}
      </Text>
      
      <Text numberOfLines={2} className="text-slate-500 dark:text-slate-400 text-sm leading-6">
        {item.content}
      </Text>

      <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
         <View className="flex-row items-center">
            <MaterialCommunityIcons name="book-open-page-variant" size={14} color="#94a3b8" />
            <Text className="text-slate-400 text-xs ml-1 font-medium">Read</Text>
         </View>
         
         <TouchableOpacity 
           className="flex-row items-center bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg"
           onPress={() => router.push({ pathname: '/quiz', params: { noteId: item.id } })}
         >
           <MaterialCommunityIcons name="brain" size={14} color="#6366f1" />
           <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold ml-1.5">
             Quiz
           </Text>
         </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-black">
      <StatusBar barStyle="default" />
      
      {/* Header Area */}
      <View className="pt-16 pb-4 px-6 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800">
        <Text className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Notes
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-base mt-1 mb-4">
          {notes.length} {notes.length === 1 ? 'Note' : 'Notes'} Stored
        </Text>

        {/* Search Bar */}
        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-4 h-12 mb-4 border border-slate-200 dark:border-slate-700">
          <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Search notes..." 
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2 text-slate-900 dark:text-white text-base h-full" 
            // Fix: Cast this style to 'any' to suppress the TypeScript error
            style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined} 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
               <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteItem}
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <View className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-4">
              <MaterialCommunityIcons name="note-text-outline" size={48} color="#94a3b8" />
            </View>
            <Text className="text-slate-900 dark:text-white text-lg font-semibold">
              {searchQuery ? "No matching notes" : "No notes yet"}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {searchQuery ? "Try a different search term." : "Tap the + button to create one."}
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        className="absolute bottom-8 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-500/40 z-50"
        onPress={() => router.push('/add-note')}
      >
        <MaterialCommunityIcons name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}