import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper';
import { useNoteStore } from './store';

// ⚠️ YOUR API KEY
const API_KEY = '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'; 

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams();
  const theme = useTheme();
  
  // Get Data from Store
  const note = useNoteStore((state) => state.notes.find((n) => n.id === noteId));
  const history = useNoteStore((state) => state.getHistoryForNote(noteId));
  const updateNote = useNoteStore((state) => state.updateNote);

  const [loadingSummary, setLoadingSummary] = useState(false);

  if (!note) return <View><Text>Note not found</Text></View>;

  // AI Logic: Generate Summary
  const generateSummary = async () => {
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
      const content = JSON.parse(data.choices[0].message.content);
      
      // Save summary to the note in the store so we don't pay for it again!
      updateNote(note.id, { summary: content.points });

    } catch (e) {
      Alert.alert("Error", "Could not generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* iOS Style Large Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={28} onPress={() => router.back()} />
        <View>
            <Text style={styles.categoryLabel}>{note.category.toUpperCase()}</Text>
            <Text variant="headlineMedium" style={styles.title}>{note.title}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* SECTION 1: SMART SUMMARY */}
        <Text style={styles.sectionTitle}>✨ Smart Summary</Text>
        <Card style={styles.iosCard}>
          <Card.Content>
            {note.summary ? (
              <View style={{ gap: 10 }}>
                {note.summary.map((point, index) => (
                  <View key={index} style={styles.bulletRow}>
                    <MaterialCommunityIcons name="star-four-points" size={16} color="#FFD700" style={{marginTop:4}} />
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={{ color: 'gray', marginBottom: 10 }}>Get key insights instantly.</Text>
                {loadingSummary ? <ActivityIndicator /> : (
                  <Button mode="contained-tonal" onPress={generateSummary} icon="sparkles">
                    Generate AI Summary
                  </Button>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* SECTION 2: ACTIONS */}
        <Text style={styles.sectionTitle}>Study Actions</Text>
        <View style={styles.actionRow}>
            <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#007AFF' }]}
                onPress={() => router.push({ pathname: '/quiz', params: { noteId: note.id } })}
            >
                <MaterialCommunityIcons name="brain" size={24} color="white" />
                <Text style={styles.actionBtnText}>Take Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#34C759' }]}>
                <MaterialCommunityIcons name="text-box-outline" size={24} color="white" />
                <Text style={styles.actionBtnText}>Read Note</Text>
            </TouchableOpacity>
        </View>

        {/* SECTION 3: QUIZ HISTORY */}
        <Text style={styles.sectionTitle}>Performance History</Text>
        {history.length === 0 ? (
           <Text style={{ color: 'gray', marginLeft: 4 }}>No quizzes taken yet.</Text>
        ) : (
            history.map((h, i) => (
                <View key={i} style={styles.historyRow}>
                    <View>
                        <Text style={{ fontWeight: '600' }}>Quiz Score</Text>
                        <Text style={{ fontSize: 12, color: 'gray' }}>{new Date(h.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.scoreBadge}>
                        <Text style={{ fontWeight: 'bold', color: h.score >= 80 ? '#34C759' : '#FF9500' }}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' }, // Apple "System Gray" background
  header: { padding: 20, paddingTop: 60, backgroundColor: 'white', paddingBottom: 20 },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: '#8E8E93', marginBottom: 4 },
  title: { fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, marginTop: 20, color: '#1C1C1E' },
  iosCard: {
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2, // Android shadow
    marginBottom: 10
  },
  bulletRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  bulletText: { fontSize: 16, lineHeight: 22, color: '#3A3A3C', flex: 1 },
  emptyState: { alignItems: 'center', padding: 20 },
  actionRow: { flexDirection: 'row', gap: 15 },
  actionBtn: { 
    flex: 1, 
    borderRadius: 14, 
    padding: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  scoreBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  }
});