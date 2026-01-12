import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import '../global.css'; // <--- 1. Import NativeWind styles

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        <Stack.Screen name="add-note" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="note-detail" options={{ headerShown: false }} />
        <Stack.Screen name="quiz" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}