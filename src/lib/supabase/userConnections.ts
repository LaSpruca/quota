import { Profile } from "./types";
import { supabase } from "./setup";
import { getProfile } from "./profile";
import { Alert } from "react-native";

export async function getBookMembers(bookId: string): Promise<Profile[]> {
  try {
    const { error, data } = await supabase
      .from("user_connections")
      .select(`user (*)`)
      .eq("book", bookId);

    if (error) {
      console.error(error);
      return [];
    }

    // @ts-ignore
    return data.map(({ user }) => user) ?? [];
  } catch (ex) {
    console.error(ex);
    return [];
  }
}

export async function removeUser(bookId: string, profileId: string) {
  try {
    const { error } = await supabase
      .from("user_connections")
      .delete()
      .eq("book", bookId)
      .eq("user", profileId);

    if (error) {
      console.error(error);
      return false;
    }
    return true;
  } catch (ex) {
    console.error(ex);
    return false;
  }
}

export async function addUserToBook(
  bookId: string,
  email: string,
): Promise<boolean> {
  try {
    const profile = await getProfile(email);
    if (!profile) {
      Alert.alert(
        "Could not add user",
        `Could not find a user with the email ${email}`,
      );
      return false;
    }

    const { error } = await supabase
      .from("user_connections")
      .insert({ user: profile.id, book: bookId });
    if (error) {
      console.error(error);
      return false;
    }
    return true;
  } catch (ex) {
    console.error(ex);
    return false;
  }
}
