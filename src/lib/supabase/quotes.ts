import { supabase } from "./setup";
import { Quote } from "./types";

export async function getQuotesFromBook(bookId: string): Promise<Quote[]> {
  try {
    const { error, data } = await supabase
      .from("quotes")
      .select()
      .eq("book", bookId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Could not fetch quotes", error);
      return [];
    }

    return data ?? [];
  } catch (ex) {
    console.error(ex);
    return [];
  }
}
