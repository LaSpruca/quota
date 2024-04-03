import { SplashScreen, Stack, router } from "expo-router";
import { SessionContext, supabase } from "$lib/supabase";
import { useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  ThemeMode,
  ThemeProvider,
  createTheme,
  useTheme,
  useThemeMode,
} from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-vector-icons/FontAwesome";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Session } from "@supabase/supabase-js";
import { ThemeProvider as RNThemeProvider } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

const theme = createTheme({
  components: {
    FAB: (props, theme) => {
      if (typeof props.icon === "object" && !props.icon.type) {
        props.icon.type = "material";
      }

      return {
        placement: "right",
        color: theme.colors.primary,
        icon: props.icon,
      };
    },
    Button: (props) => {
      if (typeof props.icon === "object") {
        if (!props.icon.type) {
          props.icon.type = "material";
        }
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

type SetThemeOptions = {
  supabaseLoaded: boolean;
};
function SetTheme({ supabaseLoaded }: SetThemeOptions) {
  const { mode, setMode } = useThemeMode();
  const [modeLoaded, setModeLoaded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    AsyncStorage.getItem("theme", (error, mode) => {
      if (!error) {
        setMode(mode as ThemeMode);
      }

      setModeLoaded(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("theme", mode);
  }, [mode]);

  useEffect(() => {
    if (modeLoaded && supabaseLoaded) {
      SplashScreen.hideAsync();
    }
  }, [modeLoaded, supabaseLoaded]);

  return (
    <RNThemeProvider
      value={{
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.white,
          text: theme.colors.black,
          border: theme.colors.black,
          notification: theme.colors.warning,
        },
        dark: theme.mode === "dark",
      }}
    >
      <Stack />
    </RNThemeProvider>
  );
}

export default function Layout() {
  const [session, setSession] = useState<Session | Session>(null);
  const [supabaseLoaded, setSupabaseLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session === null) {
        router.replace("/login");
      }

      setSession(session);
      setSupabaseLoaded(true);
    });

    const {
      data: {
        subscription: { unsubscribe },
      },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session === null) {
        router.replace("/login");
      } else {
        router.replace("/");
      }

      setSession(session);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <SessionContext.Provider value={session}>
        <SafeAreaProvider>
          <ThemeProvider theme={theme}>
            <SetTheme supabaseLoaded={supabaseLoaded} />
          </ThemeProvider>
        </SafeAreaProvider>
      </SessionContext.Provider>
    </PersistQueryClientProvider>
  );
}
