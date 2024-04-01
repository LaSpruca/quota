import { supabase } from "./setup";

export async function getProfile(email: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .like("email", email)
      .maybeSingle();

    if (error) {
      console.error("Cound not fetch profile", error);
      return null;
    }

    return data ?? null;
  } catch (ex) {
    console.error(ex);
    return null;
  }
}

export async function updateName(id: string, name: string) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", id);

    if (error) {
      console.error("Cound not update profile", error);
      return false;
    }

    return true;
  } catch (ex) {
    console.error("Could not update profile", ex);
    return false;
  }
}
