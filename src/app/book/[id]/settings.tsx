import LoadingView from "$lib/components/LoadingView";
import TextInputOverlay from "$lib/components/Overlays/TextInputOverlay";
import { useBook, useMembers } from "$lib/queries";
import {
  Profile,
  addUserToBook,
  deleteBook,
  removeUser,
  updateBookName,
} from "$lib/supabase";
import { Button, Text, makeStyles, useTheme } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MemberListProps = {
  isLoading: boolean;
  isRefreshing: boolean;
  members: Profile[];
  id: string;
  stylesheet: ReturnType<typeof createStylesheet>;
};
function MembersList({
  isLoading,
  isRefreshing,
  id,
  members,
  stylesheet,
}: MemberListProps) {
  const queryClient = useQueryClient();
  const [addMemberOverlay, setAddMemberOverlay] = useState(false);
  const addUserMutation = useMutation({
    mutationFn: async (email: string) => {
      return await addUserToBook(id, email);
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ["get-members", id] });
      }
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await removeUser(id, userId);
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ["get-members", id] });
      }
    },
  });

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <FlatList
      style={[stylesheet.membersList]}
      refreshing={isRefreshing}
      onRefresh={() => {
        queryClient.invalidateQueries({ queryKey: ["get-members", id] });
      }}
      data={members}
      keyExtractor={({ id }) => id}
      ListHeaderComponent={<Text h3>Members</Text>}
      renderItem={({ item: { name, email, id } }) => (
        <View style={[stylesheet.nameContainer]}>
          <View>
            <Text>{email}</Text>
            {name ? <Text>{name}</Text> : undefined}
          </View>
          <Button
            color="error"
            title="Remove"
            icon={{ name: "delete", color: "white" }}
            onPress={() => {
              Alert.alert(
                "Remove user",
                `Are you sure you want to remove ${email} from this book`,
                [
                  { text: "No" },
                  { text: "Yes", onPress: () => removeUserMutation.mutate(id) },
                ],
              );
            }}
          />
        </View>
      )}
      ListFooterComponent={
        <>
          <Button
            color="primary"
            icon={{ name: "add", color: "white" }}
            title="Add member"
            onPress={() => setAddMemberOverlay(true)}
          />
          <TextInputOverlay
            visible={addMemberOverlay}
            onDismis={() => {
              setAddMemberOverlay(false);
            }}
            onSubmit={(email) => {
              addUserMutation.mutate(email);
              setAddMemberOverlay(false);
            }}
            label={"Email"}
            inputMode={"email"}
            okText="Add"
          />
        </>
      }
    />
  );
}

export default function BookSettings() {
  const stylesheet = createStylesheet();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  if (Array.isArray(id)) {
    return <></>;
  }

  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const { isLoading: bookLoading, data: book } = useBook(id);
  const {
    isLoading: membersLoading,
    data: members,
    isRefetching: isMembersRefreshing,
  } = useMembers(id);
  const deleteBookMutation = useMutation({
    mutationFn: async () => {
      return await deleteBook(id);
    },
    onSuccess: (result) => {
      if (result) {
        router.dismissAll();
        queryClient.removeQueries({
          predicate: ({ queryKey: [_, second] }) => second === id,
        });
        queryClient.invalidateQueries({ queryKey: ["get-books"] });
      }
    },
  });
  const updateBookNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      return await updateBookName(id, newName);
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({
          predicate: ({ queryKey: [first, second] }) =>
            first === "get-books" || (first === "get-book" && second === id),
        });
      }
    },
  });

  if (bookLoading) {
    return (
      <LoadingView>
        <Stack.Screen options={{ title: "Loading book settings" }} />
      </LoadingView>
    );
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: `${book.book_name} Settings` }} />
      <View style={[stylesheet.membersList]}>
        <Text h3 style={[{ textAlign: "center" }]}>
          Display name
        </Text>
        <View style={[stylesheet.usernameTextWrapper]}>
          <Button
            icon={{ name: "edit", size: 15, color: theme.colors.black }}
            type="clear"
            onPress={() => setModalVisible(true)}
          />
          <Text style={[stylesheet.usernameText]}>{book.book_name}</Text>
        </View>
      </View>
      <TextInputOverlay
        onDismis={() => {
          setModalVisible(false);
        }}
        onSubmit={(text) => {
          updateBookNameMutation.mutate(text);
          setModalVisible(false);
        }}
        label={"Book name"}
        inputMode={"text"}
        defaultText={book.book_name}
        visible={modalVisible}
      />
      <MembersList
        id={id}
        isRefreshing={isMembersRefreshing}
        stylesheet={stylesheet}
        isLoading={membersLoading}
        members={members}
      />
      <View style={[stylesheet.membersList, { paddingTop: 10 }]}>
        <Button
          color="error"
          title="Delete Book"
          icon={{ name: "delete", color: "white" }}
          onPress={() =>
            Alert.alert(
              "Delete Book",
              "Are you sure you want to delete " +
                book.book_name +
                ".\nThis action cannot be undone",
              [
                { text: "Yes", onPress: () => deleteBookMutation.mutate() },
                { text: "No" },
              ],
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

const createStylesheet = makeStyles(() => {
  return {
    membersList: {
      paddingHorizontal: 20,
    },
    nameContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexDirection: "row",
      paddingBottom: 20,
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
    displayNameText: {
      fontSize: 25,
      fontWeight: "400",
    },
  };
});
