import { SplashScreen, Stack, router } from "expo-router";
import { SessionContext, supabase } from "$lib/supabase";
import { useEffect, useState } from "react";
import { ThemeProvider } from "react-native-elements";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const client = new QueryClient();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("login");
      }
      setSession(session);
      SplashScreen.hideAsync();
    });

    const {} = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("login");
      }
      setSession(session);
    });
  });

  return (
    <ThemeProvider>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={client}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: "All books",
              }}
            />
            <Stack.Screen name="login" options={{ title: "Quota login" }} />
          </Stack>
        </QueryClientProvider>
      </SessionContext.Provider>
    </ThemeProvider>
  );
}
