import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: "RouteXplore" }} />
      <Stack.Screen name="route" options={{ title: "Route" }} />
      <Stack.Screen name="places" options={{ title: "Places" }} />
    </Stack>
  );
}
