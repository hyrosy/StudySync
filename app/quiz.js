import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNoteStore } from './store';

// ⚠️ Add EXPO_PUBLIC_OPENAI_KEY to .env
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_KEY; 

export default function Quiz() {
  const { noteId } = useLocalSearchParams(); 
  const notes = useNoteStore((state) => state.notes);
  const selectedNote = notes.find((n) => n.id === noteId);
  const saveQuizResult = useNoteStore((state) => state.saveQuizResult);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (selectedNote) {
      generateQuiz(selectedNote.content);
    }
  }, [selectedNote]);

  const generateQuiz = async (noteContent) => {
    if (!API_KEY) {
        Alert.alert("Error", "Missing API Key. Check .env configuration.");
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
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
      
      if (data.error) throw new Error(data.error.message);

      let quizContent = data.choices[0].message.content;
      // Remove any markdown code blocks the AI might add
      quizContent = quizContent.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedQuestions = JSON.parse(quizContent);
      setQuestions(parsedQuestions);
      setLoading(false);

    } catch (error) {
      console.error("AI Error:", error);
      Alert.alert("Error", "Failed to generate quiz. Please try again.");
      setLoading(false);
      router.back();
    }
  };

  const handleOptionSelect = (index) => {
    if (isOptionSelected) return;
    setSelectedOptionIndex(index);
    setIsOptionSelected(true);
    setShowExplanation(true);
    if (index === questions[currentQuestionIndex].correctIndex) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionIndex(null);
      setIsOptionSelected(false);
      setShowExplanation(false);
    } else {
      const isLastCorrect = selectedOptionIndex === questions[currentQuestionIndex]?.correctIndex;
      const finalScore = isLastCorrect ? score + 1 : score;
      const percentage = Math.round((finalScore / questions.length) * 100);

      saveQuizResult({
        id: Date.now(),
        noteId: noteId,
        score: percentage,
        date: new Date().toISOString()
      });

      setScore(finalScore);
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-slate-600 dark:text-slate-300 font-medium">Generating questions...</Text>
      </View>
    );
  }

  if (showResult) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black items-center justify-center p-6">
        <Text className="text-6xl mb-4">🏆</Text>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz Completed!</Text>
        <Text className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          You scored {score} / {questions.length}
        </Text>
        <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-full bg-indigo-600 py-4 rounded-xl items-center"
        >
            <Text className="text-white font-bold text-base">Back to Notes</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Progress Bar */}
        <View className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
            <View className="h-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
        </View>

        <View className="flex-row justify-between mb-4">
            <Text className="text-slate-500 dark:text-slate-400 font-medium">Question {currentQuestionIndex + 1} of {questions.length}</Text>
        </View>

        {/* Question Card */}
        <View className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm shadow-slate-200 dark:shadow-none mb-6 border border-slate-100 dark:border-slate-800">
          <Text className="text-xl font-bold text-slate-900 dark:text-white leading-8">{currentQuestion?.question}</Text>
        </View>

        {/* Options */}
        <View className="gap-3">
          {currentQuestion?.options.map((option, index) => {
            let bgColor = "bg-white dark:bg-slate-900"; 
            let borderColor = "border-slate-200 dark:border-slate-800";
            
            if (isOptionSelected) {
              if (index === currentQuestion.correctIndex) {
                  bgColor = "bg-emerald-100 dark:bg-emerald-900/30";
                  borderColor = "border-emerald-500";
              } else if (index === selectedOptionIndex) {
                  bgColor = "bg-red-100 dark:bg-red-900/30";
                  borderColor = "border-red-500";
              }
            }

            return (
              <TouchableOpacity 
                key={index} 
                activeOpacity={0.8}
                disabled={isOptionSelected}
                className={`p-4 rounded-xl border ${borderColor} ${bgColor} flex-row items-center`}
                onPress={() => handleOptionSelect(index)}
              >
                <View className={`w-6 h-6 rounded-full border-2 mr-3 justify-center items-center ${
                    isOptionSelected && index === currentQuestion.correctIndex ? 'border-emerald-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                    {isOptionSelected && index === currentQuestion.correctIndex && <View className="w-3 h-3 bg-emerald-600 rounded-full" />}
                </View>
                <Text className="text-base text-slate-700 dark:text-slate-200 flex-1">{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {showExplanation && (
          <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
            <Text className="font-bold text-blue-800 dark:text-blue-300 mb-1">Explanation:</Text>
            <Text className="text-blue-900 dark:text-blue-100 leading-5">{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-white dark:bg-black border-t border-slate-100 dark:border-slate-900">
        <TouchableOpacity 
          onPress={handleNext} 
          disabled={!isOptionSelected}
          className={`py-4 rounded-xl items-center ${!isOptionSelected ? 'bg-slate-200 dark:bg-slate-800' : 'bg-indigo-600'}`}
        >
          <Text className={`font-bold text-lg ${!isOptionSelected ? 'text-slate-400 dark:text-slate-600' : 'text-white'}`}>
            {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}