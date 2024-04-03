import BookView from "$lib/components/BookView";
import HR from "$lib/components/HR";
import LoadingView from "$lib/components/LoadingView";
import TextInputOverlay from "$lib/components/Overlays/TextInputOverlay";
import { useBooks } from "$lib/queries";
import { createBook, useSession } from "$lib/supabase";
import { Button, FAB, Text, makeStyles } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";

export default function Index() {
  const stylesheet = createStylesheet();
  const session = useSession()!;
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isLoading, data: books, isRefetching } = useBooks();
  const [showNewBook, setShowNewBook] = useState(false);
  const createBookMutation = useMutation({
    mutationFn: async (newName: string) => {
      return await createBook(newName, session.user.id, session.user.email!);
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ["get-books"] });
      }
    },
  });

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
              icon={{ name: "person", color: "white", size: 20 }}
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
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => setShowNewBook(true)}
        />
        <TextInputOverlay
          okText="Create"
          visible={showNewBook}
          inputMode="text"
          label="New book name"
          onSubmit={(name) => {
            createBookMutation.mutate(name);
            setShowNewBook(false);
          }}
          onDismis={() => setShowNewBook(false)}
        />
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
