import LoadingView from "$lib/components/LoadingView";
import { Profile as ProfileType, supabase, updateName } from "$lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import { View, Alert } from "react-native";
import {
  Button,
  Switch,
  useThemeMode,
  Text,
  makeStyles,
  useTheme,
} from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "$lib/queries";
import TextInputOverlay from "$lib/components/Overlays/TextInputOverlay";

type ProfileInnerProps = {
  loading: boolean;
  profile: ProfileType | null;
};

function ProfileInner({ loading, profile }: ProfileInnerProps) {
  const queryClient = useQueryClient();
  const themeMode = useThemeMode();
  const [modalVisible, setModalVisible] = useState(false);
  const stylesheet = createStylesheet();
  const { theme } = useTheme();

  const updateNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const result = await updateName(profile.id, newName);
      setModalVisible(false);
      return result;
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({
          predicate: ({ queryKey: [element] }) => {
            return (
              element === "get-book" ||
              element === "get-books" ||
              element === "get-profile"
            );
          },
        });
      }
    },
  });

  if (loading) {
    return <LoadingView />;
  }

  if (!profile) {
    return (
      <View>
        <Text>Could not load profile</Text>
        <Link href="index">Go home</Link>
      </View>
    );
  }

  return (
    <View style={[stylesheet.profileContainer]}>
      <Text style={[stylesheet.displayNameText]}>Display name</Text>
      <View style={[stylesheet.usernameTextWrapper]}>
        <Button
          icon={{ name: "edit", color: theme.colors.black }}
          type="clear"
          onPress={() => setModalVisible(true)}
        />
        <Text style={[stylesheet.usernameText]}>
          {profile.name ?? profile.email ?? ""}
        </Text>
      </View>
      <Text style={[stylesheet.emailText]}>{profile.email}</Text>
      <View style={[stylesheet.darkModeSwitch]}>
        <Text>Dark theme</Text>
        <Switch
          value={themeMode.mode == "dark"}
          onValueChange={(value) => {
            if (!value) {
              themeMode.setMode("light");
            } else {
              themeMode.setMode("dark");
            }
          }}
        />
      </View>
      <TextInputOverlay
        inputMode="text"
        onDismis={() => setModalVisible(false)}
        onSubmit={(newName) => {
          updateNameMutation.mutate(newName);
        }}
        visible={modalVisible}
        label={"New name"}
        defaultText={profile.name ?? profile.email}
      />
      <View style={[stylesheet.ohOhButton]}>
        <Button title="Logout" onPress={() => supabase.auth.signOut()} />
        <Button
          title="Delete Account"
          color="error"
          onPress={() =>
            Alert.alert(
              "Delete accont",
              "Deleting your account is permanant, and will delete any books that you own",
              [
                {
                  text: "Ok",
                  onPress: () => {
                    supabase.rpc("delete_user");
                  },
                },
              ],
              {
                cancelable: true,
              },
            )
          }
        />
      </View>
    </View>
  );
}

export default function Profile() {
  const { isLoading, data: profile, isRefetching } = useProfile();
  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Profile" }} />
      <ProfileInner loading={isLoading || isRefetching} profile={profile} />
    </SafeAreaView>
  );
}

const createStylesheet = makeStyles((theme) => {
  return {
    profileContainer: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      flexDirection: "column",
    },
    usernameTextWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      paddingBottom: 30,
    },
    usernameText: {
      fontSize: 35,
      fontWeight: "bold",
    },
    emailText: {
      fontStyle: "italic",
      color: theme.colors.black,
    },

    displayNameText: {
      fontSize: 25,
      fontWeight: "400",
    },

    setNameModal: {
      display: "flex",
      minWidth: 200,
      paddingHorizontal: 10,
      paddingVertical: 15,
    },
    setNameInput: {
      width: "75%",
    },
    setNameButtons: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 20,
    },
    ohOhButton: {
      display: "flex",
      width: "100%",
      flexDirection: "row",
      paddingTop: 20,
      justifyContent: "space-evenly",
    },

    darkModeSwitch: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      gap: 15,
      padding: 20,
    },
  };
});
