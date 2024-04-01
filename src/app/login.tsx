import { supabase } from "$lib/supabase";
import { Button, Input, Text } from "@rneui/themed";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Error signing in", error.message);
    }
  };

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Quota login" }} />
      <View style={[stylesheet.container]}>
        <Input
          label="Email"
          inputMode="email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
        />
        <Input
          label="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <Button onPress={login} title="Sign in" />

        <View style={[stylesheet.signupContainer]}>
          <Text h4>No account?</Text>
          <Button onPress={() => router.push("https://quotes.laspruca.nz")}>
            Sign Up
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const stylesheet = StyleSheet.create({
  container: {
    padding: 10,
  },

  signupContainer: {
    paddingTop: 30,
    paddingBottom: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
