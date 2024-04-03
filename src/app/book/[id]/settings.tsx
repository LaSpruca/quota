import LoadingView from "$lib/components/LoadingView";
import TextInputOverlay from "$lib/components/Overlays/TextInputOverlay";
import { useBook, useMembers } from "$lib/queries";
import { Profile, addUserToBook, removeUser } from "$lib/supabase";
import { Button, Text, makeStyles } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
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
            icon={{ name: "trash", color: "white" }}
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
            icon={{ name: "plus", color: "white" }}
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

  if (Array.isArray(id)) {
    return <></>;
  }

  const { isLoading: bookLoading, data: book } = useBook(id);
  const {
    isLoading: membersLoading,
    data: members,
    isRefetching: isMembersRefreshing,
  } = useMembers(id);

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
      <MembersList
        id={id}
        isRefreshing={isMembersRefreshing}
        stylesheet={stylesheet}
        isLoading={membersLoading}
        members={members}
      />
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
  };
});
