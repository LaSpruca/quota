import { SplashScreen, Stack, router, usePathname } from "expo-router";
import { SessionContext, supabase } from "$lib/supabase";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [client] = useState(new QueryClient());
  const [session, setSession] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("login");
      }
      setSession(session);
      SplashScreen.hideAsync();
    });

    const {
      data: {
        subscription: { unsubscribe },
      },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("login");
      } else if (pathname === "/login") {
        router.replace("/");
      }

      setSession(session);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const indexHeaderRight = () => (
    <FontAwesome.Button
      name="user"
      onPress={() => router.push("profile")}
      borderRadius={100}
    >
      Profile
    </FontAwesome.Button>
  );

  return (
    <SessionContext.Provider value={session}>
      <QueryClientProvider client={client}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "All books",
              headerRight: indexHeaderRight,
            }}
          />
          <Stack.Screen name="login" options={{ title: "Quota login" }} />
        </Stack>
      </QueryClientProvider>
    </SessionContext.Provider>
  );
}
