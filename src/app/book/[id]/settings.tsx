import LoadingView from "$lib/components/LoadingView";
import { useBook, useMembers } from "$lib/queries";
import { Profile } from "$lib/supabase";
import { makeStyles } from "@rneui/base";
import { Button, Text } from "@rneui/themed";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
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
  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <FlatList
      data={members}
      style={[stylesheet.membersList]}
      onRefresh={() => {
        queryClient.invalidateQueries({ queryKey: ["get-members", id] });
      }}
      refreshing={isRefreshing}
      renderItem={({ item: { name, email } }) => (
        <View style={[stylesheet.nameContainer]}>
          <View>
            <Text>{email}</Text>
            {name ? <Text>{name}</Text> : undefined}
          </View>
          <Button color="error" title="Remove" icon={{ name: "trash" }} />
        </View>
      )}
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
      <Stack.Screen options={{ title: `${book.book_name}` }} />
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
    },
  };
});
