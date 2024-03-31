import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function BookView() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Stack.Screen options={{ title: `${id}` }} />
    </View>
  );
}
