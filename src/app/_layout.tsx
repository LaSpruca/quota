import { SplashScreen, Stack, router } from "expo-router";
import { SessionContext, supabase } from "$lib/supabase";
import { useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-vector-icons/FontAwesome";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Session } from "@supabase/supabase-js";

SplashScreen.preventAutoHideAsync();

const theme = createTheme({
  components: {
    FAB: (props, theme) => {
      if (typeof props.icon === "object" && !props.icon.type) {
        props.icon.type = "font-awesome";
      }

      return {
        placement: "right",
        color: theme.colors.primary,
        icon: props.icon,
      };
    },
    Button: (props) => {
      if (typeof props.icon === "object" && !props.icon.type) {
        props.icon.type = "font-awesome";
      }

      return {
        icon: props.icon,
      };
    },
  },
});

const client = new QueryClient();
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "rq-cache",
});

export default function Layout() {
  const [session, setSession] = useState<Session | Session>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.replace("/login");
      }
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

  // The app does not propegate that the session has not been set if I don't do
  // this, idk why ¯\_(ツ)_/¯
  useEffect(() => {
    session;
  }, [session]);

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <SessionContext.Provider value={session}>
        <SafeAreaProvider>
          <ThemeProvider theme={theme}>
            <Stack />
          </ThemeProvider>
        </SafeAreaProvider>
      </SessionContext.Provider>
    </PersistQueryClientProvider>
  );
}
