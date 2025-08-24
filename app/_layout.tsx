if (__DEV__) {
  require("../ReactotronConfig");
}
import queryClient from "@/services/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false, title: "RouteXplore" }}
          />
          <Stack.Screen name="route" options={{ title: "Route" }} />
          <Stack.Screen name="places" options={{ title: "Places" }} />
          <Stack.Screen name="place-details" options={{ title: "Place" }} />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
