import { supabase } from "./setup";
import { Book } from "./types";

export async function getBooksWithOwnerProfile(): Promise<
  {
    id: string;
    book_name: string;
    owner: string;
    owner_email: { email: string; name: string | null };
  }[]
> {
  try {
    const { error, data } = await supabase.from("books").select(`
        id,
        book_name,
        owner,
        owner_email ( email, name ) 
    `);

    if (error) {
      console.error(error);
      return [];
    }

    // @ts-ignore
    return data ?? [];
  } catch (ex) {
    console.error(ex);
    return [];
  }
}

export async function getBook(bookId: string): Promise<Book | null> {
  try {
    const { error, data: maybeBook } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .maybeSingle();

    if (error) {
      console.error(error);
      return null;
    }

    return maybeBook;
  } catch (ex) {
    console.error(ex);
    return null;
  }
}
