import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNoteStore } from './store';

// ⚠️ IMPORTANT: Create a .env file in your root directory and add EXPO_PUBLIC_OPENAI_KEY=your_key_here
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_KEY; 

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams();
  
  const note = useNoteStore((state) => state.notes.find((n) => n.id === noteId));
  const history = useNoteStore((state) => state.getHistoryForNote(noteId));
  const updateNote = useNoteStore((state) => state.updateNote);
  const deleteNote = useNoteStore((state) => state.deleteNote);

  const [loadingSummary, setLoadingSummary] = useState(false);

  if (!note) return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-slate-500">Note not found</Text>
    </View>
  );

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          deleteNote(note.id);
          router.back();
      }}
    ]);
  };

  const generateSummary = async () => {
    if (!API_KEY) {
      Alert.alert("Configuration Error", "Please set EXPO_PUBLIC_OPENAI_KEY in your .env file.");
      return;
    }
    setLoadingSummary(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Summarize the text into 3-5 short, punchy bullet points. Return JSON: { \"points\": [\"string\"] }" },
            { role: "user", content: note.content }
          ]
        })
      });
      const data = await response.json();
      // Safety check for AI response
      let contentString = data.choices[0].message.content;
      contentString = contentString.replace(/```json/g, '').replace(/```/g, '').trim();
      const content = JSON.parse(contentString);
      
      updateNote(note.id, { summary: content.points });

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-black">
      {/* Header */}
      <View className="px-6 pt-14 pb-6 bg-white dark:bg-black flex-row justify-between items-start border-b border-slate-100 dark:border-slate-900">
        <View className="flex-1 mr-4">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
                <MaterialCommunityIcons name="arrow-left" size={28} className="text-slate-900 dark:text-white" />
            </TouchableOpacity>
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                {note.category}
            </Text>
            <Text className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {note.title}
            </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full mt-10">
            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* AI Summary Section */}
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-3 mt-2">✨ Smart Summary</Text>
        <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm shadow-slate-200 dark:shadow-none mb-6">
            {note.summary ? (
              <View className="gap-3">
                {note.summary.map((point, index) => (
                  <View key={index} className="flex-row items-start gap-3">
                    <MaterialCommunityIcons name="star-four-points" size={16} color="#fbbf24" style={{ marginTop: 4 }} />
                    <Text className="text-base text-slate-700 dark:text-slate-300 flex-1 leading-6">{point}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-4">
                <Text className="text-slate-400 mb-4 text-center">Get key insights instantly with AI.</Text>
                {loadingSummary ? <ActivityIndicator color="#4f46e5" /> : (
                  <TouchableOpacity 
                    onPress={generateSummary}
                    className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/30 px-5 py-3 rounded-full"
                  >
                    <MaterialCommunityIcons name="sparkles" size={18} color="#6366f1" />
                    <Text className="text-indigo-600 dark:text-indigo-400 font-semibold ml-2">Generate Summary</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
        </View>

        {/* Actions Grid */}
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-3">Actions</Text>
        <View className="flex-row gap-4 mb-8">
            <TouchableOpacity 
                className="flex-1 bg-blue-600 rounded-2xl p-5 items-center justify-center shadow-lg shadow-blue-500/20"
                onPress={() => router.push({ pathname: '/quiz', params: { noteId: note.id } })}
            >
                <MaterialCommunityIcons name="brain" size={28} color="white" />
                <Text className="text-white font-bold text-base mt-2">Take Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-emerald-500 rounded-2xl p-5 items-center justify-center shadow-lg shadow-emerald-500/20">
                <MaterialCommunityIcons name="text-box-outline" size={28} color="white" />
                <Text className="text-white font-bold text-base mt-2">Read Note</Text>
            </TouchableOpacity>
        </View>

        {/* History */}
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-3">Quiz History</Text>
        {history.length === 0 ? (
           <Text className="text-slate-400 italic ml-1">No quizzes taken yet.</Text>
        ) : (
            history.map((h, i) => (
                <View key={i} className="flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl mb-3 border border-slate-100 dark:border-slate-800">
                    <View>
                        <Text className="font-semibold text-slate-900 dark:text-white">Quiz Result</Text>
                        <Text className="text-xs text-slate-400 mt-0.5">{new Date(h.date).toLocaleDateString()}</Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-lg ${h.score >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                        <Text className={`font-bold ${h.score >= 80 ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}`}>
                            {h.score}%
                        </Text>
                    </View>
                </View>
            ))
        )}
      </ScrollView>
    </View>
  );
}