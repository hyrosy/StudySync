import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useNoteStore } from './store';

export default function AddNoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  
  const addNote = useNoteStore((state) => state.addNote);

  const handleSave = () => {
    // 1. Validation
    if (!title.trim() || !content.trim()) {
      if (Platform.OS === 'web') {
        window.alert("Please enter a title and content");
      } else {
        Alert.alert("Missing Info", "Please enter a title and content");
      }
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      category,
      date: new Date().toISOString()
    };

    // 2. Save to Store
    addNote(newNote);

    // 3. Close Modal (with slight delay to ensure state updates)
    setTimeout(() => {
      router.back();
    }, 100);
  };

  const categories = ['General', 'Science', 'History', 'Code', 'Math'];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header - Z-Index 50 ensures it stays on top of scrollview */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 z-50">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <MaterialCommunityIcons name="close" size={24} className="text-slate-900 dark:text-white" />
          </TouchableOpacity>
          
          <Text className="text-lg font-semibold text-slate-900 dark:text-white">New Note</Text>
          
          <TouchableOpacity 
            onPress={handleSave} 
            className={`px-4 py-2 rounded-lg ${(!title || !content) ? 'bg-slate-200 dark:bg-slate-800' : 'bg-indigo-600'}`}
          >
            <Text className={`font-semibold ${(!title || !content) ? 'text-slate-400 dark:text-slate-500' : 'text-white'}`}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          
          {/* Title */}
          <Text className="text-sm font-medium text-slate-900 dark:text-slate-300 mb-2.5">Title</Text>
          <TextInput
            placeholder="e.g. Intro to Biology"
            placeholderTextColor="#94a3b8"
            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 mb-6"
            value={title}
            onChangeText={setTitle}
            style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
          />

          {/* Category */}
          <Text className="text-sm font-medium text-slate-900 dark:text-slate-300 mb-2.5">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6 max-h-12">
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full mr-2 border h-10 justify-center ${
                  category === cat 
                    ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white' 
                    : 'bg-transparent border-slate-200 dark:border-slate-700'
                }`}
              >
                <Text className={`text-xs font-semibold ${
                  category === cat 
                    ? 'text-white dark:text-slate-900' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Content */}
          <Text className="text-sm font-medium text-slate-900 dark:text-slate-300 mb-2.5">Content</Text>
          <TextInput
            placeholder="Write your study notes here..."
            placeholderTextColor="#94a3b8"
            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 min-h-[300px]"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}