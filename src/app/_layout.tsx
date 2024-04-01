import { SplashScreen, Stack, router, usePathname } from "expo-router";
import { SessionContext, supabase } from "$lib/supabase";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "react-native-elements";
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

  const indexHeaderRight = () => (
    <Button
      icon={<FontAwesome name="user" color="white" size={20} />}
      onPress={() => router.push("profile")}
      title="Profile"
      titleStyle={[{ paddingLeft: 5 }]}
      raised
    />
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
