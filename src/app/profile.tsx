import LoadingView from "$lib/components/LoadingView";
import { Profile as ProfileType, supabase, updateName } from "$lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Button, Input, Overlay, Switch, useThemeMode } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "$lib/queries";

type SetNameModal = {
  modalVisible: boolean;
  name: string;
  onSubmit: (newName: string) => void;
  onClose: () => void;
};
function SetNameModal({
  name: originalName,
  onSubmit,
  onClose,
  modalVisible,
}: SetNameModal) {
  const [name, setName] = useState(originalName);
  return (
    <Overlay
      isVisible={modalVisible}
      onRequestClose={onClose}
      onBackdropPress={onClose}
    >
      <View style={[stylesheet.setNameModal]}>
        <Input
          label="New name"
          value={name}
          style={[stylesheet.setNameInput]}
          onChangeText={(newName) => setName(newName)}
        />
        <View style={[stylesheet.setNameButtons]}>
          <Button type="clear" title="Ok" onPress={() => onSubmit(name)} />
          <Button type="solid" title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Overlay>
  );
}

type ProfileInnerProps = {
  loading: boolean;
  profile: ProfileType | null;
};

function ProfileInner({ loading, profile }: ProfileInnerProps) {
  const queryClient = useQueryClient();
  const themeMode = useThemeMode();
  const [modalVisible, setModalVisible] = useState(false);

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
          icon={<FontAwesome name="pencil" size={15} />}
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
      <SetNameModal
        name={profile.name ?? profile.email ?? ""}
        onClose={() => setModalVisible(false)}
        modalVisible={modalVisible}
        onSubmit={(newName) => {
          updateNameMutation.mutate(newName);
        }}
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

const stylesheet = StyleSheet.create({
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
    color: "#000000aa",
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
});
