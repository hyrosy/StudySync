import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import '../global.css'; // <--- 1. Import NativeWind styles

export default function RootLayout() {
  return (
    // 2. Wrap everything in PaperProvider so buttons/themes work
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