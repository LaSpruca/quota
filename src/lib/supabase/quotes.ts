import { supabase } from "./setup";
import { Quote } from "./types";

const quotesTable = supabase.from("quotes");

export async function getQuotesFromBook(bookId: string): Promise<Quote[]> {
  try {
    const { error, data } = await quotesTable
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
