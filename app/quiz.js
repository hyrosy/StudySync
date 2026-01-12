import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, ProgressBar, RadioButton, Text, useTheme } from 'react-native-paper';
import { useNoteStore } from './store'; // Import the store to find the note content

// ⚠️ REPLACE THIS WITH YOUR ACTUAL OPENAI KEY ⚠️
const API_KEY = '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'; 

export default function Quiz() {
  const theme = useTheme();
  
  // 1. Get the noteId passed from the Home screen
  const { noteId } = useLocalSearchParams(); 
  
  // 2. Find the specific note in our store
  const notes = useNoteStore((state) => state.notes);
  const selectedNote = notes.find((n) => n.id === noteId);

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const saveQuizResult = useNoteStore((state) => state.saveQuizResult);
  // 3. EFFECT: When screen loads, call AI to generate quiz
  useEffect(() => {
    if (selectedNote) {
      generateQuiz(selectedNote.content);
    }
  }, [selectedNote]);

  const generateQuiz = async (noteContent) => {
    try {
      setLoading(true);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Cheap and fast model
          messages: [
            {
              role: "system",
              content: "You are a teacher. Generate 5 multiple-choice questions based on the text provided. Return strictly a JSON array of objects. Each object must have: 'question', 'options' (array of 4 strings), 'correctIndex' (number 0-3), and 'explanation'."
            },
            {
              role: "user",
              content: `Create a quiz based on these notes: \n\n${noteContent}`
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      // Parse the JSON string from the AI
      let quizContent = data.choices[0].message.content;
      
      // Clean up markdown if AI adds it (e.g. ```json ... ```)
      quizContent = quizContent.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedQuestions = JSON.parse(quizContent);
      setQuestions(parsedQuestions);
      setLoading(false);

    } catch (error) {
      console.error("AI Error:", error);
      Alert.alert("Error", "Failed to generate quiz. Please check your API Key or internet.");
      setLoading(false);
      router.back();
    }
  };

  // --- GAME LOGIC (Same as before) ---
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? (currentQuestionIndex + 1) / questions.length : 0;

  const handleOptionSelect = (index) => {
    if (isOptionSelected) return;
    setSelectedOptionIndex(index);
    setIsOptionSelected(true);
    setShowExplanation(true);
    if (index === currentQuestion.correctIndex) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionIndex(null);
      setIsOptionSelected(false);
      setShowExplanation(false);
    } else {// 1. Calculate final score
      // (We need to add +1 if the LAST question was correct, because 'score' state updates slowly)
      const isLastCorrect = selectedOptionIndex === currentQuestion?.correctIndex;
      const finalScore = isLastCorrect ? score + 1 : score;
      
      const percentage = Math.round((finalScore / questions.length) * 100);

      // 2. Save to Store
      saveQuizResult({
        id: Date.now(),
        noteId: noteId,
        score: percentage,
        date: new Date().toISOString()
      });

      setScore(finalScore); // Update UI state
      setShowResult(true);
    }
  };

  // --- RENDER: LOADING STATE ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20 }}>Reading your notes...</Text>
        <Text variant="bodySmall" style={{ color: 'gray' }}>Generating questions with AI</Text>
      </View>
    );
  }

  // --- RENDER: RESULT SCREEN ---
  if (showResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text variant="displayMedium" style={styles.emoji}>🏆</Text>
          <Text variant="headlineMedium">Quiz Completed!</Text>
          <Text variant="titleLarge" style={styles.scoreText}>
            You scored {score} / {questions.length}
          </Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.button}>
            Back to Notes
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDER: QUIZ SCREEN ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="labelLarge">Question {currentQuestionIndex + 1}/{questions.length}</Text>
          <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.questionText}>{currentQuestion?.question}</Text>
          </Card.Content>
        </Card>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, index) => {
            let cardColor = "white"; 
            if (isOptionSelected) {
              if (index === currentQuestion.correctIndex) cardColor = "#d4edda";
              else if (index === selectedOptionIndex) cardColor = "#f8d7da";
            }

            return (
              <Card 
                key={index} 
                style={[styles.optionCard, { backgroundColor: cardColor }]}
                onPress={() => handleOptionSelect(index)}
              >
                <View style={styles.optionRow}>
                  <RadioButton
                    value={index}
                    status={selectedOptionIndex === index ? 'checked' : 'unchecked'}
                    onPress={() => handleOptionSelect(index)}
                    disabled={isOptionSelected}
                  />
                  <Text style={styles.optionText}>{option}</Text>
                </View>
              </Card>
            );
          })}
        </View>

        {showExplanation && (
          <View style={styles.explanationBox}>
            <Text style={{fontWeight: 'bold'}}>Explanation:</Text>
            <Text>{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handleNext} 
          disabled={!isOptionSelected}
          style={styles.nextButton}
        >
          {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next Question"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: { marginBottom: 20 },
  progressBar: { height: 8, borderRadius: 5, marginTop: 8 },
  card: { marginBottom: 20, elevation: 2 },
  questionText: { fontWeight: 'bold' },
  optionsContainer: { gap: 12 },
  optionCard: { padding: 8, borderWidth: 1, borderColor: '#eee' },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionText: { fontSize: 16, flex: 1 },
  explanationBox: { marginTop: 20, padding: 15, backgroundColor: '#e3f2fd', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#2196f3' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emoji: { fontSize: 80, marginBottom: 20 },
  scoreText: { marginVertical: 10, color: '#6200ee', fontWeight: 'bold' },
  button: { marginTop: 20, width: '100%' }
});