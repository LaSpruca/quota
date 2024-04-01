import { Stack, useLocalSearchParams } from "expo-router";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { getBook, getQuotesFromBook, useSession } from "$lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingView from "$lib/components/LoadingView";
import QuoteView from "$lib/components/QuoteView";
import { Button, FAB } from "@rneui/themed";
import AddQuoteOverlay from "$lib/components/AddQuoteOverlay";
import { useState } from "react";

type HeaderButtonsProps = {
  isAdmin: boolean;
};

function HeaderButtons({ isAdmin }: HeaderButtonsProps) {
  let button = <></>;
  if (isAdmin) {
    button = (
      <Button
        icon={{ name: "gear", color: "white" }}
        title="Book Settings"
        titleStyle={[{ paddingLeft: 5 }]}
      />
    );
  }

  return <View style={[stylesheet.headerButtonContainer]}>{button}</View>;
}

export default function BookView() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [addQuoteVisible, setAddQuoteVisible] = useState(false);

  if (Array.isArray(id)) return <View />;

  const session = useSession();
  const {
    isLoading: bookLoading,
    data: book,
    isRefetching: bookRefetching,
  } = useQuery({
    queryKey: ["get-book", id],
    queryFn: async () => await getBook(id),
  });

  const {
    isLoading: quotesLoading,
    data: quotes,
    isRefetching: quotesRefetching,
  } = useQuery({
    queryKey: ["get-quotes", id],
    queryFn: async () => await getQuotesFromBook(id),
  });

  if (bookLoading) {
    return (
      <LoadingView>
        <Stack.Screen options={{ headerShown: false }} />
      </LoadingView>
    );
  }

  const headerRight = () => (
    <HeaderButtons isAdmin={book.owner === session.user.id} />
  );

  if (quotesLoading) {
    return (
      <LoadingView>
        <Stack.Screen
          options={{ title: book.book_name, headerRight, headerShown: true }}
        />
      </LoadingView>
    );
  }

  return (
    <View>
      <Stack.Screen
        options={{ title: book.book_name, headerRight, headerShown: true }}
      />
      <FlatList
        data={quotes}
        keyExtractor={({ id }) => id}
        renderItem={({ item: { quote, person, date } }) => (
          <QuoteView quote={quote} author={person} date={new Date(date)} />
        )}
        contentContainerStyle={[stylesheet.container]}
        onRefresh={() => {
          queryClient.invalidateQueries({
            predicate: ({ queryKey: [_, queryId] }) => queryId === id,
          });
        }}
        refreshing={quotesRefetching || bookRefetching}
      />
      <FAB icon={{ name: "plus" }} onPress={() => setAddQuoteVisible(true)} />
      <AddQuoteOverlay
        visible={addQuoteVisible}
        onDismis={() => setAddQuoteVisible(false)}
        onSubmit={() => setAddQuoteVisible(false)}
      />
    </View>
  );
}

const stylesheet = StyleSheet.create({
  headerButtonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
  },

  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    gap: 10,
    minHeight: Dimensions.get("window").height,

    padding: 10,
  },
});
