import LoadingView from "$lib/components/LoadingView";
import { Profile as ProfileType, getProfile, useSession } from "$lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <Modal
      visible={modalVisible}
      onRequestClose={onClose}
      animationType="fade"
      transparent
    >
      <View style={[stylesheet.modalCenterer]}>
        <View style={[stylesheet.modalContainer]}>
          <View>
            <Text>New name</Text>
            <TextInput
              onChangeText={(event) => {
                setName(event);
              }}
            />
          </View>
          <View>
            <Pressable onPress={onClose}>
              <Text>Close</Text>
            </Pressable>
            <Pressable onPress={() => onSubmit(name)}>
              <Text>Submut</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type ProfileInnerProps = {
  loading: boolean;
  profile: ProfileType | null;
};

function ProfileInner({ loading, profile }: ProfileInnerProps) {
  const [modalVisible, setModalVisible] = useState(false);
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
      <View style={[stylesheet.usernameTextWrapper]}>
        <Text style={[stylesheet.usernameText]}>
          {profile.name ?? "name not set"}
        </Text>
        <FontAwesome.Button
          name="pencil"
          backgroundColor="#00000000"
          color="#000000aa"
          onPress={() => setModalVisible(true)}
        />
      </View>
      <Text style={[stylesheet.emailText]}>{profile.email}</Text>
      <SetNameModal
        name={profile.name}
        onClose={() => setModalVisible(false)}
        modalVisible={modalVisible}
        onSubmit={() => {}}
      />
    </View>
  );
}

export default function Profile() {
  const session = useSession();

  const { isLoading, data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return await getProfile(session.user.email!);
    },
  });

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Profile" }} />
      <ProfileInner loading={isLoading} profile={profile} />
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
  },
  usernameText: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  emailText: {
    fontStyle: "italic",
    color: "#000000aa",
  },
  modalCenterer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000000",
    elevation: 1,
    padding: 50,
  },
});
