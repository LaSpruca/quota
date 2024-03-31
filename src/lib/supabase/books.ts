import { supabase } from "./setup";

const booksTable = supabase.from("books");

export async function getBooksWithOwnerProfile(): Promise<
  {
    id: string;
    book_name: string;
    owner: string;
    owner_email: { email: string; name: string | null };
  }[]
> {
  try {
    const { error, data } = await booksTable.select(`
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
