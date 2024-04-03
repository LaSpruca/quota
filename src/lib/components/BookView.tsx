import { makeStyles } from "@rneui/themed";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";

type BookViewProps = {
  bookName: string;
  author: string;
  id: string;
};
export default function BookView(props: BookViewProps) {
  const [containerTouched, setContainerTouched] = useState(false);
  const stylesheet = createStylesheet(containerTouched);

  return (
    <Pressable
      onTouchStart={() => setContainerTouched(true)}
      onTouchEnd={() => setContainerTouched(false)}
      onPress={() =>
        router.push({ pathname: "/book/[id]", params: { id: props.id } })
      }
    >
      <View style={[stylesheet.container]}>
        <Text style={[stylesheet.title]}>{props.bookName}</Text>
        <Text style={[stylesheet.by]}>{props.author}</Text>
      </View>
    </Pressable>
  );
}

const createStylesheet = makeStyles((_theme, containerTouched: boolean) => {
  return {
    container: {
      width: 150,
      maxWidth: 150,
      height: 250,
      justifyContent: "space-evenly",
      flex: 1,
      padding: 10,

      borderColor: !containerTouched ? "#9e5b2d" : "#784522",
      borderWidth: 5,
      borderLeftWidth: 15,
      borderRadius: 1,

      backgroundColor: !containerTouched ? "#c47138" : "#9e5b2d",

      shadowColor: "#000",
      elevation: 5,
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
  };
});
