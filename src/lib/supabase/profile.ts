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
