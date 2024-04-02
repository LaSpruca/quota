import { supabase } from "./setup";
import { Database } from "./supabase-generated";
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

export async function insertQuote(
  quote: Database["public"]["Tables"]["quotes"]["Insert"],
) {
  try {
    const { error } = await supabase.from("quotes").insert(quote);

    if (error) {
      console.error("Could not insert quote", error);
      return false;
    }

    return true;
  } catch (ex) {
    console.error(ex);
    return false;
  }
}

export async function updateQuote(
  id: string,
  newDetails: {
    quote: string;
    person: string;
    date: string;
  },
) {
  try {
    const { error } = await supabase
      .from("quotes")
      .update(newDetails)
      .eq("id", id);

    if (error) {
      console.error("Could not update quote", error);
      return false;
    }

    return true;
  } catch (ex) {
    console.error(ex);
    return false;
  }
}

export async function deleteQuote(id: string) {
  try {
    const { error } = await supabase.from("quotes").delete().eq("id", id);

    if (error) {
      console.error("Could not delete quote", error);
      return false;
    }

    return true;
  } catch (ex) {
    console.error("Could not delete quote", ex);
    return false;
  }
}
