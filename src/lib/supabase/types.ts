import { Database } from "./sapabase-generated";

export type Book = Database["public"]["Tables"]["books"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
