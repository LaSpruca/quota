import { SplashScreen, Stack, router } from "expo-router";
import { SessionContext, supabase } from "$lib/supabase";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-vector-icons/FontAwesome";

SplashScreen.preventAutoHideAsync();

const theme = createTheme({
  components: {
    FAB: (_props, theme) => {
      return {
        placement: "right",
        icon: { type: "font-awesome", color: "white" },
        color: theme.colors.primary,
      };
    },
    Button: {
      icon: { type: "font-awesome" },
    },
  },
});

export default function Layout() {
  const [client] = useState(new QueryClient());
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
      }
      setSession(session);
      SplashScreen.hideAsync();
    });

    const {
      data: {
        subscription: { unsubscribe },
      },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (!session) {
        router.replace("/login");
      } else {
        router.replace("/");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <SessionContext.Provider value={session}>
          <QueryClientProvider client={client}>
            <Stack />
          </QueryClientProvider>
        </SessionContext.Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
