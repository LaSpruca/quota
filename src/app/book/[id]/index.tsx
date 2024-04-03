import { Stack, router, useLocalSearchParams } from "expo-router";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import {
  Quote,
  deleteQuote,
  insertQuote,
  updateQuote,
  useSession,
} from "$lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingView from "$lib/components/LoadingView";
import QuoteView from "$lib/components/QuoteView";
import { Button, FAB, SearchBar } from "@rneui/themed";
import QuoteOptions from "$lib/components/Overlays/QuoteOptionsOverlay";
import { useMemo, useState } from "react";
import { useBook, useQuotes } from "$lib/queries";
import { fuzzy } from "fast-fuzzy";

type HeaderButtonsProps = {
  isAdmin: boolean;
  id: string;
};

function HeaderButtons({ isAdmin, id }: HeaderButtonsProps) {
  let button = <></>;
  if (isAdmin) {
    button = (
      <Button
        icon={{ name: "settings", color: "white" }}
        title="Book Settings"
        titleStyle={[{ paddingLeft: 5 }]}
        onPress={() =>
          router.push({ pathname: "/book/[id]/settings", params: { id } })
        }
      />
    );
  }

  return <View style={[stylesheet.headerButtonContainer]}>{button}</View>;
}

export default function BookView() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [addQuoteVisible, setAddQuoteVisible] = useState(false);
  const [editingQuote, setEditingQuote] = useState<null | Quote>(null);
  const [searchTerm, setSearchTerm] = useState("");

  if (Array.isArray(id)) return <View />;

  const session = useSession();
  const {
    isLoading: bookLoading,
    data: book,
    isRefetching: bookRefetching,
  } = useBook(id);

  const {
    isLoading: quotesLoading,
    data: quotes,
    isRefetching: quotesRefetching,
  } = useQuotes(id);

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return await deleteQuote(quoteId);
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["get-quotes", id] });
      }
    },
  });
  const updateQuoteMutation = useMutation({
    mutationFn: async ([quoteId, data]: [
      string,
      Parameters<typeof updateQuote>[1],
    ]) => {
      return await updateQuote(quoteId, data);
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["get-quotes", id] });
      }
    },
  });
  const createQuoteMutation = useMutation({
    mutationFn: async (data: Parameters<typeof insertQuote>[0]) => {
      return await insertQuote(data);
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["get-quotes", id] });
      }
    },
  });

  if (bookLoading) {
    return (
      <LoadingView>
        <Stack.Screen options={{ headerShown: false }} />
      </LoadingView>
    );
  }

  const headerRight = () => (
    <HeaderButtons isAdmin={book.owner === session.user.id} id={id} />
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

  const filteredQuotes = useMemo(
    () =>
      searchTerm !== ""
        ? quotes.filter(
            ({ quote, person }) =>
              fuzzy(searchTerm, `${quote} ${person}`) > 0.75,
          )
        : quotes,
    [quotes, searchTerm],
  );

  return (
    <View>
      <Stack.Screen
        options={{ title: book.book_name, headerRight, headerShown: true }}
      />
      <FlatList
        ListHeaderComponent={
          <SearchBar
            containerStyle={[stylesheet.searchBar]}
            onChangeText={setSearchTerm}
            placeholder="Search"
            value={searchTerm}
            clearIcon={{ name: "backspace" }}
            onClear={() => {
              setSearchTerm("");
            }}
          />
        }
        data={filteredQuotes}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => {
          const { quote, person, date } = item;
          if (book.owner === session.user.id) {
            return (
              <QuoteView
                quote={quote}
                author={person}
                date={new Date(date)}
                onHold={() => setEditingQuote(item)}
              />
            );
          }

          return (
            <QuoteView quote={quote} author={person} date={new Date(date)} />
          );
        }}
        contentContainerStyle={[stylesheet.container]}
        onRefresh={() => {
          setSearchTerm("");
          queryClient.invalidateQueries({
            predicate: ({ queryKey: [_, queryId] }) => queryId === id,
          });
        }}
        refreshing={quotesRefetching || bookRefetching}
      />
      <FAB
        icon={{ name: "history-edu", color: "white" }}
        onPress={() => setAddQuoteVisible(true)}
      />
      <QuoteOptions
        visible={editingQuote !== null}
        onSubmit={({ quote, author, date }) => {
          updateQuoteMutation.mutate([
            editingQuote.id,
            {
              quote,
              person: author,
              date: date.toISOString(),
            },
          ]);
          setEditingQuote(null);
        }}
        onDismis={() => setEditingQuote(null)}
        onDelete={() => {
          deleteQuoteMutation.mutate(editingQuote.id);
          setEditingQuote(null);
        }}
        defaultVales={
          editingQuote !== null
            ? {
                quote: editingQuote.quote,
                author: editingQuote.person,
                date: new Date(editingQuote.date),
              }
            : undefined
        }
      />
      <QuoteOptions
        visible={addQuoteVisible}
        onDismis={() => setAddQuoteVisible(false)}
        onSubmit={({ date, quote, author }) => {
          createQuoteMutation.mutate({
            quote,
            date: date.toISOString(),
            book: id,
            person: author,
          });
          setAddQuoteVisible(false);
        }}
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
  searchBar: {
    width: Dimensions.get("screen").width - 20,
    backgroundColor: "#00000000",
  },
});
