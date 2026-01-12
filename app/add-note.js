import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Text } from 'react-native-paper'; // Keeping Text for easy typography
import { useNoteStore } from './store';

export default function AddNoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  
  const addNote = useNoteStore((state) => state.addNote);

  const handleSave = () => {
    if (!title || !content) return;

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      category,
      date: new Date().toISOString() // Using ISO for better sorting
    };

    addNote(newNote);
    router.back();
  };

  // Categories for the "Select" emulation
  const categories = ['General', 'Science', 'History', 'Code', 'Math'];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header (Shadcn Dialog Header Style) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Note</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={!title || !content}
            style={[styles.saveButton, (!title || !content) && styles.disabledButton]}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form}>
          
          {/* Label */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="e.g. Intro to Biology"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          {/* Category "Select" */}
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setCategory(cat)}
                style={[
                  styles.badge, 
                  category === cat ? styles.badgeActive : styles.badgeInactive
                ]}
              >
                <Text style={[
                  styles.badgeText, 
                  category === cat ? styles.badgeTextActive : styles.badgeTextInactive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Content Area */}
          <Text style={styles.label}>Content</Text>
          <TextInput
            placeholder="Write your study notes here..."
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Shadcn Theme Colors:
// Background: #ffffff
// Text Main: #0f172a (Slate 900)
// Text Muted: #64748b (Slate 500)
// Border: #e2e8f0 (Slate 200)
// Primary Black: #0f172a

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  iconButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#0f172a', // Shadcn Primary Black
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6, // Shadcn 'rounded-md' radius
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0', // Shadcn Border Color
    borderRadius: 6, // rounded-md
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 300,
    paddingTop: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 10,
    maxHeight: 40,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, // Full rounded for badges
    marginRight: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  badgeInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  badgeActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  badgeTextInactive: {
    color: '#64748b',
  },
  badgeTextActive: {
    color: '#ffffff',
  },
});