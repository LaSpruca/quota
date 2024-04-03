import { Dimensions, StyleSheet, View, Pressable } from "react-native";
import { Text, makeStyles } from "@rneui/themed";

type QuoteViewProps = {
  quote: string;
  author: string;
  date: Date;
  onHold?: () => void;
};

function QuoteViewInner({
  quote,
  author,
  date,
}: Omit<QuoteViewProps, "onHold">) {
  const stylesheet = createStylesheet();
  return (
    <View style={[stylesheet.container]}>
      <Text style={[stylesheet.quote]}>{quote}</Text>
      <Text style={[stylesheet.author]}>
        {author} ({date.getDate()}/{date.getMonth()}/{date.getFullYear()})
      </Text>
    </View>
  );
}

export default function QuoteView({ onHold, ...props }: QuoteViewProps) {
  if (onHold) {
    return (
      <Pressable onLongPress={onHold}>
        <QuoteViewInner {...props} />
      </Pressable>
    );
  } else {
    return <QuoteViewInner {...props} />;
  }
}

const createStylesheet = makeStyles((theme) => {
  return {
    container: {
      padding: 10,
      shadowColor: theme.mode === "dark" ? "#111" : "#aaa",
      elevation: 2,
      borderRadius: 1,
      width: Dimensions.get("screen").width - 50,
      backgroundColor: theme.mode === "dark" ? "#FFFFFF11" : undefined,
    },

    quote: {
      paddingTop: 10,
      paddingBottom: 20,
      paddingHorizontal: 10,

      fontSize: 17,
      fontWeight: "700",

      textAlign: "center",
    },

    author: {
      fontWeight: "300",
      textAlign: "right",
    },
  };
});
