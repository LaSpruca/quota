import { supabase } from "./setup";
import { Book, Profile } from "./types";

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

export async function updateBookName(
  bookId: string,
  bookName: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("books")
      .update({ book_name: bookName })
      .eq("id", bookId);

    if (error) {
      console.error("Could not rename book", error);
      return false;
    }

    return true;
  } catch (ex) {
    console.error("Could not rename book", ex);
    return false;
  }
}

export async function createBook(
  bookName: string,
  owner_id: string,
  owner_email: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("books")
      .insert({ book_name: bookName, owner: owner_id, owner_email });

    if (error) {
      console.error("Could not insert book", error);
      return false;
    }

    return true;
  } catch (ex) {
    console.error("Could not insert book", ex);
    return false;
  }
}

export async function deleteBook(bookId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("books").delete().eq("id", bookId);

    if (error) {
      console.error("Could not delete book", error);
      return false;
    }

    return true;
  } catch (ex) {
    console.error("Could not delete book", ex);
    return false;
  }
}
