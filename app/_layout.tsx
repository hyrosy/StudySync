import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This points to your new app/index.tsx */}
      <Stack.Screen name="index" /> 
      {/* This allows the modal presentation for adding notes */}
      <Stack.Screen name="add-note" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="note-detail" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
    </Stack>
  );
}