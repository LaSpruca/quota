import BookView from "$lib/components/BookView";
import HR from "$lib/components/HR";
import LoadingView from "$lib/components/LoadingView";
import { getBooksWithOwnerProfile, useSession } from "$lib/supabase";
import { Button } from "@rneui/themed";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Stack, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";

export default function Index() {
  const session = useSession()!;
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    isLoading,
    data: books,
    isRefetching,
  } = useQuery({
    queryKey: ["get-books"],
    enabled: true,
    queryFn: async () => {
      return getBooksWithOwnerProfile();
    },
  });

  const myBooks = useMemo(
    () =>
      books
        ? books
            .filter(({ owner }) => owner === session.user.id)
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
    [books],
  );

  const othersBooks = useMemo(
    () =>
      books
        ? books
            .filter(({ owner }) => owner !== session.user.id)
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
    [books],
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

const stylesheet = StyleSheet.create({
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
});
