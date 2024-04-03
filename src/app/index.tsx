import BookView from "$lib/components/BookView";
import HR from "$lib/components/HR";
import LoadingView from "$lib/components/LoadingView";
import { useBooks } from "$lib/queries";
import { useSession } from "$lib/supabase";
import { Button, Text, makeStyles } from "@rneui/themed";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useMemo } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";

export default function Index() {
  const stylesheet = createStylesheet();
  const session = useSession()!;
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isLoading, data: books, isRefetching } = useBooks();

  const myBooks = useMemo(
    () =>
      books
        ? books
            .filter(
              ({ owner }) => session !== null && owner === session.user.id,
            )
            .map(
              ({ book_name: bookName, id, owner_email: { email, name } }) => (
                <BookView
                  key={id}
                  bookName={bookName}
                  author={name ?? email ?? ""}
                  id={id}
                />
              ),
            )
        : [],
    [books, session],
  );

  const othersBooks = useMemo(
    () =>
      books
        ? books
            .filter(
              ({ owner }) => session !== null && owner !== session.user.id,
            )
            .map(
              ({ book_name: bookName, id, owner_email: { email, name } }) => (
                <BookView
                  key={id}
                  bookName={bookName}
                  author={name ?? email ?? ""}
                  id={id}
                />
              ),
            )
        : [],
    [books, session],
  );
  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <ScrollView>
      <Stack.Screen
        options={{
          title: "All books",
          headerRight: () => (
            <Button
              icon={{ name: "user", color: "white", size: 20 }}
              onPress={() => router.push("/profile")}
              title="Profile"
              titleStyle={[{ paddingLeft: 5 }]}
              raised
            />
          ),
        }}
      />
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ["get-books"] });
        }}
      >
        <Text style={[stylesheet.title]}>My Books</Text>
        <HR />
        <View style={[stylesheet.booksContainer]}>{myBooks}</View>

        <Text style={[[stylesheet.title], { paddingTop: 20 }]}>
          Others books
        </Text>
        <HR />
        <View style={[stylesheet.booksContainer]}>{othersBooks}</View>
      </RefreshControl>
    </ScrollView>
  );
}

const createStylesheet = makeStyles((theme) => {
  return {
    booksContainer: {
      padding: 10,
      gap: 15,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-evenly",
    },
    title: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "center",
    },
  };
});
