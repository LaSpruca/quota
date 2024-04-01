import { Stack, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { getBook, getQuotesFromBook, useSession } from "$lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingView from "$lib/components/LoadingView";
import QuoteView from "$lib/components/QuoteView";
import { Button } from "react-native-elements";

type HeaderButtonsProps = {
  isAdmin: boolean;
};

function HeaderButtons({ isAdmin }: HeaderButtonsProps) {
  let button = <></>;
  if (isAdmin) {
    button = <Button icon={<FontAwesome name="gear" color="white" size={20} />} />;
  }

  return <View style={[stylesheet.headerButtonContainer]}>{button}</View>;
}

export default function BookView() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();

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
    justifyContent: "center",
    flexDirection: "column",
    gap: 10,

    padding: 10,
  },
});
