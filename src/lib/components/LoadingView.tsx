import { ReactNode } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LoadingViewProps = {
  children?: ReactNode;
};

export default function LoadingView({ children }: LoadingViewProps) {
  return (
    <SafeAreaView>
      <View style={stylesheet.loadingContainer}>
        <ActivityIndicator size="large" />
        {children}
      </View>
    </SafeAreaView>
  );
}

const stylesheet = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
