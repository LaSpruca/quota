import { Dimensions, StyleSheet } from "react-native";
import { View, Text, Pressable } from "react-native";

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

const stylesheet = StyleSheet.create({
  container: {
    padding: 10,
    shadowColor: "#aaa",
    elevation: 2,
    borderRadius: 1,
    width: Dimensions.get("screen").width - 50,
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
});
