import type { Book } from "$lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";

type BookViewProps = {
  bookName: string;
  author: string;
  id: string;
};
export default function BookView(props: BookViewProps) {
  const [viewStyle, setViewStyle] = useState([stylesheet.container]);
  return (
    <Pressable
      onTouchStart={() =>
        setViewStyle([stylesheet.container, stylesheet.containerTouched])
      }
      onTouchEnd={() => setViewStyle([stylesheet.container])}
      onPress={() =>
        router.push({ pathname: "book/[id]", params: { id: props.id } })
      }
    >
      <View style={viewStyle}>
        <Text style={[stylesheet.title]}>{props.bookName}</Text>
        <Text style={[stylesheet.by]}>{props.author}</Text>
      </View>
    </Pressable>
  );
}

const stylesheet = StyleSheet.create({
  container: {
    width: 150,
    maxWidth: 150,
    height: 250,
    justifyContent: "space-evenly",
    flex: 1,
    padding: 10,

    borderColor: "#9e5b2d",
    borderWidth: 5,
    borderLeftWidth: 15,
    borderRadius: 1,

    backgroundColor: "#c47138",

    shadowColor: "#000",
    elevation: 5,
  },

  containerTouched: {
    backgroundColor: "#9e5b2d",
    borderColor: "#784522",
  },

  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",

    color: "#fff",
  },

  by: {
    fontStyle: "italic",
    textAlign: "right",
    color: "rgba(255, 255, 255, 0.9)",
  },
});
