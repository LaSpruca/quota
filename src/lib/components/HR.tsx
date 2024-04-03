import { useTheme } from "@rneui/themed";
import { View, StyleSheet } from "react-native";

export default function HR() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderBottomColor: theme.colors.divider,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 15,
        marginBottom: 15,
        marginTop: 5,
      }}
    />
  );
}
