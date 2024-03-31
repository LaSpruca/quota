import BookView from "$lib/components/BookView";
import HR from "$lib/components/HR";
import { getBooksWithOwnerProfile, useSession } from "$lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";

export default function Index() {
  const session = useSession()!;
  const queryClient = useQueryClient();

  const {
    isLoading,
    data: books,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["get-books"],
    enabled: true,
    queryFn: async () => {
      return getBooksWithOwnerProfile();
    },
  });

  if (isLoading) {
    return (
      <View style={stylesheet.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const myBooks = books
    .filter(({ owner }) => owner === session.user.id)
    .map(({ book_name: bookName, id, owner_email: { email, name } }) => (
      <BookView
        key={id}
        bookName={bookName}
        author={name ?? email ?? ""}
        id={id}
      />
    ));

  const othersBooks = books
    .filter(({ owner }) => owner !== session.user.id)
    .map(({ book_name: bookName, id, owner_email: { email, name } }) => (
      <BookView
        key={id}
        bookName={bookName}
        author={name ?? email ?? ""}
        id={id}
      />
    ));

  return (
    <ScrollView>
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ["get-books"] });
          refetch();
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
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  booksContainer: {
    padding: 10,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
});
