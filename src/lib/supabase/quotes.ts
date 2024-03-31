import { supabase } from "./setup";
import { Quote } from "./types";

export async function getQuotesFromBook(bookId: string): Promise<Quote[]> {
  try {
    console.log("Getting quotes");
    const { error, data, count } = await supabase
      .from("quotes")
      .select()
      .eq("book", bookId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Could not fetch quotes", error);
      return [];
    }

    console.log(`'${bookId}': ${count}`, data);
    return data ?? [];
  } catch (ex) {
    console.error(ex);
    return [];
  }
}
